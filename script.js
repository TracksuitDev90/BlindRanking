"use strict";

/* =========================================================
   Blind Rankings — robust pointer drag, face-first framing,
   session save/restore, desktop+mobile button layout.
   ========================================================= */

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

// ---------- Provider image helpers ----------
const IMG_CACHE_KEY = "blind-rank:imageCache:v4";
let imageCache = {};
try { imageCache = JSON.parse(localStorage.getItem(IMG_CACHE_KEY) || "{}"); } catch(_) {}
const cacheGet = (k)=> imageCache[k];
const cacheSet = (k,v)=>{ imageCache[k] = v; try{ localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(imageCache)); }catch(_){} };

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG  = "https://image.tmdb.org/t/p";

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
  }catch(_){ return null; }
}

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
  }catch(_){ return null; }
}

/* Heuristic: if topic is about people, favor top-centered crop so faces show */
const PERSON_HINTS = [
  "artist","artists","singer","singers","musician","musicians","people","players",
  "athlete","athletes","actors","actresses","olympian","olympians","drivers","golfers",
  "sprinters","tennis","composers","legends"
];
function topicPrefersFace(topic){
  const name = (topic?.name || "").toLowerCase();
  return PERSON_HINTS.some(h => name.includes(h));
}

async function resolveImages(topic, item){
  if (item.imageUrl) return { main: item.imageUrl, thumb: item.imageUrl };

  const provider  = topic.provider || "static";
  const mediaType = topic.mediaType || "";
  const cacheKey  = `${provider}|${mediaType}|${item.label}`;
  const hit = cacheGet(cacheKey);
  if (hit) return hit;

  let out = null;
  if (provider === "tmdb" && (mediaType === "movie" || mediaType === "tv")){
    const res = await tmdbSearchImages(item.label, mediaType);
    if (res) out = {
      main:  res.main  || res.thumb || `https://placehold.co/800x450?text=${encodeURIComponent(item.label)}`,
      thumb: res.thumb || res.main  || `https://placehold.co/800x450?text=${encodeURIComponent(item.label)}`
    };
  } else if (provider === "wiki"){
    const url = await wikiLeadImage(item.label);
    if (url) out = { main: url, thumb: url };
  }
  if (!out){
    const ph = `https://placehold.co/800x450?text=${encodeURIComponent(item.label)}`;
    out = { main: ph, thumb: ph };
  }
  cacheSet(cacheKey, out);
  return out;
}

// ---------- App state + session ----------
const topics = window.BLIND_RANK_TOPICS || [];
let topicOrder = shuffle(topics.map((_,i)=>i));
let currentTopicIndex = 0;

let currentTopic = null;
let itemsQueue   = [];
let placed       = {};    // rank -> item
let currentItem  = null;
let usingTouch   = false;

const SESSION_KEY = "blind-rank:session:v1";

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
restoreSession() || startNewSession();

function detectTouch(){
  function setTouch(){
    usingTouch = true;
    if (placeButtons) placeButtons.hidden = false;
    window.removeEventListener("touchstart", setTouch);
  }
  window.addEventListener("touchstart", setTouch, { passive:true });
}

function startNewSession(){
  if (!Array.isArray(topics) || topics.length === 0) {
    topicTag && (topicTag.textContent = "Add topics to begin");
    itemTitle && (itemTitle.textContent = "No topics found");
    helpText  && (helpText.textContent  = "Create topics.js and define window.BLIND_RANK_TOPICS.");
    return;
  }
  topicOrder = shuffle(topics.map((_,i)=>i));
  currentTopicIndex = 0;
  loadTopicByOrderIndex(0);
  saveSession();
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

  topicTag && (topicTag.textContent = currentTopic.name || "Untitled");
  dealNextItem();
  saveSession();
}

async function dealNextItem(){
  currentItem = itemsQueue.shift() || null;

  if (!currentItem) {
    currentCard && currentCard.classList.remove("dragging");
    if (cardPhoto) cardPhoto.style.backgroundImage = "none";
    itemTitle && (itemTitle.textContent = "All items ranked!");
    helpText  && (helpText.textContent  = "Reshuffle or start a new topic.");
    return;
  }

  const { main } = await resolveImages(currentTopic, currentItem);
  const loaded = await preloadImage(main);
  const bg = loaded || `https://placehold.co/800x450?text=${encodeURIComponent(currentItem.label)}`;

  // Face/top focus when the topic is about people
  const faceFocus = topicPrefersFace(currentTopic);
  if (cardPhoto) {
    cardPhoto.style.backgroundImage  = `url('${bg}')`;
    cardPhoto.style.backgroundPosition = faceFocus ? "center 20%" : "center";
    cardPhoto.setAttribute("aria-label", `${currentItem.label} image`);
  }
  itemTitle && (itemTitle.textContent = currentItem.label);
  helpText  && (helpText.textContent  = usingTouch
    ? "Tap a button to place this into a rank."
    : "Drag the card to a rank slot, or use the buttons below."
  );

  saveSession();
}

async function placeCurrentItemInto(rank){
  rank = Number(rank);
  if (!currentItem) return;
  if (placed[rank]) return;

  const slot = $(`.rank-slot[data-rank="${rank}"]`);
  if (!slot) return;

  placed[rank] = currentItem;
  await renderSlotInto(slot, currentItem, currentTopic);
  slot.setAttribute("aria-selected","true");
  slot.animate([{transform:"scale(1)"},{transform:"scale(1.02)"},{transform:"scale(1)"}], { duration: 160, easing:"ease-out" });

  updateResults();
  saveSession();
  dealNextItem();
}

async function renderSlotInto(slot, item, topic){
  const dz = $(".slot-dropzone", slot);
  dz.classList.remove("empty");

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

  const faceFocus = topicPrefersFace(topic);
  const thumbEl = $(".slot-thumb", dz);
  if (thumbEl){
    thumbEl.style.backgroundImage   = `url('${finalThumb}')`;
    thumbEl.style.backgroundPosition = faceFocus ? "center 20%" : "center";
  }
}

function updateResults(){
  const filled = Object.keys(placed).length;
  const remain = Math.max(0, 5 - filled);
  resultsEl && (resultsEl.textContent = filled === 5 ? "All five placed. Nice!" : `${remain} to place…`);
}

/* ---------- Session save / restore ---------- */
function saveSession(){
  try{
    const placedLabels = {};
    for (const [rank, item] of Object.entries(placed)) placedLabels[rank] = item.label;

    const payload = {
      version: 1,
      topicOrder,
      currentTopicIndex,
      currentTopicName: currentTopic?.name || null,
      placedLabels,
      queueLabels: itemsQueue.map(it => it.label),
      currentItemLabel: currentItem?.label || null,
      when: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  }catch(_){}
}

function restoreSession(){
  try{
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return false;
    const s = JSON.parse(raw);
    if (!s || !Array.isArray(s.topicOrder)) return false;

    topicOrder = s.topicOrder;
    currentTopicIndex = s.currentTopicIndex || 0;
    const topicIdx = topicOrder[currentTopicIndex] ?? 0;
    currentTopic = topics[topicIdx];

    if (!currentTopic) return false;

    // Rebuild placed/queue/current from labels
    const findItem = (label) => (currentTopic.items || []).find(it => it.label === label);

    placed = {};
    for (const [rank, label] of Object.entries(s.placedLabels || {})) {
      const it = findItem(label);
      if (it) placed[Number(rank)] = it;
    }
    itemsQueue = (s.queueLabels || []).map(findItem).filter(Boolean);
    currentItem = s.currentItemLabel ? findItem(s.currentItemLabel) : (itemsQueue.shift() || null);

    // Paint UI
    topicTag && (topicTag.textContent = currentTopic.name || "Untitled");
    clearSlots();
    for (const [rankStr, it] of Object.entries(placed)) {
      const slot = $(`.rank-slot[data-rank="${rankStr}"]`);
      if (slot) renderSlotInto(slot, it, currentTopic);
    }
    updateResults();

    // Render current card
    if (currentItem) {
      (async ()=>{
        const { main } = await resolveImages(currentTopic, currentItem);
        const loaded = await preloadImage(main);
        const bg = loaded || `https://placehold.co/800x450?text=${encodeURIComponent(currentItem.label)}`;
        const faceFocus = topicPrefersFace(currentTopic);
        cardPhoto && (cardPhoto.style.backgroundImage = `url('${bg}')`);
        cardPhoto && (cardPhoto.style.backgroundPosition = faceFocus ? "center 20%" : "center");
        itemTitle && (itemTitle.textContent = currentItem.label);
      })();
    } else {
      itemTitle && (itemTitle.textContent = "All items ranked!");
      cardPhoto && (cardPhoto.style.backgroundImage = "none");
    }
    return true;
  }catch(_){ return false; }
}

/* ---------- Pointer-based drag (works on iPad + desktop) ---------- */
let dragActive = false;
let dragId = null;
let startX = 0, startY = 0;
let lastDX = 0, lastDY = 0;
let raf = null;
let hoverDZ = null;

function setTransform(dx, dy){
  if (!currentCard) return;
  currentCard.style.transform = `translate(${dx}px, ${dy}px) scale(1.02)`;
}

function onPointerMove(e){
  if (!dragActive) return;
  lastDX = e.clientX - startX;
  lastDY = e.clientY - startY;
  if (!raf) raf = requestAnimationFrame(()=>{
    setTransform(lastDX, lastDY);
    raf = null;
  });

  const el = document.elementFromPoint(e.clientX, e.clientY);
  const dz = el && el.closest && el.closest(".slot-dropzone");
  if (dz !== hoverDZ){
    if (hoverDZ) hoverDZ.classList.remove("is-hovered");
    hoverDZ = dz;
    if (hoverDZ){
      const slot = hoverDZ.closest(".rank-slot");
      if (slot && !placed[slot.dataset.rank]) hoverDZ.classList.add("is-hovered");
    }
  }
}

function snapBack(){
  if (!currentCard) return;
  currentCard.style.transition = "transform 120ms ease-out";
  currentCard.style.transform  = "translate(0,0)";
  setTimeout(()=>{
    currentCard.style.transition = "";
    currentCard.classList.remove("dragging");
  }, 140);
}

if (currentCard){
  currentCard.addEventListener("pointerdown", (e)=>{
    if (!currentItem) return;
    dragActive = true;
    dragId = e.pointerId;
    startX = e.clientX; startY = e.clientY;
    currentCard.setPointerCapture(dragId);
    currentCard.classList.add("dragging");
  });
  currentCard.addEventListener("pointermove", onPointerMove);
  currentCard.addEventListener("pointerup", (e)=>{
    if (!dragActive) return;
    dragActive = false;
    currentCard.releasePointerCapture(dragId);
    dragId = null;

    if (hoverDZ){
      const slot = hoverDZ.closest(".rank-slot");
      const rank = slot && slot.dataset.rank;
      hoverDZ.classList.remove("is-hovered");
      hoverDZ = null;
      currentCard.style.transform = "translate(0,0)";
      currentCard.classList.remove("dragging");
      if (rank) placeCurrentItemInto(rank);
    } else {
      snapBack();
    }
  });
  currentCard.addEventListener("pointercancel", ()=>{
    dragActive = false; if (hoverDZ){ hoverDZ.classList.remove("is-hovered"); hoverDZ=null; } snapBack();
  });
}

/* ---------- Keyboard & touch buttons ---------- */
if (placeButtons){
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

/* ---------- Controls ---------- */
if (reshuffleBtn) {
  reshuffleBtn.addEventListener("click", ()=>{
    placed = {};
    clearSlots();
    itemsQueue = shuffle((currentTopic.items || []).slice());
    dealNextItem();
    updateResults();
    saveSession();
  });
}
if (nextTopicBtn) {
  nextTopicBtn.addEventListener("click", ()=>{
    const next = (currentTopicIndex + 1) % topicOrder.length;
    loadTopicByOrderIndex(next);
  });
}
if (newGameBtn) {
  newGameBtn.addEventListener("click", ()=>{
    localStorage.removeItem(SESSION_KEY);
    startNewSession();
  });
}