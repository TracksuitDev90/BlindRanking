// Stock photo APIs (Openverse / Pixabay / Pexels / Unsplash).
// These are keyword searches with no entity matching, which makes them the
// main accuracy risk — so they are NEVER auto-chosen. They only feed the
// review page's candidate list, where a human picks.
import { fetchJson } from '../http.js';

export async function openverseCandidates(query, limit = 2) {
  const u = new URL('https://api.openverse.org/v1/images/');
  u.searchParams.set('q', query);
  u.searchParams.set('page_size', '10');
  u.searchParams.set('extension', 'jpg,png');
  u.searchParams.set('source', 'flickr,wikimedia,rawpixel');
  const j = await fetchJson(u.toString());
  const out = [];
  for (const hit of j?.results || []) {
    if (!hit.url) continue;
    if ((hit.width || 0) < 600 && (hit.height || 0) < 600) continue;
    out.push({ url: hit.url, source: 'openverse' });
    if (out.length >= limit) break;
  }
  return out;
}

export async function pixabayCandidates(query, key, limit = 2) {
  if (!key) return [];
  const u = new URL('https://pixabay.com/api/');
  u.searchParams.set('key', key);
  u.searchParams.set('q', query);
  u.searchParams.set('image_type', 'photo');
  u.searchParams.set('safesearch', 'true');
  u.searchParams.set('per_page', '5');
  u.searchParams.set('min_width', '600');
  u.searchParams.set('min_height', '600');
  const j = await fetchJson(u.toString());
  return (j?.hits || []).slice(0, limit)
    .map(h => ({ url: h.largeImageURL || h.webformatURL, source: 'pixabay' }))
    .filter(c => c.url);
}

export async function pexelsCandidates(query, key, limit = 2) {
  if (!key) return [];
  const u = new URL('https://api.pexels.com/v1/search');
  u.searchParams.set('query', query);
  u.searchParams.set('per_page', '3');
  u.searchParams.set('orientation', 'portrait');
  const j = await fetchJson(u.toString(), { headers: { Authorization: key } });
  return (j?.photos || []).slice(0, limit)
    .map(p => ({ url: p.src?.large2x || p.src?.large || p.src?.original, source: 'pexels' }))
    .filter(c => c.url);
}

export async function unsplashCandidates(query, key, limit = 2) {
  if (!key) return [];
  const u = new URL('https://api.unsplash.com/search/photos');
  u.searchParams.set('query', query);
  u.searchParams.set('per_page', '3');
  u.searchParams.set('orientation', 'portrait');
  const j = await fetchJson(u.toString(), { headers: { Authorization: `Client-ID ${key}` } });
  return (j?.results || []).slice(0, limit)
    .map(p => ({ url: p.urls?.regular || p.urls?.full, source: 'unsplash' }))
    .filter(c => c.url);
}
