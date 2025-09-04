// ---------- Small DOM + utils ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const sleep = (ms)=>new Promise(r=>setTimeout(r,ms));

function shuffle(arr){
  const a = arr.slice();
  for(let i=a.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [a[i],a[j]] = [a[j],a[i]];
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
    img.onload = () => res(src);
    img.onerror = () => res(null);
    img.src = src;
  });
}

// ---------- Image resolver (TMDB + Wikipedia) ----------
const IMG_CACHE_KEY = "blind-rank:imageCache:v2";
let imageCache = {};
try { imageCache = JSON.parse(localStorage.getItem(IMG_CACHE_KEY) || "{}"); } catch(_) {}
const cacheGet = (k)=> imageCache[k];
const cacheSet = (k,v)=>{ imageCache[k]=v; try{ localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(imageCache)); }catch(_){} };

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG  = "https://image.tmdb.org/t/p";

/**
 * Returns { main, thumb, title? } or null
 * main: prefer backdrop (w1280), thumb: prefer poster (w500)
 */
async function tmdbSearchImages(query, mediaType = "movie"){
  const key = (window.BR_CONFIG && window.BR_CONFIG.TMDB_API_KEY) || "";
  if(!key) return null;
  const url = `${TMDB_BASE}/search/${mediaType}?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  try{
    const r = await fetch(url);
    if(!r.ok) return null;
    const data = await r.json();
    const first = (data.results && data.results[0]) || null;
    if(!first) return null;
    const main  = first.backdrop_path ? `${TMDB_IMG}/w1280${first.backdrop_path}` : (first.poster_path ? `${TMDB_IMG}/w780${first.poster_path}` : null);
    const thumb = first.poster_path   ? `${TMDB_IMG}/w500${first.poster_path}`   : (first.backdrop_path ? `${TMDB_IMG}/w780${first.backdrop_path}` : null);
    return { main, thumb, title: first.title || first.name || query };
  }catch(e){ return null; }
}

/** Returns a single URL or null */
async function wikiLeadImage(title){
  const endpoint = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=1200&titles=${encodeURIComponent(title)}&origin=*`;
  try{
    const r = await fetch(endpoint);
    if(!r.ok) return null;
    const data = await r.json();
    const pages = data.query && data.query.pages;
    if(!pages) return null;
    const firstPage = Object.values(pages)[0];
    const url = firstPage && firstPage.thumbnail && firstPage.thumbnail.source;
    return url || null;
  }catch(e){ return null; }
}

/**
 * Resolve both main and thumb images for an item, using provider hints on the topic:
 *   topic.provider: "tmdb" | "wiki" | undefined
 *   topic.mediaType (when provider==="tmdb"): "movie" | "tv"
 *   item.imageUrl overrides everything.
 * Returns { main, thumb }
 */
async function resolveImages(topic, item){
  if(item.imageUrl){
    const url = item.imageUrl;
    return { main: url, thumb: url };
  }
  const provider  = topic.provider || "static";
  const mediaType = topic.mediaType || "";
  const cacheKey  = `${provider}|${mediaType}|${item.label}`;
  const cached    = cacheGet(cacheKey);
  if(cached) return cached;

  let result = null;

  if(provider === "tmdb" && (mediaType === "movie" || mediaType === "tv")){
    result = await tmdbSearchImages(item.label, mediaType);
    if(result && (!result.main || !result.thumb)){
      // Fill holes with whatever we have
      const filled = result.main || result.thumb;
      result = { main: result.main || filled, thumb: result.thumb || filled };
    }
  } else if(provider === "wiki") {
    const url = await wikiLeadImage(item.label);
    if(url) result = { main: url, thumb: url };
  }

  // Fallback placeholder
  if(!result){
    const ph = `https://placehold.co/800x450?text=${encodeURIComponent(item.label)}`;
    result = { main: ph, thumb: ph };
  }

  cacheSet(cacheKey, result);
  return result;
}

// ---------- App state ----------
const topics = window.BLIND_RANK_TOPICS || [];
let topicOrder = shuffle(topics.map((_,i)=>i));
let currentTopicIndex = 0;

let currentTopic = null;
let itemsQueue = [];
let placed = {};
let currentItem = null;
let usingTouch = false;

// ---------- Elements ----------
const topicTag = $("#topicTag");
const currentCard = $("#currentCard");
const cardPhoto = $("#cardPhoto");
const cardTitle = $("#cardTitle");
const helpText = $("#cardHelp");
const placeButtons = $("#placeButtons");

const rankSlots = $$(".rank-slot");
const resultsEl = $("#results");

// ---------- Init ----------
detectTouch();
startNewSession();

function detectTouch(){
  function setTouch(){ usingTouch = true; placeButtons.hidden = false; window.removeEventListener("touchstart", setTouch); }
  window.addEventListener("touchstart", setTouch, {passive:true});
}

function startNewSession(){
  if(!Array.isArray(topics) || topics.length === 0){
    cardTitle.textContent = "Add some topics!";
    helpText.textContent = "Create topics.js and define window.BLIND_RANK_TOPICS.";
    currentCard.draggable = false;
    return;
  }
  topicOrder = shuffle(topics.map((_,i)=>i));
  currentTopicIndex = 0;
  loadTopicByOrderIndex(0);
}

function loadTopicByOrderIndex(orderIdx){
  const idx = topicOrder[orderIdx] ?? 0;
  currentTopicIndex = orderIdx;
  currentTopic = topics[idx];

  placed = {};
  itemsQueue = shuffle((currentTopic.items || []).slice());
  currentItem = null;
  updateResults();

  rankSlots.forEach(slot=>{
    slot.setAttribute("aria-selected","false");
    const dz = $(".slot-dropzone", slot);
    dz.innerHTML = "";
    dz.classList.add("empty");
  });

  topicTag.textContent = currentTopic.name || "Untitled";
  dealNextItem();
}

async function dealNextItem(){
  currentItem = itemsQueue.shift() || null;

  if(!currentItem){
    currentCard.setAttribute("aria-grabbed","false");
    currentCard.classList.remove("dragging");
    cardPhoto.style.backgroundImage = "none";
    cardTitle.textContent = "All items ranked!";
    helpText.textContent = "You can reshuffle items or move to the next topic.";
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

function placeCurrentItemInto(rank){
  rank = Number(rank);
  if(!currentItem) return;
  if(placed[rank]) return;

  placed[rank] = currentItem;
  const slot = $(`.rank-slot[data-rank="${rank}"]`);
  if(!slot) return;

  renderSlotInto(slot, currentItem, currentTopic);
  slot.setAttribute("aria-selected","true");
  slot.animate([{transform:"scale(1)"},{transform:"scale(1.02)"},{transform:"scale(1)"}],{duration:180,easing:"ease-out"});

  persistResults();
  dealNextItem();
  updateResults();
}

async function renderSlotInto(slot, item, topic){
  const dz = $(".slot-dropzone", slot);
  dz.classList.remove("empty");
  const { thumb } = await resolveImages(topic, item);
  const safeTitle = escapeHtml(item.label);
  const safeTopic = escapeHtml(topic.name || "");
  dz.innerHTML = `
    <div class="slot-item">
      <div class="slot-thumb" style="background-image:url('${thumb}')"></div>
      <div class="slot-meta">
        <p class="title">${safeTitle}</p>
        <p class="topic">${safeTopic}</p>
      </div>
    </div>`;
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
  }catch(e){}
}

// ---------- Drag & Drop ----------
currentCard.addEventListener("dragstart", (e)=>{
  if(!currentItem){ e.preventDefault(); return; }
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
      if(!currentItem || placed[slot.dataset.rank]) return;
      e.preventDefault();
      dz.style.outline = "2px solid rgba(198,255,85,.6)";
    });
  });
  ["dragleave","drop"].forEach(type=>{
    dz.addEventListener(type, ()=>{ dz.style.outline = "none"; });
  });
  dz.addEventListener("drop", (e)=>{
    e.preventDefault();
    if(!currentItem) return;
    placeCurrentItemInto(slot.dataset.rank);
  });
});

// ---------- Keyboard & Touch ----------
const placeButtons = $("#placeButtons");
placeButtons.addEventListener("click",(e)=>{
  const btn = e.target.closest("[data-rank]");
  if(!btn) return;
  placeCurrentItemInto(btn.dataset.rank);
});
$$(".rank-slot").forEach(slot=>{
  slot.addEventListener("keydown",(e)=>{
    if(e.key === "Enter" || e.key === " "){
      e.preventDefault();
      placeCurrentItemInto(slot.dataset.rank);
    }
  });
});

// ---------- Controls ----------
$("#reshuffleBtn").addEventListener("click", ()=>{
  placed = {};
  $$(".rank-slot").forEach(slot=>{
    slot.setAttribute("aria-selected","false");
    const dz = $(".slot-dropzone", slot);
    dz.innerHTML = "";
    dz.classList.add("empty");
  });
  itemsQueue = shuffle((currentTopic.items || []).slice());
  dealNextItem();
  updateResults();
});
$("#nextTopicBtn").addEventListener("click", ()=>{
  const next = (currentTopicIndex + 1) % topicOrder.length;
  loadTopicByOrderIndex(next);
});
$("#newGameBtn").addEventListener("click", startNewSession);