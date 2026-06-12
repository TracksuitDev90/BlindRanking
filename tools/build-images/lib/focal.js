// Focal-point computation for cover-cropped images.
// People: face detection (face-api SSD MobileNet on the tfjs WASM backend —
// pure JS + WASM, no native TensorFlow, models bundled in the npm package).
// Everything else cover-cropped: smartcrop saliency.
// The result is stored as object-position percentages in the manifest.
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import smartcrop from 'smartcrop-sharp';
import { FACE_CATS, isBandArtist } from './categorize.js';

const require = createRequire(import.meta.url);
const pkgDir = path.dirname(fileURLToPath(import.meta.url));

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const DEFAULT_PERSON = { x: 50, y: 25 }; // matches the old "center 20%" CSS heuristic
const DEFAULT = { x: 50, y: 50 };

let faceStack = null;
async function getFaceStack() {
  if (faceStack) return faceStack;
  faceStack = (async () => {
    const faceapi = require('@vladmandic/face-api/dist/face-api.node-wasm.js');
    const wasm = require('@tensorflow/tfjs-backend-wasm');
    const tf = faceapi.tf;
    wasm.setWasmPaths(path.join(pkgDir, '../node_modules/@tensorflow/tfjs-backend-wasm/dist/') + path.sep);
    await tf.setBackend('wasm');
    await tf.ready();
    await faceapi.nets.ssdMobilenetv1.loadFromDisk(
      path.join(pkgDir, '../node_modules/@vladmandic/face-api/model'));
    return { faceapi, tf };
  })();
  return faceStack;
}

async function detectFaces(bytes) {
  const { faceapi, tf } = await getFaceStack();
  // Downscale for speed; percentages are invariant to uniform resizing.
  const raw = await sharp(bytes, { limitInputPixels: 1e9 })
    .rotate() // respect EXIF orientation
    .resize({ width: 640, height: 640, fit: 'inside', withoutEnlargement: true })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const tensor = tf.tensor3d(new Uint8Array(raw.data), [raw.info.height, raw.info.width, 3], 'int32');
  try {
    const dets = await faceapi.detectAllFaces(
      tensor, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.5 }));
    return { dets, width: raw.info.width, height: raw.info.height };
  } finally {
    tensor.dispose();
  }
}

async function saliencyFocal(bytes) {
  // 3:4 target matches the card's aspect ratio.
  const meta = await sharp(bytes, { limitInputPixels: 1e9 }).metadata();
  const w = meta.width || 0, h = meta.height || 0;
  if (!w || !h) return { ...DEFAULT, faces: 0 };
  const cropW = Math.min(w, Math.round(h * 0.75));
  const cropH = Math.min(h, Math.round(cropW * 4 / 3));
  const { topCrop } = await smartcrop.crop(bytes, { width: cropW, height: cropH });
  return {
    x: clamp(Math.round(((topCrop.x + topCrop.width / 2) / w) * 100), 15, 85),
    y: clamp(Math.round(((topCrop.y + topCrop.height / 2) / h) * 100), 15, 85),
    faces: 0
  };
}

// Returns { x, y, faces } — faces is the detection count (used by the
// auto-accept rule: a "person" image with zero faces needs human review).
export async function computeFocal(bytes, category, fit, label = '') {
  if (fit !== 'cover') return { ...DEFAULT, faces: 0 };

  const wantFaces = FACE_CATS.has(category) && !(category === 'music-artist' && isBandArtist(label));
  if (wantFaces || FACE_CATS.has(category)) {
    try {
      const { dets, width, height } = await detectFaces(bytes);
      if (dets.length) {
        // Single face: its center. Multiple faces: center of their union box.
        const boxes = dets.map(d => d.box);
        const largest = boxes.reduce((a, b) => (a.area > b.area ? a : b));
        let cx, cy;
        if (boxes.length === 1 || !wantFaces) {
          const x1 = Math.min(...boxes.map(b => b.x));
          const y1 = Math.min(...boxes.map(b => b.y));
          const x2 = Math.max(...boxes.map(b => b.x + b.width));
          const y2 = Math.max(...boxes.map(b => b.y + b.height));
          cx = (x1 + x2) / 2; cy = (y1 + y2) / 2;
        } else {
          cx = largest.x + largest.width / 2;
          cy = largest.y + largest.height / 2;
        }
        return {
          x: clamp(Math.round((cx / width) * 100), 15, 85),
          y: clamp(Math.round((cy / height) * 100), 15, 85),
          faces: dets.length
        };
      }
      // Person categories with no detected face: heuristic focal + faces:0 so
      // the caller can flag for review.
      if (FACE_CATS.has(category)) return { ...DEFAULT_PERSON, faces: 0 };
    } catch {
      if (FACE_CATS.has(category)) return { ...DEFAULT_PERSON, faces: -1 };
    }
  }

  try {
    return await saliencyFocal(bytes);
  } catch {
    return FACE_CATS.has(category) ? { ...DEFAULT_PERSON, faces: 0 } : { ...DEFAULT, faces: 0 };
  }
}
