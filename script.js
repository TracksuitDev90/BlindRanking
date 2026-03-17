/* =========================================================
   FIRESIDE Blind Rankings — v3
   ========================================================= */

(() => {
  'use strict';

  /* ====================== SELECTORS ====================== */
  const SELECTORS = {
    previewImg: '#cardImg',
    topicTitle: '#topicTag',
    itemLabel:  '#itemTitle',
    progress:   '#progress',
    placeWrap:  '#placeButtons',
    placeBtns:  '#placeButtons button[data-rank]',
    newBtn:     '#nextTopicBtn',
    allBtns:    'button',
    loading:    '#cardLoading',
    rankList:   '#rankList',
    stage:      '.stage',
    card:       '.card'
  };

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const on = (el, ev, fn, opts) => el && el.addEventListener(ev, fn, opts);
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  function normalize(s) {
    return (s || '').toLowerCase().replace(/&/g, 'and').replace(/["""'']/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }
  function titlesEqual(a, b) { return normalize(a) === normalize(b); }
  function yearFrom(label) {
    const m = String(label).match(/\b(19|20)\d{2}\b/);
    return m ? +m[0] : null;
  }
  function cleanLabel(label) {
    return (label || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
  }

  /* ============================== CONFIG ============================== */
  const cfg = {
    TMDB_KEY:    (window.BR_CONFIG && window.BR_CONFIG.TMDB_KEY)    || '',
    OMDB_KEY:    (window.BR_CONFIG && window.BR_CONFIG.OMDB_KEY)    || '',
    LASTFM_KEY:  (window.BR_CONFIG && window.BR_CONFIG.LASTFM_KEY)  || '',
    AUDIO_KEY:   (window.BR_CONFIG && window.BR_CONFIG.AUDIO_KEY)   || '',
    PIXABAY_KEY: (window.BR_CONFIG && window.BR_CONFIG.PIXABAY_KEY) || ''
  };

  window.BR = window.BR || {};

  /* ============================= FETCH ============================= */
  function fetchT(url, timeoutMs = 8000) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), timeoutMs);
    return fetch(url, { signal: c.signal }).finally(() => clearTimeout(t));
  }

  /* ============================= STATE ============================= */
  const STORAGE = {
    key: 'br_state_v4',
    save(o) { try { localStorage.setItem(this.key, JSON.stringify(o)); } catch(_){} },
    load()  { try { return JSON.parse(localStorage.getItem(this.key) || 'null'); } catch(_){ return null; } },
  };

  const App = {
    topics: window.TOPICS || [],
    topicIndex: 0,
    itemIndex:  0,
    ranks:      new Array(5).fill(null),
    // Store resolved image URLs for placed items so we can show thumbnails
    rankImages: new Array(5).fill(null),

    hydrate() {
      const d = STORAGE.load();
      if (!d) { this.reset(); return; }
      if (this.topics.length > 0 && d.topicIndex < this.topics.length) {
        this.topicIndex = d.topicIndex | 0;
        this.itemIndex  = d.itemIndex  | 0;
        this.ranks      = Array.isArray(d.ranks) ? d.ranks : new Array(5).fill(null);
        this.rankImages = Array.isArray(d.rankImages) ? d.rankImages : new Array(5).fill(null);
      } else {
        this.reset();
      }
    },
    persist() {
      STORAGE.save({
        topicIndex: this.topicIndex,
        itemIndex:  this.itemIndex,
        ranks:      this.ranks,
        rankImages: this.rankImages
      });
    },
    reset() {
      this.topicIndex = 0; this.itemIndex = 0;
      this.ranks = new Array(5).fill(null);
      this.rankImages = new Array(5).fill(null);
      this.persist();
    },
    currentTopic() { return this.topics[this.topicIndex] || null; },
    currentItem()  { const t = this.currentTopic(); return t?.items?.[this.itemIndex] || null; },
    nextItem()     { const t = this.currentTopic(); return t?.items?.[this.itemIndex + 1] || null; },
    isComplete()   { const t = this.currentTopic(); return t ? this.itemIndex >= t.items.length - 1 && this.ranks.some(Boolean) : false; }
  };

  // Track the currently displayed image URL so we can store it for rank thumbnails
  let currentResolvedURL = null;

  /* ========================= UI HELPERS ========================= */
  function setBusy(busy = true) {
    $$(SELECTORS.allBtns).forEach(b => b.disabled = !!busy);
    const ld = $(SELECTORS.loading);
    if (ld) { ld.hidden = !busy; }
  }

  function updateProgress() {
    const el = $(SELECTORS.progress);
    const t = App.currentTopic();
    if (el && t) el.textContent = `${App.itemIndex + 1} / ${t.items.length}`;
  }

  function renderTopicTitle() {
    const t = App.currentTopic();
    const el = $(SELECTORS.topicTitle);
    if (el) el.textContent = t?.name || t?.title || '';
  }

  function renderRankSlots() {
    const slots = $$('.rank-slot');
    slots.forEach((slot, i) => {
      const item = App.ranks[i];
      const imgUrl = App.rankImages[i];
      const content = slot.querySelector('.slot-content');
      if (!content) return;

      if (item) {
        slot.classList.add('filled');
        content.classList.remove('empty');
        const label = cleanLabel(item.label || '');
        if (imgUrl) {
          content.innerHTML = `<img class="slot-thumb" src="${imgUrl}" alt=""><span>${label}</span>`;
        } else {
          content.textContent = label;
        }
      } else {
        slot.classList.remove('filled');
        content.classList.add('empty');
        content.innerHTML = '--';
      }
    });

    // Update place button states
    const btns = $$(SELECTORS.placeBtns);
    btns.forEach(btn => {
      const r = parseInt(btn.dataset.rank, 10);
      if (App.ranks[r - 1]) {
        btn.classList.add('placed');
        btn.textContent = '#' + r + ' ✓';
      } else {
        btn.classList.remove('placed');
        btn.textContent = '#' + r;
      }
    });
  }

  function installRipple() {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const rect = btn.getBoundingClientRect();
      const r = document.createElement('span');
      r.className = 'ripple-effect';
      Object.assign(r.style, {
        left: `${e.clientX - rect.left}px`,
        top:  `${e.clientY - rect.top}px`,
        width: '8px', height: '8px',
        opacity: '0.25', transform: 'translate(-50%,-50%) scale(1)',
      });
      btn.style.position ||= 'relative';
      btn.appendChild(r);
      r.animate([
        { transform: 'translate(-50%,-50%) scale(1)', opacity: 0.25 },
        { transform: 'translate(-50%,-50%) scale(20)', opacity: 0 }
      ], { duration: 500, easing: 'cubic-bezier(.2,.8,.2,1)' }).onfinish = () => r.remove();
    }, true);
  }

  /* ============================= SMARTCROP ============================= */
  let scLoaded = false, scFailed = false;
  function ensureSmartCrop() {
    if (scLoaded || scFailed) return Promise.resolve();
    return new Promise(resolve => {
      if (window.smartcrop) { scLoaded = true; return resolve(); }
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/smartcrop@2.0.6/smartcrop.js';
      s.async = true;
      s.onload  = () => { scLoaded = true; resolve(); };
      s.onerror = () => { scFailed = true; resolve(); };
      document.head.appendChild(s);
    });
  }

  /* ============================ CATEGORIES ============================ */
  const CATS = {
    MOVIE:'movie', TV:'tv', PERSON:'person',
    MUSIC_ARTIST:'music-artist', MUSIC_ALBUM:'music-album', MUSIC_TRACK:'music-track',
    GAME:'game', TEAM:'team', BRAND:'brand', LOGO:'logo',
    FOOD:'food', DEVICE:'device', PLACE:'place', GENERIC:'generic'
  };

  function inferCategory(label, hints = {}) {
    if (hints.kind) return hints.kind;
    const p = hints.provider || '', m = hints.mediaType || '';
    if (p === 'tmdb' && m === 'movie') return CATS.MOVIE;
    if (p === 'tmdb' && m === 'tv')    return CATS.TV;
    if (m === 'person')                 return CATS.PERSON;
    const n = normalize(label);
    if (/\bseason\b|\bs\d{1,2}\b/.test(n)) return CATS.TV;
    if (/\balbum\b/.test(n)) return CATS.MUSIC_ALBUM;
    if (/\btrack\b|\bsong\b/.test(n)) return CATS.MUSIC_TRACK;
    if (/\bgame\b|\bvideo game\b/.test(n)) return CATS.GAME;
    if (/\bfc\b|\bclub\b|\bunited\b|\bpatriots\b|\blakers\b|\bwarriors\b|\bceltics\b|\bsteelers\b|\bpackers\b|\bcowboys\b/.test(n)) return CATS.TEAM;
    if (/\binc\b|\bcorp\b|\bco\b|\bllc\b|\bltd\b|\bcompany\b|\bbrand\b|\blogo\b/.test(n)) return CATS.BRAND;
    if (/\bburger\b|\bpizza\b|\btaco\b|\bsushi\b|\bcoffee\b|\btea\b|\bcheese\b|\bchicken\b|\bsoup\b|\bsalad\b|\bbread\b|\bpie\b|\bcake\b|\bice cream\b/.test(n)) return CATS.FOOD;
    if (/\biphone\b|\bgalaxy\b|\bipad\b|\bmacbook\b|\bplaystation\b|\bxbox\b|\bcamera\b|\blaptop\b/.test(n)) return CATS.DEVICE;
    if (/\bpark\b|\bbridge\b|\blake\b|\bmountain\b|\bcity\b|\bcountry\b|\bbeach\b|\bcastle\b|\bmuseum\b|\btower\b/.test(n)) return CATS.PLACE;
    return CATS.GENERIC;
  }

  function buildContext(label, cat) {
    const b = cleanLabel(label);
    const map = {
      [CATS.PERSON]:      `${b} portrait photo`,
      [CATS.MOVIE]:       `${b} official movie poster`,
      [CATS.TV]:          `${b} tv show poster`,
      [CATS.FOOD]:        `${b} plated dish food photography`,
      [CATS.PLACE]:       `${b} landmark photo`,
      [CATS.DEVICE]:      `${b} product photo`,
    };
    return map[cat] || `${b} photo`;
  }

  /* ============================ SEEN SET ============================ */
  const seen = new Set();
  function resetSeen() { seen.clear(); }
  function markSeen(url) { if (url) seen.add(url.replace(/\?.*$/, '')); }
  function isSeen(url)   { return url ? seen.has(url.replace(/\?.*$/, '')) : false; }

  /* ============================ PROVIDERS ============================ */
  function tmdbImg(path, sz = 'w500') { return path ? `https://image.tmdb.org/t/p/${sz}${path}` : null; }

  async function tmdbMovie(title, year) {
    if (!cfg.TMDB_KEY) return null;
    const c = cleanLabel(title);
    const u = new URL('https://api.themoviedb.org/3/search/movie');
    u.searchParams.set('api_key', cfg.TMDB_KEY); u.searchParams.set('query', c);
    if (year) u.searchParams.set('year', year);
    try {
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      return j.results?.find(x => titlesEqual(x.title, c) || titlesEqual(x.original_title, c)) || j.results?.[0] || null;
    } catch(_) { return null; }
  }

  async function tmdbTV(title, year) {
    if (!cfg.TMDB_KEY) return null;
    const c = cleanLabel(title);
    const u = new URL('https://api.themoviedb.org/3/search/tv');
    u.searchParams.set('api_key', cfg.TMDB_KEY); u.searchParams.set('query', c);
    if (year) u.searchParams.set('first_air_date_year', year);
    try {
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      return j.results?.find(x => titlesEqual(x.name, c) || titlesEqual(x.original_name, c)) || j.results?.[0] || null;
    } catch(_) { return null; }
  }

  async function tmdbPerson(name) {
    if (!cfg.TMDB_KEY) return null;
    const c = cleanLabel(name);
    const u = new URL('https://api.themoviedb.org/3/search/person');
    u.searchParams.set('api_key', cfg.TMDB_KEY); u.searchParams.set('query', c);
    try {
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      return j.results?.find(x => titlesEqual(x.name, c)) || j.results?.[0] || null;
    } catch(_) { return null; }
  }

  async function itunesArtwork(term) {
    try {
      const u = new URL('https://itunes.apple.com/search');
      u.searchParams.set('term', term); u.searchParams.set('media', 'music');
      u.searchParams.set('entity', 'song'); u.searchParams.set('limit', '3');
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      const hit = j?.results?.[0];
      return hit?.artworkUrl100 ? hit.artworkUrl100.replace('100x100', '600x600') : null;
    } catch(_) { return null; }
  }

  async function tvmazeImg(title) {
    try {
      const u = new URL('https://api.tvmaze.com/singlesearch/shows');
      u.searchParams.set('q', cleanLabel(title));
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      return j?.image?.original || j?.image?.medium || null;
    } catch(_) { return null; }
  }

  async function wikidataQID(label) {
    try {
      const u = new URL('https://www.wikidata.org/w/api.php');
      u.searchParams.set('action','wbsearchentities'); u.searchParams.set('search', cleanLabel(label));
      u.searchParams.set('language','en'); u.searchParams.set('format','json'); u.searchParams.set('origin','*');
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      const ex = j?.search?.find(e => titlesEqual(e.label, cleanLabel(label)));
      return (ex || j?.search?.[0])?.id || null;
    } catch(_) { return null; }
  }

  async function wikidataImage(qid, prop) {
    if (!qid) return null;
    try {
      const u = new URL('https://www.wikidata.org/w/api.php');
      u.searchParams.set('action','wbgetclaims'); u.searchParams.set('entity', qid);
      u.searchParams.set('property', prop); u.searchParams.set('format','json'); u.searchParams.set('origin','*');
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      const v = j?.claims?.[prop]?.[0]?.mainsnak?.datavalue?.value;
      if (!v) return null;
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(v.replace(/ /g,'_'))}?width=800`;
    } catch(_) { return null; }
  }

  async function wikiImage(label) {
    const c = cleanLabel(label);
    try {
      let r = await fetchT(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(label)}`);
      if (!r.ok && c !== label)
        r = await fetchT(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(c)}`);
      if (!r.ok) return null;
      const j = await r.json();
      return j?.originalimage?.source || j?.thumbnail?.source || null;
    } catch(_) { return null; }
  }

  async function pixabay(query) {
    if (!cfg.PIXABAY_KEY) return null;
    try {
      const u = new URL('https://pixabay.com/api/');
      u.searchParams.set('key', cfg.PIXABAY_KEY); u.searchParams.set('q', query);
      u.searchParams.set('image_type','photo'); u.searchParams.set('safesearch','true');
      u.searchParams.set('per_page','5');
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      return j?.hits?.[0]?.largeImageURL || j?.hits?.[0]?.webformatURL || null;
    } catch(_) { return null; }
  }

  /* ============================ RESOLVER ============================ */
  async function resolveImageURL(item, hints = {}) {
    const label = item?.label || '';
    const h = { ...hints, ...(item?.hints || {}) };
    const cat = inferCategory(label, h);
    const y = h.year || yearFrom(label);
    if (item?.imageUrl) return item.imageUrl;

    // Helper: return first unseen URL from a series of async calls
    async function first(...fns) {
      for (const fn of fns) {
        const url = await fn();
        if (url && !isSeen(url)) return url;
      }
      return null;
    }

    if (cat === CATS.MOVIE)
      return first(
        async () => { const m = await tmdbMovie(label, y); return m ? (tmdbImg(m.poster_path) || tmdbImg(m.backdrop_path,'w780')) : null; },
        () => wikiImage(label)
      );

    if (cat === CATS.TV)
      return first(
        async () => { const t = await tmdbTV(label, y); return t ? (tmdbImg(t.poster_path) || tmdbImg(t.backdrop_path,'w780')) : null; },
        () => tvmazeImg(label),
        () => wikiImage(label)
      );

    if (cat === CATS.PERSON)
      return first(
        async () => { const p = await tmdbPerson(label); return p ? tmdbImg(p.profile_path) : null; },
        () => wikiImage(label),
        async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P18'); }
      );

    if (cat === CATS.MUSIC_ARTIST)
      return first(
        () => itunesArtwork(cleanLabel(label)),
        () => wikiImage(label),
        async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P18'); }
      );

    if (cat === CATS.LOGO || cat === CATS.BRAND || cat === CATS.TEAM || cat === CATS.GAME)
      return first(
        async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P154'); },
        async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P18'); },
        () => wikiImage(label)
      );

    // Generic: wiki → wikidata → pixabay
    return first(
      () => wikiImage(label),
      async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P18'); },
      () => pixabay(buildContext(label, cat))
    );
  }

  /* =========================== RENDERING =========================== */
  // Use CSS object-fit + object-position for display (no canvas processing).
  // This preserves full image quality, shows faces/recognizable elements,
  // and is much faster than canvas cropping.
  function applyImageStyle(imgEl, cat) {
    if (cat === CATS.LOGO || cat === CATS.BRAND || cat === CATS.TEAM || cat === CATS.GAME ||
        cat === CATS.MUSIC_ALBUM || cat === CATS.MUSIC_TRACK) {
      imgEl.style.objectFit = 'contain';
      imgEl.style.objectPosition = 'center';
    } else if (cat === CATS.PERSON || cat === CATS.MUSIC_ARTIST) {
      // People: show upper portion (faces at top)
      imgEl.style.objectFit = 'cover';
      imgEl.style.objectPosition = 'center 15%';
    } else if (cat === CATS.MOVIE || cat === CATS.TV) {
      // Posters: show full image
      imgEl.style.objectFit = 'contain';
      imgEl.style.objectPosition = 'center';
    } else {
      imgEl.style.objectFit = 'cover';
      imgEl.style.objectPosition = 'center';
    }
  }

  function loadImage(imgEl, url) {
    return new Promise((resolve, reject) => {
      const temp = new Image();
      temp.crossOrigin = 'anonymous';
      temp.onload = () => {
        imgEl.src = url;
        resolve(url);
      };
      temp.onerror = () => reject(new Error('Load failed'));
      temp.src = url;
    });
  }

  /* ======================= PAINT SYSTEM ======================= */
  let paintToken = 0;
  const prefetchCache = new Map();

  async function resolveAndRender(item) {
    const img = $(SELECTORS.previewImg);
    const titleEl = $(SELECTORS.itemLabel);
    if (!img || !item) return false;

    if (titleEl) titleEl.textContent = cleanLabel(item.label) || '';
    updateProgress();

    const myToken = ++paintToken;
    setBusy(true);
    img.alt = cleanLabel(item.label) || '';

    const topic = App.currentTopic();
    const hints = { provider: topic?.provider || '', mediaType: topic?.mediaType || '' };

    try {
      const cacheKey = normalize(item.label);
      let url = prefetchCache.get(cacheKey) || null;
      if (!url || isSeen(url)) {
        prefetchCache.delete(cacheKey);
        url = await resolveImageURL(item, hints);
      }
      if (myToken !== paintToken) return false;
      if (!url) throw new Error('No image');

      markSeen(url);
      currentResolvedURL = url;

      const cat = inferCategory(item.label, hints);
      applyImageStyle(img, cat);
      await loadImage(img, url);
      if (myToken !== paintToken) return false;

      prefetchNext();
      return true;
    } catch (err) {
      if (myToken !== paintToken) return false;
      // Pixabay fallback
      const cat = inferCategory(item.label, hints);
      const pb = await pixabay(buildContext(item.label, cat));
      if (pb && !isSeen(pb) && myToken === paintToken) {
        markSeen(pb);
        currentResolvedURL = pb;
        img.style.objectFit = 'cover';
        img.style.objectPosition = 'center';
        img.src = pb;
        prefetchNext();
        return true;
      }
      if (myToken === paintToken) {
        currentResolvedURL = null;
        img.removeAttribute('src');
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
    const hints = { provider: topic?.provider || '', mediaType: topic?.mediaType || '' };
    try {
      const url = await resolveImageURL(next, hints);
      if (!url) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise(r => { img.onload = r; img.onerror = r; setTimeout(r, 10000); img.src = url; });
      prefetchCache.set(key, url);
    } catch(_) {}
  }

  /* ============================== TOPIC ADVANCE ============================== */
  async function advanceToNextTopic() {
    if (!App.topics.length) return;
    App.topicIndex = (App.topicIndex + 1) % App.topics.length;
    App.itemIndex = 0;
    App.ranks = new Array(5).fill(null);
    App.rankImages = new Array(5).fill(null);
    resetSeen();
    prefetchCache.clear();
    currentResolvedURL = null;
    renderTopicTitle();
    renderRankSlots();
    $(SELECTORS.stage)?.classList.remove('complete');
    await resolveAndRender(App.currentItem());
  }

  function showCompletion() {
    const stage = $(SELECTORS.stage);
    if (stage) stage.classList.add('complete');
    // Auto-advance after 2.5 seconds
    setTimeout(() => advanceToNextTopic(), 2500);
  }

  /* ============================== BINDINGS ============================== */
  function bindPlaceButtons() {
    $$(SELECTORS.placeBtns).forEach(btn => {
      const r = parseInt(btn.dataset.rank, 10);
      if (!Number.isFinite(r)) return;
      on(btn, 'click', async () => {
        const item = App.currentItem();
        if (!item) return;

        // Place item in rank
        App.ranks[r - 1] = item;
        App.rankImages[r - 1] = currentResolvedURL;
        App.persist();
        renderRankSlots();

        const t = App.currentTopic();
        if (!t) return;

        if (App.itemIndex < t.items.length - 1) {
          // More items to go
          App.itemIndex += 1;
          await resolveAndRender(App.currentItem());
        } else {
          // All items placed — show completion + auto-advance
          showCompletion();
        }
      });
    });
  }

  function bindNavButtons() {
    on($(SELECTORS.newBtn), 'click', () => advanceToNextTopic());
  }

  function installKeyboardShortcuts() {
    on(document, 'keydown', async (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const n = e.key >= '1' && e.key <= '5' ? parseInt(e.key, 10) : 0;
      if (!n) return;

      const item = App.currentItem();
      const t = App.currentTopic();
      if (!item || !t) return;

      App.ranks[n - 1] = item;
      App.rankImages[n - 1] = currentResolvedURL;
      App.persist();
      renderRankSlots();

      if (App.itemIndex < t.items.length - 1) {
        App.itemIndex += 1;
        await resolveAndRender(App.currentItem());
      } else {
        showCompletion();
      }
    });
  }

  /* =============================== BOOT =============================== */
  async function boot() {
    installRipple();
    App.hydrate();
    if (!App.topics.length) {
      console.warn('No topics found. Ensure topics.js sets window.TOPICS.');
    }
    ensureSmartCrop(); // preload in background, not blocking
    renderTopicTitle();
    renderRankSlots();
    bindPlaceButtons();
    bindNavButtons();
    installKeyboardShortcuts();
    if (!App.currentItem()) App.reset();
    await resolveAndRender(App.currentItem());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.BR.resetSeen = resetSeen;
  window.BR.advanceToNextTopic = advanceToNextTopic;
})();
