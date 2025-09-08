/* =========================================================
   FIRESIDE Blind Ranking — Unified JavaScript (SmartCrop edition)
   - SmartCrop.js for smart "cover" crops
   - "Contain" letterboxing for logos/marks/covers (no clipping)
   - Context-aware resolver with strict exactness by provider
   - Duplicate-image avoidance within a topic
   - Buttons gated during image loads; stronger ripple hooks
   - Reduced-motion aware; polite aria-live announcements
   - Works with existing CONFIG / BR_CONFIG keys (no UI changes)
   ========================================================= */

(() => {
  'use strict';

  /* ============== SELECTORS (adjust here if your markup differs) ============== */
  const SELECTORS = {
    // primary preview image (the large hero image users rank)
    previewImg: '.rank-card__img, #card-img, .card img, img[data-role="preview"]',

    // live region for announcements (non-invasive)
    liveRegion: '[aria-live], .sr-live, #live',

    // UI text
    topicTitle: '.topic-title, #topic-title, [data-role="topic-title"]',
    itemLabel:  '.item-label, #item-label, [data-role="item-label"]',

    // ranking buttons (Place in #1..#5): either container with buttons or direct buttons
    placeButtonsContainer: '.place-buttons, #place-buttons, [data-role="place-buttons"]',
    placeButtons:          'button[data-rank], .btn-rank',

    // next/new topic buttons
    nextBtn:  '#next-topic, .btn-next, [data-role="next"]',
    newBtn:   '#new-topic, .btn-new,  [data-role="new"]',

    // generic disable-all during loads
    allButtons: 'button'
  };

  /* ======================= LITTLE UTILITIES ======================= */
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on  = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);

  const delay = (ms) => new Promise(r => setTimeout(r, ms));
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

  function getEl() {
    // resolve all key elements once (lazily)
    const els = {
      img:        $(SELECTORS.previewImg),
      live:       $(SELECTORS.liveRegion),
      topicTitle: $(SELECTORS.topicTitle),
      itemLabel:  $(SELECTORS.itemLabel),
      placeWrap:  $(SELECTORS.placeButtonsContainer),
      nextBtn:    $(SELECTORS.nextBtn),
      newBtn:     $(SELECTORS.newBtn)
    };
    // place buttons may be in a wrap or loose in DOM
    els.placeBtns = els.placeWrap ? $$(SELECTORS.placeButtons, els.placeWrap) : $$(SELECTORS.placeButtons);
    els.allBtns   = $$(SELECTORS.allButtons);
    return els;
  }

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

  function setBusy(state = true) {
    const { allBtns } = getEl();
    allBtns.forEach(b => { b.disabled = !!state; });
  }

  function pulse(el) {
    // subtle pulse; respects reduced motion
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || !el?.animate) return;
    el.animate([{ transform: 'scale(0.985)' }, { transform: 'scale(1)' }], { duration: 120, easing: 'ease-out' });
  }

  function ariaAnnounce(msg) {
    const { live } = getEl();
    if (!live) return;
    // clear then set to ensure screen readers detect change
    live.textContent = '';
    // slight delay so SR picks it up
    setTimeout(() => { live.textContent = msg; }, 30);
  }

  /* ========================= CONFIG / KEYS ========================= */
  const cfg = {
    TMDB_KEY:   (window.CONFIG && window.CONFIG.TMDB_KEY)   || (window.BR_CONFIG && window.BR_CONFIG.TMDB_KEY)   || '',
    OMDB_KEY:   (window.CONFIG && window.CONFIG.OMDB_KEY)   || (window.BR_CONFIG && window.BR_CONFIG.OMDB_KEY)   || '',
    LASTFM_KEY: (window.CONFIG && window.CONFIG.LASTFM_KEY) || (window.BR_CONFIG && window.BR_CONFIG.LASTFM_KEY) || '',
    AUDIO_KEY:  (window.CONFIG && window.CONFIG.AUDIO_KEY)  || (window.BR_CONFIG && window.BR_CONFIG.AUDIO_KEY)  || '',
    PIXABAY_KEY:(window.CONFIG && window.CONFIG.PIXABAY_KEY)|| (window.BR_CONFIG && window.BR_CONFIG.PIXABAY_KEY)|| ''
  };

  // expose simple init if you ever want to override keys at runtime
  window.BR = window.BR || {};
  window.BR.init = function init(overrides = {}) { Object.assign(cfg, overrides); return ensureSmartCrop(); };

  /* =================== SMARTCROP LOADER (ON-DEMAND) =================== */
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

  /* ======================= CATEGORY INFERENCE ======================= */
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

  /* ======================= CONTEXT TOKEN BUILDER ======================= */
  function buildContext(label, cat, hints = {}) {
    const base = normalize(label);
    const toks = [];
    switch (cat) {
      case CATS.PERSON:
        toks.push(`${base} portrait headshot face centered photo`, 'front view professional photography'); break;
      case CATS.MOVIE:
        toks.push(`${base} official movie poster`, String(hints.year || yearFrom(label) || ''));
        toks.push('no fan art no parody'); break;
      case CATS.TV:
        toks.push(`${base} official tv poster`, String(hints.year || yearFrom(label) || ''));
        toks.push('no fan art no parody'); break;
      case CATS.MUSIC_ALBUM:
        toks.push(`${base} official album cover square`, 'no fan art no lyric video'); break;
      case CATS.MUSIC_TRACK:
        toks.push(`${base} official single cover square`, 'no fan art'); break;
      case CATS.MUSIC_ARTIST:
        toks.push(`${base} artist press photo portrait`); break;
      case CATS.GAME:
        toks.push(`${base} official video game logo transparent`, 'no fan art no box mockup'); break;
      case CATS.LOGO:
      case CATS.BRAND:
      case CATS.TEAM:
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

  /* ===================== DUPLICATE AVOIDANCE ===================== */
  const seen = new Set();
  function resetSeen() { seen.clear(); }
  function markSeen(url) { if (url) seen.add(url.replace(/\?.*$/, '')); }
  function isSeen(url)   { return url ? seen.has(url.replace(/\?.*$/, '')) : false; }

  /* ========================= PROVIDER CALLS ========================= */
  // TMDB common
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

  // Wikidata / Wikipedia
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
  async function wikidataLogoByQID(qid) {
    if (!qid) return null;
    const u = new URL('https://www.wikidata.org/w/api.php');
    u.searchParams.set('action', 'wbgetclaims');
    u.searchParams.set('entity', qid);
    u.searchParams.set('property', 'P154'); // official logo image
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

  // Pixabay
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

  /* ========================= MASTER RESOLVER ========================= */
  async function resolveImageURL(item) {
    // item: { label, hints? } ; hints: {kind, year, artist, album, track}
    const label = item?.label || '';
    const hints = item?.hints || {};
    const cat   = inferCategory(label, hints);
    const y     = hints.year || yearFrom(label);

    // STRICT: do not accept "close but not exact" — only exact normalized matches

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

    // Music
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

    // Logos / Brands / Teams / Games — prefer official transparent logo
    if (cat === CATS.LOGO || cat === CATS.BRAND || cat === CATS.TEAM || cat === CATS.GAME) {
      const qid  = await wikidataQID(label);
      const logo = await wikidataLogoByQID(qid);
      if (logo && !isSeen(logo)) return logo;

      const wiki = await wikipediaLeadImage(label);
      if (wiki && /logo/i.test(wiki) && !isSeen(wiki)) return wiki;

      const context = buildContext(label, cat, hints);
      const pb = await pixabayImage(context);
      return pb && !isSeen(pb) ? pb : null;
    }

    // Food / Device / Place / Generic — context-enriched Pixabay
    const context = buildContext(label, cat, hints);
    const pb = await pixabayImage(context);
    return pb && !isSeen(pb) ? pb : null;
  }

  /* =================== SMART RENDERING PIPELINE =================== */
  function chooseRenderMode(cat) {
    // contain (no cropping) for logos/marks/covers; cover-smart for everything else
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
            if (bg && bg !== 'transparent') {
              ctx.fillStyle = bg; ctx.fillRect(0, 0, tw, th);
            }
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
            const sw = clamp(Math.round(top.width), 1, img.width - sx);
            const sh = clamp(Math.round(top.height), 1, img.height - sy);
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, tw, th);
          }
          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error('toBlob failed'));
            const url = URL.createObjectURL(blob);
            // assign and leave the URL object in place until next render; GC later
            imgEl.src = url;
            imgEl.setAttribute('data-processed', '1');
            resolve(url);
          }, 'image/png');
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('Image load failed: ' + srcURL));
      img.src = srcURL;
    });
  }

  /* ================ PUBLIC RESOLVE + RENDER (used by UI) ================ */
  async function resolveAndRender(item, opts = {}) {
    const els  = getEl();
    const img  = els.img;
    const lab  = els.itemLabel;

    // prepare UI text
    if (lab) lab.textContent = item?.label || '';

    setBusy(true);
    try {
      const url = await resolveImageURL(item);
      if (!url) throw new Error('No exact image found for: ' + (item?.label || ''));
      markSeen(url);
      // initial alt for a11y (set before load)
      if (img) img.alt = item?.label || '';

      const cat  = inferCategory(item?.label, item?.hints);
      const mode = chooseRenderMode(cat);
      await smartRenderInto(img, url, mode, 'transparent');
      ariaAnnounce(`Loaded image for ${item?.label}`);
      pulse(img);
      return true;
    } catch (err) {
      console.error(err);
      // graceful fallback: try a context Pixabay if main resolver failed
      const cat = inferCategory(item?.label, item?.hints);
      const ctx = buildContext(item?.label, cat, item?.hints);
      const pb  = await pixabayImage(ctx);
      if (pb && !isSeen(pb)) {
        markSeen(pb);
        if (els.img) {
          els.img.src = pb;
          els.img.alt = item?.label || '';
          ariaAnnounce(`Loaded fallback image for ${item?.label}`);
          pulse(els.img);
          setBusy(false);
          return true;
        }
      }
      // final: clear img
      if (els.img) els.img.removeAttribute('src');
      ariaAnnounce(`Couldn't load image for ${item?.label}`);
      return false;
    } finally {
      setBusy(false);
    }
  }

  /* ===================== SIMPLE APP STATE & WIRING ===================== */
  // This section assumes you already load TOPICS somewhere (topics.js).
  // It preserves look/feel; only JS behavior is improved.

  const App = {
    topics: window.TOPICS || [], // [{title, items:[{label,hints?}...]}]
    topicIndex: 0,
    itemIndex:  0,
    ranks:      [], // array of 5 placed items (indices), or objects per your schema

    currentTopic() { return this.topics[this.topicIndex] || null; },
    currentItem()  {
      const t = this.currentTopic(); if (!t) return null;
      return t.items?.[this.itemIndex] || null;
    },
    resetRanks() { this.ranks = new Array(5).fill(null); }
  };

  function renderTopicTitle() {
    const t = App.currentTopic();
    const { topicTitle } = getEl();
    if (topicTitle) topicTitle.textContent = t?.title || '';
  }

  async function showCurrentItem() {
    const item = App.currentItem();
    if (!item) return;
    await resolveAndRender(item);
  }

  function bindPlaceButtons() {
    const { placeBtns } = getEl();
    placeBtns.forEach(btn => {
      const r = parseInt(btn.getAttribute('data-rank') || btn.dataset.rank || '', 10);
      if (!Number.isFinite(r)) return;
      on(btn, 'click', async () => {
        // store placement (you may already have your own structure—this preserves behavior)
        App.ranks[r - 1] = App.currentItem();
        // proceed to next item in topic
        App.itemIndex = Math.min((App.itemIndex + 1), (App.currentTopic().items.length - 1));
        // if we've filled all or reached end, you can show summary or auto-next
        await showCurrentItem();
      });
    });
  }

  function bindNavButtons() {
    const { nextBtn, newBtn } = getEl();
    on(nextBtn, 'click', async () => {
      // next item (skip)
      App.itemIndex = Math.min(App.itemIndex + 1, App.currentTopic().items.length - 1);
      await showCurrentItem();
    });
    on(newBtn, 'click', async () => {
      // next topic
      App.topicIndex = (App.topicIndex + 1) % App.topics.length;
      App.itemIndex  = 0;
      App.resetRanks();
      resetSeen();
      renderTopicTitle();
      await showCurrentItem();
    });
  }

  async function boot() {
    try {
      await ensureSmartCrop(); // pre-load so first draw is crisp
    } catch (e) {
      console.warn('SmartCrop not available; will fallback to native contain/cover');
    }
    renderTopicTitle();
    bindPlaceButtons();
    bindNavButtons();
    await showCurrentItem();
  }

  // Kickoff when DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // expose a couple helpers if needed elsewhere
  window.BR.resetSeen = resetSeen;
  window.BR.resolveAndRender = resolveAndRender;

})();