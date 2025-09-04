"use strict";

/* =========================================================
   Blind Rankings — buttons-only placement, ripple feedback,
   face/top focus, localStorage resume, confetti celebration.
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

/* ------------------ Providers & image helpers ------------------ */
const IMG_CACHE_KEY = "blind-rank:imageCache:v5";
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

/* People-first focus heuristic */
const PERSON_HINTS = [
  "artist","artists","singer","singers","musician","musicians","people","players",
  "athlete","athletes","actors","actresses","olympian","olympians","drivers","golfers",
  "sprinters","tennis","composers","legends","girl groups","boy bands","pop artists","hip-hop"
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

/* ------------------ State & elements ------------------ */
const topics = window.BLIND_RANK_TOPICS || [];
let topicOrder = shuffle(topics.map((_,i)=>i));
let currentTopicIndex = 0;

let currentTopic = null;
let itemsQueue   = [];
let placed       = {};    // rank -> item
let currentItem  = null;

const SESSION_KEY = "blind-rank:session:v2";

const topicTag     = $("#topicTag");
const cardPhoto    = $("#cardPhoto");
const itemTitle    = $("#itemTitle");
const helpText     = $("#cardHelp");
const placeButtons = $("#placeButtons");
const rankSlots    = $$(".rank-slot");
const resultsEl    = $("#results");
const nextTopicBtn = $("#nextTopicBtn");
const newGameBtn   = $("#newGameBtn");
const confettiEl   = $("#confetti");

/* ------------------ Init ------------------ */
restoreSession() || startNewSession();

/* ------------------ Session ------------------ */
function saveSession(){
  try{
    const placedLabels = {};
    for (const [rank, item] of Object.entries(placed)) placedLabels[rank] = item.label;
    const payload = {
      version: 2,
      topicOrder,
      currentTopicIndex,
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

    const byLabel = (label)=> (currentTopic.items || []).find(it => it.label === label);

    placed = {};
    for (const [rank, label] of Object.entries(s.placedLabels || {})) {
      const it = byLabel(label); if (it) placed[Number(rank)] = it;
    }
    itemsQueue  = (s.queueLabels || []).map(byLabel).filter(Boolean);
    currentItem = s.currentItemLabel ? byLabel(s.currentItemLabel) : (itemsQueue.shift() || null);

    topicTag && (topicTag.textContent = currentTopic.name || "Untitled");
    clearSlots();
    for (const [rankStr, it] of Object.entries(placed)) {
      const slot = $(`.rank-slot[data-rank="${rankStr}"]`);
      if (slot) renderSlotInto(slot, it, currentTopic);
    }
    updateResults();
    paintCurrent();
    updateStartOverLock();
    return true;
  }catch(_){ return false; }
}

/* ------------------ UI helpers ------------------ */
function clearSlots(){
  rankSlots.forEach(slot=>{
    slot.setAttribute("aria-selected","false");
    const dz = $(".slot-dropzone", slot);
    dz.innerHTML = "";
    dz.classList.add("empty");
  });
}
async function paintCurrent(){
  if (!currentItem){
    if (cardPhoto) cardPhoto.style.backgroundImage = "none";
    if (itemTitle) itemTitle.textContent = "All items placed!";
    if (helpText)  helpText.textContent  = "Great job — pick a new topic to continue.";
    celebrate(); // trigger confetti
    return;
  }
  const { main } = await resolveImages(currentTopic, currentItem);
  const loaded   = await preloadImage(main);
  const bg       = loaded || `https://placehold.co/800x450?text=${encodeURIComponent(currentItem.label)}`;

  const faceFocus = topicPrefersFace(currentTopic);
  cardPhoto && (cardPhoto.style.backgroundImage  = `url('${bg}')`);
  cardPhoto && (cardPhoto.style.backgroundPosition = faceFocus ? "center 20%" : "center");
  itemTitle && (itemTitle.textContent = currentItem.label);
  if (helpText) {
    helpText.innerHTML = `
      <svg class="info-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M11 10h2v7h-2zM11 7h2v2h-2z"></path></svg>
      Use the <strong>Place</strong> buttons below to lock the item into a rank.
    `;
  }
}

/* ------------------ Game flow ------------------ */
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
function loadTopicByOrderIndex(orderIdx){
  const idx = topicOrder[orderIdx] ?? 0;
  currentTopicIndex = orderIdx;
  currentTopic = topics[idx];

  placed      = {};
  itemsQueue  = shuffle((currentTopic.items || []).slice());
  currentItem = itemsQueue.shift() || null;

  topicTag && (topicTag.textContent = currentTopic.name || "Untitled");
  clearSlots();
  updateResults();
  updateStartOverLock();
  paintCurrent();
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

  currentItem = itemsQueue.shift() || null;
  updateResults();
  updateStartOverLock();
  saveSession();
  paintCurrent();
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

/* Start Over locking: allowed until 3 placements, then disabled to keep it fair */
function updateStartOverLock(){
  const filled = Object.keys(placed).length;
  if (!newGameBtn) return;
  if (filled >= 3){
    newGameBtn.disabled = true;
    newGameBtn.title = "Start Over is locked after 3 placements to keep it fair";
    newGameBtn.setAttribute("aria-disabled","true");
  } else {
    newGameBtn.disabled = false;
    newGameBtn.title = "Start Over (resets this topic)";
    newGameBtn.removeAttribute("aria-disabled");
  }
}

/* ------------------ Controls ------------------ */
if (placeButtons){
  placeButtons.addEventListener("click",(e)=>{
    const btn = e.target.closest("[data-rank]");
    if (!btn) return;
    addRipple(btn, e);
    btn.animate(
      [{ transform: "translateY(0)" },{ transform: "translateY(1px)" },{ transform: "translateY(0)" }],
      { duration: 120, easing: "ease-out" }
    );
    placeCurrentItemInto(btn.dataset.rank);
  });
}
if (nextTopicBtn){
  nextTopicBtn.addEventListener("click", ()=>{
    const next = (currentTopicIndex + 1) % topicOrder.length;
    loadTopicByOrderIndex(next);
  });
}
if (newGameBtn){
  newGameBtn.addEventListener("click", ()=>{
    if (newGameBtn.disabled) return;
    // reset only this topic
    placed = {};
    itemsQueue = shuffle((currentTopic.items || []).slice());
    currentItem = itemsQueue.shift() || null;
    clearSlots();
    updateResults();
    updateStartOverLock();
    saveSession();
    paintCurrent();
  });
}

/* ------------------ Ripple (Material-inspired) ------------------ */
function addRipple(btn, evt){
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  const size = Math.max(rect.width, rect.height);
  const x = (evt.clientX ?? (rect.left + rect.width/2)) - rect.left - size/2;
  const y = (evt.clientY ?? (rect.top + rect.height/2)) - rect.top  - size/2;
  ripple.style.width = ripple.style.height = `${size*1.2}px`;
  ripple.style.left = `${x}px`; ripple.style.top = `${y}px`;
  btn.appendChild(ripple);
  setTimeout(()=> ripple.remove(), 450);
}

/* ------------------ Confetti celebration ------------------ */
let didCelebrate = false;
function celebrate(){
  const filled = Object.keys(placed).length;
  if (filled !== 5 || didCelebrate || !confettiEl) return;
  didCelebrate = true;
  const canvas = confettiEl;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.style.display = "block";

  const ctx = canvas.getContext("2d");
  const colors = ["#FFD84D","#7C5CFF","#22C55E","#F472B6","#38BDF8"];
  const parts = Array.from({length: 160}).map(()=>({
    x: Math.random()*canvas.width,
    y: -20 - Math.random()*canvas.height*0.3,
    r: 4 + Math.random()*6,
    c: colors[Math.floor(Math.random()*colors.length)],
    vx: -2 + Math.random()*4,
    vy: 2 + Math.random()*3,
    rot: Math.random()*Math.PI,
    vr: -0.1 + Math.random()*0.2
  }));

  let t = 0;
  function tick(){
    t++;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    parts.forEach(p=>{
      p.x += p.vx; p.y += p.vy; p.vy += 0.02;
      p.rot += p.vr;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r, -p.r, p.r*2, p.r*2);
      ctx.restore();
    });
    if (t < 220) requestAnimationFrame(tick);
    else canvas.style.display = "none";
  }
  tick();
}
window.addEventListener("resize", ()=>{
  if (!confettiEl) return;
  confettiEl.width = window.innerWidth;
  confettiEl.height = window.innerHeight;
});

/* ------------------ Start / first topic ------------------ */
if (!restoreSession()) {
  // ensure buttons usable if no session existed
  updateStartOverLock();
}