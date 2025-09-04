"use strict";

/* =========================================================
   Blind Rank — App Logic (flat UI, DnD, touch, a11y)
   Works without a TMDB key; TMDB used when configured.
   ========================================================= */

// ---------- Tiny DOM + utils ----------
const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function shuffle(arr){
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHtml(str){
  return String(str).replace(/[&<>\"']/g, s => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[s]));
}

function preloadImage(src){
  return new Promise(res=>{
    const img = new Image();
    img.onload  = () => res(src);
    img.onerror = () => res(null);
    img.src = src;
  });
}

// ---------- Simple image cache ----------
const IMG_CACHE_KEY = "blind-rank:imageCache:v3";
let imageCache = {};
try { imageCache = JSON.parse(localStorage.getItem(IMG_CACHE_KEY) || "{}"); } catch(_) {}
const cacheGet = (k)=> imageCache[k];
const cacheSet = (k,v)=>{ imageCache[k] = v; try{ localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(imageCache)); }catch(_){} };

// ---------- Providers (TMDB + Wikipedia) ----------
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG  = "https://image.tmdb.org/t/p";

/**
 * Returns { main, thumb, title } or null
 * main: prefer backdrop (w1280), thumb: prefer poster (w500)
 */
async function tmdbSearchImages(query, mediaType = "movie"){
  const key = (window.BR_CONFIG && window.BR_CONFIG.TMDB_API_KEY) || "";
  if (!key) return null;

  const url = `${TMDB_BASE}/search/${mediaType}?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  try{
    const r = await fetch(url);
    if (!r.ok) return null;
    const data = await r.json();
    const first = (data.results && data.results[0]) || null;
    if (!first) return null;

    const main  = first.backdrop_path ? `${TMDB_IMG}/w1280${first.backdrop_path}` : (first.poster_path ? `${TMDB_IMG}/w780${first.poster_path}` : null);
    const thumb = first.poster_path   ? `${TMDB_IMG}/w500${first.poster_path}`   : (first.backdrop_path ? `${TMDB_IMG}/w780${first.backdrop_path}` : null);

    return { main, thumb, title: first.title || first.name || query };
  }catch(_){
    return null;
  }
}

/** Wikipedia PageImages (no key). Returns url or null. */
async function wikiLeadImage(title){
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=1200&titles=${encodeURIComponent(title)}&origin=*`;
  try{
    const r = await fetch(endpoint);
    if (!r.ok) return null;
    const data = await r.json();
    const pages = data.query && data.query.pages;
    if (!pages) return null;
    const firstPage = Object.values(pages)[0];
    const url = firstPage && firstPage.thumbnail && firstPage.thumbnail.source;
    return url || null;
  }catch(_){
    return null;
  }
}

/**
 * Resolve images using provider hints on the topic:
 *  - item.imageUrl overrides
 *  - topic.provider === "tmdb" (mediaType "movie"|"tv") → TMDB
 *  - topic.provider === "wiki" → Wikipedia PageImages
 * Fallback → readable placeholder.
 * Returns { main, thumb }
 */
async function resolveImages(topic, item){
  if (item.imageUrl) return { main: item.imageUrl, thumb: item.imageUrl };

  const provider  = topic.provider || "static";
  const mediaType = topic.mediaType || "";
  const cacheKey  = `${provider}|${mediaType}|${item.label}`;
  const hit = cacheGet(cacheKey);
  if (hit) return hit;

  let out = null;

  if (provider === "tmdb" && (mediaType === "movie" || mediaType === "tv")) {
    const res = await tmdbSearchImages(item.label, mediaType);
    if (res) {
      out = {
        main: res.main || res.thumb || `https://placehold.co/800x450?text=${encodeURIComponent(item.label)}`,
        thumb: res.thumb || res.main || `https://placehold.co/800x450?text=${encodeURIComponent(item.label)}`
      };
    }
  } else if (provider === "wiki") {
    const url = await wikiLeadImage(item.label);
    if (url) out = { main: url, thumb: url };
  }

  if (!out) {
    const ph = `https://placehold.co/800x450?text=${encodeURIComponent(item.label)}`;
    out = { main: ph, thumb: ph };
  }

  cacheSet(cacheKey, out);
  return out;
}

// ---------- State ----------
const topics = window.BLIND_RANK_TOPICS || [];
let topicOrder = shuffle(topics.map((_,i)=>i));
let currentTopicIndex = 0;

let currentTopic = null;
let itemsQueue   = [];
let placed       = {};    // rank -> item
let currentItem  = null;
let usingTouch   = false;

// ---------- Elements ----------
const topicTag     = $("#topicTag");
const currentCard  = $("#currentCard");
const cardPhoto    = $("#cardPhoto");
const itemTitle    = $("#itemTitle");
const helpText     = $("#cardHelp");
const placeButtons = $("#placeButtons");

const rankSlots    = $$(".rank-slot");
const resultsEl    = $("#results");
const reshuffleBtn = $("#reshuffleBtn");
const nextTopicBtn = $("#nextTopicBtn");
const newGameBtn   = $("#newGameBtn");

// ---------- Init ----------
detectTouch();
startNewSession();

function detectTouch(){
  function setTouch(){
    usingTouch = true;
    if (placeButtons) placeButtons.hidden = false;
    window.removeEventListener("touchstart", setTouch);
  }
  window.addEventListener("touchstart", setTouch, { passive: true });
}

function startNewSession(){
  if (!Array.isArray(topics) || topics.length === 0) {
    if (topicTag)  topicTag.textContent  = "Add topics to begin";
    if (itemTitle) itemTitle.textContent = "No topics found";
    if (helpText)  helpText.textContent  = "Create topics.js and define window.BLIND_RANK_TOPICS.";
    if (currentCard) {
      currentCard.draggable = false;
      cardPhoto && (cardPhoto.style.backgroundImage = "none");
    }
    return;
  }
  topicOrder = shuffle(topics.map((_,i)=>i));
  currentTopicIndex = 0;
  loadTopicByOrderIndex(0);
}

function clearSlots(){
  rankSlots.forEach(slot=>{
    slot.setAttribute("aria-selected","false");
    const dz = $(".slot-dropzone", slot);
    dz.innerHTML = "";
    dz.classList.add("empty");
    dz.classList.remove("is-hovered");
  });
}

function loadTopicByOrderIndex(orderIdx){
  const idx = topicOrder[orderIdx] ?? 0;
  currentTopicIndex = orderIdx;
  currentTopic = topics[idx];

  placed      = {};
  itemsQueue  = shuffle((currentTopic.items || []).slice());
  currentItem = null;
  updateResults();
  clearSlots();

  if (topicTag)  topicTag.textContent = currentTopic.name || "Untitled";
  dealNextItem();
}

async function dealNextItem(){
  currentItem = itemsQueue.shift() || null;

  if (!currentItem) {
    currentCard && currentCard.setAttribute("aria-grabbed","false");
    currentCard && currentCard.classList.remove("dragging");
    if (cardPhoto) cardPhoto.style.backgroundImage = "none";
    if (itemTitle) itemTitle.textContent = "All items ranked!";
    if (helpText)  helpText.textContent  = "You can reshuffle items or load a new topic.";
    if (currentCard) currentCard.draggable = false;
    return;
  }

  const { main } = await resolveImages(currentTopic, currentItem);
  const loaded = await preloadImage(main);
  const bg = loaded || `https://placehold.co/800x450?text=${encodeURIComponent(currentItem.label)}`;

  if (cardPhoto) {
    cardPhoto.style.backgroundImage = `url('${bg}')`;
    cardPhoto.setAttribute("aria-label", `${currentItem.label} image`);
  }
  if (itemTitle) itemTitle.textContent = currentItem.label;

  if (currentCard) {
    currentCard.draggable = true;
    currentCard.setAttribute("aria-grabbed","false");
  }

  if (helpText) {
    helpText.textContent = usingTouch
      ? "Tap a button to place this into a rank."
      : "Drag the card to a rank slot, or use the buttons below.";
  }
}

async function placeCurrentItemInto(rank){
  rank = Number(rank);
  if (!currentItem)   return;
  if (placed[rank])   return;

  const slot = $(`.rank-slot[data-rank="${rank}"]`);
  if (!slot) return;

  placed[rank] = currentItem;

  await renderSlotInto(slot, currentItem, currentTopic);
  slot.setAttribute("aria-selected","true");
  // Tiny bounce
  slot.animate([{transform:"scale(1)"},{transform:"scale(1.02)"},{transform:"scale(1)"}], { duration: 160, easing:"ease-out" });

  persistResults();
  updateResults();
  dealNextItem();
}

async function renderSlotInto(slot, item, topic){
  const dz = $(".slot-dropzone", slot);
  dz.classList.remove("empty");

  // Skeleton while thumb resolves
  dz.innerHTML = `
    <div class="slot-item">
      <div class="slot-thumb" style="background-image:url('https://placehold.co/320x200?text=...')"></div>
      <div class="slot-meta">
        <p class="title">${escapeHtml(item.label)}</p>
        <p class="topic">${escapeHtml(topic.name || "")}</p>
      </div>
    </div>
  `;

  const { thumb } = await resolveImages(topic, item);
  const ok = await preloadImage(thumb);
  const finalThumb = ok || `https://placehold.co/320x200?text=${encodeURIComponent(item.label)}`;
  const thumbEl = $(".slot-thumb", dz);
  if (thumbEl) thumbEl.style.backgroundImage = `url('${finalThumb}')`;
}

function updateResults(){
  const filled = Object.keys(placed).length;
  const remain = Math.max(0, 5 - filled);
  if (resultsEl) resultsEl.textContent = filled === 5 ? "All five placed. Nice!" : `${remain} to place…`;
}

function persistResults(){
  try{
    const key = "blind-rank:last";
    const payload = { topic: currentTopic?.name, placed, when: Date.now() };
    localStorage.setItem(key, JSON.stringify(payload));
  }catch(_){}
}

// ---------- Drag & Drop (buttery-smooth: class-based hover) ----------
if (currentCard) {
  currentCard.addEventListener("dragstart", (e)=>{
    if (!currentItem){ e.preventDefault(); return; }
    currentCard.classList.add("dragging");
    currentCard.setAttribute("aria-grabbed","true");
    e.dataTransfer.setData("text/plain","current-card");
    e.dataTransfer.effectAllowed = "move";
  });
  currentCard.addEventListener("dragend", ()=>{
    currentCard.classList.remove("dragging");
    currentCard.setAttribute("aria-grabbed","false");
  });
}

$$(".rank-slot").forEach(slot=>{
  const dz = $(".slot-dropzone", slot);

  dz.addEventListener("dragenter", (e)=>{
    if (!currentItem || placed[slot.dataset.rank]) return;
    e.preventDefault();
    dz.classList.add("is-hovered");
  });
  dz.addEventListener("dragover", (e)=>{
    if (!currentItem || placed[slot.dataset.rank]) return;
    e.preventDefault(); // required to allow drop
  });
  ["dragleave","drop"].forEach(type=>{
    dz.addEventListener(type, ()=> dz.classList.remove("is-hovered"));
  });
  dz.addEventListener("drop", (e)=>{
    e.preventDefault();
    if (!currentItem) return;
    placeCurrentItemInto(slot.dataset.rank);
  });
});

// ---------- Keyboard & Touch ----------
if (placeButtons) {
  placeButtons.addEventListener("click",(e)=>{
    const btn = e.target.closest("[data-rank]");
    if (!btn) return;
    placeCurrentItemInto(btn.dataset.rank);
  });
}

$$(".rank-slot").forEach(slot=>{
  slot.addEventListener("keydown",(e)=>{
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      placeCurrentItemInto(slot.dataset.rank);
    }
  });
});

// ---------- Controls ----------
if (reshuffleBtn) {
  reshuffleBtn.addEventListener("click", ()=>{
    placed = {};
    clearSlots();
    itemsQueue = shuffle((currentTopic.items || []).slice());
    dealNextItem();
    updateResults();
  });
}

if (nextTopicBtn) {
  nextTopicBtn.addEventListener("click", ()=>{
    const next = (currentTopicIndex + 1) % topicOrder.length;
    loadTopicByOrderIndex(next);
  });
}

if (newGameBtn) {
  newGameBtn.addEventListener("click", startNewSession);
}