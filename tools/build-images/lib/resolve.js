// Per-category strict resolution. Returns the chosen pick plus alternates:
//   { pick: {url, source, sourceId, exact, inexactReason?} | null,
//     candidates: [{url, source, pinned?}], reviewReason: string|null }
// A pick is only "exact" when an entity-level match succeeded: the label is
// pinned to one Wikipedia article / Wikidata entity, and artwork is fetched by
// that entity's identity (its TMDB / MusicBrainz ID, its own logo or image).
// Anything weaker is left for human review (or the vision gate) — the runtime
// shows text rather than risking a wrong image.
//
// Candidates marked `pinned` come from the pinned entity itself (its other
// images); the rest are loose searches, only ever offered for review or to the
// vision gate, and never for real people.
import { CATS, cleanLabel, normalize, LOGO_CATS, COVER_CATS } from './categorize.js';
import {
  wikiPage, wikidataEntity, commonsFileUrl, isBlockedWikiFile,
  wikiSearchImages, commonsSearch
} from './sources/wikimedia.js';
import {
  tmdbImg, tmdbMovieExact, tmdbTVExact, tmdbMovieById, tmdbTVById, tmdbPersonById,
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

// Wikidata "instance of" human. Person items must be people: a YouTube
// channel, a duo or a fictional character in a "people" topic needs a human
// decision about which picture represents it.
const HUMAN = 'Q5';
// An article about a company where the topic wants a product photo
// ("Roku" in a streaming-devices topic is the company, not a device).
const COMPANY_DESC = /\b(company|corporation|conglomerate|manufacturer|subsidiary|holding company|multinational|enterprise|business)\b/;
const PRODUCT_CATS = new Set([CATS.DEVICE, CATS.PRODUCT, CATS.SNEAKER, CATS.FOOD]);
// A brand item whose article turns out to be a place, a species, a name…
const NOT_A_BRAND_DESC = /\b(city|town|village|municipality|commune|capital of|country in|state of|province|county|river|lake|mountain|island|species|genus|fruit|plant|bird|mammal|chemical element|given name|surname|family name|human settlement|neighbourhood|district|planet|deity|mythology)\b/;

// Tokens for alias-vs-subject-change comparison: diacritics folded, the
// trailing disambiguator dropped, stopwords and plural "s" ignored.
const STOP = new Set(['the', 'a', 'an', 'of', 'and', 'in', 'on', 'for']);
function tokens(s) {
  const folded = cleanLabel(String(s || '')).normalize('NFD').replace(/[̀-ͯ]/g, '');
  return normalize(folded).split(' ').filter(t => t && !STOP.has(t)).map(t => t.replace(/s$/, ''));
}
// A redirect is an alias when the target only expands the label
// ("Yellowstone" → "Yellowstone National Park") or the label is the target's
// acronym ("MIT"). A target that drops words generalizes ("Amazon Fire TV
// Stick" → "Amazon Fire TV", "HBO Max" → "Max"), and one with different
// words changes the subject ("Sour cream and onion" → "French onion dip").
export function redirectIsAlias(label, target) {
  // The target's own disambiguator counts ("Nissan S30" → "Nissan Fairlady
  // Z (S30)" is an alias).
  const a = tokens(label), b = tokens(target).concat(tokens((/\(([^)]*)\)\s*$/.exec(target) || [])[1] || ''));
  if (!a.length || !b.length) return false;
  const sb = new Set(b);
  if (a.every(t => sb.has(t))) return true;
  const compact = normalize(cleanLabel(label)).replace(/ /g, '');
  const initials = normalize(cleanLabel(target)).split(' ').filter(t => !STOP.has(t)).map(t => t[0]).join('');
  return compact.length >= 2 && compact === initials;
}

// Resolve the Wikipedia article + Wikidata entity for a label.
// requireContext: when true (categories where same-name collisions are the
// real risk), a description that doesn't match the topic fails the pin.
// Returns { ok, reason, page, wd, inexact } — `inexact` is set when the pin
// holds but went through a subject-changing redirect, so its picks need a
// second opinion before shipping.
async function pinEntity(unit, { requireContext }) {
  const page = await wikiPage(unit.label);
  const fail = (reason, wd = null) => ({ ok: false, reason, page: page.exists ? page : null, wd, inexact: null });
  if (!page.exists) return fail('no-wikipedia-page');
  if (page.disambig) return fail('disambiguation-page');
  if (page.redirectFragment) return fail(`redirect-to-section:${page.title}#${page.redirectFragment}`);
  const wd = page.qid ? await wikidataEntity(page.qid) : null;
  const desc = `${page.description || ''} ${wd?.description || ''}`.trim();
  const descLc = desc.toLowerCase();
  const short = (desc || 'no description').slice(0, 80);
  if (requireContext && unit.hintWords.length && !descMatches(desc, unit.hintWords)) {
    return fail(`context-mismatch:${short}`, wd);
  }
  if (unit.category === CATS.PERSON && wd?.instanceOf?.length && !wd.instanceOf.includes(HUMAN)) {
    return fail(`not-a-person:${short}`, wd);
  }
  // ("Car model built by Chrysler Corporation" is a product, not a company.)
  if (PRODUCT_CATS.has(unit.category) && COMPANY_DESC.test(descLc) &&
      !/\b(brand|drink|beverage|food|dish|snack|cereal|candy|confection|beer|wine|soda|chocolate|shoe|sneaker|models?|car|cars|vehicle|automobile|smartphone|phone|console|device|laptop|camera|headphones?|earbuds|watch|tablet|product|series|line of)\b/.test(descLc)) {
    return fail(`entity-is-company:${short}`, wd);
  }
  if (unit.category === CATS.BRAND && NOT_A_BRAND_DESC.test(descLc) && !COMPANY_DESC.test(descLc)) {
    return fail(`context-mismatch:${short}`, wd);
  }
  const inexact = page.redirectedFrom && !redirectIsAlias(unit.label, page.title)
    ? `redirect-mismatch:${page.title}` : null;
  return { ok: true, reason: null, page, wd, inexact };
}

function withExactness(pick, pin) {
  if (!pick) return pick;
  return pin?.inexact ? { ...pick, exact: false, inexactReason: pin.inexact } : pick;
}

// Where an entity's own pictures can be trusted to show the item itself.
// Wikidata's image (P18) is reliably the thing for people, places, food and
// products, but for clubs and brands it is often a stadium or storefront, and
// for fictional characters often a cosplayer, statue or the actor off-set.
const P18_TRUSTED = new Set([
  CATS.PERSON, CATS.MUSIC_ARTIST, CATS.PLACE, CATS.FOOD, CATS.DEVICE, CATS.PRODUCT,
  CATS.SNEAKER, CATS.FASHION, CATS.ACTIVITY, CATS.GENERIC, CATS.MUSIC_ALBUM, CATS.MUSIC_TRACK
]);
// Logo-type items are only depicted by a logo/crest/wordmark.
const NEEDS_LOGO = new Set([CATS.BRAND, CATS.TEAM, CATS.SOFTWARE, CATS.PODCAST, CATS.LOGO]);
const looksLikeLogoFile = name =>
  /\b(logo|logotype|crest|emblem|badge|wordmark|svg)\b/.test(String(name || '').toLowerCase().replace(/[_\-.,()]+/g, ' '));

function pageImagePick(page, wd, unit, sourceIdPrefix) {
  // Article lead image first (often the curated infobox image), then the
  // Wikidata P18 image. Both are screened against the blocklist (flags,
  // locator maps, logos-on-photo-categories, cosplay, signatures, …), and
  // marked inexact where that kind of picture can't be trusted to show the
  // item (inexact picks need review or the vision gate to ship).
  const cat = unit.category;
  if (page?.imageUrl && !isBlockedWikiFile(page.imageName, cat, unit.label)) {
    const exact = !NEEDS_LOGO.has(cat) || looksLikeLogoFile(page.imageName);
    return { url: page.imageUrl, source: 'wikipedia', sourceId: `${sourceIdPrefix}:${page.title}`, exact,
      ...(exact ? {} : { inexactReason: 'lead-image-not-a-logo' }) };
  }
  if (wd?.image && !isBlockedWikiFile(wd.image, cat, unit.label)) {
    // Tabletop games' Wikidata images are photos of the game itself (video
    // games' are often event or cosplay photos).
    const tabletop = cat === CATS.GAME && unit.topics.some(t => /\b(board|card|party|tabletop)\b/i.test(t));
    const exact = NEEDS_LOGO.has(cat) ? looksLikeLogoFile(wd.image) : (P18_TRUSTED.has(cat) || tabletop);
    return { url: commonsFileUrl(wd.image), source: 'wikidata-p18', sourceId: `wikidata:${wd.qid}`, exact,
      ...(exact ? {} : { inexactReason: `wikidata-image-unvetted-for-${cat}` }) };
  }
  return null;
}

// Loose picture searches for an item, for the vision gate to try once the
// strict pick has failed it (never for real people).
export const searchCandidates = (unit, keys) => reviewCandidates(unit, keys);

async function reviewCandidates(unit, keys, extras = []) {
  // Loose searches: review-page options, and inputs to the vision gate for
  // non-person items. Never auto-chosen on their own.
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
  const addCand = (c, pinned = false) => {
    if (c?.url) candidates.push({ url: c.url, source: c.source, ...(pinned ? { pinned: true } : {}) });
  };
  // The pinned entity's own images. Only a clean pin vouches for them; after
  // a failed or subject-changing pin they're plain review options.
  const addPinnedImages = (pin) => {
    if (!pin?.page && !pin?.wd) return;
    const vouched = !!pin.ok && !pin.inexact;
    if (pin.page?.imageUrl && !isBlockedWikiFile(pin.page.imageName, cat, unit.label)) {
      addCand({ url: pin.page.imageUrl, source: 'wikipedia' }, vouched);
    }
    if (pin.wd?.image && !isBlockedWikiFile(pin.wd.image, cat, unit.label)) {
      addCand({ url: commonsFileUrl(pin.wd.image), source: 'wikidata-p18' }, vouched && P18_TRUSTED.has(cat));
    }
  };
  const review = async (reason, pin) => {
    if (!pin?.ok && pin?.page?.imageUrl) addCand({ url: pin.page.imageUrl, source: 'wikipedia' });
    return { pick: null, candidates: await reviewCandidates(unit, keys, candidates), reviewReason: reason, searched: true };
  };

  // Hand-set imageUrl in topics.js wins outright (existing escape hatch).
  if (unit.imageUrlOverride) {
    return {
      pick: { url: unit.imageUrlOverride, source: 'topics.js', sourceId: 'imageUrl', exact: true },
      candidates: [], reviewReason: null
    };
  }

  if (cat === CATS.MOVIE || cat === CATS.TV) {
    const isMovie = cat === CATS.MOVIE;
    // Identity first: the film/series article's Wikidata TMDB ID.
    const pin = await pinEntity(unit, { requireContext: false });
    const tmdbId = pin.ok && !pin.inexact ? (isMovie ? pin.wd?.tmdbMovie : pin.wd?.tmdbTv) : null;
    let hit = tmdbId ? await (isMovie ? tmdbMovieById : tmdbTVById)(tmdbId, keys.TMDB_KEY) : null;
    let via = hit?.poster_path ? 'wikidata' : null;
    // Fallback: exact title (+year) search.
    if (!hit?.poster_path) {
      hit = await (isMovie ? tmdbMovieExact : tmdbTVExact)(unit.label, keys.TMDB_KEY);
      via = hit?.poster_path ? 'title' : null;
    }
    if (hit?.poster_path) {
      if (isMovie) {
        addCand({ url: await fanartMoviePoster(hit.id, keys.FANART_KEY), source: 'fanart' }, true);
      } else {
        const tvdbId = await tmdbTvExternalIds(hit.id, keys.TMDB_KEY);
        addCand({ url: await fanartTvPoster(tvdbId, keys.FANART_KEY), source: 'fanart' }, true);
      }
      addPinnedImages(pin);
      const kind = isMovie ? 'tmdb-movie' : 'tmdb-tv';
      return {
        pick: { url: tmdbImg(hit.poster_path), source: 'tmdb', sourceId: `${kind}:${hit.id}${via === 'wikidata' ? ':wikidata' : ''}`, exact: true },
        candidates, reviewReason: null
      };
    }
    if (!isMovie) {
      const tvm = await tvmazeExact(unit.label);
      if (tvm) {
        return {
          pick: { url: tvm, source: 'tvmaze', sourceId: `tvmaze:${cleanLabel(unit.label)}`, exact: true },
          candidates, reviewReason: null
        };
      }
    }
    addPinnedImages(pin);
    return review(isMovie ? 'no-exact-tmdb-match' : 'no-exact-tv-match', pin);
  }

  if (cat === CATS.PERSON) {
    // Entity pin with description sanity check (e.g. an "NFL QBs" topic
    // requires "American football"/"NFL" in the entity description) and a
    // must-be-a-human check.
    const pin = await pinEntity(unit, { requireContext: true });
    if (!pin.ok) {
      addPinnedImages(pin);
      return review(pin.reason, pin);
    }
    // Entertainment people: the TMDB headshot for *this* person, linked by
    // the TMDB person ID on their Wikidata entity (no name search — that's
    // how namesakes slip in). The Wikipedia portrait stays as a candidate.
    if (unit.entertainment && keys.TMDB_KEY && pin.wd?.tmdbPerson) {
      const p = await tmdbPersonById(pin.wd.tmdbPerson, keys.TMDB_KEY);
      const best = p?.id ? (await tmdbPersonBestProfile(p.id, keys.TMDB_KEY)) || tmdbImg(p.profile_path, 'h632') : null;
      if (best) {
        addPinnedImages(pin);
        return {
          pick: withExactness({ url: best, source: 'tmdb-person', sourceId: `tmdb-person:${p.id}`, exact: true }, pin),
          candidates, reviewReason: null
        };
      }
    }
    const pick = pageImagePick(pin.page, pin.wd, unit, 'wikipedia');
    if (pick) {
      addPinnedImages(pin);
      return { pick: withExactness(pick, pin), candidates, reviewReason: null };
    }
    return review('no-image-on-entity', pin);
  }

  if (cat === CATS.MUSIC_ARTIST) {
    // Wikidata descriptions vary ("rapper", "DJ", "record producer"…) —
    // accept any music-flavoured wording, not just musician/band/singer.
    const musicUnit = {
      ...unit,
      hintWords: [...new Set([...unit.hintWords,
        'music', 'rapper', 'dj', 'songwriter', 'composer', 'record producer', 'vocal', 'group', 'duo',
        'boy band', 'girl group', 'pop', 'rock', 'hip hop', 'band'])]
    };
    const pin = await pinEntity(musicUnit, { requireContext: true });
    // Identity first: the MusicBrainz ID on the pinned entity; exact-name
    // MusicBrainz search only when Wikidata has none.
    const mbid = (pin.ok && pin.wd?.musicbrainzArtist) || await musicbrainzArtistExact(unit.label);
    const fan = await fanartArtistThumb(mbid, keys.FANART_KEY);
    // Only a successful pin vouches for a name-matched MusicBrainz artist
    // ("Bush", "Yes" and "Live" are all several bands).
    if (fan && !pin.ok) addCand({ url: fan, source: 'fanart' });
    if (fan && pin.ok) {
      addPinnedImages(pin);
      return {
        pick: withExactness({ url: fan, source: 'fanart', sourceId: `musicbrainz:${mbid}`, exact: true }, pin),
        candidates, reviewReason: null
      };
    }
    if (pin.ok) {
      const pick = pageImagePick(pin.page, pin.wd, unit, 'wikipedia');
      if (pick) {
        addPinnedImages(pin);
        return { pick: withExactness(pick, pin), candidates, reviewReason: null };
      }
    }
    return review(pin.ok ? 'no-image-on-entity' : pin.reason, pin);
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
    addPinnedImages(pin);
    return review('no-exact-podcast-match', pin);
  }

  if (LOGO_CATS.has(cat)) {
    // Teams must really be teams ("Liverpool" alone is the city).
    const pin = await pinEntity(unit, { requireContext: cat === CATS.TEAM });
    if (pin.ok) {
      // A team *season* ("1985 Chicago Bears season") is shown as the team's
      // logo — the season article's lead image is usually one player.
      if (cat === CATS.TEAM && pin.wd?.seasonOf && !pin.wd.logo) {
        const team = await wikidataEntity(pin.wd.seasonOf);
        if (team?.logo) {
          addPinnedImages(pin);
          return {
            pick: withExactness({ url: commonsFileUrl(team.logo), source: 'wikidata-p154', sourceId: `wikidata:${team.qid}:season-of`, exact: true }, pin),
            candidates, reviewReason: null
          };
        }
      }
      // Games: the article lead image is usually the cover art (logos rarely
      // exist). Brands/teams/software: official logo (P154) first.
      if (cat !== CATS.GAME && pin.wd?.logo) {
        addPinnedImages(pin);
        return {
          pick: withExactness({ url: commonsFileUrl(pin.wd.logo), source: 'wikidata-p154', sourceId: `wikidata:${pin.wd.qid}`, exact: true }, pin),
          candidates, reviewReason: null
        };
      }
      const pick = pageImagePick(pin.page, pin.wd, unit, 'wikipedia');
      if (pick) {
        if (pin.wd?.logo) addCand({ url: commonsFileUrl(pin.wd.logo), source: 'wikidata-p154' }, true);
        addPinnedImages(pin);
        return { pick: withExactness(pick, pin), candidates, reviewReason: null };
      }
    }
    for (const c of await commonsSearch(cleanLabel(unit.label), 2)) addCand(c);
    return review(pin.ok ? 'no-image-on-entity' : pin.reason, pin);
  }

  // FOOD / PLACE / DEVICE / PRODUCT / SNEAKER / FASHION / ACTIVITY / CHARACTER
  // / GENERIC (and music albums/tracks, which are rare): the exact Wikipedia
  // article's image.
  const pin = await pinEntity(unit, { requireContext: false });
  if (pin.ok) {
    const pick = pageImagePick(pin.page, pin.wd, unit, 'wikipedia');
    if (pick) {
      addPinnedImages(pin);
      return { pick: withExactness(pick, pin), candidates, reviewReason: null };
    }
  }
  return review(pin.ok ? 'no-image-on-entity' : pin.reason, pin);
}
