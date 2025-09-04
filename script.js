"use strict";

/* =========================================================
   FIRESIDE Blind Rankings — accuracy-first build
   - Class-aware image sourcing with Wikidata P31 validation
   - Teams/brands prefer P154 logos
   - Foods/places resolve via Wikidata entity search (no stock)
   - TMDB stricter acceptance for short/ambiguous titles
   - Provider race (parallel) + timeouts; first valid wins
   - Cancel stale paints to avoid wrong flashes
   - Loader only while fetching/decoding
   - Prefetch next topic’s first item at 4/5 placed
   - LocalStorage resume; idempotent listeners; confetti
   ========================================================= */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- utils ---------- */
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
function tokenize(s){
  return String(s||"").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").split(" ").filter(Boolean);
}
const STOP = new Set(["the","a","an","of","and","&","in","on","at","to","for"]);
function scoreMatch(query, candidate){
  const qt = new Set(tokenize(query).filter(w=>!STOP.has(w)));
  const ct = new Set(tokenize(candidate).filter(w=>!STOP.has(w)));
  if (!qt.size || !ct.size) return 0;
  let hit = 0; qt.forEach(t=>{ if (ct.has(t)) hit++; });
  const recall = hit/qt.size, precis = hit/ct.size;
  return 0.65*recall + 0.35*precis;
}
function strictTitleMatch(query, candidate){
  const q = String(query||"").toLowerCase().trim();
  const c = String(candidate||"").toLowerCase().trim();
  if (!q || !c) return false;
  const norm = s => s.replace(/[^\p{L}\p{N}]+/gu," ").trim();
  return c === q || norm(c) === norm(q) || c.includes(q);
}

/* ---------- fetch with timeout ---------- */
async function fetchJson(url, opts = {}, timeoutMs = 8000){
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try{
    const r = await fetch(url, { ...opts, signal: controller.signal });
    if (!r.ok) return null;
    const ct = r.headers.get("content-type") || "";
    return ct.includes("application/json") ? r.json() : r.text();
  }catch(_){ return null; }
  finally{ clearTimeout(id); }
}

/* ---------- progressive image ---------- */
function tmdbLowRes(url){
  return url && url.includes("image.tmdb.org/t/p/")
    ? url.replace(/\/w(1280|780|500)\//, "/w342/")
    : url;
}
function decodeWithTimeout(img, ms=3500){
  return Promise.race([
    img.decode().catch(()=>{}),
    new Promise(res => setTimeout(res, ms))
  ]);
}
async function loadProgressive(el, highUrl, faceFocus=false){
  const low = tmdbLowRes(highUrl) || highUrl;
  el.style.objectPosition = faceFocus ? "center 20%" : "center";
  el.src = low;
  const hi = new Image();
  hi.decoding = "async";
  hi.src = highUrl;
  await decodeWithTimeout(hi, 3000);
  if (hi.complete && hi.naturalWidth > 0) el.src = highUrl;
}

/* ---------- loading overlay ---------- */
const cardLoading  = $("#cardLoading");
const placeButtons = $("#placeButtons");
function setLoading(on){
  if (cardLoading) cardLoading.hidden = !on;
  if (placeButtons) $$("button", placeButtons).forEach(b=> b.disabled = !!on);
}

/* ---------- cache ---------- */
const IMG_CACHE_KEY = "blind-rank:imageCache:v14";
let imageCache = {};
try { imageCache = JSON.parse(localStorage.getItem(IMG_CACHE_KEY) || "{}"); } catch(_) {}
const cacheGet = (k)=> imageCache[k];
const cacheSet = (k,v)=>{ imageCache[k] = v; try{ localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(imageCache)); }catch(_){} };

/* ---------- provider consts ---------- */
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG  = "https://image.tmdb.org/t/p";

/* ---------- classification & class guards ---------- */
const P31_ALLOW = {
  team   : new Set(["Q12973014","Q13393265","Q847017"]),
  brand  : new Set(["Q431289","Q4830453"]),
  person : new Set(["Q5"]),
  group  : new Set(["Q215380","Q2088357"]),
  movie  : new Set(["Q11424"]),
  tv     : new Set(["Q5398426","Q1254874","Q581714","Q15709879"]),
  place  : new Set(["Q515","Q486972","Q6256","Q1549591","Q23413","Q8502","Q3957"]),
  food   : new Set(["Q2095","Q746549","Q18593264"]), // food / prepared food / dish
  game   : new Set(["Q7889"]),
  book   : new Set(["Q571","Q8261"]),
  album  : new Set(["Q482994"]),
  song   : new Set(["Q7366"]),
  generic: null
};
function p31MatchesClass(p31Values, cls){
  if (!cls || !P31_ALLOW[cls]) return true;
  const allow = P31_ALLOW[cls];
  if (!Array.isArray(p31Values) || p31Values.length === 0) return false;
  return p31Values.some(qid => allow.has(qid));
}

const TEAM_HINTS = [
  "nba","nfl","mlb","nhl","ncaa","soccer","club","fc","united","city",
  "boston celtics","los angeles lakers","yankees","dodgers","patriots","packers","cowboys",
  "red sox","warriors","heat","bulls","knicks"
];
const BRAND_HINTS = ["inc","ltd","corp","company","brand","™","®","llc","gmbh"];
const PLACE_HINTS = ["city","country","park","mount","mountain","lake","river","island","national park","monument","museum","tower","bridge","palace","cathedral"];
const FOOD_HINTS  = ["pizza","burger","taco","sandwich","soup","salad","pasta","roll","cheese","sauce","noodle","ramen","sushi","steak","curry","dessert"];

function hasWord(haystack, arr){
  const s = String(haystack||"").toLowerCase();
  return arr.some(w => s.includes(w));
}
function classifyEntity(topicName, label){
  const t = (topicName||"").toLowerCase();
  const l = (label||"").toLowerCase();

  if (hasWord(t,["boy bands","girl groups","bands","band","groups","k-pop","kpop","musical groups"]) || hasWord(l,[" band"," boyz","*nsync","bts","blackpink"])) return "group";
  if (hasWord(t,["actor","actress","people","artists","singers","musicians","person"]) || hasWord(l,[" jr"," sr"," iii"])) return "person";
  if (hasWord(t,["movie","film","films","movies"]) || hasWord(l,[" the movie"," (film)"])) return "movie";
  if (hasWord(t,["tv","show","series","anime","cartoons"]) || hasWord(l,[" season"," (tv series)"])) return "tv";
  if (hasWord(t,["video games","games","game"]) || hasWord(l,[" (video game)"])) return "game";
  if (hasWord(t,["books","novels","book"]) || hasWord(l,[" (novel)"," (book)"])) return "book";
  if (hasWord(t,["albums"]) || hasWord(l,[" (album)"])) return "album";
  if (hasWord(t,["songs","tracks"]) || hasWord(l,[" (song)"])) return "song";
  if (hasWord(t,["team","teams","club","soccer","football","basketball","baseball","hockey"]) || hasWord(l, TEAM_HINTS)) return "team";
  if (hasWord(t,["brand","company"]) || hasWord(l, BRAND_HINTS)) return "brand";
  if (hasWord(t,["city","places","landmarks","parks","countries"]) || hasWord(l, PLACE_HINTS)) return "place";
  if (hasWord(t,["food","foods","dishes","cuisine","toppings"]) || hasWord(l, FOOD_HINTS)) return "food";
  return "generic";
}

/* ---------- Wikipedia / Wikidata helpers ---------- */
const commonsFileUrl = (fileName, width=1400) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${width}`;

// Prefer P154 (logo) for team/brand; otherwise P18/photo. Validate P31 class.
async function wikiLogoOrImageForClass(title, cls){
  const page = await fetchJson(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=1400&redirects=1&titles=${encodeURIComponent(title)}&origin=*`);
  const first = Object.values(page?.query?.pages || {})[0];
  if (!first) return null;
  if (first?.pageprops?.disambiguation !== undefined) return null; // ignore disambiguation

  const canonicalTitle = first?.title || title;
  const qid = first?.pageprops?.wikibase_item || null;
  const pageThumb = first?.thumbnail?.source || null;

  if (qid){
    const wd = await fetchJson(`https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${qid}&property=P154|P18|P31&format=json&origin=*`);
    const logos = wd?.claims?.P154 || [];
    const p18s  = wd?.claims?.P18 || [];
    const p31s  = (wd?.claims?.P31 || []).map(c=>c?.mainsnak?.datavalue?.value?.id).filter(Boolean);

    if (!p31MatchesClass(p31s, cls)) {
      if (!(strictTitleMatch(title, canonicalTitle) && pageThumb)) return null;
    }

    if (cls === "team" || cls === "brand"){
      const logo = logos[0]?.mainsnak?.datavalue?.value;
      if (logo) return { url: commonsFileUrl(logo), isLogo: true };
      if (pageThumb) return { url: pageThumb, isLogo: false };
      const p18 = p18s[0]?.mainsnak?.datavalue?.value;
      if (p18) return { url: commonsFileUrl(p18), isLogo: false };
      return null;
    }

    const p18 = p18s[0]?.mainsnak?.datavalue?.value;
    if (p18) return { url: commonsFileUrl(p18), isLogo: false };
    if (pageThumb) return { url: pageThumb, isLogo: false };
  }

  if (pageThumb) return { url: pageThumb, isLogo: false };

  // REST summary fallback — quick description sanity
  const sum = await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true&origin=*`);
  const img = sum?.originalimage?.source || sum?.thumbnail?.source;
  const desc = (sum?.description || "").toLowerCase();
  if (img){
    if (cls==="team"  && desc.includes("team")) return { url: img, isLogo:false };
    if (cls==="brand" && (desc.includes("company")||desc.includes("brand"))) return { url: img, isLogo:false };
    if (cls==="place" && (desc.includes("city")||desc.includes("country")||desc.includes("park"))) return { url: img, isLogo:false };
    if (cls==="movie" && (desc.includes("film")||desc.includes("movie"))) return { url: img, isLogo:false };
    if (cls==="tv" && (desc.includes("television")||desc.includes("tv"))) return { url: img, isLogo:false };
    if (cls==="food" && (desc.includes("food")||desc.includes("dish")||desc.includes("cuisine"))) return { url: img, isLogo:false };
    if (cls==="group" && (desc.includes("band")||desc.includes("group"))) return { url: img, isLogo:false };
    if (cls==="game" && desc.includes("video game")) return { url: img, isLogo:false };
    if (cls==="book" && (desc.includes("book")||desc.includes("novel"))) return { url: img, isLogo:false };
    if (cls==="album" && desc.includes("album")) return { url: img, isLogo:false };
    if (cls==="song" && desc.includes("song")) return { url: img, isLogo:false };
    if (!cls || cls==="generic") return { url: img, isLogo:false };
  }
  return null;
}

// Wikidata entity search → accept only items whose P31 fits the class.
// Use P154 for team/brand logos, else P18, else enwiki pageimage.
async function wikidataFindImageByClass(label, cls){
  const search = await fetchJson(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(label)}&language=en&type=item&limit=8&format=json&origin=*`
  );
  const hits = search?.search || [];
  for (const h of hits){
    const id = h.id;
    const ent = await fetchJson(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${id}&props=claims|sitelinks&format=json&origin=*`
    );
    const obj = ent?.entities?.[id];
    if (!obj) continue;

    const claims = obj.claims || {};
    const p31s = (claims.P31 || []).map(c=>c?.mainsnak?.datavalue?.value?.id).filter(Boolean);
    if (!p31MatchesClass(p31s, cls)) continue;

    // Preferred images
    if ((cls === "team" || cls === "brand") && claims.P154?.[0]?.mainsnak?.datavalue?.value){
      return { url: commonsFileUrl(claims.P154[0].mainsnak.datavalue.value), isLogo: true };
    }
    if (claims.P18?.[0]?.mainsnak?.datavalue?.value){
      return { url: commonsFileUrl(claims.P18[0].mainsnak.datavalue.value), isLogo: false };
    }

    // Fallback to enwiki pageimage
    const title = obj.sitelinks?.enwiki?.title;
    if (title){
      const r = await wikiLogoOrImageForClass(title, cls);
      if (r) return r;
    }
  }
  return null;
}

// Wikipedia search → try top matches until class fits
async function wikiResolveWithSearch(title, cls){
  const search = await fetchJson(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&srlimit=6&format=json&origin=*`);
  const hits = search?.query?.search || [];
  for (const h of hits){
    const r = await wikiLogoOrImageForClass(h.title, cls);
    if (r) return r;
  }
  return wikiLogoOrImageForClass(title, cls);
}

/* ---------- TMDB / TVMaze / OMDb / Music ---------- */
async function tmdbSearchImages(query, mediaType = "movie"){
  const key = window.BR_CONFIG?.TMDB_API_KEY || "";
  if (!key) return null;

  const url = `${TMDB_BASE}/search/${mediaType}?api_key=${encodeURIComponent(key)}&query=${encodeURIComponent(query)}&include_adult=false&language=en-US&page=1`;
  const data = await fetchJson(url);
  if (!data?.results?.length) return null;

  const norm = s => String(s||"").toLowerCase().replace(/[^\p{L}\p{N}]+/gu," ").trim();
  const qn = norm(query);

  let best = null, bestScore = 0;
  for (const r of data.results){
    const title = r.title || r.name || "";
    const tn = norm(title);
    let s = scoreMatch(query, title);
    if (tn === qn || strictTitleMatch(query, title)) s += 0.25;
    if (s > bestScore){ bestScore = s; best = r; }
  }
  const min = qn.length <= 3 ? 0.75 : 0.35;
  if (!best || bestScore < min) return null;

  if (mediaType === "person"){
    const profile = best.profile_path ? `${TMDB_IMG}/w780${best.profile_path}` : null;
    return profile ? { main: profile, thumb: profile } : null;
  }
  const main  = best.backdrop_path ? `${TMDB_IMG}/w1280${best.backdrop_path}` : (best.poster_path ? `${TMDB_IMG}/w780${best.poster_path}` : null);
  const thumb = best.poster_path   ? `${TMDB_IMG}/w500${best.poster_path}`   : (best.backdrop_path ? `${TMDB_IMG}/w780${best.backdrop_path}` : null);
  return (main || thumb) ? { main, thumb } : null;
}

async function tvmazeShowImage(query){
  const data = await fetchJson(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
  if (!Array.isArray(data) || !data.length) return null;
  const ranked = data
    .map(x => ({ url: x?.show?.image?.original || x?.show?.image?.medium, title: x?.show?.name || "", score: scoreMatch(query, x?.show?.name || "") }))
    .filter(x => x.url).sort((a,b)=> b.score - a.score);
  return (ranked[0] && ranked[0].score >= 0.35) ? ranked[0].url : null;
}

async function omdbPoster(query){
  const key = window.BR_CONFIG?.OMDB_API_KEY;
  if (!key) return null;
  const d = await fetchJson(`https://www.omdbapi.com/?apikey=${encodeURIComponent(key)}&t=${encodeURIComponent(query)}`);
  const p = d?.Poster;
  return (p && p !== "N/A") ? p : null;
}

/* iTunes + music sources */
function upscaleItunes(url){ return url ? url.replace(/\/\d+x\d+bb\.jpg/, '/1200x1200bb.jpg') : null; }
async function itunesArtistImage(query){
  const d = await fetchJson(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=musicArtist&limit=3`);
  const arr = Array.isArray(d?.results) ? d.results : [];
  let best=null,score=0; for(const r of arr){ const s=scoreMatch(query,r.artistName||""); if(s>score){score=s; best=upscaleItunes(r.artworkUrl100);} }
  return score>=0.35?best:null;
}
async function itunesMoviePoster(query){
  const d = await fetchJson(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=movie&entity=movie&limit=3`);
  const arr = Array.isArray(d?.results) ? d.results : [];
  let best=null,score=0; for(const r of arr){ const t=r.trackName||r.collectionName||""; const s=scoreMatch(query,t); if(s>score){score=s; best=upscaleItunes(r.artworkUrl100);} }
  return score>=0.35?best:null;
}
async function audioDbArtistImage(query){
  const key = window.BR_CONFIG?.AUDIODB_API_KEY || "1";
  const d = await fetchJson(`https://www.theaudiodb.com/api/v1/json/${encodeURIComponent(key)}/search.php?s=${encodeURIComponent(query)}`);
  const a = d?.artists?.[0];
  return a?.strArtistFanart || a?.strArtistThumb || null;
}
async function lastfmArtistImage(query){
  const key = window.BR_CONFIG?.LASTFM_API_KEY;
  if (!key) return null;
  const d = await fetchJson(`https://ws.audioscrobbler.com/2.0/?method=artist.getinfo&artist=${encodeURIComponent(query)}&api_key=${encodeURIComponent(key)}&format=json`);
  const imgs = d?.artist?.image;
  const url = imgs?.length ? imgs[imgs.length - 1]["#text"] : null;
  return url || null;
}

/* ---------- face preferences ---------- */
function topicPrefersFace(topic){
  const PERSON_HINTS = [
    "artist","artists","singer","singers","musician","musicians","people","players",
    "athlete","athletes","actors","actresses","olympian","olympians","drivers","golfers",
    "sprinters","tennis","composers","legends","girl groups","boy bands","pop artists","hip-hop",
    "character","characters","superhero","superheroes","marvel","dc","anime","manga"
  ];
  const name = (topic?.name || "").toLowerCase();
  return PERSON_HINTS.some(h => name.includes(h)) || (topic?.mediaType === "person");
}
function labelPrefersFace(label){
  const s = String(label||"").toLowerCase();
  return /\b(man|woman|girl|boy|kid|hero|princess|queen|king)\b/.test(s) ||
         /iron man|batman|spider-man|spider man|superman|captain america|wonder woman|hulk|thor|black widow|goku|naruto|luffy|pikachu/.test(s);
}

/* ---------- provider race ---------- */
async function firstTruthy(promises){
  return new Promise((resolve) => {
    let settled = false;
    const done = (val) => { if (!settled && val) { settled = true; resolve(val); } };
    promises.forEach(async (p) => {
      try { done(await p); } catch {}
    });
    Promise.allSettled(promises).then(() => !settled && resolve(null));
  });
}

/* ---------- unified resolver ---------- */
function contextSuffix(topicName){
  const s = (topicName||"").toLowerCase();
  if (s.includes("cities") || s.includes("places")) return " city";
  return "";
}

async function resolveImages(topic, item){
  if (item.imageUrl) return { main: item.imageUrl, thumb: item.imageUrl, isLogo: false };

  const provider  = topic.provider || "static";
  const mediaType = topic.mediaType || "";
  const cacheKey  = `${provider}|${mediaType}|${item.label}`;
  const hit = cacheGet(cacheKey); if (hit) return hit;

  const cls = classifyEntity(topic.name, item.label);
  const wantsFace = (cls === "person") || topicPrefersFace(topic) || labelPrefersFace(item.label);

  const tasks = [];

  // Teams/brands → logos/photos via Wikidata/Wikipedia (validated)
  if (cls === "team" || cls === "brand"){
    tasks.push((async()=> {
      // Try exact-page route first, then entity search
      const direct = await wikiLogoOrImageForClass(item.label, cls);
      if (direct) return { main: direct.url, thumb: direct.url, isLogo: !!direct.isLogo };
      const viaWd = await wikidataFindImageByClass(item.label, cls);
      return viaWd ? { main: viaWd.url, thumb: viaWd.url, isLogo: !!viaWd.isLogo } : null;
    })());
  }

  // Movies / TV / Person → TMDB + validated Wikipedia/TV/music
  if (cls === "movie" || mediaType === "movie"){
    tasks.push((async()=> {
      const tm = await tmdbSearchImages(item.label, "movie");
      return (tm?.main || tm?.thumb) ? { main: tm.main || tm.thumb, thumb: tm.thumb || tm.main, isLogo: false } : null;
    })());
    tasks.push((async()=> {
      const r = await wikiResolveWithSearch(item.label, "movie");
      return r ? { main: r.url, thumb: r.url, isLogo: !!r.isLogo } : null;
    })());
    tasks.push((async()=> {
      const it = await itunesMoviePoster(item.label);
      return it ? { main: it, thumb: it, isLogo: false } : null;
    })());
  }
  if (cls === "tv" || mediaType === "tv"){
    tasks.push((async()=> {
      const tm = await tmdbSearchImages(item.label, "tv");
      return (tm?.main || tm?.thumb) ? { main: tm.main || tm.thumb, thumb: tm.thumb || tm.main, isLogo: false } : null;
    })());
    tasks.push((async()=> {
      const tvm = await tvmazeShowImage(item.label);
      return tvm ? { main: tvm, thumb: tvm, isLogo: false } : null;
    })());
    tasks.push((async()=> {
      const r = await wikiResolveWithSearch(item.label, "tv");
      return r ? { main: r.url, thumb: r.url, isLogo: !!r.isLogo } : null;
    })());
  }
  if (cls === "person" || mediaType === "person"){
    tasks.push((async()=> {
      const tm = await tmdbSearchImages(item.label, "person");
      return (tm?.main || tm?.thumb) ? { main: tm.main || tm.thumb, thumb: tm.thumb || tm.main, isLogo: false } : null;
    })());
    tasks.push((async()=> {
      const a1 = await audioDbArtistImage(item.label);
      if (a1) return { main: a1, thumb: a1, isLogo: false };
      const a2 = await lastfmArtistImage(item.label);
      if (a2) return { main: a2, thumb: a2, isLogo: false };
      const a3 = await itunesArtistImage(item.label);
      return a3 ? { main: a3, thumb: a3, isLogo: false } : null;
    })());
    tasks.push((async()=> {
      const r = await wikiResolveWithSearch(item.label, "person");
      return r ? { main: r.url, thumb: r.url, isLogo: !!r.isLogo } : null;
    })());
  }

  // Groups (bands)
  if (cls === "group"){
    tasks.push((async()=> {
      const a1 = await audioDbArtistImage(item.label);
      if (a1) return { main: a1, thumb: a1, isLogo: false };
      const a2 = await lastfmArtistImage(item.label);
      if (a2) return { main: a2, thumb: a2, isLogo: false };
      const it = await itunesArtistImage(item.label);
      if (it) return { main: it, thumb: it, isLogo: false };
      return null;
    })());
    tasks.push((async()=> {
      const r = await wikiResolveWithSearch(item.label, "group");
      return r ? { main: r.url, thumb: r.url, isLogo: !!r.isLogo } : null;
    })());
  }

  // Places / Foods → Wikidata entity search FIRST, then validated Wikipedia.
  if (cls === "place" || cls === "food"){
    tasks.push((async()=> {
      const viaWd = await wikidataFindImageByClass(item.label, cls);
      return viaWd ? { main: viaWd.url, thumb: viaWd.url, isLogo: !!viaWd.isLogo } : null;
    })());
    tasks.push((async()=> {
      const viaWp = await wikiResolveWithSearch(item.label, cls);
      return viaWp ? { main: viaWp.url, thumb: viaWp.url, isLogo: !!viaWp.isLogo } : null;
    })());
  }

  // Generic → Wikipedia only (no stock to avoid randomness)
  if (cls === "generic" || provider === "wiki"){
    tasks.push((async()=> {
      const r = await wikiResolveWithSearch(item.label, "generic");
      return r ? { main: r.url, thumb: r.url, isLogo: !!r.isLogo } : null;
    })());
  }

  // IMPORTANT: we NO LONGER use stock for foods (and places).
  // Stock caused the “Chow Mein → dog” class of errors.
  // We prefer a neutral placeholder to a wrong image.

  let out = await firstTruthy(tasks);

  if (!out){
    const ph = `https://placehold.co/800x450?text=${encodeURIComponent(item.label)}`;
    out = { main: ph, thumb: ph, isLogo: false };
  }

  out.prefersFace = wantsFace;
  cacheSet(cacheKey, out);
  return out;
}

/* ---------- state & elements ---------- */
const topics = window.BLIND_RANK_TOPICS || [];
let topicOrder = shuffle(topics.map((_,i)=>i));
let currentTopicIndex = 0;

let currentTopic = null;
let itemsQueue   = [];
let placed       = {};
let currentItem  = null;
let didCelebrate = false;

const SESSION_KEY = "blind-rank:session:v10";

const topicTag     = $("#topicTag");
const cardImg      = $("#cardImg");
const itemTitle    = $("#itemTitle");
const helpText     = $("#cardHelp");
const rankSlots    = $$(".rank-slot");
const resultsEl    = $("#results");
const nextTopicBtn = $("#nextTopicBtn");
const confettiEl   = $("#confetti");
const nextTopicCta = $("#nextTopicCta");

/* ---------- central UI updater ---------- */
function updateUIAfterState(){
  if (!currentItem){
    setLoading(false);
    itemTitle && (itemTitle.textContent = "All items placed!");
    helpText  && (helpText.textContent  = "Great job — tap Next Topic to continue.");
    if (cardImg) cardImg.style.display = "none";
    if (nextTopicCta) nextTopicCta.hidden = false;
    celebrate();
    return;
  }
  if (nextTopicCta) nextTopicCta.hidden = true;
  if (cardImg) cardImg.style.display = "";
}

/* ---------- session ---------- */
function saveSession(){
  try{
    const placedLabels = {};
    for (const [rank, item] of Object.entries(placed)) placedLabels[rank] = item.label;
    const payload = {
      version: 10,
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
    if (!s?.topicOrder) return false;

    topicOrder = s.topicOrder;
    currentTopicIndex = s.currentTopicIndex || 0;
    const topicIdx = topicOrder[currentTopicIndex] ?? 0;
    currentTopic = topics[topicIdx];
    if (!currentTopic) return false;

    const byLabel = (label)=> (currentTopic.items || []).find(it => it.label === label);

    placed = {};
    Object.entries(s.placedLabels || {}).forEach(([rank, label])=>{
      const it = byLabel(label); if (it) placed[Number(rank)] = it;
    });
    itemsQueue  = (s.queueLabels || []).map(byLabel).filter(Boolean);
    currentItem = s.currentItemLabel ? byLabel(s.currentItemLabel) : (itemsQueue.shift() || null);

    topicTag && (topicTag.textContent = currentTopic.name || "Untitled");
    clearSlots();
    Object.entries(placed).forEach(([rankStr, it])=>{
      const slot = $(`.rank-slot[data-rank="${rankStr}"]`);
      if (slot) renderSlotInto(slot, it, currentTopic);
    });
    updateResults();
    didCelebrate = false;
    paintCurrent().then(()=>{ updateUIAfterState(); prefetchNext(2); });
    wireControls();
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

let _paintToken = 0;
async function paintCurrent(){
  if (!currentItem){
    setLoading(false);
    updateUIAfterState();
    return;
  }
  const token = ++_paintToken;

  setLoading(true);
  const info = await resolveImages(currentTopic, currentItem);
  if (token !== _paintToken) return; // user moved on; abort

  if (cardImg){
    cardImg.style.objectFit = info.isLogo ? "contain" : "cover";
    cardImg.style.background = info.isLogo ? "#0e120e" : "transparent";
    await loadProgressive(cardImg, info.main, !info.isLogo && (info.prefersFace === true));
    if (token !== _paintToken) return;
    cardImg.alt = currentItem.label;
  }
  setLoading(false);

  if (token !== _paintToken) return;
  itemTitle && (itemTitle.textContent = currentItem.label);
  if (helpText) {
    helpText.innerHTML = `
      <svg class="info-icon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M11 10h2v7h-2zM11 7h2v2h-2z"></path></svg>
      Use the <strong>Place</strong> buttons to lock this into a rank. No drag needed.
    `;
  }
}

/* prefetch next N low-res */
async function prefetchNext(n=2){
  const peek = itemsQueue.slice(0, n);
  for (const it of peek){
    const { main } = await resolveImages(currentTopic, it);
    const img = new Image(); img.decoding = "async";
    img.src = tmdbLowRes(main) || main;
  }
}

/* ---------- flow ---------- */
function startNewSession(){
  if (!Array.isArray(topics) || topics.length === 0) {
    topicTag && (topicTag.textContent = "Add topics to begin");
    itemTitle && (itemTitle.textContent = "No topics found");
    helpText  && (helpText.textContent  = "Create topics.js and define window.BLIND_RANK_TOPICS.");
    setLoading(false);
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

  didCelebrate = false;
  topicTag && (topicTag.textContent = currentTopic.name || "Untitled");
  clearSlots();
  updateResults();
  setLoading(false);
  paintCurrent().then(()=>{ updateUIAfterState(); prefetchNext(2); });
  saveSession();
}

async function placeCurrentItemInto(rank){
  rank = Number(rank);
  if (!currentItem || (cardLoading && !cardLoading.hidden)) return;
  if (placed[rank]) return;

  const slot = $(`.rank-slot[data-rank="${rank}"]`);
  if (!slot) return;

  placed[rank] = currentItem;
  await renderSlotInto(slot, currentItem, currentTopic);
  slot.setAttribute("aria-selected","true");

  currentItem = itemsQueue.shift() || null;

  updateResults();
  saveSession();

  paintCurrent().then(()=>{ updateUIAfterState(); prefetchNext(2); });
}

async function renderSlotInto(slot, item, topic){
  const dz = $(".slot-dropzone", slot);
  dz.classList.remove("empty");
  dz.innerHTML = `
    <div class="slot-item">
      <div class="slot-thumb skeleton"></div>
      <div class="slot-meta">
        <p class="title">${escapeHtml(item.label)}</p>
        <p class="topic">${escapeHtml(topic.name || "")}</p>
      </div>
    </div>
  `;
  const info = await resolveImages(topic, item);

  // Verify the image loads; otherwise fallback text image
  const ok = await new Promise(res => {
    const im = new Image(); im.onload = () => res(true); im.onerror = () => res(false); im.src = info.thumb;
  });
  const finalThumb = ok ? info.thumb : `https://placehold.co/320x200?text=${encodeURIComponent(item.label)}`;

  const face = !info.isLogo && (topicPrefersFace(topic) || labelPrefersFace(item.label));
  const thumbEl = $(".slot-thumb", dz);
  if (thumbEl){
    thumbEl.classList.remove("skeleton");
    thumbEl.style.backgroundImage   = `url('${finalThumb}')`;
    thumbEl.style.backgroundPosition = face ? "center 20%" : "center";
    if (info.isLogo){
      thumbEl.style.backgroundSize  = "contain";
      thumbEl.style.backgroundColor = "#0e120e";
    } else {
      thumbEl.style.backgroundSize  = "cover";
      thumbEl.style.backgroundColor = "transparent";
    }
  }
}

function updateResults(){
  const filled = Object.keys(placed).length;
  const remain = Math.max(0, 5 - filled);
  resultsEl && (resultsEl.textContent = filled === 5 ? "All five placed. Nice!" : `${remain} to place…`);

  // Warm up first image of NEXT topic when we hit 4 placements
  if (filled === 4) {
    const nextIdx = (currentTopicIndex + 1) % topicOrder.length;
    const nextTopic = topics[topicOrder[nextIdx]];
    if (nextTopic?.items?.[0]) {
      resolveImages(nextTopic, nextTopic.items[0]).then(info => {
        const img = new Image();
        img.decoding = "async";
        img.src = tmdbLowRes(info.main) || info.main;
      }).catch(()=>{});
    }
  }
}

/* ---------- controls ---------- */
function gotoNextTopic(){
  const next = (currentTopicIndex + 1) % topicOrder.length;
  setLoading(false);
  loadTopicByOrderIndex(next);
}
function addRipple(btn, evt){
  const rect = btn.getBoundingClientRect();
  const ripple = document.createElement("span");
  ripple.className = "ripple";
  const size = Math.max(rect.width, rect.height) * 1.25;
  const x = ((evt.clientX ?? (rect.left + rect.width/2)) - rect.left) - size/2;
  const y = ((evt.clientY ?? (rect.top + rect.height/2)) - rect.top)  - size/2;
  ripple.style.width = ripple.style.height = `${size * 1.6}px`;
  ripple.style.left = `${x}px`; ripple.style.top = `${y}px`;
  btn.appendChild(ripple);
  setTimeout(()=> ripple.remove(), 800);
}
function wireControls(){
  const pb = $("#placeButtons");
  if (pb && !pb.__wired){
    pb.addEventListener("click",(e)=>{
      const btn = e.target.closest("[data-rank]");
      if (!btn) return;
      addRipple(btn, e);
      btn.animate(
        [{ transform: "translateY(0)" },{ transform: "translateY(1px)" },{ transform: "translateY(0)" }],
        { duration: 140, easing: "ease-out" }
      );
      placeCurrentItemInto(btn.dataset.rank);
    });
    pb.__wired = true;
  }
  if (nextTopicBtn && !nextTopicBtn.__wired){
    nextTopicBtn.addEventListener("click", gotoNextTopic);
    nextTopicBtn.__wired = true;
  }
  if (nextTopicCta && !nextTopicCta.__wired){
    nextTopicCta.addEventListener("click", gotoNextTopic);
    nextTopicCta.__wired = true;
  }
}
wireControls();

/* ---------- confetti ---------- */
function celebrate(){
  const filled = Object.keys(placed).length;
  if (filled !== 5 || didCelebrate || !confettiEl) return;
  didCelebrate = true;

  const canvas = confettiEl;
  canvas.width = innerWidth;
  canvas.height = innerHeight;
  canvas.style.display = "block";

  const ctx = canvas.getContext("2d");
  const colors = ["#FFD84D","#7C5CFF","#22C55E","#F472B6","#38BDF8"];
  const parts = Array.from({length: 100}).map(()=>({
    x: Math.random()*canvas.width,
    y: -20 - Math.random()*canvas.height*0.3,
    r: 4 + Math.random()*6,
    c: colors[Math.floor(Math.random()*colors.length)],
    vx: -2 + Math.random()*4,
    vy: 2 + Math.random()*3,
    rot: Math.random()*Math.PI,
    vr: -0.12 + Math.random()*0.24
  }));

  let t = 0;
  (function tick(){
    t++;
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0,0,W,H);
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
    if (t < 180) requestAnimationFrame(tick);
    else canvas.style.display = "none";
  })();
}
addEventListener("resize", ()=>{
  if (!confettiEl) return;
  confettiEl.width = innerWidth;
  confettiEl.height = innerHeight;
});

/* ---------- bootstrap ---------- */
restoreSession() || startNewSession();
