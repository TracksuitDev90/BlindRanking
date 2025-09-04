"use strict";

/* =========================================================
   Fixes: loader only when fetching/decoding hero image;
   New Topic moved above rankings; central UI updater.
   ========================================================= */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- Utils ---------- */
function shuffle(arr){ const a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }
function escapeHtml(str){ return String(str).replace(/[&<>\"']/g, s => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[s])); }
function tokenize(s){ return String(s||"").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").split(" ").filter(Boolean); }
const STOP = new Set(["the","a","an","of","and","&","in","on","at","to","for"]);
function scoreMatch(q,c){ const qt=new Set(tokenize(q).filter(w=>!STOP.has(w))); const ct=new Set(tokenize(c).filter(w=>!STOP.has(w))); if(!qt.size||!ct.size) return 0; let hit=0; qt.forEach(t=>ct.has(t)&&hit++); const r=hit/qt.size,p=hit/ct.size; return 0.65*r+0.35*p; }
async function fetchJson(url, opts={}, timeoutMs=7000){
  const controller=new AbortController(); const id=setTimeout(()=>controller.abort(), timeoutMs);
  try { const r=await fetch(url,{...opts,signal:controller.signal}); if(!r.ok) return null; const ct=r.headers.get("content-type")||""; return ct.includes("application/json")?r.json():r.text(); }
  catch{ return null; } finally{ clearTimeout(id); }
}

/* Progressive image helpers */
function tmdbLowRes(url){ return url && url.includes("image.tmdb.org/t/p/") ? url.replace(/\/w(1280|780|500)\//,"/w342/") : url; }
function decodeWithTimeout(img,ms=3500){ return Promise.race([img.decode().catch(()=>{}), new Promise(res=>setTimeout(res,ms))]); }
async function loadProgressive(el, highUrl, faceFocus=false){
  const low = tmdbLowRes(highUrl) || highUrl;
  el.style.objectPosition = faceFocus ? "center 20%" : "center";
  el.src = low;
  const hi = new Image(); hi.decoding="async"; hi.src=highUrl;
  await decodeWithTimeout(hi, 3000);
  if (hi.complete && hi.naturalWidth > 0) el.src = highUrl;
}

/* Loading state (strictly around hero image fetch/decode) */
const cardLoading = $("#cardLoading");
const placeButtons = $("#placeButtons");
function setLoading(on){
  if (cardLoading) cardLoading.hidden = !on;      // now truly hidden via CSS rule
  if (placeButtons) $$("button", placeButtons).forEach(b=> b.disabled = !!on);
}

/* ---------- Image providers (same as prior build) ---------- */
const IMG_CACHE_KEY = "blind-rank:imageCache:v10";
let imageCache={}; try{ imageCache=JSON.parse(localStorage.getItem(IMG_CACHE_KEY)||"{}"); }catch{}
const cacheGet=k=>imageCache[k];
const cacheSet=(k,v)=>{ imageCache[k]=v; try{ localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(imageCache)); }catch{} };

const TMDB_BASE="https://api.themoviedb.org/3";
const TMDB_IMG ="https://image.tmdb.org/t/p";

async function tmdbSearchImages(query, mediaType="movie"){
  const key = window.BR_CONFIG?.TMDB_API_KEY || ""; if(!key) return null;
  const u = `${TMDB_BASE}/search/${mediaType}?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const d = await fetchJson(u); if(!d?.results?.length) return null;
  const best = d.results.map(r=>({raw:r,title:r.title||r.name||"",score:scoreMatch(query,r.title||r.name||"")})).sort((a,b)=>b.score-a.score)[0];
  if(!best || best.score<0.35) return null;
  const r=best.raw;
  if(mediaType==="person"){
    const profile=r.profile_path?`${TMDB_IMG}/w780${r.profile_path}`:null;
    return profile?{main:profile,thumb:profile}:null;
  }
  const main = r.backdrop_path?`${TMDB_IMG}/w1280${r.backdrop_path}`:(r.poster_path?`${TMDB_IMG}/w780${r.poster_path}`:null);
  const thumb= r.poster_path?`${TMDB_IMG}/w500${r.poster_path}`:(r.backdrop_path?`${TMDB_IMG}/w780${r.backdrop_path}`:null);
  return (main||thumb)?{main,thumb}:null;
}
async function wikiBestImage(title){
  const wp = await fetchJson(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=1400&titles=${encodeURIComponent(title)}&origin=*`);
  try{
    const page = Object.values(wp?.query?.pages||{})[0];
    const direct = page?.thumbnail?.source; if (direct) return direct;
    const qid = page?.pageprops?.wikibase_item;
    if (qid){
      const wd = await fetchJson(`https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&property=P18&format=json&origin=*`);
      const p18 = wd?.claims?.P18?.[0]?.mainsnak?.datavalue?.value;
      if (p18) return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(p18)}?width=1400`;
    }
  }catch{}
  return null;
}
async function tvmazeShowImage(q){
  const d=await fetchJson(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(q)}`);
  if(!Array.isArray(d)||!d.length) return null;
  const ranked=d.map(x=>({url:x?.show?.image?.original||x?.show?.image?.medium,title:x?.show?.name||"",score:scoreMatch(q,x?.show?.name||"")})).filter(x=>x.url).sort((a,b)=>b.score-a.score)[0];
  return ranked&&ranked.score>=0.35?ranked.url:null;
}
async function omdbPoster(q){
  const key=window.BR_CONFIG?.OMDB_API_KEY; if(!key) return null;
  const d=await fetchJson(`https://www.omdbapi.com/?apikey=${encodeURIComponent(key)}&t=${encodeURIComponent(q)}`);
  return d?.Poster && d.Poster!=="N/A" ? d.Poster : null;
}
const upscaleItunes=url=>url?url.replace(/\/\d+x\d+bb\.jpg/, '/1200x1200bb.jpg'):null;
async function itunesArtistImage(q){
  const d=await fetchJson(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=musicArtist&limit=3`);
  const a=Array.isArray(d?.results)?d.results:[]; let best=null,s=0; for(const r of a){ const sc=scoreMatch(q,r.artistName||""); if(sc>s){s=sc; best=upscaleItunes(r.artworkUrl100);} }
  return s>=0.35?best:null;
}
async function itunesMoviePoster(q){
  const d=await fetchJson(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=movie&entity=movie&limit=3`);
  const a=Array.isArray(d?.results)?d.results:[]; let best=null,s=0; for(const r of a){ const t=r.trackName||r.collectionName||""; const sc=scoreMatch(q,t); if(sc>s){s=sc; best=upscaleItunes(r.artworkUrl100);} }
  return s>=0.35?best:null;
}
async function audioDbArtistImage(q){
  const key=window.BR_CONFIG?.AUDIODB_API_KEY||"1";
  const d=await fetchJson(`https://www.theaudiodb.com/api/v1/json/${encodeURIComponent(key)}/search.php?s=${encodeURIComponent(q)}`);
  const a=d?.artists?.[0]; return a?.strArtistFanart||a?.strArtistThumb||null;
}
async function lastfmArtistImage(q){
  const key=window.BR_CONFIG?.LASTFM_API_KEY; if(!key) return null;
  const d=await fetchJson(`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(q)}&api_key=${encodeURIComponent(key)}&format=json`);
  const imgs=d?.artist?.image; return imgs?.length?imgs[imgs.length-1]["#text"]:null;
}
async function pixabayPhoto(q){
  const key=window.BR_CONFIG?.PIXABAY_API_KEY; if(!key) return null;
  const d=await fetchJson(`https://pixabay.com/api/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&image_type=photo&per_page=3&safesearch=true`);
  const h=d?.hits?.[0]; return h?.largeImageURL||h?.webformatURL||null;
}
async function unsplashPhoto(q){
  const key=window.BR_CONFIG?.UNSPLASH_ACCESS_KEY; if(!key) return null;
  const r=await fetch(`https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&per_page=1`,{headers:{Authorization:`Client-ID ${key}`}}).catch(()=>null);
  if(!r||!r.ok) return null; const d=await r.json().catch(()=>null); const p=d?.results?.[0]; return p?.urls?.regular||p?.urls?.full||p?.urls?.small||null;
}
async function pexelsPhoto(q){
  const key=window.BR_CONFIG?.PEXELS_API_KEY; if(!key) return null;
  const r=await fetch(`https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&per_page=1`,{headers:{Authorization:key}}).catch(()=>null);
  if(!r||!r.ok) return null; const d=await r.json().catch(()=>null); const p=d?.photos?.[0]; return p?.src?.large2x||p?.src?.large||p?.src?.medium||null;
}

/* Face focus helpers */
const PERSON_HINTS=["artist","artists","singer","singers","musician","musicians","people","players","athlete","athletes","actors","actresses","olympian","olympians","drivers","golfers","sprinters","tennis","composers","legends","girl groups","boy bands","pop artists","hip-hop","character","characters","superhero","superheroes","marvel","dc","anime","manga"];
function topicPrefersFace(t){ const n=(t?.name||"").toLowerCase(); return PERSON_HINTS.some(h=>n.includes(h)) || (t?.mediaType==="person"); }
function labelPrefersFace(l){ const s=String(l||"").toLowerCase(); return PERSON_HINTS.some(h=>s.includes(h)) || /\b(man|woman|girl|boy|kid|hero|princess|queen|king)\b/.test(s) || /iron man|batman|spider-man|spider man|superman|captain america|wonder woman|hulk|thor|black widow|goku|naruto|luffy|pikachu/.test(s); }
function contextSuffix(n){ const s=(n||"").toLowerCase(); if(s.includes("foods")||s.includes("food"))return" food"; if(s.includes("cars")||s.includes("vehicles"))return" car"; if(s.includes("animals")||s.includes("pets"))return" animal"; if(s.includes("cities")||s.includes("places"))return" city"; return ""; }

/** Unified resolver */
async function resolveImages(topic, item){
  if(item.imageUrl) return {main:item.imageUrl, thumb:item.imageUrl};

  const provider=topic.provider||"static"; const mediaType=topic.mediaType||"";
  const key=`${provider}|${mediaType}|${item.label}`; const hit=cacheGet(key); if(hit) return hit;

  const wantFace = topicPrefersFace(topic) || labelPrefersFace(item.label);
  let out=null;

  if(!out && provider==="tmdb" && (mediaType==="movie"||mediaType==="tv"||mediaType==="person")){
    const tm=await tmdbSearchImages(item.label, mediaType);
    if(tm?.main||tm?.thumb) out={main:tm.main||tm.thumb, thumb:tm.thumb||tm.main};
  }
  if(!out && provider==="wiki"){ const w=await wikiBestImage(item.label); if(w) out={main:w,thumb:w}; }

  if(!out && provider==="tmdb" && mediaType==="tv"){ const tvm=await tvmazeShowImage(item.label); if(tvm) out={main:tvm,thumb:tvm}; }
  if(!out && provider==="tmdb" && mediaType==="movie"){ const om=await omdbPoster(item.label); if(om) out={main:om,thumb:om}; }
  if(!out && (mediaType==="person"||wantFace)){
    const a1=await audioDbArtistImage(item.label);
    const a2=a1?null:await lastfmArtistImage(item.label);
    const a3=(a1||a2)?null:await itunesArtistImage(item.label);
    const pick=a1||a2||a3; if(pick) out={main:pick,thumb:pick};
  }
  if(!out && provider==="tmdb" && mediaType==="movie"){ const it=await itunesMoviePoster(item.label); if(it) out={main:it,thumb:it}; }

  if(!out){
    const suffix=contextSuffix(topic.name);
    const pxb=await pixabayPhoto(item.label+suffix);
    const uns=pxb?null:await unsplashPhoto(item.label+suffix);
    const pex=(pxb||uns)?null:await pexelsPhoto(item.label+suffix);
    const pick=pxb||uns||pex; if(pick) out={main:pick,thumb:pick};
  }

  if(!out){ const ph=`https://placehold.co/800x450?text=${encodeURIComponent(item.label)}`; out={main:ph,thumb:ph}; }

  cacheSet(key,out); return out;
}

/* ---------- State & elements ---------- */
const topics = window.BLIND_RANK_TOPICS || [];
let topicOrder = shuffle(topics.map((_,i)=>i));
let currentTopicIndex = 0;

let currentTopic = null;
let itemsQueue   = [];
let placed       = {};
let currentItem  = null;
let didCelebrate = false;

const SESSION_KEY = "blind-rank:session:v7";

const topicTag   = $("#topicTag");
const cardImg    = $("#cardImg");
const itemTitle  = $("#itemTitle");
const helpText   = $("#cardHelp");
const rankSlots  = $$(".rank-slot");
const resultsEl  = $("#results");
const nextTopicBtn = $("#nextTopicBtn");
const confettiEl = $("#confetti");
const nextTopicCta = $("#nextTopicCta");

/* ---------- UI updater ---------- */
function updateUIAfterState(){
  if (!currentItem){
    setLoading(false);                        // ensure loader is off when done
    if (cardImg) cardImg.style.display = "none";
    if (nextTopicCta) nextTopicCta.hidden = false;
    itemTitle && (itemTitle.textContent = "All items placed!");
    helpText  && (helpText.textContent  = "Great job — tap Next Topic to continue.");
    celebrate();
    return;
  }
  if (nextTopicCta) nextTopicCta.hidden = true;
  if (cardImg) cardImg.style.display = "";
}

/* ---------- Session ---------- */
function saveSession(){
  try{
    const placedLabels = {};
    for (const [rank, item] of Object.entries(placed)) placedLabels[rank] = item.label;
    const payload = {
      version: 7,
      topicOrder,
      currentTopicIndex,
      placedLabels,
      queueLabels: itemsQueue.map(it => it.label),
      currentItemLabel: currentItem?.label || null,
      when: Date.now()
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(payload));
  }catch{}
}
function restoreSession(){
  try{
    const raw=localStorage.getItem(SESSION_KEY); if(!raw) return false;
    const s=JSON.parse(raw); if(!s?.topicOrder) return false;

    topicOrder=s.topicOrder; currentTopicIndex=s.currentTopicIndex||0;
    const idx=topicOrder[currentTopicIndex]??0; currentTopic=topics[idx]; if(!currentTopic) return false;

    const byLabel = (label)=> (currentTopic.items||[]).find(it=>it.label===label);

    placed={}; Object.entries(s.placedLabels||{}).forEach(([rank,label])=>{ const it=byLabel(label); if(it) placed[Number(rank)]=it; });
    itemsQueue=(s.queueLabels||[]).map(byLabel).filter(Boolean);
    currentItem=s.currentItemLabel?byLabel(s.currentItemLabel):(itemsQueue.shift()||null);

    topicTag && (topicTag.textContent=currentTopic.name||"Untitled");
    clearSlots();
    Object.entries(placed).forEach(([rankStr,it])=>{ const slot=$(`.rank-slot[data-rank="${rankStr}"]`); if(slot) renderSlotInto(slot,it,currentTopic); });
    updateResults();
    didCelebrate=false;
    paintCurrent().then(()=>{ updateUIAfterState(); prefetchNext(2); });
    wireControls();
    return true;
  }catch{ return false; }
}

/* ---------- UI helpers ---------- */
function clearSlots(){
  rankSlots.forEach(slot=>{
    slot.setAttribute("aria-selected","false");
    const dz=$(".slot-dropzone",slot); dz.innerHTML=""; dz.classList.add("empty");
  });
}

async function paintCurrent(){
  if (!currentItem){
    setLoading(false);
    updateUIAfterState();
    return;
  }
  setLoading(true);
  const { main } = await resolveImages(currentTopic, currentItem);
  const face = topicPrefersFace(currentTopic) || labelPrefersFace(currentItem.label);
  if (cardImg){
    await loadProgressive(cardImg, main, face);
    cardImg.alt = currentItem.label;
  }
  setLoading(false);

  itemTitle && (itemTitle.textContent = currentItem.label);
  if (helpText) {
    helpText.innerHTML = `
      <svg class="info-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M11 10h2v7h-2zM11 7h2v2h-2z"></path></svg>
      Use the <strong>Place</strong> buttons to lock this into a rank. No drag needed.
    `;
  }
}

/* Prefetch */
async function prefetchNext(n=2){
  const peek=itemsQueue.slice(0,n);
  for(const it of peek){
    const { main } = await resolveImages(currentTopic, it);
    const img=new Image(); img.decoding="async";
    img.src = tmdbLowRes(main) || main;
  }
}

/* ---------- Game flow ---------- */
function startNewSession(){
  if (!Array.isArray(topics)||!topics.length){
    topicTag&&(topicTag.textContent="Add topics to begin");
    itemTitle&&(itemTitle.textContent="No topics found");
    helpText&&(helpText.textContent="Create topics.js and define window.BLIND_RANK_TOPICS.");
    setLoading(false);
    return;
  }
  topicOrder=shuffle(topics.map((_,i)=>i));
  currentTopicIndex=0;
  loadTopicByOrderIndex(0);
  saveSession();
}

function loadTopicByOrderIndex(orderIdx){
  const idx=topicOrder[orderIdx]??0;
  currentTopicIndex=orderIdx;
  currentTopic=topics[idx];

  placed={};
  itemsQueue=shuffle((currentTopic.items||[]).slice());
  currentItem=itemsQueue.shift()||null;

  didCelebrate=false;
  topicTag&&(topicTag.textContent=currentTopic.name||"Untitled");
  clearSlots();
  updateResults();
  setLoading(false);
  paintCurrent().then(()=>{ updateUIAfterState(); prefetchNext(2); });
  saveSession();
}

async function placeCurrentItemInto(rank){
  rank=Number(rank);
  if(!currentItem || cardLoading && !cardLoading.hidden) return; // don't place during load
  if(placed[rank]) return;

  const slot=$(`.rank-slot[data-rank="${rank}"]`);
  if(!slot) return;

  placed[rank]=currentItem;
  await renderSlotInto(slot,currentItem,currentTopic);
  slot.setAttribute("aria-selected","true");

  currentItem=itemsQueue.shift()||null;

  updateResults();
  saveSession();

  paintCurrent().then(()=>{ updateUIAfterState(); prefetchNext(2); });
}

async function renderSlotInto(slot, item, topic){
  const dz=$(".slot-dropzone",slot);
  dz.classList.remove("empty");
  dz.innerHTML=`
    <div class="slot-item">
      <div class="slot-thumb skeleton"></div>
      <div class="slot-meta">
        <p class="title">${escapeHtml(item.label)}</p>
        <p class="topic">${escapeHtml(topic.name||"")}</p>
      </div>
    </div>
  `;
  const { thumb } = await resolveImages(topic,item);
  const ok = await new Promise(res=>{ const im=new Image(); im.onload=()=>res(true); im.onerror=()=>res(false); im.src=thumb; });
  const finalThumb = ok ? thumb : `https://placehold.co/320x200?text=${encodeURIComponent(item.label)}`;
  const face = topicPrefersFace(topic) || labelPrefersFace(item.label);
  const el=$(".slot-thumb",dz);
  if(el){ el.classList.remove("skeleton"); el.style.backgroundImage=`url('${finalThumb}')`; el.style.backgroundPosition=face?"center 20%":"center"; }
}

function updateResults(){
  const filled=Object.keys(placed).length;
  const remain=Math.max(0,5-filled);
  resultsEl && (resultsEl.textContent = filled===5 ? "All five placed. Nice!" : `${remain} to place…`);
}

/* ---------- Controls ---------- */
function gotoNextTopic(){
  const next=(currentTopicIndex+1)%topicOrder.length;
  setLoading(false); // ensure loader is off when navigating
  loadTopicByOrderIndex(next);
}
function addRipple(btn,evt){
  const rect=btn.getBoundingClientRect();
  const r=document.createElement("span"); r.className="ripple";
  const size=Math.max(rect.width,rect.height)*1.25;
  const x=((evt.clientX ?? (rect.left+rect.width/2))-rect.left)-size/2;
  const y=((evt.clientY ?? (rect.top+rect.height/2))-rect.top)-size/2;
  r.style.width=r.style.height=`${size*1.6}px`; r.style.left=`${x}px`; r.style.top=`${y}px`;
  btn.appendChild(r); setTimeout(()=>r.remove(),800);
}
function wireControls(){
  const pb=$("#placeButtons");
  if(pb && !pb.__wired){
    pb.addEventListener("click",(e)=>{
      const btn=e.target.closest("[data-rank]"); if(!btn) return;
      addRipple(btn,e);
      btn.animate([{transform:"translateY(0)"},{transform:"translateY(1px)"},{transform:"translateY(0)"}],{duration:140,easing:"ease-out"});
      placeCurrentItemInto(btn.dataset.rank);
    });
    pb.__wired=true;
  }
  if(nextTopicBtn && !nextTopicBtn.__wired){
    nextTopicBtn.addEventListener("click", gotoNextTopic);
    nextTopicBtn.__wired=true;
  }
  if(nextTopicCta && !nextTopicCta.__wired){
    nextTopicCta.addEventListener("click", gotoNextTopic);
    nextTopicCta.__wired=true;
  }
}
wireControls();

/* ---------- Confetti ---------- */
function celebrate(){
  const filled=Object.keys(placed).length;
  if(filled!==5 || didCelebrate || !confettiEl) return;
  didCelebrate=true;
  const c=confettiEl; c.width=innerWidth; c.height=innerHeight; c.style.display="block";
  const ctx=c.getContext("2d"); const colors=["#FFD84D","#7C5CFF","#22C55E","#F472B6","#38BDF8"];
  const parts=Array.from({length:100}).map(()=>({x:Math.random()*c.width,y:-20-Math.random()*c.height*0.3,r:4+Math.random()*6,c:colors[Math.floor(Math.random()*colors.length)],vx:-2+Math.random()*4,vy:2+Math.random()*3,rot:Math.random()*Math.PI,vr:-0.12+Math.random()*0.24}));
  let t=0;(function loop(){ t++; ctx.clearRect(0,0,c.width,c.height);
    parts.forEach(p=>{ p.x+=p.vx; p.y+=p.vy; p.vy+=0.02; p.rot+=p.vr; ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.c; ctx.fillRect(-p.r,-p.r,p.r*2,p.r*2); ctx.restore(); });
    if(t<180) requestAnimationFrame(loop); else c.style.display="none";
  })();
}
addEventListener("resize", ()=>{ if(confettiEl){ confettiEl.width=innerWidth; confettiEl.height=innerHeight; }});

/* ---------- Bootstrap ---------- */
const topicsArr = window.BLIND_RANK_TOPICS || [];
restoreSession() || startNewSession();