"use strict";

/* =========================================================
   Blind Rankings — robust end flow, reliable images,
   relevance scoring, face/character focus, confetti+CTA.
   ========================================================= */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- Utils ---------- */
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

/* Fetch with timeout */
async function fetchJson(url, opts = {}, timeoutMs = 7000){
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try{
    const r = await fetch(url, { ...opts, signal: controller.signal });
    if (!r.ok) return null;
    const ct = r.headers.get("content-type") || "";
    const data = ct.includes("application/json") ? await r.json() : await r.text();
    return data;
  }catch(_){ return null; }
  finally{ clearTimeout(id); }
}

/* Relevance scoring to avoid unrelated results */
const STOP = new Set(["the","a","an","of","and","&","in","on","at","to","for"]);
function tokenize(s){
  return String(s||"").toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu," ")
    .split(" ").filter(w => w && !STOP.has(w));
}
function scoreMatch(query, candidate){
  const qt = new Set(tokenize(query));
  const ct = new Set(tokenize(candidate));
  if (!qt.size || !ct.size) return 0;
  let hit = 0;
  qt.forEach(t => { if (ct.has(t)) hit++; });
  const recall  = hit / qt.size;
  const precis  = hit / ct.size;
  return 0.65*recall + 0.35*precis; // weight recall higher
}

/* ---------- Image providers & fallbacks ---------- */
const IMG_CACHE_KEY = "blind-rank:imageCache:v7";
let imageCache = {};
try { imageCache = JSON.parse(localStorage.getItem(IMG_CACHE_KEY) || "{}"); } catch(_) {}
const cacheGet = (k)=> imageCache[k];
const cacheSet = (k,v)=>{ imageCache[k] = v; try{ localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(imageCache)); }catch(_){} };

const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG  = "https://image.tmdb.org/t/p";

/** TMDB (movie/tv/person) with relevance filter */
async function tmdbSearchImages(query, mediaType = "movie"){
  const key = window.BR_CONFIG?.TMDB_API_KEY || "";
  if (!key) return null;
  const url = `${TMDB_BASE}/search/${mediaType}?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const data = await fetchJson(url);
  if (!data || !Array.isArray(data.results) || !data.results.length) return null;

  // pick best by relevance
  const results = data.results
    .map(r => ({
      raw: r,
      title: r.title || r.name || "",
      score: scoreMatch(query, r.title || r.name || "")
    }))
    .sort((a,b)=> b.score - a.score);

  const best = results[0];
  if (!best || best.score < 0.35) return null; // too unrelated

  const first = best.raw;

  if (mediaType === "person"){
    const profile = first.profile_path ? `${TMDB_IMG}/w780${first.profile_path}` : null;
    if (!profile) return null;
    return { main: profile, thumb: profile, title: first.name || query };
  }

  const main  = first.backdrop_path ? `${TMDB_IMG}/w1280${first.backdrop_path}` : (first.poster_path ? `${TMDB_IMG}/w780${first.poster_path}` : null);
  const thumb = first.poster_path   ? `${TMDB_IMG}/w500${first.poster_path}`   : (first.backdrop_path ? `${TMDB_IMG}/w780${first.backdrop_path}` : null);
  if (!main && !thumb) return null;
  return { main, thumb, title: first.title || first.name || query };
}

/** Wikipedia PageImages + Wikidata P18 (Commons) */
async function wikiBestImage(title){
  // Wikipedia pageimages + QID
  const wp = await fetchJson(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=1400&titles=${encodeURIComponent(title)}&origin=*`);
  try{
    const pages = wp?.query?.pages || {};
    const firstPage = Object.values(pages)[0];
    const direct = firstPage?.thumbnail?.source || null;
    if (direct) return direct;

    const qid = firstPage?.pageprops?.wikibase_item;
    if (qid){
      const wd = await fetchJson(`https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&property=P18&format=json&origin=*`);
      const p18 = wd?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
      if (p18){
        const file = encodeURIComponent(p18);
        return `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=1400`;
      }
    }
  }catch(_){}
  return null;
}

/** TVMaze (TV shows; no key) */
async function tvmazeShowImage(query){
  const data = await fetchJson(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
  if (!Array.isArray(data) || !data.length) return null;
  const ranked = data
    .map(x => ({ url: x?.show?.image?.original || x?.show?.image?.medium, title: x?.show?.name || "", score: scoreMatch(query, x?.show?.name || "") }))
    .filter(x => x.url)
    .sort((a,b)=> b.score - a.score);
  return (ranked[0] && ranked[0].score >= 0.35) ? ranked[0].url : null;
}

/** OMDb (movie/TV posters; key) */
async function omdbPoster(query){
  const key = window.BR_CONFIG?.OMDB_API_KEY;
  if (!key) return null;
  const d = await fetchJson(`https://www.omdbapi.com/?apikey=${encodeURIComponent(key)}&t=${encodeURIComponent(query)}`);
  const p = d?.Poster;
  return (p && p !== "N/A") ? p : null;
}

/** iTunes (artists/movies; no key) */
function upscaleItunes(url){ return url ? url.replace(/\/\d+x\d+bb\.jpg/, '/1200x1200bb.jpg') : null; }
async function itunesArtistImage(query){
  const d = await fetchJson(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=musicArtist&limit=3`);
  const cands = Array.isArray(d?.results) ? d.results : [];
  let best = null, bestScore = 0;
  for (const r of cands){
    const t = r.artistName || "";
    const s = scoreMatch(query, t);
    if (s > bestScore){
      bestScore = s;
      best = upscaleItunes(r.artworkUrl100);
    }
  }
  return bestScore >= 0.35 ? best : null;
}
async function itunesMoviePoster(query){
  const d = await fetchJson(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=movie&entity=movie&limit=3`);
  const cands = Array.isArray(d?.results) ? d.results : [];
  let best = null, bestScore = 0;
  for (const r of cands){
    const t = r.trackName || r.collectionName || "";
    const s = scoreMatch(query, t);
    if (s > bestScore){
      bestScore = s;
      best = upscaleItunes(r.artworkUrl100);
    }
  }
  return bestScore >= 0.35 ? best : null;
}

/** TheAudioDB (artist; key or test key "1") */
async function audioDbArtistImage(query){
  const key = window.BR_CONFIG?.AUDIODB_API_KEY || "1";
  const d = await fetchJson(`https://www.theaudiodb.com/api/v1/json/${encodeURIComponent(key)}/search.php?s=${encodeURIComponent(query)}`);
  const a = d?.artists?.[0];
  return a?.strArtistFanart || a?.strArtistThumb || null;
}

/** Last.fm (artist; key) */
async function lastfmArtistImage(query){
  const key = window.BR_CONFIG?.LASTFM_API_KEY;
  if (!key) return null;
  const d = await fetchJson(`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(query)}&api_key=${encodeURIComponent(key)}&format=json`);
  const imgs = d?.artist?.image;
  const url = imgs?.length ? imgs[imgs.length - 1]["#text"] : null;
  return url || null;
}

/** Pixabay / Unsplash / Pexels (generic fallback) */
async function pixabayPhoto(query){
  const key = window.BR_CONFIG?.PIXABAY_API_KEY;
  if (!key) return null;
  const d = await fetchJson(`https://pixabay.com/api/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(query)}&image_type=photo&per_page=3&safesearch=true`);
  const h = d?.hits?.[0];
  return h?.largeImageURL || h?.webformatURL || null;
}
async function unsplashPhoto(query){
  const key = window.BR_CONFIG?.UNSPLASH_ACCESS_KEY;
  if (!key) return null;
  const d = await fetchJson(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1`, {
    headers: { Authorization: `Client-ID ${key}` }
  });
  const p = d?.results?.[0];
  return p?.urls?.regular || p?.urls?.full || p?.urls?.small || null;
}
async function pexelsPhoto(query){
  const key = window.BR_CONFIG?.PEXELS_API_KEY;
  if (!key) return null;
  const r = await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`, {
    headers: { Authorization: key }
  }).catch(()=>null);
  if (!r || !r.ok) return null;
  const d = await r.json().catch(()=>null);
  const p = d?.photos?.[0];
  return p?.src?.large2x || p?.src?.large || p?.src?.medium || null;
}

/* Heuristics for face/character focus */
const PERSON_HINTS = [
  "artist","artists","singer","singers","musician","musicians","people","players",
  "athlete","athletes","actors","actresses","olympian","olympians","drivers","golfers",
  "sprinters","tennis","composers","legends","girl groups","boy bands","pop artists","hip-hop",
  "character","characters","superhero","superheroes","marvel","dc","anime","manga"
];
function topicPrefersFace(topic){
  const name = (topic?.name || "").toLowerCase();
  return PERSON_HINTS.some(h => name.includes(h)) || (topic?.mediaType === "person");
}
function labelPrefersFace(label){
  const s = String(label||"").toLowerCase();
  return PERSON_HINTS.some(h => s.includes(h)) ||
         /\b(man|woman|girl|boy|kid|hero|princess|queen|king)\b/.test(s) ||
         /iron man|batman|spider-man|superman|captain america|wonder woman|hulk|thor|black widow|goku|naruto|luffy|pikachu/.test(s);
}

/* Add gentle context for stock searches (helps relevance) */
function contextSuffix(topicName){
  const s = (topicName||"").toLowerCase();
  if (s.includes("foods") || s.includes("food")) return " food";
  if (s.includes("cars") || s.includes("vehicles")) return " car";
  if (s.includes("animals") || s.includes("pets")) return " animal";
  if (s.includes("cities") || s.includes("places")) return " city";
  return "";
}

/** Unified resolver with timeouts, relevance & fallbacks */
async function resolveImages(topic, item){
  if (item.imageUrl) return { main: item.imageUrl, thumb: item.imageUrl };

  const provider  = topic.provider || "static";
  const mediaType = topic.mediaType || "";
  const cacheKey  = `${provider}|${mediaType}|${item.label}`;
  const hit = cacheGet(cacheKey);
  if (hit) return hit;

  const wantFace = topicPrefersFace(topic) || labelPrefersFace(item.label);
  let out = null;

  // 1) Provider-directed first
  if (!out && provider === "tmdb" && (mediaType === "movie" || mediaType === "tv" || mediaType === "person")){
    const tm = await tmdbSearchImages(item.label, mediaType);
    if (tm?.main || tm?.thumb) out = { main: tm.main || tm.thumb, thumb: tm.thumb || tm.main };
  }
  if (!out && provider === "wiki"){
    const w = await wikiBestImage(item.label);
    if (w) out = { main: w, thumb: w };
  }

  // 2) Category-aware backups
  if (!out && provider === "tmdb" && mediaType === "tv"){
    const tvm = await tvmazeShowImage(item.label);
    if (tvm) out = { main: tvm, thumb: tvm };
  }
  if (!out && provider === "tmdb" && mediaType === "movie"){
    const om = await omdbPoster(item.label);
    if (om) out = { main: om, thumb: om };
  }
  if (!out && (mediaType === "person" || wantFace)){
    const a1 = await audioDbArtistImage(item.label);
    const a2 = a1 ? null : await lastfmArtistImage(item.label);
    const a3 = (a1 || a2) ? null : await itunesArtistImage(item.label);
    const pick = a1 || a2 || a3;
    if (pick) out = { main: pick, thumb: pick };
  }
  if (!out && provider === "tmdb" && mediaType === "movie"){
    const itMovie = await itunesMoviePoster(item.label);
    if (itMovie) out = { main: itMovie, thumb: itMovie };
  }
  if (!out){
    const suffix = contextSuffix(topic.name);
    const pex = await pixabayPhoto(item.label + suffix);
    const uns = pex ? null : await unsplashPhoto(item.label + suffix);
    const pex2= (pex || uns) ? null : await pexelsPhoto(item.label + suffix);
    const pick = pex || uns || pex2;
    if (pick) out = { main: pick, thumb: pick };
  }

  // 3) Placeholder
  if (!out){
    const ph = `https://placehold.co/800x450?text=${encodeURIComponent(item.label)}`;
    out = { main: ph, thumb: ph };
  }

  cacheSet(cacheKey, out);
  return out;
}

/* ---------- State & elements ---------- */
const topics = window.BLIND_RANK_TOPICS || [];
let topicOrder = shuffle(topics.map((_,i)=>i));
let currentTopicIndex = 0;

let currentTopic = null;
let itemsQueue   = [];
let placed       = {};    // rank -> item
let currentItem  = null;

const SESSION_KEY = "blind-rank:session:v4";

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
const nextTopicCta = $("#nextTopicCta");

/* ---------- Init ---------- */
restoreSession() || startNewSession();

/* ---------- Session ---------- */
function saveSession(){
  try{
    const placedLabels = {};
    for (const [rank, item] of Object.entries(placed)) placedLabels[rank] = item.label;
    const payload = {
      version: 4,
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
    didCelebrate = false; // reset confetti for restored topic
    paintCurrent();
    updateStartOverLock();
    wireControls(); // ensure buttons are live
    return true;
  }catch(_){ return false; }
}

/* ---------- UI helpers ---------- */
function clearSlots(){
  rankSlots.forEach(slot=>{
    slot.setAttribute("aria-selected","false");
    const dz = $(".slot-dropzone", slot);
    dz.innerHTML = "";
    dz.classList.add("empty");
  });
}
async function paintCurrent(){
  // Reset CTA vs photo each time
  if (nextTopicCta) nextTopicCta.hidden = true;
  if (cardPhoto)   cardPhoto.style.display = "";

  if (!currentItem){
    // Completed: show CTA in card area
    if (itemTitle) itemTitle.textContent = "All items placed!";
    if (helpText)  helpText.textContent  = "Great job — tap Next Topic to continue.";
    if (cardPhoto) cardPhoto.style.display = "none";
    if (nextTopicCta) nextTopicCta.hidden = false;
    celebrate();
    return;
  }

  const { main } = await resolveImages(currentTopic, currentItem);
  const loaded   = await preloadImage(main);
  const bg       = loaded || `https://placehold.co/800x450?text=${encodeURIComponent(currentItem.label)}`;

  const faceFocus = topicPrefersFace(currentTopic) || labelPrefersFace(currentItem.label);
  if (cardPhoto){
    cardPhoto.style.backgroundImage  = `url('${bg}')`;
    cardPhoto.style.backgroundPosition = faceFocus ? "center 20%" : "center";
  }
  itemTitle && (itemTitle.textContent = currentItem.label);

  if (helpText) {
    helpText.innerHTML = `
      <svg class="info-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M11 10h2v7h-2zM11 7h2v2h-2z"></path></svg>
      Use the <strong>Place</strong> buttons below to lock the item into a rank.
    `;
  }
}

/* ---------- Game flow ---------- */
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
  didCelebrate = false;            // reset confetti for new topic
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
  const faceFocus = topicPrefersFace(topic) || labelPrefersFace(item.label);
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

/* Start Over locking: disabled after 3 placements */
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

/* ---------- Controls ---------- */
function gotoNextTopic(){
  const next = (currentTopicIndex + 1) % topicOrder.length;
  loadTopicByOrderIndex(next);
}
function wireControls(){
  if (placeButtons && !placeButtons.__wired){
    placeButtons.addEventListener("click",(e)=>{
      const btn = e.target.closest("[data-rank]");
      if (!btn) return;
      addRipple(btn, e);
      btn.animate(
        [{ transform: "translateY(0)" },{ transform: "translateY(1px)" },{ transform: "translateY(0)" }],
        { duration: 140, easing: "ease-out" }
      );
      placeCurrentItemInto(btn.dataset.rank);
    });
    placeButtons.__wired = true;
  }
  if (nextTopicBtn && !nextTopicBtn.__wired){
    nextTopicBtn.addEventListener("click", gotoNextTopic);
    nextTopicBtn.__wired = true;
  }
  if (nextTopicCta && !nextTopicCta.__wired){
    nextTopicCta.addEventListener("click", gotoNextTopic);
    nextTopicCta.__wired = true;
  }
  if (newGameBtn && !newGameBtn.__wired){
    newGameBtn.addEventListener("click", ()=>{
      if (newGameBtn.disabled) return;
      placed = {};
      itemsQueue = shuffle((currentTopic.items || []).slice());
      currentItem = itemsQueue.shift() || null;
      clearSlots();
      updateResults();
      updateStartOverLock();
      didCelebrate = false;
      saveSession();
      paintCurrent();
    });
    newGameBtn.__wired = true;
  }
}
wireControls();

/* ---------- Ripple (prominent) ---------- */
function addRipple(btn, evt){
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  const size = Math.max(rect.width, rect.height) * 1.25;
  const x = ((evt.clientX ?? (rect.left + rect.width/2)) - rect.left) - size/2;
  const y = ((evt.clientY ?? (rect.top + rect.height/2)) - rect.top)  - size/2;
  ripple.style.position = "absolute";
  ripple.style.borderRadius = "50%";
  ripple.style.width = ripple.style.height = `${size * 1.6}px`;
  ripple.style.left = `${x}px`;
  ripple.style.top  = `${y}px`;
  ripple.style.transform = "scale(0.15)";
  ripple.style.opacity = "0.5";
  ripple.style.pointerEvents = "none";
  ripple.style.background = "rgba(255,255,255,.95)";
  ripple.style.filter = "blur(0.5px)";
  ripple.style.mixBlendMode = "screen";
  ripple.style.animation = "ripple-expand .65s cubic-bezier(.2,.8,.2,1) forwards";
  btn.appendChild(ripple);
  setTimeout(()=> ripple.remove(), 800);
}

/* ---------- Confetti ---------- */
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
  const parts = Array.from({length: 200}).map(()=>({
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
  (function tick(){
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
    if (t < 260) requestAnimationFrame(tick);
    else canvas.style.display = "none";
  })();
}
window.addEventListener("resize", ()=>{
  if (!confettiEl) return;
  confettiEl.width = window.innerWidth;
  confettiEl.height = window.innerHeight;
});