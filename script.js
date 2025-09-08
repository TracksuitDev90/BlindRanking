/* =========================================================
   FIRESIDE Blind Rankings — accuracy + UX hardened build
   - Context-aware image queries (burger/tea/pizza/device)
   - Strict TMDB matching (no short-title drift)
   - Wikidata logo preference (P154) (+ basic P31 sanity)
   - Duplicate-image avoidance within a topic
   - No stock for risky classes (team/brand/logo/device/place) unless forced
   - Loader gates: disable ALL buttons only during image load
   - Stronger ripple (mobile-friendly)
   - Cancel stale paints; prefetch next; localStorage resume; confetti hook
   - SmartCrop.js for face/object-aware "cover" cropping
   - "Contain" letterboxing for logos/covers to avoid bad crops
   ========================================================= */

(() => {
  'use strict';

  /* ====================== SELECTORS (tweak if needed) ====================== */
  const SELECTORS = {
    previewImg: '.rank-card__img, #card-img, .card img, img[data-role="preview"]',
    liveRegion: '[aria-live], .sr-live, #live',
    topicTitle: '.topic-title, #topic-title, [data-role="topic-title"]',
    itemLabel:  '.item-label, #item-label, [data-role="item-label"]',
    placeWrap:  '.place-buttons, #place-buttons, [data-role="place-buttons"]',
    placeBtns:  'button[data-rank], .btn-rank',
    nextBtn:    '#next-topic, .btn-next, [data-role="next"]',
    newBtn:     '#new-topic, .btn-new,  [data-role="new"]',
    allBtns:    'button'
  };

  /* ============================== UTILITIES =============================== */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const once = (el, ev, fn, opts) => el && el.addEventListener(ev, (...a) => (fn(...a), el.removeEventListener(ev, fn, opts)), opts);
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));

  function normalize(s) {
    return (s || '')
      .toLowerCase()
      .replace(/&/g, 'and')
      .replace(/[“”"']/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }
  function titlesEqual(a, b) { return normalize(a) === normalize(b); }
  function yearFrom(label) {
    const m = String(label).match(/\b(19|20)\d{2}\b/);
    return m ? +m[0] : null;
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
    return { img, live, topicTitle, itemLabel, placeWrap, placeBtns, nextBtn, newBtn, allBtns };
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
      if (Array.isArray(this.topics) && data.topicIndex < this.topics.length) {
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
  function setBusy(on = true) {
    els().allBtns.forEach(b => b.disabled = !!on);
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
  function ensureSmartCrop() {
    return new Promise((resolve, reject) => {
      if (window.smartcrop) return resolve();
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/smartcrop@2.0.6/smartcrop.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('SmartCrop failed to load'));
      document.head.appendChild(s);
    });
  }

  /* ============================ CATEGORY / CONTEXT ============================ */
  const CATS = {
    MOVIE: 'movie', TV: 'tv', PERSON: 'person',
    MUSIC_ARTIST: 'music-artist', MUSIC_ALBUM: 'music-album', MUSIC_TRACK: 'music-track',
    GAME: 'game', TEAM: 'team', BRAND: 'brand', LOGO: 'logo',
    FOOD: 'food', DEVICE: 'device', PLACE: 'place', GENERIC: 'generic'
  };

  function inferCategory(label, hints = {}) {
    const n = normalize(label);
    if (hints.kind) return hints.kind;

    if (/\bseason\b|\bs\d{1,2}\b/.test(n)) return CATS.TV;
    if (/\balbum\b/.test(n)) return CATS.MUSIC_ALBUM;
    if (/\btrack\b|\bsong\b/.test(n)) return CATS.MUSIC_TRACK;
    if (/\bgame\b|\bvideo game\b/.test(n)) return CATS.GAME;
    if (/\bfc\b|\bclub\b|\bunited\b|\bcity\b|\bpatriots\b|\blakers\b|\bwarriors\b/.test(n)) return CATS.TEAM;
    if (/\binc\b|\bcorp\b|\bco\b|\bllc\b|\bltd\b|\bcompany\b|\blogo\b|\bbrand\b/.test(n)) return CATS.BRAND;
    if (/\blogo\b/.test(n)) return CATS.LOGO;
    if (/\bburger\b|\bpizza\b|\btaco\b|\bsushi\b|\bfries\b|\bcoffee\b|\btea\b|\bmushroom\b|\bswiss\b/.test(n)) return CATS.FOOD;
    if (/\biphone\b|\bgalaxy\b|\bipad\b|\bmacbook\b|\bplaystation\b|\bxbox\b|\bcamera\b/.test(n)) return CATS.DEVICE;
    if (/\bpark\b|\bbridge\b|\blake\b|\bmountain\b|\bcity\b|\bcountry\b|\bstate\b/.test(n)) return CATS.PLACE;
    if (/\bactor\b|\bactress\b|\bdirector\b|\bproducer\b/.test(n)) return CATS.PERSON;

    return CATS.GENERIC;
  }

  function buildContext(label, cat, hints = {}) {
    const base = normalize(label);
    const toks = [];
    switch (cat) {
      case CATS.PERSON:
        toks.push(`${base} portrait headshot face centered photo`, 'front view professional photography'); break;
      case CATS.MOVIE:
        toks.push(`${base} official movie poster`, String(hints.year || yearFrom(label) || '')); toks.push('no fan art no parody'); break;
      case CATS.TV:
        toks.push(`${base} official tv poster`, String(hints.year || yearFrom(label) || '')); toks.push('no fan art no parody'); break;
      case CATS.MUSIC_ALBUM:
        toks.push(`${base} official album cover square`, 'no fan art no lyric video'); break;
      case CATS.MUSIC_TRACK:
        toks.push(`${base} official single cover square`, 'no fan art'); break;
      case CATS.MUSIC_ARTIST:
        toks.push(`${base} artist press photo portrait`); break;
      case CATS.GAME:
        toks.push(`${base} official video game logo transparent`, 'no fan art no box mockup'); break;
      case CATS.LOGO: case CATS.BRAND: case CATS.TEAM:
        toks.push(`${base} official logo transparent background svg png`, 'centered no mockup no banner'); break;
      case CATS.FOOD:
        toks.push(`${base} plated dish food photography`, 'no raw ingredients no recipe text');
        if (/\bmushroom\b/.test(base)) toks.push('mushroom');
        if (/\bswiss\b/.test(base))    toks.push('swiss cheese');
        if (/\bburger\b/.test(base))   toks.push('burger sandwich');
        break;
      case CATS.DEVICE:
        toks.push(`${base} product photo front view`, 'studio lighting isolated'); break;
      case CATS.PLACE:
        toks.push(`${base} landmark skyline wide shot`); break;
      default:
        toks.push(`${base} high quality photo`);
    }
    return toks.filter(Boolean).join(' ').trim();
  }

  /* ============================ DUPLICATE CONTROL ============================ */
  const seen = new Set();
  function resetSeen() { seen.clear(); }
  function markSeen(url) { if (url) seen.add(url.replace(/\?.*$/, '')); }
  function isSeen(url)   { return url ? seen.has(url.replace(/\?.*$/, '')) : false; }

  /* ============================== PROVIDERS ============================== */
  // TMDB
  function tmdbImage(path, size = 'w500') { return path ? `https://image.tmdb.org/t/p/${size}${path}` : null; }
  async function tmdbSearchMovie(title, year) {
    if (!cfg.TMDB_KEY) return null;
    const u = new URL('https://api.themoviedb.org/3/search/movie');
    u.searchParams.set('api_key', cfg.TMDB_KEY);
    u.searchParams.set('query', title);
    if (year) u.searchParams.set('year', year);
    const r = await fetch(u); if (!r.ok) return null;
    const j = await r.json();
    return j.results?.find(x => titlesEqual(x.title, title) || titlesEqual(x.original_title, title)) || null;
  }
  async function tmdbSearchTV(title, year) {
    if (!cfg.TMDB_KEY) return null;
    const u = new URL('https://api.themoviedb.org/3/search/tv');
    u.searchParams.set('api_key', cfg.TMDB_KEY);
    u.searchParams.set('query', title);
    if (year) u.searchParams.set('first_air_date_year', year);
    const r = await fetch(u); if (!r.ok) return null;
    const j = await r.json();
    return j.results?.find(x => titlesEqual(x.name, title) || titlesEqual(x.original_name, title)) || null;
  }
  async function tmdbSearchPerson(name) {
    if (!cfg.TMDB_KEY) return null;
    const u = new URL('https://api.themoviedb.org/3/search/person');
    u.searchParams.set('api_key', cfg.TMDB_KEY);
    u.searchParams.set('query', name);
    const r = await fetch(u); if (!r.ok) return null;
    const j = await r.json();
    return j.results?.find(x => titlesEqual(x.name, name)) || null;
  }

  // Last.fm / TheAudioDB
  async function lastfmArtistImage(artist) {
    if (!cfg.LASTFM_KEY) return null;
    const u = new URL('https://ws.audioscrobbler.com/2.0/');
    u.searchParams.set('method', 'artist.getinfo');
    u.searchParams.set('artist', artist);
    u.searchParams.set('api_key', cfg.LASTFM_KEY);
    u.searchParams.set('format', 'json');
    const r = await fetch(u); if (!r.ok) return null;
    const j = await r.json();
    const ok = j?.artist?.name && titlesEqual(j.artist.name, artist);
    if (!ok) return null;
    const images = j?.artist?.image || [];
    const best = images.reverse().find(im => im['#text']);
    return best ? best['#text'] : null;
  }
  async function theAudioDBAlbumCover(artist, album) {
    if (!cfg.AUDIO_KEY) return null;
    const u = new URL(`https://theaudiodb.com/api/v1/json/${cfg.AUDIO_KEY}/searchalbum.php`);
    u.searchParams.set('s', artist);
    u.searchParams.set('a', album);
    const r = await fetch(u); if (!r.ok) return null;
    const j = await r.json();
    const exact = j?.album?.find(a => titlesEqual(a.strArtist, artist) && titlesEqual(a.strAlbum, album));
    return exact?.strAlbumThumbHQ || exact?.strAlbumThumb || null;
  }
  async function theAudioDBTrackCover(artist, track) {
    if (!cfg.AUDIO_KEY) return null;
    const u = new URL(`https://theaudiodb.com/api/v1/json/${cfg.AUDIO_KEY}/searchtrack.php`);
    u.searchParams.set('s', artist);
    u.searchParams.set('t', track);
    const r = await fetch(u); if (!r.ok) return null;
    const j = await r.json();
    const exact = j?.track?.find(t => titlesEqual(t.strArtist, artist) && titlesEqual(t.strTrack, track));
    return exact?.strTrackThumbHQ || exact?.strTrackThumb || null;
  }

  // Wikidata / Wikipedia (logos first; basic P31 sanity when available)
  async function wikidataQID(label) {
    const u = new URL('https://www.wikidata.org/w/api.php');
    u.searchParams.set('action', 'wbsearchentities');
    u.searchParams.set('search', label);
    u.searchParams.set('language', 'en');
    u.searchParams.set('format', 'json');
    u.searchParams.set('origin', '*');
    const r = await fetch(u); if (!r.ok) return null;
    const j = await r.json();
    const exact = j?.search?.find(e => titlesEqual(e.label, label));
    return (exact || j?.search?.[0])?.id || null;
  }
  async function wikidataP31Types(qid) {
    if (!qid) return [];
    const u = new URL('https://www.wikidata.org/w/api.php');
    u.searchParams.set('action', 'wbgetentities');
    u.searchParams.set('ids', qid);
    u.searchParams.set('props', 'claims');
    u.searchParams.set('format', 'json');
    u.searchParams.set('origin', '*');
    const r = await fetch(u); if (!r.ok) return [];
    const j = await r.json();
    const claims = j?.entities?.[qid]?.claims?.P31 || [];
    // Return array of QIDs as strings
    return claims.map(c => c?.mainsnak?.datavalue?.value?.id).filter(Boolean);
  }
  // very light whitelist of instance-of QIDs (approximate)
  const P31_OK = new Set([
    // organization/company/brand/team (approximate common QIDs)
    'Q43229',   // organization
    'Q783794',  // brand
    'Q4830453', // business enterprise
    'Q12973014',// sports team
    'Q476028'   // association football club
  ]);

  async function wikidataLogoByQID(qid) {
    if (!qid) return null;
    // Optional sanity: only accept logos for likely org/brand/team
    try {
      const p31s = await wikidataP31Types(qid);
      if (p31s.length && !p31s.some(q => P31_OK.has(q))) {
        // If clearly not an org/team/brand, bail to fallback
        // (If P31 missing, we’ll still try; data can be sparse.)
      }
    } catch(_) {}
    const u = new URL('https://www.wikidata.org/w/api.php');
    u.searchParams.set('action', 'wbgetclaims');
    u.searchParams.set('entity', qid);
    u.searchParams.set('property', 'P154');
    u.searchParams.set('format', 'json');
    u.searchParams.set('origin', '*');
    const r = await fetch(u); if (!r.ok) return null;
    const j = await r.json();
    const claim = j?.claims?.P154?.[0]?.mainsnak?.datavalue?.value;
    if (!claim) return null;
    const file = claim.replace(/ /g, '_');
    return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}`;
  }
  async function wikipediaLeadImage(label) {
    const r = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(label)}`);
    if (!r.ok) return null;
    const j = await r.json();
    return j?.thumbnail?.source || j?.originalimage?.source || null;
  }

  // Pixabay (generic fallback only)
  async function pixabayImage(query) {
    if (!cfg.PIXABAY_KEY) return null;
    const u = new URL('https://pixabay.com/api/');
    u.searchParams.set('key', cfg.PIXABAY_KEY);
    u.searchParams.set('q', query);
    u.searchParams.set('image_type', 'photo');
    u.searchParams.set('safesearch', 'true');
    u.searchParams.set('per_page', '10');
    const r = await fetch(u); if (!r.ok) return null;
    const j = await r.json();
    return j?.hits?.[0]?.largeImageURL || j?.hits?.[0]?.webformatURL || null;
  }

  /* ============================ RESOLVER (STRICT) ============================ */
  async function resolveImageURL(item) {
    const label = item?.label || '';
    const hints = item?.hints || {};
    const cat = inferCategory(label, hints);
    const y   = hints.year || yearFrom(label);

    // STRICT providers first; only accept exact name matches
    if (cat === CATS.MOVIE) {
      const m = await tmdbSearchMovie(label, y);
      const url = m ? (tmdbImage(m.poster_path, 'w500') || tmdbImage(m.backdrop_path, 'w780')) : null;
      return url && !isSeen(url) ? url : null;
    }
    if (cat === CATS.TV) {
      const t = await tmdbSearchTV(label, y);
      const url = t ? (tmdbImage(t.poster_path, 'w500') || tmdbImage(t.backdrop_path, 'w780')) : null;
      return url && !isSeen(url) ? url : null;
    }
    if (cat === CATS.PERSON) {
      const p = await tmdbSearchPerson(label);
      const url = p ? tmdbImage(p.profile_path, 'w500') : null;
      return url && !isSeen(url) ? url : null;
    }
    if (cat === CATS.MUSIC_ALBUM && hints.artist) {
      const url = await theAudioDBAlbumCover(hints.artist, label);
      return url && !isSeen(url) ? url : null;
    }
    if (cat === CATS.MUSIC_TRACK && hints.artist) {
      const url = await theAudioDBTrackCover(hints.artist, label);
      return url && !isSeen(url) ? url : null;
    }
    if (cat === CATS.MUSIC_ARTIST) {
      const url = await lastfmArtistImage(label);
      return url && !isSeen(url) ? url : null;
    }

    // Logos/Brands/Teams/Games: prefer official transparent logos
    if (cat === CATS.LOGO || cat === CATS.BRAND || cat === CATS.TEAM || cat === CATS.GAME) {
      const qid  = await wikidataQID(label);
      const logo = await wikidataLogoByQID(qid);
      if (logo && !isSeen(logo)) return logo;

      const wiki = await wikipediaLeadImage(label);
      if (wiki && /logo/i.test(wiki) && !isSeen(wiki)) return wiki;

      // "Risky" classes: avoid generic stock unless forced
      const ctx = buildContext(label, cat, hints);
      const pb  = await pixabayImage(ctx);
      return pb && !isSeen(pb) ? pb : null;
    }

    // Food/Device/Place/Generic: context-enriched fallback
    const ctx = buildContext(label, cat, hints);
    const pb  = await pixabayImage(ctx);
    return pb && !isSeen(pb) ? pb : null;
  }

  /* =========================== SMART RENDERING =========================== */
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
    await ensureSmartCrop();
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = async () => {
        try {
          const { w: tw, h: th } = getTargetSizeFor(imgEl);
          const canvas = document.createElement('canvas');
          canvas.width = tw; canvas.height = th;
          const ctx = canvas.getContext('2d');

          if (mode === 'contain') {
            if (bg && bg !== 'transparent') { ctx.fillStyle = bg; ctx.fillRect(0, 0, tw, th); }
            const scale = Math.min(tw / img.width, th / img.height);
            const dw = Math.round(img.width * scale);
            const dh = Math.round(img.height * scale);
            const dx = Math.round((tw - dw) / 2);
            const dy = Math.round((th - dh) / 2);
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, dx, dy, dw, dh);
          } else {
            const crop = await window.smartcrop.crop(img, { width: tw, height: th, minScale: 1.0, ruleOfThirds: true });
            const top = crop?.topCrop || crop?.crops?.[0] || { x: 0, y: 0, width: img.width, height: img.height };
            const sx = clamp(Math.round(top.x), 0, img.width);
            const sy = clamp(Math.round(top.y), 0, img.height);
            const sw = clamp(Math.round(top.width),  1, img.width  - sx);
            const sh = clamp(Math.round(top.height), 1, img.height - sy);
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, tw, th);
          }

          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('toBlob failed'));
            // Revoke previous object URL to avoid leaks
            const prev = imgEl.getAttribute('data-blob');
            if (prev) { try { URL.revokeObjectURL(prev); } catch(_){} }
            const url = URL.createObjectURL(blob);
            imgEl.src = url;
            imgEl.setAttribute('data-blob', url);
            imgEl.setAttribute('data-processed', '1');
            resolve(url);
          }, 'image/png');
        } catch (e) { reject(e); }
      };
      img.onerror = () => reject(new Error('Image load failed: ' + srcURL));
      img.src = srcURL;
    });
  }

  /* ======================= CANCEL-STALE PAINTS / PREFETCH ======================= */
  let paintToken = 0; // increment per request; ignore late responses
  const prefetchCache = new Map(); // label -> URL (blob/objectURL)

  async function resolveAndRender(item) {
    const { img, itemLabel } = els();
    if (!img || !item) return false;

    // label text
    if (itemLabel) itemLabel.textContent = item.label || '';

    // cancel-stale: token for this render
    const myToken = ++paintToken;
    setBusy(true);
    img.alt = item.label || '';

    try {
      const url = await resolveImageURL(item);
      if (myToken !== paintToken) return false; // newer request in flight
      if (!url) throw new Error('No exact image found for: ' + (item.label || ''));

      markSeen(url);

      const cat  = inferCategory(item.label, item.hints);
      const mode = chooseRenderMode(cat);
      await smartRenderInto(img, url, mode, 'transparent');
      if (myToken !== paintToken) return false;

      ariaAnnounce(`Loaded image for ${item.label}`);
      pulse(img);

      // Prefetch next item (best-effort)
      prefetchNext();
      return true;
    } catch (err) {
      console.error(err);
      // fallback: context-enriched Pixabay
      const cat = inferCategory(item.label, item.hints);
      const ctx = buildContext(item.label, cat, item.hints);
      const pb  = await pixabayImage(ctx);
      if (pb && !isSeen(pb) && myToken === paintToken) {
        markSeen(pb);
        img.src = pb; // direct
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
    try {
      const url = await resolveImageURL(next);
      if (!url) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      once(img, 'load', () => { prefetchCache.set(key, url); });
      img.src = url;
    } catch(_) {}
  }

  /* ============================== UI BINDINGS ============================== */
  function renderTopicTitle() {
    const t = App.currentTopic();
    const { topicTitle } = els();
    if (topicTitle) topicTitle.textContent = t?.title || '';
  }

  function bindPlaceButtons() {
    const { placeBtns } = els();
    placeBtns.forEach(btn => {
      const r = parseInt(btn.getAttribute('data-rank') || btn.dataset.rank || '', 10);
      if (!Number.isFinite(r)) return;
      on(btn, 'click', async () => {
        App.ranks[r - 1] = App.currentItem();
        // proceed to next item if any
        const t = App.currentTopic();
        if (App.itemIndex < (t.items.length - 1)) {
          App.itemIndex += 1;
          await resolveAndRender(App.currentItem());
        } else {
          // finished placing items — confetti hook (respect reduced motion)
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
      App.topicIndex = (App.topicIndex + 1) % App.topics.length;
      App.itemIndex  = 0;
      App.ranks      = new Array(5).fill(null);
      resetSeen();
      renderTopicTitle();
      await resolveAndRender(App.currentItem());
    });
  }

  function installKeyboardShortcuts() {
    // Optional: number keys 1..5 to place quickly
    on(document, 'keydown', async (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = e.keyCode - 48; // '1'..'9'
      if (n >= 1 && n <= 5) {
        const t = App.currentTopic(); if (!t) return;
        App.ranks[n - 1] = App.currentItem();
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
      console.warn('No topics found (window.TOPICS).');
    }
    try { await ensureSmartCrop(); } catch(e) { console.warn('SmartCrop not available, continuing.', e); }
    renderTopicTitle();
    bindPlaceButtons();
    bindNavButtons();
    installKeyboardShortcuts();
    // Start/resume
    if (!App.currentItem()) { App.reset(); }
    await resolveAndRender(App.currentItem());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // expose a couple helpers if you need them elsewhere
  window.BR.resetSeen = resetSeen;
  window.BR.resolveAndRender = resolveAndRender;

})();