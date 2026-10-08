#!/usr/bin/env node
// Build-time image pipeline for BlindRanking.
//
// For every topic item in topics.js, resolves an image via strict exact-match
// source rules, validates the bytes, computes a crop focal point, and writes:
//   ../../images.manifest.json  (full record, feeds tools/review.html)
//   ../../images.js             (runtime manifest, only vetted entries)
// Human review decisions live in ../../images.overrides.json:
//   { "<key>": {"approve": true} | {"reject": true} | {"url": "https://..."} }
//
// Usage:
//   node build.js [--topic <substr>] [--label <substr>] [--force]
//                 [--revalidate-only] [--concurrency N] [--limit N]
//
// Incremental by default: already-vetted entries are only re-checked for link
// rot; review/rejected entries wait for a human unless --force.
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadTopics } from './lib/load-topics.js';
import { buildUnits } from './lib/keys.js';
import { resolveItem, fitFor, searchCandidates } from './lib/resolve.js';
import { validateImage, revalidateUrl } from './lib/validate.js';
import { computeFocal } from './lib/focal.js';
import { FACE_CATS, normalize } from './lib/categorize.js';
import { isBlockedWikiFile } from './lib/sources/wikimedia.js';
import { loadJson, writeManifest, writeImagesJs, summarize, SHIPPABLE } from './lib/manifest.js';
import { verifyEnabled, verifyImage, verifyKey, verifyStatus, isMatch } from './lib/verify.js';

const BUILD_START = Date.now();

// BR_ROOT override exists for the offline test harness (test/run-tests.sh).
const ROOT = process.env.BR_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST_FILE = path.join(ROOT, 'images.manifest.json');
const IMAGES_JS_FILE = path.join(ROOT, 'images.js');
const OVERRIDES_FILE = path.join(ROOT, 'images.overrides.json');

function parseArgs(argv) {
  const args = {
    concurrency: 4, force: false, revalidateOnly: false, topic: null, label: null, limit: 0,
    timeBudgetMin: parseFloat(process.env.BUILD_TIME_BUDGET_MIN || '0') || 0
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force') args.force = true;
    else if (a === '--revalidate-only') args.revalidateOnly = true;
    else if (a === '--topic') args.topic = argv[++i] || '';
    else if (a === '--label') args.label = argv[++i] || '';
    else if (a === '--concurrency') args.concurrency = Math.max(1, parseInt(argv[++i], 10) || 4);
    else if (a === '--limit') args.limit = parseInt(argv[++i], 10) || 0;
    else if (a === '--time-budget') args.timeBudgetMin = parseFloat(argv[++i]) || 0;
    else { console.error(`Unknown argument: ${a}`); process.exit(2); }
  }
  return args;
}

// A URL that is clearly a rendered logo/pictogram must never be cover-cropped,
// whatever the category says (e.g. a soda brand inside a food topic whose
// best available image is its logo).
function looksLikeLogoUrl(url) {
  const norm = String(url || '').toLowerCase().replace(/%2[02]/g, ' ').replace(/[_\-.]+/g, ' ');
  return /\blogo\b|\bpictogram\b|\bsvg\b/.test(norm);
}

// Bumped whenever resolution rules tighten: machine-vetted entries resolved
// under older rules are re-resolved on the next build (human-approved entries
// never are). v2: identity-linked TMDB/MusicBrainz lookups, redirect checks,
// person/team/product entity checks, product-vs-logo categories, wider
// filename blocklist. v3: logo-type items ship only real logos; Wikidata
// images trusted only where they reliably show the item (not clubs, brands,
// characters, games); wide wordmark logos accepted.
const RULES_VERSION = 3;
// Most options the vision gate will try per item (primary pick + alternates).
const MAX_TRIES = 4;

// Download, validate and focal-point one candidate image.
async function prepareImage(unit, url) {
  let { fit, pad } = fitFor(unit);
  const v = await validateImage(url, unit.category);
  if (!v.ok) return { ok: false, reason: `validation-failed:${v.reason}` };
  // A URL that is clearly a rendered logo/pictogram must never be
  // cover-cropped, whatever the category says.
  if (fit === 'cover' && looksLikeLogoUrl(url)) { fit = 'contain'; pad = true; }
  const focal = await computeFocal(v.bytes, unit.category, fit, unit.label);
  return { ok: true, v, fit, pad, focal };
}

// Resolve + validate + focal-point (+ vision-verify) one unit into a
// manifest entry. `known` maps url → a verdict already obtained this run.
async function buildEntry(unit, keys, log, known = new Map()) {
  const verify = verifyEnabled();
  const base = {
    label: unit.label,
    topics: unit.topics,
    category: unit.category,
    ...fitFor(unit),
    rules: RULES_VERSION,
    gate: verify ? 'vision' : 'rules',
    resolvedAt: new Date().toISOString()
  };

  let res;
  try {
    res = await resolveItem(unit, keys);
  } catch (err) {
    log(unit, 'review', `resolver-error:${err?.message || err}`);
    return { ...base, url: null, source: null, confidence: 'review', reviewReason: `resolver-error:${String(err?.message || err).slice(0, 80)}`, candidates: [] };
  }

  const candidates = dedupeCandidates(res.candidates, res.pick?.url);
  const isPerson = FACE_CATS.has(unit.category);

  // Options in preference order. Without the vision gate only the strict
  // pick is eligible. With it, alternates may be tried too: for things
  // (food, logos, products…) any candidate the gate confirms; for real
  // people only the pinned entity's own images — identity comes from the
  // entity, never from a picture search.
  const options = res.pick ? [res.pick] : [];
  const addOptions = (list) => {
    for (const c of list || []) {
      if (!c?.url || options.some(o => o.url === c.url)) continue;
      if (isPerson && !(c.pinned && res.pick?.exact)) continue;
      options.push({ url: c.url, source: c.source, sourceId: c.pinned ? `${c.source}:pinned` : c.source, exact: !!c.pinned });
    }
  };
  if (verify) addOptions(res.candidates);
  // Picture searches run only once everything better has failed the gate.
  let searched = !!res.searched || isPerson;

  if (!options.length && (!verify || searched)) {
    log(unit, 'review', res.reviewReason);
    return { ...base, url: null, source: null, confidence: 'review', reviewReason: res.reviewReason, candidates };
  }

  let fallback = null; // what the review page shows if nothing passes
  const toReview = (entry, reason) => ({ ...entry, confidence: 'review', reviewReason: reason });
  const limit = verify ? MAX_TRIES : 1;

  for (let i = 0; i < limit; i++) {
    if (i >= options.length && verify && !searched) {
      searched = true;
      const found = await searchCandidates(unit, keys).catch(() => []);
      addOptions(found);
      for (const c of dedupeCandidates(found, null)) {
        if (!candidates.some(x => x.url === c.url) && candidates.length < 6) candidates.push(c);
      }
    }
    const opt = options[i];
    if (!opt) break;
    const prep = await prepareImage(unit, opt.url);
    const entry = {
      ...base,
      url: opt.url,
      source: opt.source,
      sourceId: opt.sourceId,
      candidates: opt === res.pick ? candidates : dedupeCandidates([res.pick, ...(res.candidates || [])].filter(Boolean), opt.url)
    };
    if (!prep.ok) {
      fallback ||= toReview(entry, prep.reason);
      continue;
    }
    Object.assign(entry, {
      fit: prep.fit, pad: prep.pad,
      width: prep.v.width, height: prep.v.height, contentHash: prep.v.hash,
      focusX: prep.focal.x, focusY: prep.focal.y
    });
    const faceOk = !isPerson || prep.fit !== 'cover' || prep.focal.faces > 0;
    const strictReason = !opt.exact ? (opt.inexactReason || 'inexact-match') : (!faceOk ? 'no-face-detected' : null);

    if (!verify) {
      // Rules-only policy: exact entity match + valid bytes + (people) a face.
      if (!strictReason) {
        log(unit, 'auto', `${entry.source} ${entry.width}x${entry.height} focal ${entry.focusX},${entry.focusY}`);
        return { ...entry, confidence: 'auto', reviewReason: null };
      }
      log(unit, 'review', strictReason);
      return toReview(entry, strictReason);
    }

    // Vision policy. People still need an exact pin and a detected face —
    // the gate checks picture type and context, never identity.
    if (isPerson && strictReason) {
      fallback ||= toReview(entry, strictReason);
      continue;
    }
    const verdict = known.get(opt.url) || await verifyImage(unit, opt.url, prep.v.bytes);
    if (!verdict) {
      fallback ||= toReview(entry, 'verify-unavailable');
      break; // API down or call cap reached: retry on the next build
    }
    entry.verify = verdict;
    if (isMatch(verdict)) {
      log(unit, 'auto', `${entry.source} verified (${verdict.confidence}) — ${verdict.depicts.slice(0, 60)}`);
      return { ...entry, confidence: 'auto', reviewReason: null };
    }
    fallback ||= toReview(entry, `vision-${verdict.verdict}:${verdict.depicts.slice(0, 90)}`);
  }

  if (!fallback) {
    log(unit, 'review', res.reviewReason || 'no-candidates');
    return { ...base, url: null, source: null, confidence: 'review', reviewReason: res.reviewReason || 'no-candidates', candidates };
  }
  log(unit, 'review', fallback.reviewReason);
  return fallback;
}

function dedupeCandidates(cands, chosenUrl, max = 4) {
  const seen = new Set([chosenUrl].filter(Boolean));
  const out = [];
  for (const c of cands || []) {
    if (!c?.url || seen.has(c.url)) continue;
    seen.add(c.url);
    out.push({ url: c.url, source: c.source || 'unknown' });
    if (out.length >= max) break;
  }
  return out;
}

// Apply a human override to (possibly) replace the computed entry.
async function applyOverride(key, ov, entry, unit, keys, log) {
  if (!ov) return entry;
  if (ov.reject) {
    log(unit, 'rejected', 'by override');
    return { ...entry, confidence: 'rejected', reviewReason: 'rejected-by-review' };
  }
  if (ov.url) {
    if (entry.source === 'override' && entry.url === ov.url && entry.confidence === 'approved') return entry;
    const { fit, pad } = fitFor(unit);
    const v = await validateImage(ov.url, unit.category);
    if (!v.ok) {
      log(unit, 'review', `override-invalid:${v.reason}`);
      return { ...entry, confidence: 'review', reviewReason: `override-invalid:${v.reason}` };
    }
    const focal = await computeFocal(v.bytes, unit.category, fit, unit.label);
    log(unit, 'approved', `override url (${v.width}x${v.height})`);
    return {
      ...entry,
      url: ov.url, source: 'override', sourceId: 'images.overrides.json',
      width: v.width, height: v.height, contentHash: v.hash,
      fit, pad, focusX: focal.x, focusY: focal.y,
      confidence: 'approved', reviewReason: null,
      resolvedAt: new Date().toISOString()
    };
  }
  if (ov.approve && entry.url) {
    log(unit, 'approved', 'by override');
    return { ...entry, confidence: 'approved', reviewReason: null };
  }
  return entry;
}

// Whether a unit has real work pending (vs. a link-rot check). Used to put
// that work first, so a time-budgeted run spends its budget where it counts.
function needsWork(unit, existing, overrides) {
  if (!existing || overrides[unit.key]) return true;
  if ((existing.rules || 1) < RULES_VERSION || existing.category !== unit.category) return true;
  if (verifyEnabled()) {
    if (existing.confidence === 'auto' && existing.verify?.key !== verifyKey(unit, existing.url)) return true;
    if (existing.confidence === 'review' && (existing.gate !== 'vision' || existing.reviewReason === 'verify-unavailable')) return true;
  }
  return false;
}

async function processUnit(unit, ctx) {
  const { manifest, overrides, keys, args, log } = ctx;
  const key = unit.key;
  const existing = manifest[key];
  const ov = overrides[key];

  // Rejected stays rejected (cheap, no network) unless the override changed.
  if (ov?.reject) {
    return applyOverride(key, ov, existing || {
      label: unit.label, topics: unit.topics, category: unit.category,
      url: null, source: null, candidates: []
    }, unit, keys, log);
  }

  // Machine-vetted entries are re-resolved when the rules changed under them:
  // the unit's category differs, or the stored URL would now be rejected
  // (blocklist/fit-guard improvements). Human-approved entries are never
  // second-guessed — overrides own those.
  const rulesChanged = existing && existing.confidence === 'auto' && (
    (existing.rules || 1) < RULES_VERSION ||
    existing.category !== unit.category ||
    isBlockedWikiFile(existing.url, unit.category, unit.label) ||
    (existing.fit === 'cover' && looksLikeLogoUrl(existing.url))
  );

  // A url override that the manifest already reflects needs no re-resolve.
  const pendingUrlOverride = ov?.url && !(existing?.source === 'override' && existing.url === ov.url);

  // Vetted entries: link-rot check only (unless --force or a new url
  // override), plus a one-time vision check of machine-vetted ones once the
  // gate is on.
  if (existing && SHIPPABLE.has(existing.confidence) && !args.force && !pendingUrlOverride && !rulesChanged) {
    const bytes = await revalidateUrl(existing.url);
    if (bytes) {
      // Keep byte-identical to avoid noisy diffs; refresh topics in case the
      // label moved between topics.
      const kept = { ...existing, topics: unit.topics };
      if (existing.confidence === 'auto' && verifyEnabled() && existing.verify?.key !== verifyKey(unit, existing.url)) {
        const verdict = await verifyImage(unit, existing.url, bytes);
        if (!verdict) return applyOverride(key, ov, kept, unit, keys, log); // unverified; retried next build
        if (isMatch(verdict)) {
          log(unit, 'auto', `existing image verified (${verdict.confidence})`);
          return applyOverride(key, ov, { ...kept, verify: verdict }, unit, keys, log);
        }
        // The shipped picture failed the gate: look for one that passes.
        const fresh = await buildEntry(unit, keys, () => {}, new Map([[existing.url, verdict]]));
        log(unit, fresh.confidence, `shipped image failed the gate (${verdict.verdict}: ${verdict.depicts.slice(0, 50)}) → ` +
          (fresh.confidence === 'auto' ? `replaced by verified ${fresh.source}` : fresh.reviewReason));
        return applyOverride(key, ov, fresh, unit, keys, log);
      }
      return applyOverride(key, ov, kept, unit, keys, log);
    }
    // URL died: re-resolve. A replacement ships only if the vision gate
    // confirms it and no human had approved the old one; otherwise demote.
    const fresh = await buildEntry(unit, keys, () => {});
    if (!(existing.confidence === 'auto' && fresh.confidence === 'auto' && fresh.verify)) {
      fresh.confidence = 'review';
      fresh.reviewReason = 'dead-url';
    }
    log(unit, fresh.confidence, `dead-url (was ${existing.url})`);
    return applyOverride(key, ov, fresh, unit, keys, log);
  }

  // Review entries await a human; don't hammer the APIs again unless forced,
  // an override arrived, the rules changed, or the vision gate is newly
  // available to rescue them.
  const retryForVision = verifyEnabled() && existing &&
    (existing.gate !== 'vision' || existing.reviewReason === 'verify-unavailable');
  if (existing && existing.confidence === 'review' && !args.force && !ov &&
      existing.category === unit.category && (existing.rules || 1) >= RULES_VERSION && !retryForVision) {
    return { ...existing, topics: unit.topics };
  }

  if (args.revalidateOnly) return existing || null;

  const entry = await buildEntry(unit, keys, log);
  return applyOverride(key, ov, entry, unit, keys, log);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { topics, config } = loadTopics(ROOT);
  const keys = {
    TMDB_KEY: process.env.TMDB_KEY || config.TMDB_KEY || '',
    FANART_KEY: process.env.FANART_KEY || config.FANART_KEY || '',
    PIXABAY_KEY: process.env.PIXABAY_KEY || config.PIXABAY_KEY || '',
    PEXELS_KEY: process.env.PEXELS_KEY || config.PEXELS_KEY || '',
    UNSPLASH_KEY: process.env.UNSPLASH_KEY || config.UNSPLASH_KEY || ''
  };

  let units = buildUnits(topics);
  const allKeys = new Set(units.map(u => u.key));
  const filtered = !!(args.topic || args.label || args.limit);
  if (args.topic) {
    const t = normalize(args.topic);
    units = units.filter(u => u.topics.some(n => normalize(n).includes(t)));
  }
  if (args.label) {
    const l = normalize(args.label);
    units = units.filter(u => normalize(u.label).includes(l));
  }
  if (args.limit > 0) units = units.slice(0, args.limit);

  const manifestDoc = loadJson(MANIFEST_FILE, { version: 1, items: {} });
  const manifest = manifestDoc.items || {};
  const overrides = loadJson(OVERRIDES_FILE, {});

  console.log(`Topics: ${topics.length} | units total: ${allKeys.size} | processing: ${units.length}${args.force ? ' (force)' : ''}`);
  const vs = verifyStatus();
  console.log(vs.enabled
    ? `Vision gate: ON (${vs.model}, effort ${vs.effort}${vs.maxCalls ? `, max ${vs.maxCalls} calls` : ''}) — every shipped image must be confirmed.`
    : 'Vision gate: OFF (set ANTHROPIC_API_KEY to enable) — rules-only accuracy checks.');

  let done = 0;
  const log = (unit, status, detail) => {
    done++;
    console.log(`[${String(done).padStart(4)}/${units.length}] ${status.padEnd(8)} ${unit.key} ${detail ? '— ' + detail : ''}`);
  };

  const ctx = { manifest, overrides, keys, args, log };
  // Pending work first; a time budget (CI job limits) stops dequeuing once
  // spent — everything finished is still written, and the next run picks up
  // where this one stopped.
  const pending = units.filter(u => needsWork(u, manifest[u.key], overrides));
  const queue = [...pending, ...units.filter(u => !pending.includes(u))];
  const budgetMs = args.timeBudgetMin > 0 ? args.timeBudgetMin * 60000 : 0;
  let deferred = 0;
  if (budgetMs) console.log(`Time budget: ${args.timeBudgetMin} min; ${pending.length} units have pending work.`);
  const results = new Map();
  await Promise.all(Array.from({ length: args.concurrency }, async () => {
    while (queue.length) {
      if (budgetMs && Date.now() - BUILD_START > budgetMs) {
        deferred += queue.length;
        queue.length = 0;
        break;
      }
      const unit = queue.shift();
      try {
        const entry = await processUnit(unit, ctx);
        if (entry) results.set(unit.key, entry);
      } catch (err) {
        console.error(`  !! ${unit.key}: ${err?.stack || err}`);
        results.set(unit.key, {
          label: unit.label, topics: unit.topics, category: unit.category,
          url: null, source: null, confidence: 'review',
          reviewReason: `build-error:${String(err?.message || err).slice(0, 80)}`, candidates: []
        });
      }
    }
  }));

  for (const [key, entry] of results) manifest[key] = entry;
  // Drop entries for items no longer in topics.js (full runs only — a
  // filtered run sees only a subset of keys).
  if (!filtered) {
    for (const key of Object.keys(manifest)) {
      if (!allKeys.has(key)) delete manifest[key];
    }
  }

  writeManifest(MANIFEST_FILE, manifest, manifestDoc.version || 1);
  const shipped = writeImagesJs(IMAGES_JS_FILE, manifest);

  const s = summarize(manifest);
  console.log('\n=== Summary ===');
  console.log('status:', JSON.stringify(s.byStatus));
  console.log('review reasons:', JSON.stringify(s.reviewByReason));
  console.log('per category (shipped/total):');
  for (const [cat, c] of Object.entries(s.byCategory).sort()) {
    console.log(`  ${cat.padEnd(14)} ${c.shipped}/${c.total}`);
  }
  const vEnd = verifyStatus();
  const verified = Object.values(manifest).filter(e => SHIPPABLE.has(e.confidence) && e.verify && isMatch(e.verify)).length;
  console.log(`vision gate: ${vEnd.calls} checks this run; ${verified} shipped images carry a match verdict` +
    (vEnd.disabledReason ? ` (disabled mid-run: ${vEnd.disabledReason})` : ''));
  if (deferred) {
    console.log(`\nTime budget reached: ${deferred} units deferred to the next run (re-run the workflow to continue).`);
  }
  console.log(`\nimages.js: ${shipped} entries shipped → app shows text for the rest.`);
  console.log('Review pending picks in tools/review.html, save decisions to images.overrides.json, and re-run.');
}

main().then(() => process.exit(0), err => { console.error(err); process.exit(1); });
