"use strict";

/* =========================================================
   FIRESIDE Blind Rankings — accuracy-first sourcing
   - Class-aware, high-confidence image selection only
   - Wikidata P31 validation + P154 (logo) for teams/brands
   - Movies/TV/Person via TMDB with strict acceptance
   - Foods/Places via Wikidata entity search (no stock)
   - Devices/Products (e.g., smartwatches) require brand token
   - Reject suspicious images (animals/cars) for non-matching classes
   - Loader only while actually fetching/decoding
   - Cancel stale paints, prefetch next, localStorage resume, confetti
   ========================================================= */

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ---------- small utils ---------- */
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
async function fetchJson(url, opts = {}, timeoutMs = 9000){
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
const IMG_CACHE_KEY = "blind-rank:imageCache:v16";
let imageCache = {};
try { imageCache = JSON.parse(localStorage.getItem(IMG_CACHE_KEY) || "{}"); } catch(_) {}
const cacheGet = (k)=> imageCache[k];
const cacheSet = (k,v)=>{ imageCache[k] = v; try{ localStorage.setItem(IMG_CACHE_KEY, JSON.stringify(imageCache)); }catch(_){} };

/* ---------- constants ---------- */
const TMDB_BASE = "https://api.themoviedb.org/3";
const TMDB_IMG  = "https://image.tmdb.org/t/p";

/* ---------- classification ---------- */
const P31_ALLOW = {
  team   : new Set(["Q12973014","Q13393265","Q847017"]),                            // sports team / basketball team / NBA team
  brand  : new Set(["Q431289","Q4830453"]),                                         // brand / business
  person : new Set(["Q5"]),                                                         // human
  group  : new Set(["Q215380","Q2088357"]),                                         // band / musical group
  movie  : new Set(["Q11424"]),                                                     // film
  tv     : new Set(["Q5398426","Q1254874","Q581714","Q15709879"]),                  // tv series / miniseries / animated series / anime tv
  place  : new Set(["Q515","Q486972","Q6256","Q1549591","Q23413","Q8502","Q3957"]), // city, settlement, country, park, island, mountain, museum
  food   : new Set(["Q2095","Q746549","Q18593264"]),                                 // food / prepared food / dish
  game   : new Set(["Q7889"]),
  book   : new Set(["Q571","Q8261"]),
  album  : new Set(["Q482994"]),
  song   : new Set(["Q7366"]),
  device : new Set(["Q838948","Q1972349","Q3249551"]), // wristwatch, smartwatch, electronic device (broad)
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
  if (hasWord(t,["smartwatches","phones","devices","gadgets","cameras","laptops","wearables"]) || hasWord(l,["fitbit","watch","iphone","galaxy","garmin","pixel","asus","lenovo","sony","versA"])) return "device";
  if (hasWord(t,["city","places","landmarks","parks","countries"]) || hasWord(l, PLACE_HINTS)) return "place";
  if (hasWord(t,["food","foods","dishes","cuisine","toppings"]) || hasWord(l, FOOD_HINTS)) return "food";
  return "generic";
}

/* ---------- content safety / acceptance gates ---------- */
const ANIMAL_WORDS = ["dog","puppy","cat","kitten","horse","cow","pig","goat","sheep","monkey"];
const CAR_WORDS    = ["car","sedan","hatchback","suv","coupe","truck","nissan","bmw","toyota","mercedes","ford","chevy"];
function urlHas(url, words){ const u = String(url||"").toLowerCase(); return words.some(w=>u.includes(w)); }

function acceptanceForClass(meta, cls, label, brandToken){
  // meta: {title, desc, url, isLogo, p31Ok}
  const title = (meta.title||"").toLowerCase();
  const desc  = (meta.desc||"").toLowerCase();
  const url   = (meta.url||"").toLowerCase();
  const lab   = (label||"").toLowerCase();

  // reject obviously wrong content for certain classes
  if ((cls==="food" || cls==="device" || cls==="movie" || cls==="tv" || cls==="group" || cls==="person") && urlHas(url, ANIMAL_WORDS)) return false;
  if ((cls==="food" || cls==="team"  || cls==="brand" || cls==="place") && urlHas(url, CAR_WORDS)) return false;

  // class-specific guards
  if (cls==="food"){
    if (!meta.p31Ok) return false; // must be a food/dish entity
    if (!(title.includes(lab) || desc.includes(lab) || strictTitleMatch(label, meta.title))) {
      // Allow generic “Cheese” for “Extra cheese”, etc.
      if (!(lab.includes("cheese") && (title.includes("cheese")||desc.includes("cheese")))) return false;
    }
    return true;
  }

  if (cls==="place"){
    return meta.p31Ok; // type-validated place
  }

  if (cls==="team" || cls==="brand"){
    return meta.p31Ok; // type-validated; logos are fine
  }

  if (cls==="device"){
    // must contain brand token and device-y terms
    const watchy = ["watch","smartwatch","wearable","fitness","tracker"];
    const hasDeviceWord = watchy.some(w=>title.includes(w)||desc.includes(w));
    const hasBrand = brandToken ? (title.includes(brandToken)||desc.includes(brandToken)) : true;
    return hasDeviceWord && hasBrand && !urlHas(url, CAR_WORDS);
  }

  if (cls==="movie" || cls==="tv" || cls==="person" || cls==="group" || cls==="book" || cls==="album" || cls==="song" || cls==="game"){
    // rely on provider match; meta.p31Ok may be undefined here
    return true;
  }

  return !!meta.url;
}

/* ---------- Wikipedia / Wikidata ---------- */
const commonsFileUrl = (fileName, width=1400) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(fileName)}?width=${width}`;

async function wikiPageBasics(title){
  const page = await fetchJson(`https://en.wikipedia.org/w/api.php?action=query&prop=pageimages|pageprops&format=json&pithumbsize=1400&redirects=1&titles=${encodeURIComponent(title)}&origin=*`);
  const first = Object.values(page?.query?.pages || {})[0];
  if (!first) return null;
  if (first?.pageprops?.disambiguation !== undefined) return { disambig:true };
  return {
    title: first?.title || title,
    qid: first?.pageprops?.wikibase_item || null,
    thumb: first?.thumbnail?.source || null
  };
}

async function wikiLogoOrImageForClass(title, cls){
  const page = await wikiPageBasics(title);
  if (!page || page.disambig) return null;
  let p31Ok = null;

  if (page.qid){
    const wd = await fetchJson(`https://www.wikidata.org/w/api.php?action=wbgetclaims&entity=${page.qid}&property=P154|P18|P31&format=json&origin=*`);
    const logos = wd?.claims?.P154 || [];
    const p18s  = wd?.claims?.P18 || [];
    const p31s  = (wd?.claims?.P31 || []).map(c=>c?.mainsnak?.datavalue?.value?.id).filter(Boolean);
    p31Ok = p31MatchesClass(p31s, cls);

    if (cls === "team" || cls === "brand"){
      const logo = logos[0]?.mainsnak?.datavalue?.value;
      if (logo) return { url: commonsFileUrl(logo), isLogo: true, title: page.title, desc:"", p31Ok };
    }
    if (p18s[0]?.mainsnak?.datavalue?.value){
      const file = p18s[0].mainsnak.datavalue.value;
      return { url: commonsFileUrl(file), isLogo: false, title: page.title, desc:"", p31Ok };
    }
  }
  if (page.thumb) return { url: page.thumb, isLogo:false, title: page.title, desc:"", p31Ok };

  // REST summary fallback
  const sum = await fetchJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}?redirect=true&origin=*`);
  const img = sum?.originalimage?.source || sum?.thumbnail?.source;
  if (!img) return null;
  return { url: img, isLogo:false, title: sum?.title || title, desc: sum?.description || "", p31Ok };
}

// Wikidata entity search → accept only items whose P31 fits the class.
async function wikidataFindImageByClass(label, cls){
  const search = await fetchJson(
    `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(label)}&language=en&type=item&limit=8&format=json&origin=*`
  );
  const hits = search?.search || [];
  for (const h of hits){
    const id = h.id;
    const ent = await fetchJson(
      `https://www.wikidata.org/w/api.php?action=wbgetentities&ids=${id}&props=claims|sitelinks|labels|descriptions&languages=en&format=json&origin=*`
    );
    const obj = ent?.entities?.[id];
    if (!obj) continue;

    const claims = obj.claims || {};
    const p31s = (claims.P31 || []).map(c=>c?.mainsnak?.datavalue?.value?.id).filter(Boolean);
    const p31Ok = p31MatchesClass(p31s, cls);
    if (!p31Ok) continue;

    // preferred: P154 logo for team/brand
    if ((cls === "team" || cls === "brand") && claims.P154?.[0]?.mainsnak?.datavalue?.value){
      return { url: commonsFileUrl(claims.P154[0].mainsnak.datavalue.value), isLogo: true, title: obj.labels?.en?.value || label, desc: obj.descriptions?.en?.value || "", p31Ok };
    }
    // else P18 image
    if (claims.P18?.[0]?.mainsnak?.datavalue?.value){
      return { url: commonsFileUrl(claims.P18[0].mainsnak.datavalue.value), isLogo: false, title: obj.labels?.en?.value || label, desc: obj.descriptions?.en?.value || "", p31Ok };
    }
    // fallback to enwiki sitelink
    const enTitle = obj.sitelinks?.enwiki?.title;
    if (enTitle){
      const viaPage = await wikiLogoOrImageForClass(enTitle, cls);
      if (viaPage) { viaPage.p31Ok = p31Ok; return viaPage; }
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

/* ---------- TMDB / TVMaze / OMDb ---------- */
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
  const min = qn.length <= 3 ? 0.8 : 0.4; // short titles must be near-exact
  if (!best || bestScore < min) return null;

  if (mediaType === "person"){
    const profile = best.profile_path ? `${TMDB_IMG}/w780${best.profile_path}` : null;
    return profile ? { main: profile, thumb: profile, meta: { title: best.name || "", desc: "", p31Ok:true } } : null;
  }
  const main  = best.backdrop_path ? `${TMDB_IMG}/w1280${best.backdrop_path}` : (best.poster_path ? `${TMDB_IMG}/w780${best.poster_path}` : null);
  const thumb = best.poster_path   ? `${TMDB_IMG}/w500${best.poster_path}`   : (best.backdrop_path ? `${TMDB_IMG}/w780${best.backdrop_path}` : null);
  return (main || thumb) ? { main, thumb, meta: { title: best.title || best.name || "", desc: "", p31Ok:true } } : null;
}

async function tvmazeShowImage(query){
  const data = await fetchJson(`https://api.tvmaze.com/search/shows?q=${encodeURIComponent(query)}`);
  if (!Array.isArray(data) || !data.length) return null;
  const ranked = data
    .map(x => ({ url: x?.show?.image?.original || x?.show?.image?.medium, title: x?.show?.name || "", score: scoreMatch(query, x?.show?.name || "") }))
    .filter(x => x.url).sort((a,b)=> b.score - a.score);
  return (ranked[0] && ranked[0].score >= 0.4) ? ranked[0] : null;
}

async function omdbPoster(query){
  const key = window.BR_CONFIG?.OMDB_API_KEY;
  if (!key) return null;
  const d = await fetchJson(`https://www.omdbapi.com/?apikey=${encodeURIComponent(key)}&t=${encodeURIComponent(query)}`);
  const p = d?.Poster;
  return (p && p !== "N/A") ? { url: p, title: d?.Title || query, desc: "", p31Ok:true } : null;
}

/* ---------- pizza topping aliasing / brand token ---------- */
const TOPPING_ALIASES = {
  "extra cheese":"Cheese",
  "three cheese":"Cheese",
  "cheese":"Cheese",
  "bbq chicken":"Barbecue chicken",
  "bbq sauce":"Barbecue sauce",
  "green peppers":"Bell pepper",
  "peppers":"Bell pepper",
  "mushrooms":"Mushroom",
  "black olives":"Olive",
  "ham":"Ham",
  "bacon":"Bacon",
  "sausage":"Sausage",
  "pepperoni":"Pepperoni",
  "pineapple":"Pineapple",
  "anchovies":"Anchovy",
  "spinach":"Spinach",
  "onions":"Onion",
  "jalapeños":"Jalapeño",
  "jalapenos":"Jalapeño"
};
function canonicalizeFoodLabel(topicName, label){
  const l = label.toLowerCase().trim();
  if (TOPPING_ALIASES[l]) return TOPPING_ALIASES[l];
  if (l.includes("cheese")) return "Cheese";
  return label;
}
function extractBrandToken(label){
  // First word is a good brand hint for devices (Fitbit Versa, Garmin Forerunner)
  const parts = label.split(/\s+/);
  return parts.length ? parts[0].toLowerCase() : null;
}

/* ---------- provider race helper ---------- */
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

/* ---------- unified resolver (accuracy-first) ---------- */
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

async function resolveImages(topic, rawItem){
  const item = { ...rawItem };
  // Canonicalize some food labels (e.g., “Extra cheese” → “Cheese”)
  if ((topic.name||"").toLowerCase().includes("pizza") || (topic.name||"").toLowerCase().includes("toppings")){
    item.label = canonicalizeFoodLabel(topic.name, item.label);
  }

  if (item.imageUrl) return { main: item.imageUrl, thumb: item.imageUrl, isLogo: false };

  const provider  = topic.provider || "static";
  const mediaType = topic.mediaType || "";
  const cacheKey  = `${provider}|${mediaType}|${item.label}`;
  const hit = cacheGet(cacheKey); if (hit) return hit;

  const cls = classifyEntity(topic.name, item.label);
  const wantsFace = (cls === "person") || topicPrefersFace(topic) || labelPrefersFace(item.label);
  const brandToken = (cls === "device") ? extractBrandToken(item.label) : null;

  const tasks = [];

  // TEAMS/BRANDS — logos or page image (validated P31)
  if (cls === "team" || cls === "brand"){
    tasks.push((async()=> {
      const viaPage = await wikiLogoOrImageForClass(item.label, cls);
      if (viaPage && acceptanceForClass(viaPage, cls, item.label)) return { main: viaPage.url, thumb: viaPage.url, isLogo: !!viaPage.isLogo };
      const viaWd   = await wikidataFindImageByClass(item.label, cls);
      if (viaWd && acceptanceForClass(viaWd, cls, item.label)) return { main: viaWd.url, thumb: viaWd.url, isLogo: !!viaWd.isLogo };
      return null;
    })());
  }

  // MOVIE/TV/PERSON — TMDB (strict), then validated Wikipedia/TVMaze/OMDb as needed
  if (cls === "movie" || mediaType === "movie"){
    tasks.push((async()=> {
      const tm = await tmdbSearchImages(item.label, "movie");
      if (tm) return { main: tm.main || tm.thumb, thumb: tm.thumb || tm.main, isLogo: false };
      const om = await omdbPoster(item.label);
      if (om && acceptanceForClass(om, "movie", item.label)) return { main: om.url, thumb: om.url, isLogo: false };
      const wp = await wikiResolveWithSearch(item.label, "movie");
      if (wp && acceptanceForClass(wp, "movie", item.label)) return { main: wp.url, thumb: wp.url, isLogo: !!wp.isLogo };
      return null;
    })());
  }
  if (cls === "tv" || mediaType === "tv"){
    tasks.push((async()=> {
      const tm = await tmdbSearchImages(item.label, "tv");
      if (tm) return { main: tm.main || tm.thumb, thumb: tm.thumb || tm.main, isLogo: false };
      const tvm = await tvmazeShowImage(item.label);
      if (tvm && acceptanceForClass({url:tvm.url,title:tvm.title,desc:"",p31Ok:true}, "tv", item.label)) return { main: tvm.url, thumb: tvm.url, isLogo: false };
      const wp = await wikiResolveWithSearch(item.label, "tv");
      if (wp && acceptanceForClass(wp, "tv", item.label)) return { main: wp.url, thumb: wp.url, isLogo: !!wp.isLogo };
      return null;
    })());
  }
  if (cls === "person" || mediaType === "person"){
    tasks.push((async()=> {
      const tm = await tmdbSearchImages(item.label, "person");
      if (tm) return { main: tm.main || tm.thumb, thumb: tm.thumb || tm.main, isLogo: false };
      const wp = await wikiResolveWithSearch(item.label, "person");
      if (wp && acceptanceForClass(wp, "person", item.label)) return { main: wp.url, thumb: wp.url, isLogo: !!wp.isLogo };
      return null;
    })());
  }
  if (cls === "group"){
    tasks.push((async()=> {
      const wp = await wikiResolveWithSearch(item.label, "group");
      if (wp && acceptanceForClass(wp, "group", item.label)) return { main: wp.url, thumb: wp.url, isLogo: !!wp.isLogo };
      return null;
    })());
  }

  // PLACES / FOODS — Wikidata entity search first, then validated Wikipedia. NO STOCK.
  if (cls === "place" || cls === "food"){
    tasks.push((async()=> {
      const viaWd = await wikidataFindImageByClass(item.label, cls);
      if (viaWd && acceptanceForClass(viaWd, cls, item.label)) return { main: viaWd.url, thumb: viaWd.url, isLogo: !!viaWd.isLogo };
      const viaWp = await wikiResolveWithSearch(item.label, cls);
      if (viaWp && acceptanceForClass(viaWp, cls, item.label)) return { main: viaWp.url, thumb: viaWp.url, isLogo: !!viaWp.isLogo };
      return null;
    })());
  }

  // DEVICES / PRODUCTS — must include brand token + smartwatch/device terms. NO STOCK.
  if (cls === "device"){
    tasks.push((async()=> {
      // Try Wikipedia page directly and variants with brand token
      const candidates = [item.label, `${item.label} (smartwatch)`, `${item.label} watch`];
      for (const t of candidates){
        const r = await wikiLogoOrImageForClass(t, "device");
        if (r && acceptanceForClass(r, "device", item.label, brandToken)) return { main: r.url, thumb: r.url, isLogo: !!r.isLogo };
      }
      // Try Wikidata entity search with device class
      const wd = await wikidataFindImageByClass(item.label, "device");
      if (wd && acceptanceForClass(wd, "device", item.label, brandToken)) return { main: wd.url, thumb: wd.url, isLogo: !!wd.isLogo };
      return null;
    })());
  }

  // GENERIC — Wikipedia only. If no confident image → placeholder.
  if (cls === "generic" || provider === "wiki"){
    tasks.push((async()=> {
      const r = await wikiResolveWithSearch(item.label, "generic");
      if (r && acceptanceForClass(r, "generic", item.label)) return { main: r.url, thumb: r.url, isLogo: !!r.isLogo };
      return null;
    })());
  }

  let out = await firstTruthy(tasks);

  if (!out){
    const ph = `https://placehold.co/800x450?text=${encodeURIComponent(item.label)}`;
    out = { main: ph, thumb: ph, isLogo: false };
  }

  out.prefersFace = (cls === "person") || topicPrefersFace(topic) || labelPrefersFace(item.label);
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

const SESSION_KEY = "blind-rank:session:v11";

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
      version: 11,
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
  if (token !== _paintToken) return; // user moved on; abort applying

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