"use strict";

/* =========================================================
   Blind Rank — App Logic (provider-aware, a11y, DnD, touch)
   Works even without a TMDB key (uses placeholders/Wikipedia)
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
const IMG_CACHE_KEY = "blind-rank:imageCache:v2";
let imageCache = {};
try { imageCache = JSON.parse(localStorage.getItem(IMG_CACHE_KEY) || "{}"); } catch(_) {}
const cacheGet = (k)=> imageCache[k];
const cacheSet = (k,v)=>{ imageCache[k] = v; try{ localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(imageCache)); }catch(_){} };

// ---------- External providers (TMDB + Wikipedia) ----------
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG  = "https://image.tmdb.org/t/p";

/**
 * Search TMDB for movie/tv and return best images.
 * Returns { main, thumb, title } or null.
 * - main: prefer backdrop (w1280), fallback to poster (w780)
 * - thumb: prefer poster (w500), fallback to backdrop (w780)
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

/**
 * Wikipedia lead image using PageImages (no key).
 * Returns a single URL or null.
 */
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
 * Resolve images for the given topic/item using provider hints:
 *  - item.imageUrl overrides everything
 *  - topic.provider === "tmdb" with topic.mediaType "movie"|"tv" → TMDB
 *  - topic.provider === "wiki" → Wikipedia PageImages
 * Fallback: placeholder with item label
 * Returns { main, thumb }
 */
async function resolveImages(topic, item){
  if (item.imageUrl) {
    return { main: item.imageUrl, thumb: item.imageUrl };
  }

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

// ---------- App state ----------
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
const cardTitle    = $("#cardTitle");
const helpText     = $("#cardHelp");
const placeButtons = $("#placeButtons"); // NOTE: declared once here only

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
    placeButtons.hidden = false;
    window.removeEventListener("touchstart", setTouch);
  }
  window.addEventListener("touchstart", setTouch, { passive:true });
}

function startNewSession(){
  if (!Array.isArray(topics) || topics.length === 0) {
    // No topics yet; keep UI friendly
    topicTag.textContent   = "Add topics to begin";
    cardTitle.textContent  = "No topics found";
    helpText.textContent   = "Create topics.js and define window.BLIND_RANK_TOPICS.";
    currentCard.draggable  = false;
    cardPhoto.style.backgroundImage = "none";
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
    dz.style.outline = "none";
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

  topicTag.textContent = currentTopic.name || "Untitled";
  dealNextItem();
}

async function dealNextItem(){
  currentItem = itemsQueue.shift() || null;

  if (!currentItem) {
    currentCard.setAttribute("aria-grabbed","false");
    currentCard.classList.remove("dragging");
    cardPhoto.style.backgroundImage = "none";
    cardTitle.textContent = "All items ranked!";
    helpText.textContent  = "You can reshuffle items or move to the next topic.";
    currentCard.draggable = false;
    return;
  }

  const { main } = await resolveImages(currentTopic, currentItem);
  const loaded = await preloadImage(main);
  const bg = loaded || `https://placehold.co/800x450?text=${encodeURIComponent(currentItem.label)}`;

  cardPhoto.style.backgroundImage = `url('${bg}')`;
  cardPhoto.setAttribute("aria-label", `${currentItem.label} image`);
  cardTitle.textContent = currentItem.label;

  currentCard.draggable = true;
  currentCard.setAttribute("aria-grabbed","false");

  helpText.textContent = usingTouch
    ? "Tap a button to place this into a rank."
    : "Drag the card to a rank slot, or use the buttons below.";
}

async function placeCurrentItemInto(rank){
  rank = Number(rank);
  if (!currentItem)   return;
  if (placed[rank])   return; // already filled

  const slot = $(`.rank-slot[data-rank="${rank}"]`);
  if (!slot) return;

  // Mark placement
  placed[rank] = currentItem;

  // Render the slot card (thumb)
  await renderSlotInto(slot, currentItem, currentTopic);
  slot.setAttribute("aria-selected","true");
  slot.animate([{transform:"scale(1)"},{transform:"scale(1.02)"},{transform:"scale(1)"}], { duration:180, easing:"ease-out" });

  persistResults();
  updateResults();
  dealNextItem();
}

async function renderSlotInto(slot, item, topic){
  const dz = $(".slot-dropzone", slot);
  dz.classList.remove("empty");

  // Skeleton while loading thumb
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
  resultsEl.textContent = filled === 5 ? "All five placed. Nice!" : `${remain} to place…`;
}

function persistResults(){
  try{
    const key = "blind-rank:last";
    const payload = { topic: currentTopic?.name, placed, when: Date.now() };
    localStorage.setItem(key, JSON.stringify(payload));
  }catch(_){}
}

// ---------- Drag & Drop ----------
currentCard.addEventListener("dragstart", (e)=>{
  if (!currentItem) { e.preventDefault(); return; }
  currentCard.classList.add("dragging");
  currentCard.setAttribute("aria-grabbed","true");
  e.dataTransfer.setData("text/plain","current-card");
  e.dataTransfer.effectAllowed = "move";
});
currentCard.addEventListener("dragend", ()=>{
  currentCard.classList.remove("dragging");
  currentCard.setAttribute("aria-grabbed","false");
});

$$(".rank-slot").forEach(slot=>{
  const dz = $(".slot-dropzone", slot);

  ["dragenter","dragover"].forEach(type=>{
    dz.addEventListener(type, (e)=>{
      if (!currentItem || placed[slot.dataset.rank]) return;
      e.preventDefault();
      dz.style.outline = "2px solid rgba(198,255,85,.6)";
    });
  });
  ["dragleave","drop"].forEach(type=>{
    dz.addEventListener(type, ()=>{
      dz.style.outline = "none";
    });
  });
  dz.addEventListener("drop", (e)=>{
    e.preventDefault();
    if (!currentItem) return;
    placeCurrentItemInto(slot.dataset.rank);
  });
});

// ---------- Keyboard & Touch ----------
placeButtons.addEventListener("click",(e)=>{
  const btn = e.target.closest("[data-rank]");
  if (!btn) return;
  placeCurrentItemInto(btn.dataset.rank);
});

$$(".rank-slot").forEach(slot=>{
  slot.addEventListener("keydown",(e)=>{
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      placeCurrentItemInto(slot.dataset.rank);
    }
  });
});

// ---------- Controls ----------
reshuffleBtn.addEventListener("click", ()=>{
  placed = {};
  clearSlots();
  itemsQueue = shuffle((currentTopic.items || []).slice());
  dealNextItem();
  updateResults();
});

nextTopicBtn.addEventListener("click", ()=>{
  const next = (currentTopicIndex + 1) % topicOrder.length;
  loadTopicByOrderIndex(next);
});

newGameBtn.addEventListener("click", startNewSession);