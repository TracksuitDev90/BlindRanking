/* =========================================================
   FIRESIDE Blind Rankings — v4
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
    shareBtn:   '#shareBtn',
    allBtns:    'button',
    loading:    '#cardLoading',
    rankList:   '#rankList',
    stage:      '.stage',
    card:       '.card',
    moodPicker: '#moodPicker',
    moodChips:  '#moodChips',
    moodSkip:   '#moodSkipBtn',
    moodGo:     '#moodGoBtn',
    completionOverlay: '#completionOverlay',
    confetti:   '#confetti',
    shareToast: '#shareToast'
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
  function fetchT(url, timeoutMs = 12000) {
    const c = new AbortController();
    const t = setTimeout(() => c.abort(), timeoutMs);
    return fetch(url, { signal: c.signal }).finally(() => clearTimeout(t));
  }

  /* ============================= SHUFFLE ============================= */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /* ============================= STATE ============================= */
  const STORAGE = {
    key: 'br_state_v5',
    save(o) { try { localStorage.setItem(this.key, JSON.stringify(o)); } catch(_){} },
    load()  { try { return JSON.parse(localStorage.getItem(this.key) || 'null'); } catch(_){ return null; } },
  };

  const MOOD_STORAGE = {
    key: 'br_moods_v1',
    save(moods) { try { localStorage.setItem(this.key, JSON.stringify(moods)); } catch(_){} },
    load() { try { return JSON.parse(localStorage.getItem(this.key) || 'null'); } catch(_){ return null; } },
    clear() { try { localStorage.removeItem(this.key); } catch(_){} }
  };

  const App = {
    allTopics: window.TOPICS || [],
    topics: [],       // shuffled + filtered working set
    topicIndex: 0,
    itemIndex:  0,
    ranks:      new Array(5).fill(null),
    rankImages: new Array(5).fill(null),
    selectedMoods: [], // mood IDs the user picked

    buildTopicList(moods) {
      let pool = this.allTopics;
      if (moods && moods.length > 0) {
        pool = pool.filter(t => moods.includes(t.mood));
      }
      this.topics = shuffle(pool);
      // For topics with itemPool, pick 5 random items for variety
      this.topics.forEach(t => this._rollItems(t));
      this.selectedMoods = moods || [];
    },

    // Pick 5 random items from itemPool (if present)
    _rollItems(topic) {
      if (!topic.itemPool || topic.itemPool.length <= 5) return;
      topic.items = shuffle(topic.itemPool).slice(0, 5);
    },

    hydrate() {
      const d = STORAGE.load();
      const savedMoods = MOOD_STORAGE.load();
      if (!d) { return false; } // signal no saved state
      this.buildTopicList(savedMoods || []);
      if (this.topics.length > 0 && d.topicIndex < this.topics.length) {
        // Restore the shuffled order from saved topic name matching
        if (d.topicName) {
          const idx = this.topics.findIndex(t => t.name === d.topicName);
          if (idx >= 0) {
            this.topicIndex = idx;
          } else {
            this.topicIndex = 0;
          }
        } else {
          this.topicIndex = d.topicIndex | 0;
        }
        this.itemIndex  = d.itemIndex  | 0;
        this.ranks      = Array.isArray(d.ranks) ? d.ranks : new Array(5).fill(null);
        this.rankImages = Array.isArray(d.rankImages) ? d.rankImages : new Array(5).fill(null);
        return true;
      }
      return false;
    },
    persist() {
      const t = this.currentTopic();
      STORAGE.save({
        topicIndex: this.topicIndex,
        topicName:  t?.name || '',
        itemIndex:  this.itemIndex,
        ranks:      this.ranks,
        rankImages: this.rankImages
      });
      MOOD_STORAGE.save(this.selectedMoods);
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
        btn.textContent = '#' + r + ' \u2713';
      } else {
        btn.classList.remove('placed');
        btn.textContent = '#' + r;
      }
    });

    // Show/hide share button based on completion
    updateShareButton();
  }

  function updateShareButton() {
    const shareBtn = $(SELECTORS.shareBtn);
    if (!shareBtn) return;
    const allPlaced = App.ranks.every(r => r !== null);
    shareBtn.hidden = !allPlaced;
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
    FOOD:'food', DEVICE:'device', PLACE:'place',
    PRODUCT:'product', SNEAKER:'sneaker', FASHION:'fashion',
    GENERIC:'generic'
  };

  function inferCategory(label, hints = {}) {
    if (hints.kind) return hints.kind;
    const p = hints.provider || '', m = hints.mediaType || '';
    if (p === 'tmdb' && m === 'movie') return CATS.MOVIE;
    if (p === 'tmdb' && m === 'tv')    return CATS.TV;
    if (m === 'person')                 return CATS.PERSON;
    if (m === 'sneaker')                return CATS.SNEAKER;
    if (m === 'product')                return CATS.PRODUCT;
    if (m === 'fashion')                return CATS.FASHION;
    const n = normalize(label);
    if (/\bseason\b|\bs\d{1,2}\b/.test(n)) return CATS.TV;
    if (/\balbum\b/.test(n)) return CATS.MUSIC_ALBUM;
    if (/\btrack\b|\bsong\b/.test(n)) return CATS.MUSIC_TRACK;
    if (/\bvideo game\b/.test(n)) return CATS.GAME;
    if (/\bgame\b/.test(n) && !/\bgame of\b/.test(n)) return CATS.GAME;
    if (/\bfc\b|\bclub\b|\bunited\b|\bpatriots\b|\blakers\b|\bwarriors\b|\bceltics\b|\bsteelers\b|\bpackers\b|\bcowboys\b/.test(n)) return CATS.TEAM;
    if (/\binc\b|\bcorp\b|\bco\b|\bllc\b|\bltd\b|\bcompany\b|\bbrand\b|\blogo\b/.test(n)) return CATS.BRAND;
    // Sneakers / shoes
    if (/\bair jordan\b|\bjordan \d|\bair force\b|\bair max\b|\byeezy\b|\bnew balance\b|\bchuck taylor\b|\bstan smith\b|\bdunk\b|\b(?:nike|adidas|puma|reebok|vans|converse)\b.*\b(?:shoe|sneaker|boot|runner)\b|\bsneaker\b|\b(?:shoe|sneaker|boot|runner)s?\b/.test(n)) return CATS.SNEAKER;
    // Fashion items (clothing, accessories, luxury goods)
    if (/\bhandbag\b|\bpurse\b|\bsunglasses\b|\bjacket\b|\bdress\b|\bperfume\b|\bcologne\b|\bjewelry\b|\bnecklace\b|\bwatch\b.*\b(?:rolex|omega|patek|cartier|tag)\b/.test(n)) return CATS.FASHION;
    if (/\bburger\b|\bpizza\b|\btaco\b|\bsushi\b|\bcoffee\b|\btea\b|\bcheese\b|\bchicken\b|\bsoup\b|\bsalad\b|\bbread\b|\bpie\b|\bcake\b|\bice cream\b|\bbrownie\b|\bdoughnut\b|\bcookie\b|\bwaffle\b|\bpancake\b|\bchip\b|\bcereal\b|\bcandy\b/.test(n)) return CATS.FOOD;
    if (/\biphone\b|\bgalaxy\b|\bipad\b|\bmacbook\b|\bplaystation\b|\bxbox\b|\bcamera\b|\blaptop\b/.test(n)) return CATS.DEVICE;
    if (/\bpark\b|\bbridge\b|\blake\b|\bmountain\b|\bcity\b|\bcountry\b|\bbeach\b|\bcastle\b|\bmuseum\b|\btower\b/.test(n)) return CATS.PLACE;
    return CATS.GENERIC;
  }

  // Also infer category from topic-level mood when item-level detection returns generic
  function inferCategoryWithMood(label, hints, topicMood) {
    const cat = inferCategory(label, hints);
    if (cat !== CATS.GENERIC) return cat;
    // Use topic mood to improve generic inference
    if (topicMood === 'food') return CATS.FOOD;
    if (topicMood === 'music') return CATS.MUSIC_ARTIST;
    if (topicMood === 'people') return CATS.PERSON;
    if (topicMood === 'places') return CATS.PLACE;
    if (topicMood === 'sports') return CATS.TEAM;
    if (topicMood === 'sneakers') return CATS.SNEAKER;
    if (topicMood === 'fashion') return CATS.FASHION;
    if (topicMood === 'products') return CATS.PRODUCT;
    // Topic name heuristic for product-like "culture" topics
    const tn = normalize(hints.topicName || '');
    if (/\bsneaker/.test(tn)) return CATS.SNEAKER;
    if (/\bwatch\b|\bfashion\b|\bluxury\b|\bjewel/.test(tn)) return CATS.FASHION;
    return cat;
  }

  function buildContext(label, cat, topicName) {
    const b = cleanLabel(label);
    const map = {
      [CATS.PERSON]:       `${b} portrait photo face`,
      [CATS.MUSIC_ARTIST]: `${b} artist portrait photo face`,
      [CATS.MOVIE]:        `${b} official movie poster`,
      [CATS.TV]:           `${b} tv show poster`,
      [CATS.FOOD]:         `${b} food dish close-up photography`,
      [CATS.PLACE]:        `${b} landmark photo`,
      [CATS.DEVICE]:       `${b} product photo`,
      [CATS.SNEAKER]:      `${b} sneaker shoe product photography white background`,
      [CATS.FASHION]:      `${b} product photography studio`,
      [CATS.PRODUCT]:      `${b} product photography high quality`,
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
    // Also try extracting year from label if not provided
    const y = year || yearFrom(title);
    const u = new URL('https://api.themoviedb.org/3/search/movie');
    u.searchParams.set('api_key', cfg.TMDB_KEY); u.searchParams.set('query', c);
    if (y) u.searchParams.set('year', y);
    try {
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      // Strict: exact title match first
      const exact = j.results?.find(x => titlesEqual(x.title, c) || titlesEqual(x.original_title, c));
      if (exact) return exact;
      // If year was provided, also try matching with year to disambiguate
      if (y) {
        const yearMatch = j.results?.find(x => {
          const rd = x.release_date || '';
          return rd.startsWith(String(y)) && (titlesEqual(x.title, c) || normalize(x.title).includes(normalize(c)));
        });
        if (yearMatch) return yearMatch;
      }
      // Fallback: first result, but only if query is specific enough (3+ chars)
      return c.length >= 3 ? (j.results?.[0] || null) : null;
    } catch(_) { return null; }
  }

  async function tmdbTV(title, year) {
    if (!cfg.TMDB_KEY) return null;
    const c = cleanLabel(title);
    const y = year || yearFrom(title);
    const u = new URL('https://api.themoviedb.org/3/search/tv');
    u.searchParams.set('api_key', cfg.TMDB_KEY); u.searchParams.set('query', c);
    if (y) u.searchParams.set('first_air_date_year', y);
    try {
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      const exact = j.results?.find(x => titlesEqual(x.name, c) || titlesEqual(x.original_name, c));
      if (exact) return exact;
      if (y) {
        const yearMatch = j.results?.find(x => {
          const fd = x.first_air_date || '';
          return fd.startsWith(String(y)) && (titlesEqual(x.name, c) || normalize(x.name).includes(normalize(c)));
        });
        if (yearMatch) return yearMatch;
      }
      return c.length >= 3 ? (j.results?.[0] || null) : null;
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
      const match = j.results?.find(x => titlesEqual(x.name, c)) || j.results?.[0] || null;
      // If we got a match, try to get a high-res profile image
      if (match && match.id && match.profile_path) {
        // Use h632 size for better face quality
        return { ...match, _hrPath: tmdbImg(match.profile_path, 'h632') };
      }
      return match;
    } catch(_) { return null; }
  }

  // Get TMDB person images endpoint for best face photo
  async function tmdbPersonImages(personId) {
    if (!cfg.TMDB_KEY || !personId) return null;
    try {
      const u = new URL(`https://api.themoviedb.org/3/person/${personId}/images`);
      u.searchParams.set('api_key', cfg.TMDB_KEY);
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      // Pick the profile with highest vote_average (best quality face shot)
      const profiles = j.profiles || [];
      if (!profiles.length) return null;
      // Sort by vote_average desc, then pick one with good aspect ratio (portrait)
      const sorted = profiles.slice().sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
      return tmdbImg(sorted[0].file_path, 'h632');
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
      // Try full label first (with disambiguation), then clean label
      const candidates = [label, cleanLabel(label)];
      for (const search of candidates) {
        const u = new URL('https://www.wikidata.org/w/api.php');
        u.searchParams.set('action','wbsearchentities'); u.searchParams.set('search', search);
        u.searchParams.set('language','en'); u.searchParams.set('format','json'); u.searchParams.set('origin','*');
        const r = await fetchT(u); if (!r.ok) continue;
        const j = await r.json();
        if (!j?.search?.length) continue;
        // Try exact match on label first
        const ex = j.search.find(e => titlesEqual(e.label, cleanLabel(label)));
        // Then try matching description keywords for disambiguation
        if (ex) return ex.id;
        // If label has disambiguation suffix, look for it in description
        const suffix = label.match(/\(([^)]+)\)$/)?.[1]?.toLowerCase();
        if (suffix) {
          const descMatch = j.search.find(e => (e.description || '').toLowerCase().includes(suffix));
          if (descMatch) return descMatch.id;
        }
        return j.search[0].id;
      }
      return null;
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

  async function wikiImage(label, extraTerms) {
    // Try multiple Wikipedia search strategies for best accuracy
    const c = cleanLabel(label);
    const candidates = [label];
    if (c !== label) candidates.push(c);
    // If extraTerms provided (e.g. "food", "film"), try label + term as Wikipedia title
    if (extraTerms) {
      for (const term of Array.isArray(extraTerms) ? extraTerms : [extraTerms]) {
        candidates.push(`${c} (${term})`);
      }
    }
    for (const candidate of candidates) {
      try {
        const r = await fetchT(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(candidate)}`);
        if (!r.ok) continue;
        const j = await r.json();
        const url = j?.originalimage?.source || j?.thumbnail?.source || null;
        if (url) return url;
      } catch(_) { /* try next candidate */ }
    }
    // Final fallback: use Wikipedia search API to find the best matching article
    try {
      const u = new URL('https://en.wikipedia.org/w/api.php');
      u.searchParams.set('action', 'query');
      u.searchParams.set('generator', 'search');
      u.searchParams.set('gsrsearch', c);
      u.searchParams.set('gsrlimit', '3');
      u.searchParams.set('prop', 'pageimages');
      u.searchParams.set('piprop', 'original|thumbnail');
      u.searchParams.set('format', 'json');
      u.searchParams.set('origin', '*');
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      const pages = j?.query?.pages;
      if (!pages) return null;
      // Pick the first page with an image, sorted by search relevance (lowest index)
      const sorted = Object.values(pages).sort((a, b) => (a.index || 99) - (b.index || 99));
      for (const pg of sorted) {
        const url = pg?.original?.source || pg?.thumbnail?.source || null;
        if (url) return url;
      }
    } catch(_) {}
    return null;
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

  // Openverse (WordPress) — free, no API key, openly-licensed high-quality images
  async function openverseImage(query, opts = {}) {
    try {
      const u = new URL('https://api.openverse.org/v1/images/');
      u.searchParams.set('q', query);
      u.searchParams.set('page_size', '5');
      if (opts.aspectRatio) u.searchParams.set('aspect_ratio', opts.aspectRatio);
      if (opts.size) u.searchParams.set('size', opts.size);
      // Prefer photos, not illustrations/logos
      u.searchParams.set('extension', 'jpg,png');
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      const results = j?.results || [];
      // Pick the highest-resolution result that looks like a real photo
      for (const hit of results) {
        const url = hit?.url;
        if (!url) continue;
        // Skip very small images (likely thumbnails/icons)
        if ((hit.width || 0) < 300 && (hit.height || 0) < 300) continue;
        return url;
      }
      return null;
    } catch(_) { return null; }
  }

  // Wikimedia Commons search — finds high-quality images from Commons
  async function commonsSearch(query) {
    try {
      const u = new URL('https://commons.wikimedia.org/w/api.php');
      u.searchParams.set('action', 'query');
      u.searchParams.set('generator', 'search');
      u.searchParams.set('gsrsearch', `${query} filetype:bitmap`);
      u.searchParams.set('gsrlimit', '5');
      u.searchParams.set('gsrnamespace', '6'); // File namespace
      u.searchParams.set('prop', 'imageinfo');
      u.searchParams.set('iiprop', 'url|size|mime');
      u.searchParams.set('iiurlwidth', '800');
      u.searchParams.set('format', 'json');
      u.searchParams.set('origin', '*');
      const r = await fetchT(u); if (!r.ok) return null;
      const j = await r.json();
      const pages = j?.query?.pages;
      if (!pages) return null;
      // Sort by page ID (lower = older/more established) and pick first good image
      const sorted = Object.values(pages).sort((a, b) => (a.pageid || 0) - (b.pageid || 0));
      for (const pg of sorted) {
        const info = pg?.imageinfo?.[0];
        if (!info) continue;
        // Skip SVGs and tiny images
        if (info.mime === 'image/svg+xml') continue;
        if ((info.width || 0) < 300) continue;
        // Use the thumbnail URL at 800px width, or original if smaller
        return info.thumburl || info.url || null;
      }
      return null;
    } catch(_) { return null; }
  }

  // Pexels API — high-quality curated stock photos (requires API key)
  async function pexelsImage(query) {
    const key = (window.BR_CONFIG && window.BR_CONFIG.PEXELS_KEY) || '';
    if (!key) return null;
    try {
      const u = new URL('https://api.pexels.com/v1/search');
      u.searchParams.set('query', query);
      u.searchParams.set('per_page', '3');
      u.searchParams.set('orientation', 'portrait');
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 8000);
      const resp = await fetch(u.toString(), {
        headers: { 'Authorization': key },
        signal: c.signal
      }).finally(() => clearTimeout(t));
      if (!resp.ok) return null;
      const j = await resp.json();
      const photo = j?.photos?.[0];
      return photo?.src?.large2x || photo?.src?.large || photo?.src?.original || null;
    } catch(_) { return null; }
  }

  // Unsplash API — high-quality photos (requires API key)
  async function unsplashImage(query) {
    const key = (window.BR_CONFIG && window.BR_CONFIG.UNSPLASH_KEY) || '';
    if (!key) return null;
    try {
      const u = new URL('https://api.unsplash.com/search/photos');
      u.searchParams.set('query', query);
      u.searchParams.set('per_page', '3');
      u.searchParams.set('orientation', 'portrait');
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), 8000);
      const resp = await fetch(u.toString(), {
        headers: { 'Authorization': `Client-ID ${key}` },
        signal: c.signal
      }).finally(() => clearTimeout(t));
      if (!resp.ok) return null;
      const j = await resp.json();
      const photo = j?.results?.[0];
      return photo?.urls?.regular || photo?.urls?.full || null;
    } catch(_) { return null; }
  }

  /* ============================ RESOLVER ============================ */

  // Map categories to Wikipedia disambiguation hints for better search accuracy
  function wikiHintsForCategory(cat) {
    const map = {
      [CATS.MOVIE]: ['film'],
      [CATS.TV]: ['TV series', 'television series'],
      [CATS.PERSON]: null,
      [CATS.MUSIC_ARTIST]: ['musician', 'band', 'singer'],
      [CATS.MUSIC_ALBUM]: ['album'],
      [CATS.MUSIC_TRACK]: ['song'],
      [CATS.GAME]: ['video game', 'game'],
      [CATS.TEAM]: ['team', 'sports team'],
      [CATS.FOOD]: ['food', 'dish'],
      [CATS.PLACE]: ['place', 'city'],
      [CATS.DEVICE]: ['device', 'product'],
      [CATS.BRAND]: ['company', 'brand'],
    };
    return map[cat] || null;
  }

  async function resolveImageURL(item, hints = {}) {
    const label = item?.label || '';
    const h = { ...hints, ...(item?.hints || {}) };
    const topic = App.currentTopic();
    const topicMood = topic?.mood || '';
    h.topicName = topic?.name || '';
    const cat = inferCategoryWithMood(label, h, topicMood);
    const y = h.year || yearFrom(label);
    if (item?.imageUrl) return item.imageUrl;

    const wikiHints = wikiHintsForCategory(cat);

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
        () => wikiImage(label, wikiHints)
      );

    if (cat === CATS.TV)
      return first(
        async () => { const t = await tmdbTV(label, y); return t ? (tmdbImg(t.poster_path) || tmdbImg(t.backdrop_path,'w780')) : null; },
        () => tvmazeImg(label),
        () => wikiImage(label, wikiHints)
      );

    // PERSON: prioritize TMDB person images API for best face photo
    if (cat === CATS.PERSON)
      return first(
        async () => {
          const p = await tmdbPerson(label);
          if (!p) return null;
          // Try the images endpoint for highest-rated face photo
          const best = await tmdbPersonImages(p.id);
          if (best) return best;
          // Fall back to the search result profile_path at high res
          return p._hrPath || tmdbImg(p.profile_path, 'h632') || tmdbImg(p.profile_path);
        },
        () => wikiImage(label),
        async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P18'); }
      );

    // MUSIC_ARTIST: prioritize TMDB person search for face photos over iTunes album art
    if (cat === CATS.MUSIC_ARTIST)
      return first(
        async () => {
          const p = await tmdbPerson(label);
          if (!p) return null;
          const best = await tmdbPersonImages(p.id);
          if (best) return best;
          return p._hrPath || tmdbImg(p.profile_path, 'h632') || tmdbImg(p.profile_path);
        },
        () => wikiImage(label, wikiHints),
        async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P18'); },
        () => itunesArtwork(cleanLabel(label))
      );

    if (cat === CATS.LOGO || cat === CATS.BRAND || cat === CATS.TEAM || cat === CATS.GAME)
      return first(
        async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P154'); },
        async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P18'); },
        () => wikiImage(label, wikiHints)
      );

    // SNEAKER: prioritize product-specific sources for actual shoe images
    if (cat === CATS.SNEAKER) {
      const ctx = buildContext(label, cat, topic?.name);
      return first(
        async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P18'); },
        () => commonsSearch(`${cleanLabel(label)} shoe`),
        () => openverseImage(`${cleanLabel(label)} sneaker shoe`, { size: 'medium' }),
        () => wikiImage(label),
        () => pexelsImage(ctx),
        () => unsplashImage(ctx),
        () => pixabay(ctx)
      );
    }

    // FASHION: luxury goods, watches, accessories — prioritize product photography
    if (cat === CATS.FASHION) {
      const ctx = buildContext(label, cat, topic?.name);
      return first(
        async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P18'); },
        () => commonsSearch(cleanLabel(label)),
        () => openverseImage(cleanLabel(label), { size: 'medium' }),
        () => wikiImage(label),
        () => pexelsImage(ctx),
        () => unsplashImage(ctx),
        () => pixabay(ctx)
      );
    }

    // PRODUCT: general products — similar chain with product-focused queries
    if (cat === CATS.PRODUCT) {
      const ctx = buildContext(label, cat, topic?.name);
      return first(
        () => wikiImage(label, wikiHints),
        async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P18'); },
        () => commonsSearch(cleanLabel(label)),
        () => openverseImage(`${cleanLabel(label)} product`, { size: 'medium' }),
        () => pexelsImage(ctx),
        () => unsplashImage(ctx),
        () => pixabay(ctx)
      );
    }

    // DEVICE: tech products — add new sources
    if (cat === CATS.DEVICE) {
      const ctx = buildContext(label, cat, topic?.name);
      return first(
        () => wikiImage(label, wikiHints),
        async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P18'); },
        () => commonsSearch(cleanLabel(label)),
        () => openverseImage(`${cleanLabel(label)} product`, { size: 'medium' }),
        () => pexelsImage(ctx),
        () => unsplashImage(ctx),
        () => pixabay(ctx)
      );
    }

    // FOOD: use more specific search queries to avoid wrong images
    if (cat === CATS.FOOD)
      return first(
        () => wikiImage(label, wikiHints),
        async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P18'); },
        () => openverseImage(`${cleanLabel(label)} food`, { size: 'medium' }),
        () => pexelsImage(buildContext(label, cat, topic?.name)),
        () => unsplashImage(buildContext(label, cat, topic?.name)),
        () => pixabay(buildContext(label, cat, topic?.name))
      );

    // Generic: wiki → wikidata → commons → openverse → pexels → unsplash → pixabay
    const ctx = buildContext(label, cat, topic?.name);
    return first(
      () => wikiImage(label, wikiHints),
      async () => { const q = await wikidataQID(label); return wikidataImage(q, 'P18'); },
      () => commonsSearch(cleanLabel(label)),
      () => openverseImage(cleanLabel(label)),
      () => pexelsImage(ctx),
      () => unsplashImage(ctx),
      () => pixabay(ctx)
    );
  }

  /* =========================== RENDERING =========================== */
  function applyImageStyle(imgEl, cat) {
    if (cat === CATS.LOGO || cat === CATS.BRAND || cat === CATS.TEAM || cat === CATS.GAME ||
        cat === CATS.MUSIC_ALBUM || cat === CATS.MUSIC_TRACK) {
      imgEl.style.objectFit = 'contain';
      imgEl.style.objectPosition = 'center';
    } else if (cat === CATS.PERSON || cat === CATS.MUSIC_ARTIST) {
      imgEl.style.objectFit = 'cover';
      imgEl.style.objectPosition = 'center 20%';
    } else if (cat === CATS.MOVIE || cat === CATS.TV) {
      imgEl.style.objectFit = 'contain';
      imgEl.style.objectPosition = 'center';
    } else if (cat === CATS.SNEAKER || cat === CATS.FASHION || cat === CATS.PRODUCT || cat === CATS.DEVICE) {
      // Products: contain to show full product, centered
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
        // Reject tiny images (likely icons/placeholders, not real photos)
        if (temp.naturalWidth < 80 || temp.naturalHeight < 80) {
          reject(new Error('Image too small'));
          return;
        }
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

      const topicMood = topic?.mood || '';
      const cat = inferCategoryWithMood(item.label, hints, topicMood);
      applyImageStyle(img, cat);
      try {
        await loadImage(img, url);
      } catch (loadErr) {
        // Image URL resolved but failed to actually load — try resolving again
        // (will skip the seen URL and try next provider)
        if (myToken !== paintToken) return false;
        const retryUrl = await resolveImageURL(item, hints);
        if (retryUrl && myToken === paintToken) {
          markSeen(retryUrl);
          currentResolvedURL = retryUrl;
          applyImageStyle(img, cat);
          await loadImage(img, retryUrl);
        } else {
          throw loadErr;
        }
      }
      if (myToken !== paintToken) return false;

      prefetchNext();
      return true;
    } catch (err) {
      if (myToken !== paintToken) return false;
      const topicMood = topic?.mood || '';
      const cat = inferCategoryWithMood(item.label, hints, topicMood);
      const ctx = buildContext(item.label, cat, topic?.name);
      // Try multiple fallback sources before giving up
      const fallbackUrl = await openverseImage(cleanLabel(item.label))
        || await commonsSearch(cleanLabel(item.label))
        || await pexelsImage(ctx)
        || await unsplashImage(ctx)
        || await pixabay(ctx);
      if (fallbackUrl && !isSeen(fallbackUrl) && myToken === paintToken) {
        markSeen(fallbackUrl);
        currentResolvedURL = fallbackUrl;
        applyImageStyle(img, cat);
        img.src = fallbackUrl;
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

  /* ============================== CONFETTI ============================== */
  function fireConfetti() {
    const canvas = $(SELECTORS.confetti);
    if (!canvas) return;
    canvas.classList.add('active');
    canvas.style.display = 'block';
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#d0bcff', '#a8db8b', '#ccc2dc', '#eaddff', '#ffb4ab', '#ffd700'];
    const particles = [];
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: -Math.random() * 14 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rotSpeed: (Math.random() - 0.5) * 10,
        life: 1
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      for (const p of particles) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // gravity
        p.rotation += p.rotSpeed;
        p.life -= 0.012;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }
      frame++;
      if (alive && frame < 120) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.classList.remove('active');
        canvas.style.display = 'none';
      }
    }
    requestAnimationFrame(animate);
  }

  /* ============================== SHARING ============================== */
  function buildShareText() {
    const t = App.currentTopic();
    if (!t) return '';
    let text = `FIRESIDE Blind Rankings: ${t.name}\n\n`;
    for (let i = 0; i < 5; i++) {
      const item = App.ranks[i];
      text += `#${i + 1} ${item ? cleanLabel(item.label) : '---'}\n`;
    }
    text += '\nfiresiderankings.com';
    return text;
  }

  async function handleShare() {
    const text = buildShareText();
    if (!text) return;

    // Try native share first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch(_) {
        // User cancelled or share failed, fall through to clipboard
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!');
    } catch(_) {
      // Final fallback: textarea select
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      showToast('Copied to clipboard!');
    }
  }

  function showToast(msg) {
    const toast = $(SELECTORS.shareToast);
    if (!toast) return;
    toast.textContent = msg;
    toast.hidden = false;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => { toast.hidden = true; }, 300);
    }, 2000);
  }

  /* ============================== TOPIC ADVANCE ============================== */
  let autoAdvanceTimer = null;

  async function advanceToNextTopic() {
    if (autoAdvanceTimer) { clearTimeout(autoAdvanceTimer); autoAdvanceTimer = null; }
    if (!App.topics.length) return;
    App.topicIndex = (App.topicIndex + 1) % App.topics.length;
    // Re-roll items from pool for variety on revisit
    const nextTopic = App.topics[App.topicIndex];
    if (nextTopic) App._rollItems(nextTopic);
    App.itemIndex = 0;
    App.ranks = new Array(5).fill(null);
    App.rankImages = new Array(5).fill(null);
    resetSeen();
    prefetchCache.clear();
    currentResolvedURL = null;
    renderTopicTitle();
    renderRankSlots();
    const stage = $(SELECTORS.stage);
    if (stage) stage.classList.remove('complete');
    const overlay = $(SELECTORS.completionOverlay);
    if (overlay) { overlay.hidden = true; overlay.classList.remove('visible'); }
    await resolveAndRender(App.currentItem());
  }

  function showCompletion() {
    const stage = $(SELECTORS.stage);
    if (stage) stage.classList.add('complete');

    // Show completion badge overlay
    const overlay = $(SELECTORS.completionOverlay);
    if (overlay) {
      overlay.hidden = false;
      requestAnimationFrame(() => overlay.classList.add('visible'));
    }

    // Fire confetti
    if (!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      fireConfetti();
    }

    // Show share button
    updateShareButton();

    // NO auto-advance — user shares first, then clicks "New Topic"
  }

  /* ============================== MOOD PICKER ============================== */
  let moodPickerBound = false;
  let moodPickerSelected = new Set();

  function showMoodPicker() {
    const picker = $(SELECTORS.moodPicker);
    const chipsContainer = $(SELECTORS.moodChips);
    const goBtn = $(SELECTORS.moodGo);
    if (!picker || !chipsContainer) return;

    const moods = window.BR_MOODS || [];
    moodPickerSelected = new Set();
    if (goBtn) goBtn.disabled = true;

    chipsContainer.innerHTML = '';
    moods.forEach(m => {
      const btn = document.createElement('button');
      btn.className = 'mood-chip';
      btn.textContent = m.label;
      btn.dataset.mood = m.id;
      on(btn, 'click', () => {
        if (moodPickerSelected.has(m.id)) {
          moodPickerSelected.delete(m.id);
          btn.classList.remove('selected');
        } else {
          moodPickerSelected.add(m.id);
          btn.classList.add('selected');
        }
        if (goBtn) goBtn.disabled = moodPickerSelected.size === 0;
      });
      chipsContainer.appendChild(btn);
    });

    if (!moodPickerBound) {
      moodPickerBound = true;

      on($(SELECTORS.moodSkip), 'click', () => {
        App.buildTopicList([]);
        App.reset();
        picker.hidden = true;
        startRanking();
      });

      on(goBtn, 'click', () => {
        if (moodPickerSelected.size === 0) return;
        App.buildTopicList(Array.from(moodPickerSelected));
        App.reset();
        picker.hidden = true;
        startRanking();
      });
    }

    picker.hidden = false;
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
          App.itemIndex += 1;
          await resolveAndRender(App.currentItem());
        } else {
          // All items placed
          showCompletion();
        }
      });
    });
  }

  function bindNavButtons() {
    on($(SELECTORS.newBtn), 'click', () => advanceToNextTopic());
    on($('#changeMoodBtn'), 'click', () => showMoodPicker());
  }

  function bindShareButton() {
    on($(SELECTORS.shareBtn), 'click', () => handleShare());
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

  /* ============================== BOOT ============================== */
  async function startRanking() {
    renderTopicTitle();
    renderRankSlots();
    if (!App.currentItem()) App.reset();
    await resolveAndRender(App.currentItem());
  }

  async function boot() {
    installRipple();
    ensureSmartCrop();
    bindPlaceButtons();
    bindNavButtons();
    bindShareButton();
    installKeyboardShortcuts();

    // Try to restore saved state
    const restored = App.hydrate();
    if (restored && App.topics.length > 0) {
      // Continue where we left off
      await startRanking();
    } else {
      // No saved state — show mood picker
      App.buildTopicList([]);
      if (window.BR_MOODS && window.BR_MOODS.length > 0) {
        showMoodPicker();
      } else {
        App.reset();
        await startRanking();
      }
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  window.BR.resetSeen = resetSeen;
  window.BR.advanceToNextTopic = advanceToNextTopic;
  window.BR.showMoodPicker = () => {
    const picker = $(SELECTORS.moodPicker);
    if (picker) showMoodPicker();
  };
})();
