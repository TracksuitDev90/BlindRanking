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
import { resolveItem, fitFor } from './lib/resolve.js';
import { validateImage, revalidateUrl } from './lib/validate.js';
import { computeFocal } from './lib/focal.js';
import { FACE_CATS, normalize } from './lib/categorize.js';
import { isBlockedWikiFile } from './lib/sources/wikimedia.js';
import { loadJson, writeManifest, writeImagesJs, summarize, SHIPPABLE } from './lib/manifest.js';

// BR_ROOT override exists for the offline test harness (test/run-tests.sh).
const ROOT = process.env.BR_ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const MANIFEST_FILE = path.join(ROOT, 'images.manifest.json');
const IMAGES_JS_FILE = path.join(ROOT, 'images.js');
const OVERRIDES_FILE = path.join(ROOT, 'images.overrides.json');

function parseArgs(argv) {
  const args = { concurrency: 4, force: false, revalidateOnly: false, topic: null, label: null, limit: 0 };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--force') args.force = true;
    else if (a === '--revalidate-only') args.revalidateOnly = true;
    else if (a === '--topic') args.topic = argv[++i] || '';
    else if (a === '--label') args.label = argv[++i] || '';
    else if (a === '--concurrency') args.concurrency = Math.max(1, parseInt(argv[++i], 10) || 4);
    else if (a === '--limit') args.limit = parseInt(argv[++i], 10) || 0;
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

// Resolve + validate + focal-point one unit into a manifest entry.
async function buildEntry(unit, keys, log) {
  let { fit, pad } = fitFor(unit);
  const base = {
    label: unit.label,
    topics: unit.topics,
    category: unit.category,
    fit, pad,
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

  if (!res.pick) {
    log(unit, 'review', res.reviewReason);
    return { ...base, url: null, source: null, confidence: 'review', reviewReason: res.reviewReason, candidates };
  }

  const v = await validateImage(res.pick.url, unit.category);
  if (!v.ok) {
    log(unit, 'review', `validation-failed:${v.reason}`);
    return {
      ...base, url: res.pick.url, source: res.pick.source, sourceId: res.pick.sourceId,
      confidence: 'review', reviewReason: `validation-failed:${v.reason}`, candidates
    };
  }

  if (fit === 'cover' && looksLikeLogoUrl(res.pick.url)) {
    fit = 'contain'; pad = true;
    base.fit = fit; base.pad = pad;
  }

  const focal = await computeFocal(v.bytes, unit.category, fit, unit.label);
  const entry = {
    ...base,
    url: res.pick.url,
    source: res.pick.source,
    sourceId: res.pick.sourceId,
    width: v.width,
    height: v.height,
    contentHash: v.hash,
    focusX: focal.x,
    focusY: focal.y,
    candidates
  };

  // Auto-accept: exact entity match + validated bytes + (for people) a face.
  if (res.pick.exact && (!FACE_CATS.has(unit.category) || fit !== 'cover' || focal.faces > 0)) {
    entry.confidence = 'auto';
    entry.reviewReason = null;
    log(unit, 'auto', `${entry.source} ${entry.width}x${entry.height} focal ${focal.x},${focal.y}`);
  } else {
    entry.confidence = 'review';
    entry.reviewReason = res.pick.exact ? 'no-face-detected' : 'inexact-match';
    log(unit, 'review', entry.reviewReason);
  }
  return entry;
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
    existing.category !== unit.category ||
    isBlockedWikiFile(existing.url, unit.category) ||
    (existing.fit === 'cover' && looksLikeLogoUrl(existing.url))
  );

  // Vetted entries: link-rot check only (unless --force or a url override).
  if (existing && SHIPPABLE.has(existing.confidence) && !args.force && !ov?.url && !rulesChanged) {
    const alive = await revalidateUrl(existing.url);
    if (alive) {
      // Keep byte-identical to avoid noisy diffs; refresh topics in case the
      // label moved between topics.
      return applyOverride(key, ov, { ...existing, topics: unit.topics }, unit, keys, log);
    }
    // URL died: re-resolve, but never silently ship a different image than
    // the one a human saw — demote to review.
    const fresh = await buildEntry(unit, keys, () => {});
    fresh.confidence = 'review';
    fresh.reviewReason = 'dead-url';
    log(unit, 'review', `dead-url (was ${existing.url})`);
    return applyOverride(key, ov, fresh, unit, keys, log);
  }

  // Review entries await a human; don't hammer the APIs again unless forced,
  // an override arrived, or the categorization rules changed.
  if (existing && existing.confidence === 'review' && !args.force && !ov &&
      existing.category === unit.category) {
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

  let done = 0;
  const log = (unit, status, detail) => {
    done++;
    console.log(`[${String(done).padStart(4)}/${units.length}] ${status.padEnd(8)} ${unit.key} ${detail ? '— ' + detail : ''}`);
  };

  const ctx = { manifest, overrides, keys, args, log };
  const queue = units.slice();
  const results = new Map();
  await Promise.all(Array.from({ length: args.concurrency }, async () => {
    while (queue.length) {
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
  console.log(`\nimages.js: ${shipped} entries shipped → app shows text for the rest.`);
  console.log('Review pending picks in tools/review.html, save decisions to images.overrides.json, and re-run.');
}

main().then(() => process.exit(0), err => { console.error(err); process.exit(1); });
