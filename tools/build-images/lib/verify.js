// Vision gate: before an image can ship, Claude looks at it and confirms it
// depicts the item as meant in its topic ("Cream soda" in "Best Sodas" must
// show cream soda — not cola, not a generic soft drink, not a logo for a
// different brand). Exact-title and entity rules decide *where* a picture
// comes from; this decides whether the picture is actually right.
//
// Enabled when ANTHROPIC_API_KEY is set (a GitHub Actions secret in CI).
// Verdicts are cached in the manifest per (url, item, topic context, prompt
// version), so each image is checked once and incremental builds stay cheap.
//
// Real people: the model is told never to identify anyone from their face.
// For people it checks only the picture type and visible context (one person
// as the subject, not a statue/autograph/group shot, nothing contradicting
// the name); *who* is pictured is established by the Wikidata entity pin.
import { createHash } from 'node:crypto';
import Anthropic from '@anthropic-ai/sdk';
import sharp from 'sharp';
import { CATS, cleanLabel } from './categorize.js';

export const VERIFY_PROMPT_VERSION = 1;
export const MIN_CONFIDENCE = 0.8;
const MODEL = process.env.VERIFY_MODEL || 'claude-opus-5-5';
const EFFORT = process.env.VERIFY_EFFORT || 'medium';
// 0 = unlimited. A cap keeps a first full run's cost predictable; items left
// unverified are retried on the next build.
const MAX_CALLS = parseInt(process.env.VERIFY_MAX_CALLS || '0', 10) || 0;

const SYSTEM = `You are the image-accuracy gate for a ranking game. Players see one item at a time (for example "Cream soda" in the category "Best Sodas") together with a picture, and the picture must show exactly that item. A picture that is merely close (a different soda, a generic soft drink, another model from the same car maker, another team's logo, a poster for a different film) is wrong, and showing no picture is better than showing a wrong one.

You get one candidate picture and a description of the item. Decide whether the picture clearly depicts that specific item, as it is meant in that category.

How to judge each kind of item:
- Food and drink: the picture shows that specific dish or drink (cream soda, not cola; carbonara, not just any pasta). For branded products (Coca-Cola, Kit Kat, Cheerios) the brand's own packaging, product or logo must be visible.
- Brands, companies, teams, apps and services: the official logo, or an unmistakably branded product of that exact brand. A storefront, headquarters, executive, unrelated product, old or regional logo of a different entity, or another brand's logo is a mismatch.
- Cars, gadgets and other products: that exact model, identifiable from its shape, badge or lettering. A logo on its own, a different model or generation that is clearly distinguishable, an interior, or a part is a mismatch.
- Films, TV shows, games, books, podcasts and albums: official poster, cover, logo or key art for that exact title; when the title text is legible it must match. An unrelated scene, a cosplayer, merchandise, or a sequel or remake with a different title is a mismatch.
- Real people: never try to recognize or identify a person from their facial features. Judge only what is visible apart from the face: the picture is a photograph (or, for historical figures, a painted or drawn portrait) in which one person is clearly the main subject, and nothing visible contradicts that it is the named person: no caption, name tag or jersey naming someone else, no sport, uniform or setting at odds with the category, no group shot in which the subject is ambiguous. Statues, wax figures, signatures, graves, plaques, trading cards, logos and posters are mismatches. Your verdict for a person is about the picture type and context, not about who the person is.
- Fictional characters: the character as recognisably depicted (comic art, animation, a film still or official render). A cosplayer, a toy or a different character is a mismatch.
- Places, landmarks, animals and plants: that specific place, landmark, breed or species. A map, flag, coat of arms, or a similar-looking but different one is a mismatch.
- Activities, concepts, styles and anything else: the picture shows that specific thing unmistakably. If the item cannot be shown unambiguously in a picture, answer "unsure".

Verdicts:
- "match": the picture clearly depicts the item. Only use it when you would bet on it.
- "mismatch": the picture shows something else, or only something related.
- "unsure": the picture could be the item but you cannot confirm it from what is visible.

Fill "depicts" with a short, plain description of what the picture actually shows, before deciding. "confidence" is your probability, from 0 to 1, that the picture correctly depicts the item. "reason" explains the verdict in one sentence.`;

const SCHEMA = {
  type: 'object',
  properties: {
    depicts: { type: 'string' },
    verdict: { type: 'string', enum: ['match', 'mismatch', 'unsure'] },
    confidence: { type: 'number' },
    reason: { type: 'string' }
  },
  required: ['depicts', 'verdict', 'confidence', 'reason'],
  additionalProperties: false
};

const KIND = {
  [CATS.MOVIE]: 'film', [CATS.TV]: 'TV series', [CATS.PERSON]: 'real person',
  [CATS.MUSIC_ARTIST]: 'musician or band (real people)', [CATS.MUSIC_ALBUM]: 'album',
  [CATS.MUSIC_TRACK]: 'song', [CATS.GAME]: 'game', [CATS.TEAM]: 'sports team',
  [CATS.BRAND]: 'brand or company', [CATS.LOGO]: 'brand or company', [CATS.FOOD]: 'food or drink',
  [CATS.DEVICE]: 'specific product model', [CATS.PLACE]: 'place or landmark',
  [CATS.PRODUCT]: 'specific product', [CATS.SNEAKER]: 'specific sneaker model',
  [CATS.FASHION]: 'fashion brand or item', [CATS.PODCAST]: 'podcast',
  [CATS.SOFTWARE]: 'software or app', [CATS.ACTIVITY]: 'activity',
  [CATS.CHARACTER]: 'fictional character'
};

// Identifies what was asked, so a verdict is reused only for the same
// question about the same picture.
export function verifyKey(unit, url) {
  const ctx = [VERIFY_PROMPT_VERSION, MODEL, url, unit.label, unit.category, [...unit.topics].sort().join('|')].join('\n');
  return createHash('sha256').update(ctx).digest('hex').slice(0, 20);
}

export const isMatch = v => !!v && v.verdict === 'match' && v.confidence >= MIN_CONFIDENCE;

let client = null;
let calls = 0;
let disabledReason = null;

export function verifyEnabled() {
  return !!process.env.ANTHROPIC_API_KEY && process.env.BR_VERIFY !== '0' && !disabledReason;
}
export function verifyStatus() {
  return { enabled: verifyEnabled(), model: MODEL, effort: EFFORT, calls, disabledReason, maxCalls: MAX_CALLS };
}

async function toJpegBase64(bytes) {
  // ~1000px is plenty to judge identity of an object/poster/logo and keeps
  // image tokens modest. Flatten transparency onto white so logos stay visible.
  const buf = await sharp(bytes, { limitInputPixels: 1e9 })
    .rotate()
    .resize({ width: 1000, height: 1000, fit: 'inside', withoutEnlargement: true })
    .flatten({ background: '#ffffff' })
    .jpeg({ quality: 85 })
    .toBuffer();
  return buf.toString('base64');
}

// Returns {verdict, confidence, depicts, reason, model, key, url} or null when
// verification could not run (disabled, call cap reached, API failure) — the
// caller must then treat the image as unverified.
export async function verifyImage(unit, url, bytes) {
  if (!verifyEnabled()) return null;
  if (MAX_CALLS && calls >= MAX_CALLS) return null;
  calls++;
  client ||= new Anthropic({ maxRetries: 4 });

  const label = cleanLabel(unit.label);
  const lines = [
    `Item: "${label}"`,
    unit.label !== label ? `Exact reference title: "${unit.label}"` : null,
    `Category${unit.topics.length > 1 ? ' (ranked in several)' : ''}: ${unit.topics.map(t => `"${t}"`).join(', ')}`,
    `Kind of item: ${KIND[unit.category] || 'thing'}`,
    '',
    `Does this picture clearly depict "${label}" as meant in that category?`
  ].filter(l => l !== null);

  let response;
  try {
    const data = await toJpegBase64(bytes);
    const params = {
      model: MODEL,
      max_tokens: 16000,
      system: [{ type: 'text', text: SYSTEM, cache_control: { type: 'ephemeral' } }],
      output_config: { effort: EFFORT, format: { type: 'json_schema', schema: SCHEMA } },
      messages: [{
        role: 'user',
        content: [
          { type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data } },
          { type: 'text', text: lines.join('\n') }
        ]
      }]
    };
    // Server-side refusal fallback where the model supports it.
    if (/^claude-(opus-5|fable-5|sonnet-5-5)/.test(MODEL)) {
      params.betas = ['server-side-fallback-2026-07-01'];
      params.fallbacks = 'default';
    }
    response = await client.beta.messages.create(params);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError ||
        err instanceof Anthropic.NotFoundError) {
      // A bad key or model name would fail every call: stop verifying for
      // this run instead of demoting the whole catalog to text.
      disabledReason = `${err.status} ${err.message}`.slice(0, 200);
      console.error(`!! vision verification disabled for this run: ${disabledReason}`);
    } else {
      console.error(`  !! verify ${unit.key}: ${String(err?.message || err).slice(0, 160)}`);
    }
    return null;
  }

  const key = verifyKey(unit, url);
  if (response.stop_reason === 'refusal') {
    return { verdict: 'unsure', confidence: 0, depicts: '', reason: 'model declined to assess this image', model: response.model, key, url };
  }
  const text = response.content.filter(b => b.type === 'text').map(b => b.text).join('');
  let parsed;
  try { parsed = JSON.parse(text); } catch { return null; }
  const confidence = Math.max(0, Math.min(1, Number(parsed.confidence) || 0));
  return {
    verdict: ['match', 'mismatch', 'unsure'].includes(parsed.verdict) ? parsed.verdict : 'unsure',
    confidence: Math.round(confidence * 100) / 100,
    depicts: String(parsed.depicts || '').slice(0, 200),
    reason: String(parsed.reason || '').slice(0, 300),
    model: response.model,
    key,
    url
  };
}
