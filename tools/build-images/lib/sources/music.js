// MusicBrainz (entity pin) → Fanart.tv (artist photos), plus iTunes podcast
// artwork. Exact-name matches only.
import { fetchJson } from '../http.js';
import { cleanLabel, titlesEqual } from '../categorize.js';

export async function musicbrainzArtistExact(label) {
  const c = cleanLabel(label);
  const u = new URL('https://musicbrainz.org/ws/2/artist/');
  u.searchParams.set('query', `artist:"${c}"`);
  u.searchParams.set('limit', '5');
  u.searchParams.set('fmt', 'json');
  const j = await fetchJson(u.toString());
  const m = (j?.artists || []).find(a => titlesEqual(a.name, c) && (a.score ?? 0) >= 90);
  return m?.id || null;
}

export async function fanartArtistThumb(mbid, key) {
  if (!key || !mbid) return null;
  const j = await fetchJson(`https://webservice.fanart.tv/v3/music/${mbid}?api_key=${key}`);
  return j?.artistthumb?.[0]?.url || null;
}

export async function fanartMoviePoster(tmdbId, key) {
  if (!key || !tmdbId) return null;
  const j = await fetchJson(`https://webservice.fanart.tv/v3/movies/${tmdbId}?api_key=${key}`);
  return j?.movieposter?.[0]?.url || null;
}

export async function fanartTvPoster(tvdbId, key) {
  if (!key || !tvdbId) return null;
  const j = await fetchJson(`https://webservice.fanart.tv/v3/tv/${tvdbId}?api_key=${key}`);
  return j?.tvposter?.[0]?.url || null;
}

export async function itunesPodcastExact(label) {
  const c = cleanLabel(label);
  const u = new URL('https://itunes.apple.com/search');
  u.searchParams.set('term', c);
  u.searchParams.set('media', 'podcast');
  u.searchParams.set('entity', 'podcast');
  u.searchParams.set('limit', '5');
  const j = await fetchJson(u.toString());
  const hit = (j?.results || []).find(r => titlesEqual(r.collectionName, c));
  if (!hit) return null;
  return hit.artworkUrl600 || (hit.artworkUrl100 ? hit.artworkUrl100.replace('100x100', '600x600') : null);
}
