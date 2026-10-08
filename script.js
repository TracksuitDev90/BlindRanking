/* =========================================================
   FIRESIDE Blind Rankings — v5
   One item at a time; tap the slot it belongs in; no take-backs.
   Images come only from the pre-vetted manifest (images.js, built by
   tools/build-images) — anything without a vetted image is a text card.
   ========================================================= */

(() => {
  'use strict';

  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const REDUCED_MOTION = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const SLOTS = 5;

  // Must match normalize()/slug() in tools/build-images (manifest keys).
  function normalize(s) {
    return (s || '').toLowerCase().replace(/&/g, 'and').replace(/["']/g, '')
      .replace(/[^a-z0-9]+/g, ' ').trim();
  }
  const slug = s => normalize(s).replace(/ /g, '-');
  // "Up (2009 film)" → "Up": disambiguators are for lookup, not display.
  const cleanLabel = label => (label || '').replace(/\s*\([^)]*\)\s*$/, '').trim();

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function store(key) {
    return {
      load() { try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch (_) { return null; } },
      save(v) { try { localStorage.setItem(key, JSON.stringify(v)); } catch (_) {} }
    };
  }

  /* ============================ MOODS ============================ */
  // Per-mood look for text cards and chips.
  const MOOD_STYLE = {
    movies:  { glyph: '🎬', grad: 'linear-gradient(140deg, #3a1c71 0%, #a4237a 100%)' },
    tv:      { glyph: '📺', grad: 'linear-gradient(140deg, #1b2f6b 0%, #3f6fd8 100%)' },
    music:   { glyph: '🎵', grad: 'linear-gradient(140deg, #5b1a8f 0%, #e0367f 100%)' },
    food:    { glyph: '🍕', grad: 'linear-gradient(140deg, #b3261e 0%, #f08a24 100%)' },
    sports:  { glyph: '🏆', grad: 'linear-gradient(140deg, #155e47 0%, #2fa36b 100%)' },
    animals: { glyph: '🐾', grad: 'linear-gradient(140deg, #6b4a1f 0%, #c58b3a 100%)' },
    places:  { glyph: '🧭', grad: 'linear-gradient(140deg, #0d5c6e 0%, #2aa6a1 100%)' },
    tech:    { glyph: '⚡', grad: 'linear-gradient(140deg, #1e3a5f 0%, #3a8dde 100%)' },
    games:   { glyph: '🎮', grad: 'linear-gradient(140deg, #4a1f7a 0%, #7b4ce0 100%)' },
    culture: { glyph: '✨', grad: 'linear-gradient(140deg, #7a2240 0%, #d9534f 100%)' },
    people:  { glyph: '⭐', grad: 'linear-gradient(140deg, #6d2a12 0%, #e0662a 100%)' }
  };
  const moodLabel = id => (window.BR_MOODS || []).find(m => m.id === id)?.label || '';

  /* ========================= VARIETY ========================= */
  // Each topic has a pool of items (items ∪ itemPool). Every visit deals 5:
  // usually one or two familiar faces from last time, the rest swapped for
  // the items you've gone longest without seeing — so replays mix "some
  // same, some different" and never repeat the exact same five.
  const rotationStore = store('br_rotation_v1');
  const rotation = rotationStore.load() || { topics: {}, recent: [] };

  function poolOf(topic) {
    const seen = new Set();
    const out = [];
    for (const it of [...(topic.items || []), ...(topic.itemPool || [])]) {
      if (it?.label && !seen.has(it.label)) { seen.add(it.label); out.push(it); }
    }
    return out;
  }

  // Weighted sampling without replacement.
  function weightedSample(items, n, weightOf) {
    const bag = items.map(it => ({ it, w: Math.max(0.01, weightOf(it)) }));
    const out = [];
    while (out.length < n && bag.length) {
      let r = Math.random() * bag.reduce((s, b) => s + b.w, 0);
      let i = 0;
      while (i < bag.length - 1 && (r -= bag[i].w) > 0) i++;
      out.push(bag.splice(i, 1)[0].it);
    }
    return out;
  }

  function dealItems(topic) {
    const pool = poolOf(topic);
    if (pool.length <= SLOTS) return shuffle(pool);
    const h = rotation.topics[topic.name] || { round: 0, seen: {}, last: [] };
    const round = h.round + 1;
    const last = new Set(h.last);

    const familiar = shuffle(pool.filter(it => last.has(it.label)));
    const keepCount = familiar.length ? [0, 1, 1, 2, 2][Math.floor(Math.random() * 5)] : 0;
    const keep = familiar.slice(0, keepCount);
    // Freshness: never seen → 8; otherwise rounds since last seen.
    const fresh = pool.filter(it => !last.has(it.label));
    const weight = it => (h.seen[it.label] == null ? 8 : Math.min(8, round - h.seen[it.label]));
    const picked = weightedSample(fresh, SLOTS - keep.length, weight);
    // Small pools: top up from last time's set.
    const topUp = familiar.slice(keepCount, keepCount + (SLOTS - keep.length - picked.length));
    const hand = shuffle([...keep, ...picked, ...topUp]);

    h.round = round;
    h.last = hand.map(it => it.label);
    for (const it of hand) h.seen[it.label] = round;
    rotation.topics[topic.name] = h;
    rotation.recent = [topic.name, ...rotation.recent.filter(n => n !== topic.name)].slice(0, 40);
    rotationStore.save(rotation);
    return hand;
  }

  /* ============================ STATE ============================ */
  const stateStore = store('br_state_v6');
  const moodStore = store('br_moods_v1');

  const App = {
    allTopics: window.TOPICS || [],
    topics: [],
    topicIndex: 0,
    hand: [],          // the 5 items dealt for the current topic
    itemIndex: 0,
    ranks: new Array(SLOTS).fill(null),   // item labels
    rankImages: new Array(SLOTS).fill(null),
    completed: false,
    moods: [],

    buildTopicList(moods) {
      this.moods = moods || [];
      let pool = this.allTopics;
      if (this.moods.length) pool = pool.filter(t => this.moods.includes(t.mood));
      // Random order, but topics you played recently go to the back.
      const recentRank = new Map(rotation.recent.map((n, i) => [n, i]));
      const fresh = shuffle(pool.filter(t => !recentRank.has(t.name)));
      const recent = pool.filter(t => recentRank.has(t.name))
        .sort((a, b) => recentRank.get(b.name) - recentRank.get(a.name));
      this.topics = [...fresh, ...recent];
      this.topicIndex = 0;
    },
    topic() { return this.topics[this.topicIndex] || null; },
    item() { return this.hand[this.itemIndex] || null; },
    startTopic(index) {
      this.topicIndex = ((index % this.topics.length) + this.topics.length) % this.topics.length;
      this.hand = dealItems(this.topic());
      this.itemIndex = 0;
      this.ranks = new Array(SLOTS).fill(null);
      this.rankImages = new Array(SLOTS).fill(null);
      this.completed = false;
      this.persist();
    },
    persist() {
      stateStore.save({
        topicOrder: this.topics.map(t => t.name),
        topicIndex: this.topicIndex,
        hand: this.hand.map(it => it.label),
        itemIndex: this.itemIndex,
        ranks: this.ranks,
        rankImages: this.rankImages,
        completed: this.completed
      });
      moodStore.save(this.moods);
    },
    // Restore mid-topic exactly as it was (same five items, same slots).
    hydrate() {
      const d = stateStore.load();
      if (!d || !Array.isArray(d.topicOrder)) return false;
      this.moods = moodStore.load() || [];
      const byName = new Map(this.allTopics.map(t => [t.name, t]));
      this.topics = d.topicOrder.map(n => byName.get(n)).filter(Boolean);
      if (!this.topics.length) return false;
      this.topicIndex = Math.min(d.topicIndex | 0, this.topics.length - 1);
      const pool = new Map(poolOf(this.topic()).map(it => [it.label, it]));
      const hand = (d.hand || []).map(l => pool.get(l));
      if (hand.length !== Math.min(SLOTS, pool.size) || hand.some(x => !x)) {
        this.startTopic(this.topicIndex); // topics.js changed under us
        return true;
      }
      this.hand = hand;
      this.itemIndex = Math.min(d.itemIndex | 0, hand.length - 1);
      this.ranks = Array.isArray(d.ranks) ? d.ranks.slice(0, SLOTS) : new Array(SLOTS).fill(null);
      this.rankImages = Array.isArray(d.rankImages) ? d.rankImages.slice(0, SLOTS) : new Array(SLOTS).fill(null);
      this.completed = !!d.completed;
      return true;
    }
  };

  /* ========================== IMAGES ========================== */
  function manifestEntryFor(item, topic) {
    const images = window.BR_IMAGES;
    if (!images || !item?.label) return null;
    const key = slug(item.label);
    if (topic?.name) {
      const scoped = images[`${key}@@${slug(topic.name)}`];
      if (scoped) return scoped;
    }
    return images[key] || null;
  }

  const preloaded = new Map(); // url → Promise<boolean>
  const loadedOk = new Set();  // urls known to have loaded fine
  function preload(url) {
    if (!url) return Promise.resolve(false);
    if (!preloaded.has(url)) {
      preloaded.set(url, new Promise(resolve => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          const ok = img.naturalWidth >= 150 && img.naturalHeight >= 150;
          if (ok) loadedOk.add(url);
          resolve(ok);
        };
        img.onerror = () => resolve(false);
        img.src = url;
      }));
    }
    return preloaded.get(url);
  }
  // The image an item is shown with — only ever its own vetted, loaded image.
  function imageFor(item) {
    const e = manifestEntryFor(item, App.topic());
    return e && loadedOk.has(e.u) ? e.u : null;
  }
  function preloadHand() {
    for (const it of App.hand) {
      const e = manifestEntryFor(it, App.topic());
      if (e) preload(e.u);
    }
  }

  /* ========================== RENDER ========================== */
  const els = {};
  let paintToken = 0;
  let cardReady = false; // the current item is on screen and can be ranked

  function renderTopic() {
    const t = App.topic();
    els.topicTitle.textContent = t?.name || '';
    els.topicMood.textContent = moodLabel(t?.mood);
    const style = MOOD_STYLE[t?.mood] || {};
    els.card.style.setProperty('--mood-grad', style.grad || '');
  }

  function renderProgress() {
    const placed = App.ranks.filter(Boolean).length;
    $$('li', els.dots).forEach((li, i) => {
      li.classList.toggle('done', i < placed);
      li.classList.toggle('now', !App.completed && i === placed);
    });
    els.progressText.textContent = App.completed ? 'All ranked' : `${Math.min(placed + 1, SLOTS)} of ${SLOTS}`;
  }

  function renderSlots(popRank = 0) {
    $$('.slot', els.slots).forEach(btn => {
      const r = +btn.dataset.rank;
      const label = App.ranks[r - 1];
      const body = $('.slot-body', btn);
      body.textContent = '';
      btn.classList.toggle('filled', !!label);
      btn.disabled = !!label || App.completed;
      if (label) {
        const url = App.rankImages[r - 1];
        if (url) {
          const img = document.createElement('img');
          img.className = 'slot-thumb';
          img.alt = '';
          img.src = url;
          const entry = manifestEntryFor({ label }, App.topic());
          if (entry?.p) img.classList.add('is-logo');
          body.appendChild(img);
        }
        const name = document.createElement('span');
        name.className = 'slot-name';
        name.textContent = cleanLabel(label);
        body.appendChild(name);
        btn.setAttribute('aria-label', `#${r}: ${cleanLabel(label)}`);
      } else {
        const hint = document.createElement('span');
        hint.className = 'slot-empty';
        hint.textContent = `Rank it #${r}`;
        body.appendChild(hint);
        const cur = App.item();
        btn.setAttribute('aria-label', cur ? `Rank ${cleanLabel(cur.label)} number ${r}` : `Rank ${r}`);
      }
      if (r === popRank && !REDUCED_MOTION) {
        btn.classList.remove('pop');
        void btn.offsetWidth;
        btn.classList.add('pop');
      }
    });
  }

  function showTextCard(label) {
    els.card.classList.remove('has-img', 'is-logo');
    els.card.classList.add('is-text');
    els.cardImg.hidden = true;
    els.cardImg.removeAttribute('src');
    els.cardText.hidden = false;
    els.cardText.innerHTML = '';
    const span = document.createElement('span');
    span.textContent = label;
    els.cardText.appendChild(span);
  }

  async function renderCard({ deal = true } = {}) {
    const item = App.item();
    const token = ++paintToken;
    cardReady = false;
    els.card.hidden = false;
    els.results.hidden = true;
    if (!item) return;
    const label = cleanLabel(item.label);

    const entry = manifestEntryFor(item, App.topic());
    let ok = !!entry && loadedOk.has(entry.u);
    if (entry && !ok) {
      // Clear the previous item first: a picture must never sit under
      // another item's name, even for a moment.
      els.card.classList.remove('has-img', 'is-logo', 'is-text');
      els.cardImg.hidden = true;
      els.cardImg.removeAttribute('src');
      els.cardText.hidden = true;
      els.backdrop.style.backgroundImage = '';
      els.cardLabel.textContent = '';
      els.loading.hidden = false;
      ok = await preload(entry.u);
      if (token !== paintToken) return;
      els.loading.hidden = true;
    }

    els.cardLabel.textContent = label;
    els.card.setAttribute('aria-label', label);
    if (ok) {
      els.card.classList.remove('is-text');
      els.card.classList.add('has-img');
      els.card.classList.toggle('is-logo', !!entry.p);
      els.cardText.hidden = true;
      els.cardImg.hidden = false;
      els.cardImg.alt = label;
      els.cardImg.src = entry.u;
      els.cardImg.dataset.fit = entry.f || 'contain';
      els.cardImg.style.objectFit = entry.f || 'contain';
      els.cardImg.style.objectPosition = `${entry.x ?? 50}% ${entry.y ?? 50}%`;
      els.backdrop.style.backgroundImage = entry.p ? '' : `url("${entry.u.replace(/"/g, '%22')}")`;
    } else {
      showTextCard(label);
    }
    cardReady = true;

    if (deal && !REDUCED_MOTION) {
      els.card.classList.remove('deal');
      void els.card.offsetWidth;
      els.card.classList.add('deal');
    }
  }

  function renderAll() {
    renderTopic();
    renderProgress();
    renderSlots();
    els.game.classList.toggle('done', App.completed);
    els.hint.textContent = App.completed
      ? 'Final order. Agree? Disagree? Share it.'
      : 'Where does it rank? Tap a spot — no take-backs.';
  }

  /* ====================== PLACING AN ITEM ====================== */
  let animating = false;

  // A snapshot of the card flies into the slot it was ranked in.
  function flyCardTo(slotBtn) {
    if (REDUCED_MOTION || !els.card.isConnected) return Promise.resolve();
    const from = els.card.getBoundingClientRect();
    const to = slotBtn.getBoundingClientRect();
    if (!from.width || !to.width) return Promise.resolve();
    const ghost = els.card.cloneNode(true);
    ghost.removeAttribute('id');
    $$('[id]', ghost).forEach(n => n.removeAttribute('id'));
    ghost.classList.remove('deal');
    ghost.classList.add('card-ghost');
    Object.assign(ghost.style, { left: `${from.left}px`, top: `${from.top}px`, width: `${from.width}px`, height: `${from.height}px` });
    document.body.appendChild(ghost);
    const dx = to.left - from.left, dy = to.top - from.top;
    const sx = to.width / from.width, sy = to.height / from.height;
    const anim = ghost.animate([
      { transform: 'translate(0,0) scale(1,1)', opacity: 1, borderRadius: '26px' },
      { transform: `translate(${dx}px,${dy}px) scale(${sx},${sy})`, opacity: 0.35, borderRadius: '14px' }
    ], { duration: 420, easing: 'cubic-bezier(.55,0,.35,1)' });
    return anim.finished.catch(() => {}).then(() => ghost.remove());
  }

  async function place(rank) {
    const item = App.item();
    if (!item || !cardReady || App.completed || animating || App.ranks[rank - 1]) return;
    animating = true;
    const slotBtn = $(`.slot[data-rank="${rank}"]`, els.slots);

    App.ranks[rank - 1] = item.label;
    App.rankImages[rank - 1] = imageFor(item);
    const last = App.itemIndex >= App.hand.length - 1;
    if (last) App.completed = true; else App.itemIndex += 1;
    App.persist();

    const flight = flyCardTo(slotBtn);
    if (!last) {
      // Next card deals in underneath while the ghost flies.
      renderCard();
    }
    await flight;
    renderSlots(rank);
    renderProgress();
    if (last) {
      renderAll();
      showResults(true);
    } else {
      announce(`Ranked #${rank}. Next: ${cleanLabel(App.item()?.label)}`);
    }
    animating = false;
  }

  function showResults(celebrate) {
    els.card.hidden = true;
    els.results.hidden = false;
    const top = App.ranks[0];
    els.resultsTitle.textContent = top ? cleanLabel(top) : '';
    els.resultsTopic.textContent = `${App.topic()?.name || ''} · ranked`;
    // The #1 pick's own vetted image (if it had one), else a plain medal.
    els.resultsMedal.textContent = '';
    if (top && App.rankImages[0]) {
      const img = document.createElement('img');
      img.alt = '';
      img.src = App.rankImages[0];
      if (manifestEntryFor({ label: top }, App.topic())?.p) img.classList.add('is-logo');
      els.resultsMedal.appendChild(img);
    } else {
      const n = document.createElement('span');
      n.textContent = '1';
      els.resultsMedal.appendChild(n);
    }
    if (celebrate) {
      announce('All five ranked!');
      if (!REDUCED_MOTION) fireConfetti();
    }
    els.nextBtn.focus({ preventScroll: true });
  }

  async function nextTopic() {
    if (!App.topics.length) return;
    App.startTopic(App.topicIndex + 1);
    preloadHand();
    renderAll();
    await renderCard();
  }

  /* ============================ SHARE ============================ */
  const MEDALS = ['🥇', '🥈', '🥉', '4️⃣', '5️⃣'];
  function shareText() {
    const t = App.topic();
    const lines = App.ranks.map((l, i) => `${MEDALS[i]} ${l ? cleanLabel(l) : '—'}`);
    return `🔥 FIRESIDE Blind Rankings — ${t?.name || ''}\n\n${lines.join('\n')}\n\nfiresiderankings.com`;
  }
  async function share() {
    const text = shareText();
    if (navigator.share) {
      try { await navigator.share({ text }); return; } catch (_) { /* cancelled → copy */ }
    }
    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;left:-9999px';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
    }
    toast('Copied — paste it anywhere');
  }

  let toastTimer = null;
  function toast(msg) {
    els.toast.textContent = msg;
    els.toast.hidden = false;
    requestAnimationFrame(() => els.toast.classList.add('show'));
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove('show');
      setTimeout(() => { els.toast.hidden = true; }, 250);
    }, 1800);
  }

  function announce(msg) {
    els.live.textContent = '';
    requestAnimationFrame(() => { els.live.textContent = msg; });
  }

  /* ========================== CONFETTI ========================== */
  function fireConfetti() {
    const canvas = els.confetti;
    const ctx = canvas.getContext('2d');
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    canvas.style.display = 'block';
    ctx.scale(dpr, dpr);
    const colors = ['#ff5a1f', '#ff8a1f', '#ffb03b', '#ffe08a', '#fbf3ea', '#ffc93c'];
    const origin = els.results.getBoundingClientRect();
    const ox = origin.left + origin.width / 2, oy = origin.top + origin.height * 0.3;
    const parts = Array.from({ length: 110 }, () => ({
      x: ox, y: oy,
      vx: (Math.random() - 0.5) * 14,
      vy: -Math.random() * 13 - 3,
      s: Math.random() * 7 + 4,
      c: colors[(Math.random() * colors.length) | 0],
      r: Math.random() * 360,
      vr: (Math.random() - 0.5) * 14,
      life: 1
    }));
    let frame = 0;
    (function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let alive = false;
      for (const p of parts) {
        if (p.life <= 0) continue;
        alive = true;
        p.x += p.vx; p.y += p.vy; p.vy += 0.32; p.vx *= 0.99;
        p.r += p.vr; p.life -= 0.011;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.r * Math.PI / 180);
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.fillStyle = p.c;
        ctx.fillRect(-p.s / 2, -p.s / 3, p.s, p.s * 0.6);
        ctx.restore();
      }
      if (alive && ++frame < 160) requestAnimationFrame(tick);
      else { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height); canvas.style.display = 'none'; }
    })();
  }

  /* ========================== MOOD SHEET ========================== */
  let moodSelection = new Set();
  let lastFocus = null;

  function openMoods() {
    lastFocus = document.activeElement;
    moodSelection = new Set(App.moods);
    els.moodChips.innerHTML = '';
    for (const m of window.BR_MOODS || []) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mood-chip';
      b.setAttribute('aria-pressed', String(moodSelection.has(m.id)));
      const g = document.createElement('span');
      g.className = 'glyph';
      g.setAttribute('aria-hidden', 'true');
      g.textContent = MOOD_STYLE[m.id]?.glyph || '';
      b.append(g, document.createTextNode(m.label));
      b.addEventListener('click', () => {
        if (moodSelection.has(m.id)) moodSelection.delete(m.id); else moodSelection.add(m.id);
        b.setAttribute('aria-pressed', String(moodSelection.has(m.id)));
        els.moodGo.disabled = moodSelection.size === 0;
      });
      els.moodChips.appendChild(b);
    }
    els.moodGo.disabled = moodSelection.size === 0;
    els.moodPicker.hidden = false;
    (els.moodChips.firstElementChild || els.moodGo).focus({ preventScroll: true });
  }

  function closeMoods() {
    els.moodPicker.hidden = true;
    if (lastFocus?.focus) lastFocus.focus({ preventScroll: true });
  }

  async function startWith(moods) {
    App.buildTopicList(moods);
    if (!App.topics.length) App.buildTopicList([]);
    App.startTopic(0);
    closeMoods();
    preloadHand();
    renderAll();
    await renderCard();
  }

  /* ============================ BOOT ============================ */
  function bind() {
    els.slots.addEventListener('click', e => {
      const btn = e.target.closest('.slot');
      if (btn && !btn.disabled) place(+btn.dataset.rank);
    });
    els.nextBtn.addEventListener('click', nextTopic);
    els.skipBtn.addEventListener('click', nextTopic);
    els.shareBtn.addEventListener('click', share);
    els.moodBtn.addEventListener('click', openMoods);
    els.moodGo.addEventListener('click', () => { if (moodSelection.size) startWith([...moodSelection]); });
    els.moodSkip.addEventListener('click', () => startWith([]));
    els.moodPicker.addEventListener('click', e => {
      if (e.target === els.moodPicker && App.topics.length) closeMoods();
    });
    document.addEventListener('keydown', e => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (!els.moodPicker.hidden) {
        if (e.key === 'Escape' && App.topics.length) closeMoods();
        return;
      }
      if (e.key >= '1' && e.key <= String(SLOTS)) place(+e.key);
      else if (App.completed && (e.key === 'Enter' || e.key === 'n')) { e.preventDefault(); nextTopic(); }
    });
  }

  async function boot() {
    Object.assign(els, {
      game: $('.game'),
      topicTitle: $('#topicTitle'), topicMood: $('#topicMood'),
      dots: $('#progressDots'), progressText: $('#progressText'),
      card: $('#card'), cardImg: $('#cardImg'), cardText: $('#cardText'), cardLabel: $('#cardLabel'),
      backdrop: $('.card-backdrop'), loading: $('#cardLoading'),
      results: $('#results'), resultsTitle: $('#resultsTitle'),
      resultsTopic: $('#resultsTopic'), resultsMedal: $('#resultsMedal'),
      shareBtn: $('#shareBtn'), nextBtn: $('#nextBtn'), skipBtn: $('#skipBtn'),
      hint: $('#boardHint'), slots: $('#slots'),
      moodBtn: $('#moodBtn'), moodPicker: $('#moodPicker'), moodChips: $('#moodChips'),
      moodGo: $('#moodGoBtn'), moodSkip: $('#moodSkipBtn'),
      toast: $('#toast'), confetti: $('#confetti'), live: $('#live')
    });
    bind();

    if (App.hydrate()) {
      preloadHand();
      renderAll();
      if (App.completed) showResults(false);
      else await renderCard({ deal: false });
      return;
    }
    // First visit: pick moods first (nothing is dealt until then).
    if ((window.BR_MOODS || []).length) {
      showTextCard('');
      openMoods();
    } else {
      await startWith([]);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();

  // Debug hooks.
  window.BR = { App, dealItems, nextTopic };
})();
