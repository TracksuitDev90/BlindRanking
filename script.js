/* =========================================================
   FIRESIDE Blind Rankings — accuracy + performance overhaul
   - Topic-level provider/mediaType drives category (not keyword guessing)
   - Cleaned TMDB label parsing (strips Wikipedia disambiguation)
   - Wikidata P18 (main image) + P154 (logo) support
   - iTunes Search API for music artists/albums
   - TVMaze API for TV show fallback
   - Wikipedia lead image as universal fallback
   - Fetch timeout wrapper (8s default)
   - Loading spinner shown/hidden properly
   - Prefetch cache actually used on render
   - SmartCrop only for cover mode
   - Cancel-stale paints; localStorage resume; confetti hook
   ========================================================= */

(() => {
  'use strict';

  /* ====================== SELECTORS ====================== */
  const SELECTORS = {
    previewImg: '#cardImg, .rank-card__img, .card img, img[data-role="preview"]',
    liveRegion: '[aria-live], .sr-live, #live',
    topicTitle: '#topicTag, .topic-title, #topic-title, [data-role="topic-title"]',
    itemLabel:  '#itemTitle, .item-label, #item-label, [data-role="item-label"]',
    placeWrap:  '#placeButtons, .place-buttons, [data-role="place-buttons"]',
    placeBtns:  'button[data-rank], .btn-rank',
    nextBtn:    '#next-topic, .btn-next, [data-role="next"]',
    newBtn:     '#nextTopicBtn, #new-topic, .btn-new, [data-role="new"]',
    allBtns:    'button',
    loading:    '#cardLoading'
  };

  /* ============================== UTILITIES =============================== */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const once = (el, ev, fn, opts) => el && el.addEventListener(ev, (...a) => { fn(...a); el.removeEventListener(ev, fn, opts); }, opts);
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function normalize(s) {
    return (s || '')
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/["""'']/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
  function titlesEqual(a, b) { return normalize(a) === normalize(b); }
  function yearFrom(label) {
    const m = String(label).match(/\b(19|20)\d{2}\b/);
    return m ? +m[0] : null;
  }

  // Strip Wikipedia-style disambiguation: "Up (2009 film)" → "Up", year extracted separately
  function cleanLabel(label) {
    return (label || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
  }

  function els() {
    const img        = $(SELECTORS.previewImg);
    const live       = $(SELECTORS.liveRegion);
    const topicTitle = $(SELECTORS.topicTitle);
    const itemLabel  = $(SELECTORS.itemLabel);
    const placeWrap  = $(SELECTORS.placeWrap);
    const placeBtns  = placeWrap ? $$(SELECTORS.placeBtns, placeWrap) : $$(SELECTORS.placeBtns);
    const nextBtn    = $(SELECTORS.nextBtn);
    const newBtn     = $(SELECTORS.newBtn);
    const allBtns    = $$(SELECTORS.allBtns);
    const loading    = $(SELECTORS.loading);
    return { img, live, topicTitle, itemLabel, placeWrap, placeBtns, nextBtn, newBtn, allBtns, loading };
  }

  function ariaAnnounce(msg) {
    const { live } = els();
    if (!live) return;
    live.textContent = '';
    setTimeout(() => { live.textContent = msg; }, 30);
  }

  /* ============================== KEYS / CONFIG ============================== */
  const cfg = {
    TMDB_KEY:    (window.CONFIG && window.CONFIG.TMDB_KEY)    || (window.BR_CONFIG && window.BR_CONFIG.TMDB_KEY)    || '',
    OMDB_KEY:    (window.CONFIG && window.CONFIG.OMDB_KEY)    || (window.BR_CONFIG && window.BR_CONFIG.OMDB_KEY)    || '',
    LASTFM_KEY:  (window.CONFIG && window.CONFIG.LASTFM_KEY)  || (window.BR_CONFIG && window.BR_CONFIG.LASTFM_KEY)  || '',
    AUDIO_KEY:   (window.CONFIG && window.CONFIG.AUDIO_KEY)   || (window.BR_CONFIG && window.BR_CONFIG.AUDIO_KEY)   || '',
    PIXABAY_KEY: (window.CONFIG && window.CONFIG.PIXABAY_KEY) || (window.BR_CONFIG && window.BR_CONFIG.PIXABAY_KEY) || ''
  };

  window.BR = window.BR || {};
  window.BR.init = (overrides = {}) => { Object.assign(cfg, overrides); return ensureSmartCrop(); };

  /* ============================= FETCH WITH TIMEOUT ============================= */
  function fetchWithTimeout(url, opts = {}, timeoutMs = 8000) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    return fetch(url, { ...opts, signal: controller.signal })
      .finally(() => clearTimeout(timer));
  }

  /* ============================= APP STATE ============================= */
  const STORAGE = {
    key: 'br_state_v3',
    save(state) { try { localStorage.setItem(this.key, JSON.stringify(state)); } catch(_){} },
    load() { try { return JSON.parse(localStorage.getItem(this.key) || 'null'); } catch(_){ return null; } },
    clear() { try { localStorage.removeItem(this.key); } catch(_){} }
  };

  const App = {
    topics: window.TOPICS || [],
    topicIndex: 0,
    itemIndex:  0,
    ranks:      [],

    hydrate() {
      const data = STORAGE.load();
      if (!data) { this.reset(); return; }
      if (Array.isArray(this.topics) && this.topics.length > 0 && data.topicIndex < this.topics.length) {
        this.topicIndex = data.topicIndex|0;
        this.itemIndex  = data.itemIndex|0;
        this.ranks      = Array.isArray(data.ranks) ? data.ranks : new Array(5).fill(null);
      } else {
        this.reset();
      }
    },
    persist() {
      STORAGE.save({ topicIndex: this.topicIndex, itemIndex: this.itemIndex, ranks: this.ranks });
    },
    reset() {
      this.topicIndex = 0;
      this.itemIndex  = 0;
      this.ranks      = new Array(5).fill(null);
      this.persist();
    },
    currentTopic() { return this.topics[this.topicIndex] || null; },
    currentItem()  { const t = this.currentTopic(); return t?.items?.[this.itemIndex] || null; },
    nextItem()     { const t = this.currentTopic(); if (!t) return null; return t.items?.[this.itemIndex + 1] || null; }
  };

  /* ========================= LOADER GATES & RIPPLE ========================= */
  function setBusy(busy = true) {
    const { allBtns, loading } = els();
    allBtns.forEach(b => b.disabled = !!busy);
    if (loading) {
      loading.hidden = !busy;
      loading.setAttribute('aria-hidden', busy ? 'false' : 'true');
    }
  }

  function installRipple(scope = document) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;
    scope.addEventListener('click', (e) => {
      const target = e.target.closest('button');
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const x = e.clientX - rect.left, y = e.clientY - rect.top;
      const r = document.createElement('span');
      r.className = 'ripple-effect';
      Object.assign(r.style, {
        position: 'absolute',
        left: `${x}px`, top: `${y}px`,
        width: '8px', height: '8px', borderRadius: '50%',
        pointerEvents: 'none', opacity: '0.3', transform: 'translate(-50%,-50%) scale(1)',
        background: 'currentColor'
      });
      target.style.position ||= 'relative';
      target.appendChild(r);
      r.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 0.3 },
        { transform: 'translate(-50%,-50%) scale(18)', opacity: 0.0 }
      ], { duration: 420, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => r.remove();
    }, true);
  }

  function pulse(el) {
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !el?.animate) return;
    el.animate([{ transform: 'scale(0.985)' }, { transform: 'scale(1)' }], { duration: 120, easing: 'ease-out' });
  }

  /* ============================= SMARTCROP LOADER ============================= */
  let smartCropLoaded = false;
  let smartCropFailed = false;
  function ensureSmartCrop() {
    if (smartCropLoaded || smartCropFailed) return Promise.resolve();
    return new Promise((resolve) => {
      if (window.smartcrop) { smartCropLoaded = true; return resolve(); }
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/smartcrop@2.0.6/smartcrop.js';
      s.async = true;
      s.onload = () => { smartCropLoaded = true; resolve(); };
      s.onerror = () => { smartCropFailed = true; console.warn('SmartCrop unavailable, using CSS object-fit.'); resolve(); };
      document.head.appendChild(s);
    });
  }

  /* ============================ CATEGORY SYSTEM ============================ */
  const CATS = {
    MOVIE: 'movie', TV: 'tv', PERSON: 'person',
    MUSIC_ARTIST: 'music-artist', MUSIC_ALBUM: 'music-album', MUSIC_TRACK: 'music-track',
    GAME: 'game', TEAM: 'team', BRAND: 'brand', LOGO: 'logo',
    FOOD: 'food', DEVICE: 'device', PLACE: 'place', GENERIC: 'generic'
  };

  // Topic-level hints are the PRIMARY way to determine category.
  // Keyword fallback only for topics that don't specify provider/mediaType.
  function inferCategory(label, topicHints = {}) {
    // Direct item-level override
    if (topicHints.kind) return topicHints.kind;

    // Topic-level provider + mediaType (this is the main accuracy driver)
    const provider  = topicHints.provider  || '';
    const mediaType = topicHints.mediaType || '';

    if (provider === 'tmdb' && mediaType === 'movie') return CATS.MOVIE;
    if (provider === 'tmdb' && mediaType === 'tv')    return CATS.TV;
    if (mediaType === 'person')                        return CATS.PERSON;

    // Keyword fallback for topics without explicit mediaType
    const n = normalize(label);
    if (/\bseason\b|\bs\d{1,2}\b/.test(n)) return CATS.TV;
    if (/\balbum\b/.test(n)) return CATS.MUSIC_ALBUM;
    if (/\btrack\b|\bsong\b/.test(n)) return CATS.MUSIC_TRACK;
    if (/\bgame\b|\bvideo game\b/.test(n)) return CATS.GAME;
    if (/\bfc\b|\bclub\b|\bunited\b|\bpatriots\b|\blakers\b|\bwarriors\b|\bceltics\b|\bsteelers\b|\bpackers\b|\bcowboys\b/.test(n)) return CATS.TEAM;
    if (/\binc\b|\bcorp\b|\bco\b|\bllc\b|\bltd\b|\bcompany\b|\bbrand\b/.test(n)) return CATS.BRAND;
    if (/\blogo\b/.test(n)) return CATS.LOGO;
    if (/\bburger\b|\bpizza\b|\btaco\b|\bsushi\b|\bfries\b|\bcoffee\b|\btea\b|\bcheese\b|\bchicken\b|\bsoup\b|\bsalad\b|\bbread\b|\bpie\b|\bcake\b|\bice cream\b/.test(n)) return CATS.FOOD;
    if (/\biphone\b|\bgalaxy\b|\bipad\b|\bmacbook\b|\bplaystation\b|\bxbox\b|\bcamera\b|\blaptop\b|\bwatch\b/.test(n)) return CATS.DEVICE;
    if (/\bpark\b|\bbridge\b|\blake\b|\bmountain\b|\bcity\b|\bcountry\b|\bstate\b|\bbeach\b|\bcastle\b|\bmuseum\b|\btower\b/.test(n)) return CATS.PLACE;
    if (/\bactor\b|\bactress\b|\bdirector\b|\bproducer\b/.test(n)) return CATS.PERSON;

    return CATS.GENERIC;
  }

  function buildContext(label, cat) {
    const base = cleanLabel(label);
    switch (cat) {
      case CATS.PERSON:       return `${base} portrait photo`;
      case CATS.MOVIE:        return `${base} official movie poster`;
      case CATS.TV:           return `${base} official tv show poster`;
      case CATS.MUSIC_ALBUM:  return `${base} official album cover`;
      case CATS.MUSIC_TRACK:  return `${base} official single cover`;
      case CATS.MUSIC_ARTIST: return `${base} artist photo portrait`;
      case CATS.GAME:         return `${base} video game logo`;
      case CATS.LOGO: case CATS.BRAND: case CATS.TEAM:
                              return `${base} official logo`;
      case CATS.FOOD:         return `${base} plated dish food photography`;
      case CATS.DEVICE:       return `${base} product photo`;
      case CATS.PLACE:        return `${base} landmark photo`;
      default:                return `${base} photo`;
    }
  }

  /* ============================ DUPLICATE CONTROL ============================ */
  const seen = new Set();
  function resetSeen() { seen.clear(); }
  function markSeen(url) { if (url) seen.add(url.replace(/\?.*$/, '')); }
  function isSeen(url)   { return url ? seen.has(url.replace(/\?.*$/, '')) : false; }

  /* ============================== PROVIDERS ============================== */

  // --- TMDB (movies, TV, people) ---
  function tmdbImage(path, size = 'w500') { return path ? `https://image.tmdb.org/t/p/${size}${path}` : null; }

  async function tmdbSearchMovie(title, year) {
    if (!cfg.TMDB_KEY) return null;
    const clean = cleanLabel(title);
    const u = new URL('https://api.themoviedb.org/3/search/movie');
    u.searchParams.set('api_key', cfg.TMDB_KEY);
    u.searchParams.set('query', clean);
    if (year) u.searchParams.set('year', year);
    try {
      const r = await fetchWithTimeout(u); if (!r.ok) return null;
      const j = await r.json();
      // Try exact match first, then accept first result (topic already guarantees it's a movie)
      const exact = j.results?.find(x => titlesEqual(x.title, clean) || titlesEqual(x.original_title, clean));
      return exact || j.results?.[0] || null;
    } catch(_) { return null; }
  }

  async function tmdbSearchTV(title, year) {
    if (!cfg.TMDB_KEY) return null;
    const clean = cleanLabel(title);
    const u = new URL('https://api.themoviedb.org/3/search/tv');
    u.searchParams.set('api_key', cfg.TMDB_KEY);
    u.searchParams.set('query', clean);
    if (year) u.searchParams.set('first_air_date_year', year);
    try {
      const r = await fetchWithTimeout(u); if (!r.ok) return null;
      const j = await r.json();
      const exact = j.results?.find(x => titlesEqual(x.name, clean) || titlesEqual(x.original_name, clean));
      return exact || j.results?.[0] || null;
    } catch(_) { return null; }
  }

  async function tmdbSearchPerson(name) {
    if (!cfg.TMDB_KEY) return null;
    const clean = cleanLabel(name);
    const u = new URL('https://api.themoviedb.org/3/search/person');
    u.searchParams.set('api_key', cfg.TMDB_KEY);
    u.searchParams.set('query', clean);
    try {
      const r = await fetchWithTimeout(u); if (!r.ok) return null;
      const j = await r.json();
      const exact = j.results?.find(x => titlesEqual(x.name, clean));
      return exact || j.results?.[0] || null;
    } catch(_) { return null; }
  }

  // --- TheAudioDB (album/track covers) ---
  async function theAudioDBAlbumCover(artist, album) {
    if (!cfg.AUDIO_KEY) return null;
    try {
      const u = new URL(`https://theaudiodb.com/api/v1/json/${cfg.AUDIO_KEY}/searchalbum.php`);
      u.searchParams.set('s', artist);
      u.searchParams.set('a', album);
      const r = await fetchWithTimeout(u); if (!r.ok) return null;
      const j = await r.json();
      const exact = j?.album?.find(a => titlesEqual(a.strArtist, artist) && titlesEqual(a.strAlbum, album));
      return exact?.strAlbumThumbHQ || exact?.strAlbumThumb || null;
    } catch(_) { return null; }
  }

  async function theAudioDBTrackCover(artist, track) {
    if (!cfg.AUDIO_KEY) return null;
    try {
      const u = new URL(`https://theaudiodb.com/api/v1/json/${cfg.AUDIO_KEY}/searchtrack.php`);
      u.searchParams.set('s', artist);
      u.searchParams.set('t', track);
      const r = await fetchWithTimeout(u); if (!r.ok) return null;
      const j = await r.json();
      const exact = j?.track?.find(t => titlesEqual(t.strArtist, artist) && titlesEqual(t.strTrack, track));
      return exact?.strTrackThumbHQ || exact?.strTrackThumb || null;
    } catch(_) { return null; }
  }

  // --- iTunes Search API (music artists, albums — replaces deprecated Last.fm images) ---
  async function itunesArtistImage(artist) {
    const clean = cleanLabel(artist);
    try {
      const u = new URL('https://itunes.apple.com/search');
      u.searchParams.set('term', clean);
      u.searchParams.set('media', 'music');
      u.searchParams.set('entity', 'musicArtist');
      u.searchParams.set('limit', '5');
      const r = await fetchWithTimeout(u); if (!r.ok) return null;
      const j = await r.json();
      const match = j?.results?.find(x => titlesEqual(x.artistName, clean));
      // iTunes artist results don't have images directly, but musicArtist entity
      // may not have artworkUrl. Try allMusic or fall through.
      // Instead search for a top song to get artwork
      if (!match) return null;
      return await itunesArtistArtwork(clean);
    } catch(_) { return null; }
  }

  async function itunesArtistArtwork(artist) {
    try {
      const u = new URL('https://itunes.apple.com/search');
      u.searchParams.set('term', artist);
      u.searchParams.set('media', 'music');
      u.searchParams.set('entity', 'song');
      u.searchParams.set('limit', '3');
      const r = await fetchWithTimeout(u); if (!r.ok) return null;
      const j = await r.json();
      const hit = j?.results?.[0];
      if (!hit?.artworkUrl100) return null;
      // Upscale to 600x600
      return hit.artworkUrl100.replace('100x100', '600x600');
    } catch(_) { return null; }
  }

  // --- TVMaze (TV show fallback) ---
  async function tvmazeImage(title) {
    const clean = cleanLabel(title);
    try {
      const u = new URL('https://api.tvmaze.com/singlesearch/shows');
      u.searchParams.set('q', clean);
      const r = await fetchWithTimeout(u); if (!r.ok) return null;
      const j = await r.json();
      return j?.image?.original || j?.image?.medium || null;
    } catch(_) { return null; }
  }

  // --- Wikidata (P18 main image + P154 logo) ---
  async function wikidataQID(label) {
    const clean = cleanLabel(label);
    try {
      const u = new URL('https://www.wikidata.org/w/api.php');
      u.searchParams.set('action', 'wbsearchentities');
      u.searchParams.set('search', clean);
      u.searchParams.set('language', 'en');
      u.searchParams.set('format', 'json');
      u.searchParams.set('origin', '*');
      const r = await fetchWithTimeout(u); if (!r.ok) return null;
      const j = await r.json();
      const exact = j?.search?.find(e => titlesEqual(e.label, clean));
      return (exact || j?.search?.[0])?.id || null;
    } catch(_) { return null; }
  }

  async function wikidataImageByQID(qid, property) {
    if (!qid) return null;
    try {
      const u = new URL('https://www.wikidata.org/w/api.php');
      u.searchParams.set('action', 'wbgetclaims');
      u.searchParams.set('entity', qid);
      u.searchParams.set('property', property);
      u.searchParams.set('format', 'json');
      u.searchParams.set('origin', '*');
      const r = await fetchWithTimeout(u); if (!r.ok) return null;
      const j = await r.json();
      const claim = j?.claims?.[property]?.[0]?.mainsnak?.datavalue?.value;
      if (!claim) return null;
      const file = claim.replace(/ /g, '_');
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=800`;
    } catch(_) { return null; }
  }

  // --- Wikipedia lead image (universal fallback) ---
  async function wikipediaLeadImage(label) {
    const clean = cleanLabel(label);
    try {
      const r = await fetchWithTimeout(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(label)}`);
      if (!r.ok) {
        // Try with cleaned label if original had disambiguation
        if (clean !== label) {
          const r2 = await fetchWithTimeout(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(clean)}`);
          if (!r2.ok) return null;
          const j2 = await r2.json();
          return j2?.originalimage?.source || j2?.thumbnail?.source || null;
        }
        return null;
      }
      const j = await r.json();
      return j?.originalimage?.source || j?.thumbnail?.source || null;
    } catch(_) { return null; }
  }

  // --- Pixabay (last-resort fallback) ---
  async function pixabayImage(query) {
    if (!cfg.PIXABAY_KEY) return null;
    try {
      const u = new URL('https://pixabay.com/api/');
      u.searchParams.set('key', cfg.PIXABAY_KEY);
      u.searchParams.set('q', query);
      u.searchParams.set('image_type', 'photo');
      u.searchParams.set('safesearch', 'true');
      u.searchParams.set('per_page', '5');
      const r = await fetchWithTimeout(u); if (!r.ok) return null;
      const j = await r.json();
      return j?.hits?.[0]?.largeImageURL || j?.hits?.[0]?.webformatURL || null;
    } catch(_) { return null; }
  }

  /* ============================ RESOLVER ============================ */
  // The resolver uses topic-level hints to pick the right provider chain.
  // This is the key accuracy improvement: "Up" in a movie topic → TMDB movie search,
  // not keyword guessing that would miss it entirely.

  async function resolveImageURL(item, topicHints = {}) {
    const label = item?.label || '';
    const hints = { ...topicHints, ...(item?.hints || {}) };
    const cat = inferCategory(label, hints);
    const y   = hints.year || yearFrom(label);

    // If item has a hardcoded imageUrl, use it directly
    if (item?.imageUrl) return item.imageUrl;

    // --- MOVIES (TMDB primary → Wikipedia fallback) ---
    if (cat === CATS.MOVIE) {
      const m = await tmdbSearchMovie(label, y);
      const url = m ? (tmdbImage(m.poster_path, 'w500') || tmdbImage(m.backdrop_path, 'w780')) : null;
      if (url && !isSeen(url)) return url;
      // Fallback: Wikipedia
      const wiki = await wikipediaLeadImage(label);
      if (wiki && !isSeen(wiki)) return wiki;
      return null;
    }

    // --- TV (TMDB primary → TVMaze → Wikipedia fallback) ---
    if (cat === CATS.TV) {
      const t = await tmdbSearchTV(label, y);
      const url = t ? (tmdbImage(t.poster_path, 'w500') || tmdbImage(t.backdrop_path, 'w780')) : null;
      if (url && !isSeen(url)) return url;
      // Fallback: TVMaze
      const tvmaze = await tvmazeImage(label);
      if (tvmaze && !isSeen(tvmaze)) return tvmaze;
      // Fallback: Wikipedia
      const wiki = await wikipediaLeadImage(label);
      if (wiki && !isSeen(wiki)) return wiki;
      return null;
    }

    // --- PEOPLE (TMDB person → Wikipedia → Wikidata P18) ---
    if (cat === CATS.PERSON) {
      const p = await tmdbSearchPerson(label);
      const url = p ? tmdbImage(p.profile_path, 'w500') : null;
      if (url && !isSeen(url)) return url;
      // Fallback: Wikipedia
      const wiki = await wikipediaLeadImage(label);
      if (wiki && !isSeen(wiki)) return wiki;
      // Fallback: Wikidata P18
      const qid = await wikidataQID(label);
      const wd = await wikidataImageByQID(qid, 'P18');
      if (wd && !isSeen(wd)) return wd;
      return null;
    }

    // --- MUSIC ALBUM ---
    if (cat === CATS.MUSIC_ALBUM && hints.artist) {
      const url = await theAudioDBAlbumCover(hints.artist, label);
      if (url && !isSeen(url)) return url;
      // iTunes fallback
      const it = await itunesArtistArtwork(label + ' ' + hints.artist);
      if (it && !isSeen(it)) return it;
      return null;
    }

    // --- MUSIC TRACK ---
    if (cat === CATS.MUSIC_TRACK && hints.artist) {
      const url = await theAudioDBTrackCover(hints.artist, label);
      if (url && !isSeen(url)) return url;
      return null;
    }

    // --- MUSIC ARTIST (iTunes artwork from top song → Wikipedia → Wikidata P18) ---
    if (cat === CATS.MUSIC_ARTIST) {
      const it = await itunesArtistArtwork(cleanLabel(label));
      if (it && !isSeen(it)) return it;
      const wiki = await wikipediaLeadImage(label);
      if (wiki && !isSeen(wiki)) return wiki;
      const qid = await wikidataQID(label);
      const wd = await wikidataImageByQID(qid, 'P18');
      if (wd && !isSeen(wd)) return wd;
      return null;
    }

    // --- LOGOS / BRANDS / TEAMS / GAMES ---
    if (cat === CATS.LOGO || cat === CATS.BRAND || cat === CATS.TEAM || cat === CATS.GAME) {
      const qid  = await wikidataQID(label);
      // Try logo (P154) first, then main image (P18)
      const logo = await wikidataImageByQID(qid, 'P154');
      if (logo && !isSeen(logo)) return logo;
      const p18 = await wikidataImageByQID(qid, 'P18');
      if (p18 && !isSeen(p18)) return p18;
      const wiki = await wikipediaLeadImage(label);
      if (wiki && !isSeen(wiki)) return wiki;
      return null;
    }

    // --- EVERYTHING ELSE (Wikipedia → Wikidata P18 → Pixabay) ---
    // Wikipedia is the best free source for specific items (foods, animals, places, etc.)
    const wiki = await wikipediaLeadImage(label);
    if (wiki && !isSeen(wiki)) return wiki;

    const qid = await wikidataQID(label);
    const wd = await wikidataImageByQID(qid, 'P18');
    if (wd && !isSeen(wd)) return wd;

    // Last resort: Pixabay with context-enriched query
    const ctx = buildContext(label, cat);
    const pb  = await pixabayImage(ctx);
    return pb && !isSeen(pb) ? pb : null;
  }

  /* =========================== RENDERING =========================== */
  function chooseRenderMode(cat) {
    if (cat === CATS.LOGO || cat === CATS.BRAND || cat === CATS.TEAM || cat === CATS.GAME) return 'contain';
    if (cat === CATS.MUSIC_ALBUM || cat === CATS.MUSIC_TRACK) return 'contain';
    return 'cover-smart';
  }

  function getTargetSizeFor(imgEl) {
    const rect = imgEl.getBoundingClientRect();
    let w = Math.max(1, Math.round(rect.width))  || 512;
    let h = Math.max(1, Math.round(rect.height)) || 384;
    const MAX = 1600;
    if (w > MAX || h > MAX) {
      const s = Math.min(MAX / w, MAX / h);
      w = Math.round(w * s);
      h = Math.round(h * s);
    }
    return { w, h };
  }

  async function smartRenderInto(imgEl, srcURL, mode, bg = 'transparent') {
    // For 'contain' mode or if SmartCrop is unavailable, use CSS object-fit (faster)
    if (mode === 'contain' || smartCropFailed) {
      imgEl.style.objectFit = mode === 'contain' ? 'contain' : 'cover';
      imgEl.style.objectPosition = 'center';
      return new Promise((resolve, reject) => {
        const temp = new Image();
        temp.crossOrigin = 'anonymous';
        temp.onload = () => {
          imgEl.src = srcURL;
          imgEl.setAttribute('data-processed', '1');
          resolve(srcURL);
        };
        temp.onerror = () => reject(new Error('Image load failed: ' + srcURL));
        temp.src = srcURL;
      });
    }

    // For 'cover-smart': use SmartCrop for face/object-aware cropping
    await ensureSmartCrop();
    if (!window.smartcrop) {
      // SmartCrop not available, fall back to CSS
      imgEl.style.objectFit = 'cover';
      imgEl.style.objectPosition = 'center';
      return new Promise((resolve, reject) => {
        const temp = new Image();
        temp.crossOrigin = 'anonymous';
        temp.onload = () => { imgEl.src = srcURL; resolve(srcURL); };
        temp.onerror = () => reject(new Error('Image load failed: ' + srcURL));
        temp.src = srcURL;
      });
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const { w: tw, h: th } = getTargetSizeFor(imgEl);
          const canvas = document.createElement('canvas');
          canvas.width = tw; canvas.height = th;
          const ctx = canvas.getContext('2d');

          const crop = await window.smartcrop.crop(img, { width: tw, height: th, minScale: 1.0, ruleOfThirds: true });
          const top = crop?.topCrop || crop?.crops?.[0] || { x: 0, y: 0, width: img.width, height: img.height };
          const sx = clamp(Math.round(top.x), 0, img.width);
          const sy = clamp(Math.round(top.y), 0, img.height);
          const sw = clamp(Math.round(top.width),  1, img.width  - sx);
          const sh = clamp(Math.round(top.height), 1, img.height - sy);
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, tw, th);

          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('toBlob failed'));
            const prev = imgEl.getAttribute('data-blob');
            if (prev) { try { URL.revokeObjectURL(prev); } catch(_){} }
            const url = URL.createObjectURL(blob);
            imgEl.src = url;
            imgEl.style.objectFit = 'cover';
            imgEl.setAttribute('data-blob', url);
            imgEl.setAttribute('data-processed', '1');
            resolve(url);
          }, 'image/jpeg', 0.92); // JPEG is faster than PNG for photos
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error('Image load failed: ' + srcURL));
      img.src = srcURL;
    });
  }

  /* ======================= CANCEL-STALE / PREFETCH ======================= */
  let paintToken = 0;
  const prefetchCache = new Map();

  async function resolveAndRender(item) {
    const { img, itemLabel } = els();
    if (!img || !item) return false;

    if (itemLabel) itemLabel.textContent = item.label || '';

    const myToken = ++paintToken;
    setBusy(true);
    img.alt = item.label || '';

    // Get topic-level hints to pass to resolver
    const topic = App.currentTopic();
    const topicHints = {
      provider:  topic?.provider  || '',
      mediaType: topic?.mediaType || ''
    };

    try {
      // Check prefetch cache first
      const cacheKey = normalize(item.label);
      let url = prefetchCache.get(cacheKey) || null;
      if (!url || isSeen(url)) {
        prefetchCache.delete(cacheKey);
        url = await resolveImageURL(item, topicHints);
      }
      if (myToken !== paintToken) return false;
      if (!url) throw new Error('No image found for: ' + (item.label || ''));

      markSeen(url);

      const cat  = inferCategory(item.label, topicHints);
      const mode = chooseRenderMode(cat);
      await smartRenderInto(img, url, mode, 'transparent');
      if (myToken !== paintToken) return false;

      ariaAnnounce(`Loaded image for ${item.label}`);
      pulse(img);
      prefetchNext();
      return true;
    } catch (err) {
      console.warn('Image resolve failed:', err.message);
      // Fallback: context-enriched Pixabay
      if (myToken !== paintToken) return false;
      const cat = inferCategory(item.label, topicHints);
      const ctx = buildContext(item.label, cat);
      const pb  = await pixabayImage(ctx);
      if (pb && !isSeen(pb) && myToken === paintToken) {
        markSeen(pb);
        img.style.objectFit = 'cover';
        img.src = pb;
        ariaAnnounce(`Loaded fallback image for ${item.label}`);
        pulse(img);
        prefetchNext();
        return true;
      }
      if (myToken === paintToken) {
        img.removeAttribute('src');
        ariaAnnounce(`Couldn't load image for ${item.label}`);
      }
      return false;
    } finally {
      if (myToken === paintToken) setBusy(false);
      App.persist();
    }
  }

  async function prefetchNext() {
    const next = App.nextItem();
    if (!next) return;
    const key = normalize(next.label);
    if (prefetchCache.has(key)) return;

    const topic = App.currentTopic();
    const topicHints = {
      provider:  topic?.provider  || '',
      mediaType: topic?.mediaType || ''
    };

    try {
      const url = await resolveImageURL(next, topicHints);
      if (!url) return;
      // Preload the image into browser cache
      const img = new Image();
      img.crossOrigin = 'anonymous';
      const loaded = new Promise((resolve) => {
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        // Timeout after 10s
        setTimeout(() => resolve(false), 10000);
      });
      img.src = url;
      const ok = await loaded;
      if (ok) prefetchCache.set(key, url);
    } catch(_) {}
  }

  /* ============================== UI BINDINGS ============================== */
  function renderTopicTitle() {
    const t = App.currentTopic();
    const { topicTitle } = els();
    if (topicTitle) topicTitle.textContent = t?.name || t?.title || '';
  }

  function bindPlaceButtons() {
    const { placeBtns } = els();
    placeBtns.forEach(btn => {
      const r = parseInt(btn.getAttribute('data-rank') || btn.dataset.rank || '', 10);
      if (!Number.isFinite(r)) return;
      on(btn, 'click', async () => {
        App.ranks[r - 1] = App.currentItem();
        App.persist();
        const t = App.currentTopic();
        if (!t) return;
        if (App.itemIndex < (t.items.length - 1)) {
          App.itemIndex += 1;
          await resolveAndRender(App.currentItem());
        } else {
          const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          if (!reduce && window.fireConfetti) { try { window.fireConfetti(); } catch(_){} }
        }
      });
    });
  }

  function bindNavButtons() {
    const { nextBtn, newBtn } = els();
    on(nextBtn, 'click', async () => {
      const t = App.currentTopic(); if (!t) return;
      App.itemIndex = Math.min(App.itemIndex + 1, t.items.length - 1);
      await resolveAndRender(App.currentItem());
    });
    on(newBtn, 'click', async () => {
      if (!App.topics.length) return;
      App.topicIndex = (App.topicIndex + 1) % App.topics.length;
      App.itemIndex  = 0;
      App.ranks      = new Array(5).fill(null);
      resetSeen();
      prefetchCache.clear();
      renderTopicTitle();
      await resolveAndRender(App.currentItem());
    });
  }

  function installKeyboardShortcuts() {
    on(document, 'keydown', async (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = e.keyCode - 48;
      if (n >= 1 && n <= 5) {
        const t = App.currentTopic(); if (!t) return;
        App.ranks[n - 1] = App.currentItem();
        App.persist();
        if (App.itemIndex < (t.items.length - 1)) {
          App.itemIndex += 1;
          await resolveAndRender(App.currentItem());
        }
      }
    });
  }

  /* =============================== BOOT =============================== */
  async function boot() {
    installRipple(document);
    App.hydrate();
    if (!Array.isArray(App.topics) || App.topics.length === 0) {
      console.warn('No topics found. Check that topics.js sets window.TOPICS.');
    }
    try { await ensureSmartCrop(); } catch(e) { console.warn('SmartCrop not available, continuing.', e); }
    renderTopicTitle();
    bindPlaceButtons();
    bindNavButtons();
    installKeyboardShortcuts();
    if (!App.currentItem()) { App.reset(); }
    await resolveAndRender(App.currentItem());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.BR.resetSeen = resetSeen;
  window.BR.resolveAndRender = resolveAndRender;

})();
