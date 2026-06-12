// TMDB lookups — strict variants of the resolvers in script.js: a result is
// only returned on an exact normalized-title match (the runtime's
// "first result" fallback is deliberately gone; a non-exact match goes to
// human review instead of guessing).
import { fetchJson } from '../http.js';
import { cleanLabel, titlesEqual, yearFrom, normalize } from '../categorize.js';

export const tmdbImg = (path, sz = 'w780') =>
  path ? `https://image.tmdb.org/t/p/${sz}${path}` : null;

export async function tmdbMovieExact(label, key) {
  if (!key) return null;
  const c = cleanLabel(label);
  const y = yearFrom(label);
  const u = new URL('https://api.themoviedb.org/3/search/movie');
  u.searchParams.set('api_key', key);
  u.searchParams.set('query', c);
  if (y) u.searchParams.set('year', y);
  const j = await fetchJson(u.toString());
  const results = j?.results || [];
  let m = results.find(x => titlesEqual(x.title, c) || titlesEqual(x.original_title, c));
  if (!m && y) {
    m = results.find(x =>
      (x.release_date || '').startsWith(String(y)) && normalize(x.title).includes(normalize(c)));
  }
  return m || null;
}

export async function tmdbTVExact(label, key) {
  if (!key) return null;
  const c = cleanLabel(label);
  const y = yearFrom(label);
  const u = new URL('https://api.themoviedb.org/3/search/tv');
  u.searchParams.set('api_key', key);
  u.searchParams.set('query', c);
  if (y) u.searchParams.set('first_air_date_year', y);
  const j = await fetchJson(u.toString());
  const results = j?.results || [];
  let m = results.find(x => titlesEqual(x.name, c) || titlesEqual(x.original_name, c));
  if (!m && y) {
    m = results.find(x =>
      (x.first_air_date || '').startsWith(String(y)) && normalize(x.name).includes(normalize(c)));
  }
  return m || null;
}

export async function tmdbPersonExact(label, key) {
  if (!key) return null;
  const c = cleanLabel(label);
  const u = new URL('https://api.themoviedb.org/3/search/person');
  u.searchParams.set('api_key', key);
  u.searchParams.set('query', c);
  const j = await fetchJson(u.toString());
  return (j?.results || []).find(x => titlesEqual(x.name, c)) || null;
}

// Highest-voted profile headshot for a person (better, more recent photos
// than Wikipedia for entertainment figures).
export async function tmdbPersonBestProfile(personId, key) {
  if (!key || !personId) return null;
  const u = new URL(`https://api.themoviedb.org/3/person/${personId}/images`);
  u.searchParams.set('api_key', key);
  const j = await fetchJson(u.toString());
  const profiles = j?.profiles || [];
  if (!profiles.length) return null;
  const best = profiles.slice().sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0))[0];
  return tmdbImg(best.file_path, 'h632');
}

export async function tmdbTvExternalIds(tvId, key) {
  if (!key || !tvId) return null;
  const u = new URL(`https://api.themoviedb.org/3/tv/${tvId}/external_ids`);
  u.searchParams.set('api_key', key);
  const j = await fetchJson(u.toString());
  return j?.tvdb_id || null;
}

export async function tvmazeExact(label) {
  const c = cleanLabel(label);
  const u = new URL('https://api.tvmaze.com/singlesearch/shows');
  u.searchParams.set('q', c);
  const j = await fetchJson(u.toString());
  if (!j || !titlesEqual(j.name, c)) return null;
  return j.image?.original || j.image?.medium || null;
}
