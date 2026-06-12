// Per-category strict resolution. Returns the chosen pick plus alternates:
//   { pick: {url, source, sourceId, exact} | null,
//     candidates: [{url, source}], reviewReason: string|null }
// A pick is only "exact" when an entity-level match succeeded (exact title /
// name / entity pin). Anything weaker is left for human review — the runtime
// shows text rather than risking a wrong image.
import { CATS, cleanLabel, LOGO_CATS, COVER_CATS } from './categorize.js';
import {
  wikiPage, wikidataEntity, commonsFileUrl, isBlockedWikiFile,
  wikiSearchImages, commonsSearch
} from './sources/wikimedia.js';
import {
  tmdbImg, tmdbMovieExact, tmdbTVExact, tmdbPersonExact,
  tmdbPersonBestProfile, tmdbTvExternalIds, tvmazeExact
} from './sources/tmdb.js';
import {
  musicbrainzArtistExact, fanartArtistThumb, fanartMoviePoster,
  fanartTvPoster, itunesPodcastExact
} from './sources/music.js';
import {
  openverseCandidates, pixabayCandidates, pexelsCandidates, unsplashCandidates
} from './sources/stock.js';

export function fitFor(unit) {
  if (LOGO_CATS.has(unit.category)) return { fit: 'contain', pad: true };
  if (COVER_CATS.has(unit.category)) return { fit: 'cover', pad: false };
  // Animal topics land on GENERIC; they read better full-bleed with saliency crop.
  if (unit.moods.includes('animals')) return { fit: 'cover', pad: false };
  return { fit: 'contain', pad: false };
}

const descMatches = (desc, hintWords) => {
  const d = (desc || '').toLowerCase();
  return hintWords.some(h => d.includes(h));
};

// Resolve the Wikipedia article + Wikidata entity for a label.
// requireContext: when true (person-like categories where same-name collisions
// are the real risk), a non-matching description fails the pin.
async function pinEntity(unit, { requireContext }) {
  const page = await wikiPage(unit.label);
  if (!page.exists) return { ok: false, reason: 'no-wikipedia-page', page: null, wd: null };
  if (page.disambig) return { ok: false, reason: 'disambiguation-page', page, wd: null };
  const wd = page.qid ? await wikidataEntity(page.qid) : null;
  if (requireContext && unit.hintWords.length) {
    const desc = `${page.description || ''} ${wd?.description || ''}`;
    if (!descMatches(desc, unit.hintWords)) {
      return { ok: false, reason: `context-mismatch:${(desc || 'no description').trim().slice(0, 80)}`, page, wd };
    }
  }
  return { ok: true, reason: null, page, wd };
}

function pageImagePick(page, wd, category, sourceIdPrefix) {
  // Article lead image first (often a curated, non-free-permitted image),
  // then the Wikidata P18 image. Both are screened against the blocklist
  // (flags, locator maps, logos-on-photo-categories, …).
  if (page?.imageUrl && !isBlockedWikiFile(page.imageName, category)) {
    return { url: page.imageUrl, source: 'wikipedia', sourceId: `${sourceIdPrefix}:${page.title}`, exact: true };
  }
  if (wd?.image && !isBlockedWikiFile(wd.image, category)) {
    return { url: commonsFileUrl(wd.image), source: 'wikidata-p18', sourceId: `wikidata:${wd.qid}`, exact: true };
  }
  return null;
}

async function reviewCandidates(unit, keys, extras = []) {
  // Loose searches, gathered only so the review page has something to offer.
  const q = cleanLabel(unit.label);
  const hint = unit.hintWords[0] || '';
  const lists = await Promise.all([
    wikiSearchImages(hint ? `${q} ${hint}` : q),
    commonsSearch(q),
    openverseCandidates(hint ? `${q} ${hint}` : q),
    pixabayCandidates(q, keys.PIXABAY_KEY),
    pexelsCandidates(q, keys.PEXELS_KEY),
    unsplashCandidates(q, keys.UNSPLASH_KEY)
  ]).then(r => r.flat()).catch(() => []);
  return [...extras, ...lists];
}

export async function resolveItem(unit, keys) {
  const cat = unit.category;
  const candidates = [];
  const addCand = c => { if (c?.url) candidates.push(c); };

  // Hand-set imageUrl in topics.js wins outright (existing escape hatch).
  if (unit.imageUrlOverride) {
    return {
      pick: { url: unit.imageUrlOverride, source: 'topics.js', sourceId: 'imageUrl', exact: true },
      candidates: [], reviewReason: null
    };
  }

  if (cat === CATS.MOVIE) {
    const m = await tmdbMovieExact(unit.label, keys.TMDB_KEY);
    if (m?.poster_path) {
      addCand({ url: await fanartMoviePoster(m.id, keys.FANART_KEY), source: 'fanart' });
      const page = await wikiPage(unit.label);
      if (page.exists && !page.disambig) addCand({ url: page.imageUrl, source: 'wikipedia' });
      return {
        pick: { url: tmdbImg(m.poster_path), source: 'tmdb', sourceId: `tmdb-movie:${m.id}`, exact: true },
        candidates, reviewReason: null
      };
    }
    const pin = await pinEntity(unit, { requireContext: false });
    if (pin.page?.imageUrl) addCand({ url: pin.page.imageUrl, source: 'wikipedia' });
    return { pick: null, candidates: await reviewCandidates(unit, keys, candidates), reviewReason: 'no-exact-tmdb-match' };
  }

  if (cat === CATS.TV) {
    const t = await tmdbTVExact(unit.label, keys.TMDB_KEY);
    if (t?.poster_path) {
      const tvdbId = await tmdbTvExternalIds(t.id, keys.TMDB_KEY);
      addCand({ url: await fanartTvPoster(tvdbId, keys.FANART_KEY), source: 'fanart' });
      return {
        pick: { url: tmdbImg(t.poster_path), source: 'tmdb', sourceId: `tmdb-tv:${t.id}`, exact: true },
        candidates, reviewReason: null
      };
    }
    const tvm = await tvmazeExact(unit.label);
    if (tvm) {
      return {
        pick: { url: tvm, source: 'tvmaze', sourceId: `tvmaze:${cleanLabel(unit.label)}`, exact: true },
        candidates, reviewReason: null
      };
    }
    const pin = await pinEntity(unit, { requireContext: false });
    if (pin.page?.imageUrl) addCand({ url: pin.page.imageUrl, source: 'wikipedia' });
    return { pick: null, candidates: await reviewCandidates(unit, keys, candidates), reviewReason: 'no-exact-tv-match' };
  }

  if (cat === CATS.PERSON) {
    // Entity pin with description sanity check (e.g. an "active NFL QBs"
    // topic requires "American football"/"NFL" in the entity description).
    const pin = await pinEntity(unit, { requireContext: true });
    if (!pin.ok) {
      if (pin.page?.imageUrl) addCand({ url: pin.page.imageUrl, source: 'wikipedia' });
      if (pin.wd?.image) addCand({ url: commonsFileUrl(pin.wd.image), source: 'wikidata-p18' });
      return { pick: null, candidates: await reviewCandidates(unit, keys, candidates), reviewReason: pin.reason };
    }
    // Entertainment people: prefer the TMDB headshot (recent, high quality);
    // the Wikipedia/Wikidata portrait stays as a candidate.
    if (unit.entertainment && keys.TMDB_KEY) {
      const p = await tmdbPersonExact(unit.label, keys.TMDB_KEY);
      const best = p ? (await tmdbPersonBestProfile(p.id, keys.TMDB_KEY)) || tmdbImg(p.profile_path, 'h632') : null;
      if (best) {
        addCand(pageImagePick(pin.page, pin.wd, cat, 'wikipedia'));
        return {
          pick: { url: best, source: 'tmdb-person', sourceId: `tmdb-person:${p.id}`, exact: true },
          candidates, reviewReason: null
        };
      }
    }
    const pick = pageImagePick(pin.page, pin.wd, cat, 'wikipedia');
    if (pick) {
      if (pin.wd?.image && pick.source !== 'wikidata-p18') addCand({ url: commonsFileUrl(pin.wd.image), source: 'wikidata-p18' });
      return { pick, candidates, reviewReason: null };
    }
    return { pick: null, candidates: await reviewCandidates(unit, keys, candidates), reviewReason: 'no-image-on-entity' };
  }

  if (cat === CATS.MUSIC_ARTIST) {
    const mbid = await musicbrainzArtistExact(unit.label);
    const fan = await fanartArtistThumb(mbid, keys.FANART_KEY);
    // Wikidata descriptions vary ("rapper", "DJ", "record producer"…) —
    // accept any music-flavoured wording, not just musician/band/singer.
    const musicUnit = {
      ...unit,
      hintWords: [...new Set([...unit.hintWords,
        'music', 'rapper', 'dj', 'songwriter', 'composer', 'record producer', 'vocal', 'group', 'duo'])]
    };
    const pin = await pinEntity(musicUnit, { requireContext: true });
    if (fan) {
      if (pin.ok) addCand(pageImagePick(pin.page, pin.wd, cat, 'wikipedia'));
      return {
        pick: { url: fan, source: 'fanart', sourceId: `musicbrainz:${mbid}`, exact: true },
        candidates, reviewReason: null
      };
    }
    if (pin.ok) {
      const pick = pageImagePick(pin.page, pin.wd, cat, 'wikipedia');
      if (pick) return { pick, candidates, reviewReason: null };
    }
    if (pin.page?.imageUrl) addCand({ url: pin.page.imageUrl, source: 'wikipedia' });
    return {
      pick: null,
      candidates: await reviewCandidates(unit, keys, candidates),
      reviewReason: pin.ok ? 'no-image-on-entity' : pin.reason
    };
  }

  if (cat === CATS.PODCAST) {
    const art = await itunesPodcastExact(unit.label);
    if (art) {
      return {
        pick: { url: art, source: 'itunes-podcast', sourceId: `itunes:${cleanLabel(unit.label)}`, exact: true },
        candidates, reviewReason: null
      };
    }
    const pin = await pinEntity(unit, { requireContext: false });
    if (pin.page?.imageUrl) addCand({ url: pin.page.imageUrl, source: 'wikipedia' });
    return { pick: null, candidates: await reviewCandidates(unit, keys, candidates), reviewReason: 'no-exact-podcast-match' };
  }

  if (LOGO_CATS.has(cat)) {
    const pin = await pinEntity(unit, { requireContext: false });
    if (pin.ok) {
      // Games: the article lead image is usually the cover art (logos rarely
      // exist). Brands/teams/software: official logo (P154) first.
      if (cat !== CATS.GAME && pin.wd?.logo) {
        addCand(pageImagePick(pin.page, pin.wd, cat, 'wikipedia'));
        return {
          pick: { url: commonsFileUrl(pin.wd.logo), source: 'wikidata-p154', sourceId: `wikidata:${pin.wd.qid}`, exact: true },
          candidates, reviewReason: null
        };
      }
      const pick = pageImagePick(pin.page, pin.wd, cat, 'wikipedia');
      if (pick) {
        if (pin.wd?.logo) addCand({ url: commonsFileUrl(pin.wd.logo), source: 'wikidata-p154' });
        return { pick, candidates, reviewReason: null };
      }
    }
    for (const c of await commonsSearch(cleanLabel(unit.label), 2)) addCand(c);
    return {
      pick: null,
      candidates: await reviewCandidates(unit, keys, candidates),
      reviewReason: pin.ok ? 'no-image-on-entity' : pin.reason
    };
  }

  // FOOD / PLACE / DEVICE / PRODUCT / SNEAKER / FASHION / ACTIVITY / GENERIC
  // (and music albums/tracks, which are rare): exact Wikipedia article image.
  const pin = await pinEntity(unit, { requireContext: false });
  if (pin.ok) {
    const pick = pageImagePick(pin.page, pin.wd, cat, 'wikipedia');
    if (pick) {
      if (pin.wd?.image && pick.source !== 'wikidata-p18') addCand({ url: commonsFileUrl(pin.wd.image), source: 'wikidata-p18' });
      return { pick, candidates, reviewReason: null };
    }
  }
  if (pin.page?.imageUrl) addCand({ url: pin.page.imageUrl, source: 'wikipedia' });
  return {
    pick: null,
    candidates: await reviewCandidates(unit, keys, candidates),
    reviewReason: pin.ok ? 'no-image-on-entity' : pin.reason
  };
}
