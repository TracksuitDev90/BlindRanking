// Polite HTTP client: timeouts, retry with backoff, and per-host rate limiting
// (Wikimedia API etiquette: low concurrency, identifying User-Agent).
import { setTimeout as delay } from 'node:timers/promises';

export const USER_AGENT =
  'BlindRankingImageBuild/1.0 (https://github.com/TracksuitDev90/BlindRanking)';

const HOST_RULES = [
  // upload.wikimedia.org is the image CDN — it tolerates far more than the APIs.
  { test: h => h === 'upload.wikimedia.org', bucket: 'wikimedia-cdn', concurrency: 4, spacingMs: 50 },
  { test: h => /(^|\.)((wikipedia|wikidata|wikimedia)\.org)$/.test(h), bucket: 'wikimedia', concurrency: 2, spacingMs: 250 },
  { test: h => /(^|\.)musicbrainz\.org$/.test(h), bucket: 'musicbrainz', concurrency: 1, spacingMs: 1100 },
  { test: h => /(^|\.)itunes\.apple\.com$/.test(h), bucket: 'itunes', concurrency: 1, spacingMs: 3100 },
  { test: h => /(^|\.)themoviedb\.org$/.test(h), bucket: 'tmdb', concurrency: 4, spacingMs: 60 },
];

class Limiter {
  constructor(concurrency, spacingMs) {
    this.concurrency = concurrency;
    this.spacingMs = spacingMs;
    this.active = 0;
    this.nextStart = 0;
    this.queue = [];
  }
  async run(fn) {
    await new Promise(resolve => { this.queue.push(resolve); this._pump(); });
    try { return await fn(); }
    finally { this.active--; this._pump(); }
  }
  _pump() {
    if (!this.queue.length || this.active >= this.concurrency) return;
    const now = Date.now();
    const wait = Math.max(0, this.nextStart - now);
    this.active++;
    this.nextStart = now + wait + this.spacingMs;
    const resolve = this.queue.shift();
    wait ? setTimeout(resolve, wait) : resolve();
  }
}

const limiters = new Map();
function limiterFor(url) {
  const host = new URL(url).hostname;
  const rule = HOST_RULES.find(r => r.test(host));
  const key = rule ? rule.bucket : host;
  if (!limiters.has(key)) {
    limiters.set(key, new Limiter(rule?.concurrency ?? 4, rule?.spacingMs ?? 50));
  }
  return limiters.get(key);
}

const RETRYABLE = new Set([429, 500, 502, 503, 504]);

async function request(url, { headers = {}, timeoutMs = 15000, retries = 3 } = {}) {
  const limiter = limiterFor(url);
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await limiter.run(() =>
        fetch(url, {
          headers: { 'User-Agent': USER_AGENT, ...headers },
          redirect: 'follow',
          signal: AbortSignal.timeout(timeoutMs)
        })
      );
      if (RETRYABLE.has(res.status) && attempt < retries) {
        const retryAfter = parseInt(res.headers.get('retry-after') || '', 10);
        await delay(Number.isFinite(retryAfter) ? retryAfter * 1000 : 1000 * 2 ** attempt + Math.random() * 250);
        continue;
      }
      return res;
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await delay(1000 * 2 ** attempt + Math.random() * 250);
        continue;
      }
    }
  }
  throw lastErr || new Error(`request failed: ${url}`);
}

export async function fetchJson(url, opts = {}) {
  const res = await request(url, opts);
  if (!res.ok) return null;
  try { return await res.json(); } catch { return null; }
}

const MAX_IMAGE_BYTES = 30 * 1024 * 1024;

// Downloads image bytes (capped). Returns { ok, status, bytes, contentType, finalUrl }.
export async function fetchBytes(url, opts = {}) {
  let res;
  try {
    res = await request(url, { timeoutMs: 30000, ...opts });
  } catch (err) {
    return { ok: false, status: 0, error: String(err?.message || err) };
  }
  if (!res.ok) return { ok: false, status: res.status };
  const len = parseInt(res.headers.get('content-length') || '0', 10);
  if (len > MAX_IMAGE_BYTES) return { ok: false, status: res.status, error: 'too-large' };
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length > MAX_IMAGE_BYTES) return { ok: false, status: res.status, error: 'too-large' };
  return {
    ok: true,
    status: res.status,
    bytes: buf,
    contentType: res.headers.get('content-type') || '',
    finalUrl: res.url || url
  };
}
