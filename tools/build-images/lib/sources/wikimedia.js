// Wikipedia / Wikidata / Wikimedia Commons lookups.
// Accuracy strategy: topic labels are canonical Wikipedia article titles, so we
// resolve by EXACT title (following Wikipedia's own redirects, which are
// trustworthy canonicalization) instead of fuzzy search. Search APIs are used
// only to gather review-page candidates, never for auto-accepted picks.
import { fetchJson } from '../http.js';

// One call resolves everything we need about an article: canonical title after
// redirects, disambiguation flag, Wikidata QID, short description, and the
// lead image at up to 1000px.
export async function wikiPage(title) {
  const u = new URL('https://en.wikipedia.org/w/api.php');
  u.searchParams.set('action', 'query');
  u.searchParams.set('titles', title);
  u.searchParams.set('redirects', '1');
  u.searchParams.set('prop', 'pageimages|pageprops|description');
  u.searchParams.set('piprop', 'thumbnail|name|original');
  u.searchParams.set('pithumbsize', '1000');
  u.searchParams.set('ppprop', 'disambiguation|wikibase_item');
  u.searchParams.set('format', 'json');
  u.searchParams.set('formatversion', '2');
  const j = await fetchJson(u.toString());
  const page = j?.query?.pages?.[0];
  if (!page || page.missing || page.invalid) return { exists: false };
  return {
    exists: true,
    title: page.title,
    disambig: page.pageprops?.disambiguation !== undefined,
    qid: page.pageprops?.wikibase_item || null,
    description: page.description || '',
    imageName: page.pageimage || null,
    imageUrl: page.thumbnail?.source || page.original?.source || null,
    imageWidth: page.thumbnail?.width || page.original?.width || 0,
    imageHeight: page.thumbnail?.height || page.original?.height || 0
  };
}

// Wikidata entity: English description plus image (P18) and logo (P154) file names.
export async function wikidataEntity(qid) {
  if (!qid) return null;
  const u = new URL('https://www.wikidata.org/w/api.php');
  u.searchParams.set('action', 'wbgetentities');
  u.searchParams.set('ids', qid);
  u.searchParams.set('props', 'claims|descriptions');
  u.searchParams.set('languages', 'en');
  u.searchParams.set('format', 'json');
  const j = await fetchJson(u.toString());
  const ent = j?.entities?.[qid];
  if (!ent) return null;
  const claimFile = prop => ent.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value || null;
  return {
    qid,
    description: ent.descriptions?.en?.value || '',
    image: claimFile('P18'),
    logo: claimFile('P154')
  };
}

// Stable Commons URL for a file name; ?width rasterizes SVGs to PNG and keeps
// downloads reasonably sized.
export function commonsFileUrl(fileName, width = 1000) {
  if (!fileName) return null;
  return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(String(fileName).replace(/ /g, '_'))}?width=${width}`;
}

// File-name blocklist for lead images that are technically on the article but
// wrong for display: locator maps, flags, heraldry, pictograms, and logos
// (for photo categories — a country article's lead is often its flag, a
// brand-adjacent product's lead is often a logo SVG). File names are
// normalized first because Wikipedia uses underscores, which defeat \b.
const PHOTO_BLOCK_PATTERNS = [
  /\bflag of\b/, /\bcoat of arms\b/, /\bmap of\b/, /\blocator map\b/,
  /\bblank map\b/, /\bspecial marker\b/, /\bmarker\b/, /\bpictogram\b/,
  /\blogo\b/, /\bemblem\b/, /\bseal of\b/, /\bsvg\b/
];
export function isBlockedWikiFile(fileName, cat) {
  if (!fileName) return false;
  // Logo categories (brand/team/game/software/podcast) WANT logos and crests.
  if (['brand', 'team', 'game', 'software', 'podcast', 'logo'].includes(cat)) return false;
  const norm = String(fileName).toLowerCase().replace(/%2[02]/g, ' ').replace(/[_\-.]+/g, ' ');
  return PHOTO_BLOCK_PATTERNS.some(p => p.test(norm));
}

// Candidate gathering only (review page): Wikipedia full-text search images.
export async function wikiSearchImages(query, limit = 3) {
  const u = new URL('https://en.wikipedia.org/w/api.php');
  u.searchParams.set('action', 'query');
  u.searchParams.set('generator', 'search');
  u.searchParams.set('gsrsearch', query);
  u.searchParams.set('gsrlimit', String(limit + 2));
  u.searchParams.set('prop', 'pageimages');
  u.searchParams.set('piprop', 'thumbnail|name');
  u.searchParams.set('pithumbsize', '1000');
  u.searchParams.set('format', 'json');
  u.searchParams.set('formatversion', '2');
  const j = await fetchJson(u.toString());
  const pages = (j?.query?.pages || []).sort((a, b) => (a.index || 99) - (b.index || 99));
  const out = [];
  for (const pg of pages) {
    if (pg.thumbnail?.source) out.push({ url: pg.thumbnail.source, source: `wikipedia-search:${pg.title}` });
    if (out.length >= limit) break;
  }
  return out;
}

// Candidate gathering only (review page): Wikimedia Commons file search.
export async function commonsSearch(query, limit = 3) {
  const u = new URL('https://commons.wikimedia.org/w/api.php');
  u.searchParams.set('action', 'query');
  u.searchParams.set('generator', 'search');
  u.searchParams.set('gsrsearch', `${query} filetype:bitmap`);
  u.searchParams.set('gsrlimit', String(limit + 2));
  u.searchParams.set('gsrnamespace', '6');
  u.searchParams.set('prop', 'imageinfo');
  u.searchParams.set('iiprop', 'url|size|mime');
  u.searchParams.set('iiurlwidth', '1000');
  u.searchParams.set('format', 'json');
  u.searchParams.set('formatversion', '2');
  const j = await fetchJson(u.toString());
  const pages = j?.query?.pages || [];
  const out = [];
  for (const pg of pages) {
    const info = pg.imageinfo?.[0];
    if (!info || info.mime === 'image/svg+xml' || (info.width || 0) < 300) continue;
    out.push({ url: info.thumburl || info.url, source: `commons-search:${pg.title}` });
    if (out.length >= limit) break;
  }
  return out;
}
