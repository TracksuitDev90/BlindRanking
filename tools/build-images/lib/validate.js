// Byte-level validation of a chosen image URL: it must download, decode, and
// meet size/aspect quality floors before it can ship.
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import { fetchBytes } from './http.js';
import { LOGO_CATS } from './categorize.js';

export async function validateImage(url, category) {
  const dl = await fetchBytes(url);
  if (!dl.ok) return { ok: false, reason: `download-failed:${dl.status || dl.error}` };

  let meta;
  try {
    meta = await sharp(dl.bytes, { limitInputPixels: 1e9 }).metadata();
  } catch {
    return { ok: false, reason: 'decode-failed' };
  }
  const width = meta.width || 0;
  const height = meta.height || 0;
  const isLogo = LOGO_CATS.has(category);

  // SVG markup is fine for logos (browsers render it) but not for photo
  // categories — mirrors the SVG rule in validateRelevance().
  if (meta.format === 'svg' && !isLogo) return { ok: false, reason: 'svg-for-photo-category' };

  const minSide = isLogo ? 200 : 400;
  if (Math.min(width, height) < minSide) return { ok: false, reason: `too-small:${width}x${height}` };

  const aspect = width / height;
  const maxAspect = isLogo ? 8 : 4;
  const minAspect = isLogo ? 0.08 : 0.15;
  if (aspect > maxAspect || aspect < minAspect) return { ok: false, reason: `bad-aspect:${aspect.toFixed(2)}` };

  return {
    ok: true,
    width,
    height,
    format: meta.format,
    hash: 'sha256:' + createHash('sha256').update(dl.bytes).digest('hex').slice(0, 24),
    bytes: dl.bytes
  };
}

// Cheap link-rot check for already-vetted entries on incremental runs.
export async function revalidateUrl(url) {
  const dl = await fetchBytes(url);
  if (!dl.ok) return false;
  try {
    await sharp(dl.bytes, { limitInputPixels: 1e9 }).metadata();
    return true;
  } catch {
    return false;
  }
}
