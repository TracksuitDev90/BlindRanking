// Node port of the categorization helpers in script.js (which is an IIFE and
// cannot be required). The regex tables are copied verbatim — if you change
// them here, mirror the change in script.js and vice versa.

export function normalize(s) {
  return (s || '').toLowerCase().replace(/&/g, 'and').replace(/["""'']/g, '')
    .replace(/[^a-z0-9]+/g, ' ').trim();
}
export function titlesEqual(a, b) { return normalize(a) === normalize(b); }
export function yearFrom(label) {
  const m = String(label).match(/\b(19|20)\d{2}\b/);
  return m ? +m[0] : null;
}
export function cleanLabel(label) {
  return (label || '').replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export const CATS = {
  MOVIE: 'movie', TV: 'tv', PERSON: 'person',
  MUSIC_ARTIST: 'music-artist', MUSIC_ALBUM: 'music-album', MUSIC_TRACK: 'music-track',
  GAME: 'game', TEAM: 'team', BRAND: 'brand', LOGO: 'logo',
  FOOD: 'food', DEVICE: 'device', PLACE: 'place',
  PRODUCT: 'product', SNEAKER: 'sneaker', FASHION: 'fashion',
  PODCAST: 'podcast', SOFTWARE: 'software', ACTIVITY: 'activity',
  GENERIC: 'generic'
};

export function inferCategory(label, hints = {}) {
  if (hints.kind) return hints.kind;
  const p = hints.provider || '', m = hints.mediaType || '';
  if (p === 'tmdb' && m === 'movie') return CATS.MOVIE;
  if (p === 'tmdb' && m === 'tv')    return CATS.TV;
  if (m === 'person')                 return CATS.PERSON;
  if (m === 'sneaker')                return CATS.SNEAKER;
  if (m === 'product')                return CATS.PRODUCT;
  if (m === 'fashion')                return CATS.FASHION;
  if (m === 'podcast')                return CATS.PODCAST;
  if (m === 'software')               return CATS.SOFTWARE;
  if (m === 'activity')               return CATS.ACTIVITY;
  const n = normalize(label);
  if (/\bseason\b|\bs\d{1,2}\b/.test(n)) return CATS.TV;
  if (/\balbum\b/.test(n)) return CATS.MUSIC_ALBUM;
  if (/\btrack\b|\bsong\b/.test(n)) return CATS.MUSIC_TRACK;
  if (/\bvideo game\b/.test(n)) return CATS.GAME;
  if (/\bgame\b/.test(n) && !/\bgame of\b/.test(n)) return CATS.GAME;
  if (/\bfc\b|\bclub\b|\bunited\b|\bpatriots\b|\blakers\b|\bwarriors\b|\bceltics\b|\bsteelers\b|\bpackers\b|\bcowboys\b/.test(n)) return CATS.TEAM;
  if (/\binc\b|\bcorp\b|\bco\b|\bllc\b|\bltd\b|\bcompany\b|\bbrand\b|\blogo\b/.test(n)) return CATS.BRAND;
  if (/\btoyota\b|\bford\b|\bbmw\b|\bmercedes[-\s]?benz\b|\bhonda\b|\bporsche\b|\bferrari\b|\blamborghini\b|\baudi\b|\bvolkswagen\b|\btesla\b|\bchevrolet\b|\bjeep\b|\bsubaru\b|\bhyundai\b|\bkia\b|\bnissan\b|\bmazda\b|\bjaguar\b|\bland rover\b|\bbugatti\b|\bmclaren\b|\bbentley\b|\brolls[-\s]?royce\b|\bmaserati\b|\baston martin\b|\bvolvo\b/.test(n)) return CATS.BRAND;
  if (/\bgoogle\b|\bmicrosoft\b|\bapple\b|\bamazon\b|\bmeta\b|\bnetflix\b|\bspotify\b|\buber\b|\bairbnb\b|\bslack\b|\bstripe\b|\bsnapchat\b|\btiktok\b|\breddit\b|\btwitch\b|\bdiscord\b|\bshopify\b|\bdropbox\b|\bsalesforce\b|\badobe\b|\boracle\b|\bibm\b|\bsamsung\b|\bsony\b|\bnintendo\b|\bvalve\b|\bepic games\b|\broku\b|\bnvidia\b/.test(n)) return CATS.BRAND;
  if (/\bgucci\b|\blouis vuitton\b|\bchanel\b|\bprada\b|\bversace\b|\bdior\b|\bbalenciaga\b|\bhermes\b|\bburberry\b|\bfendi\b|\bgivenchy\b|\byves saint laurent\b|\bralph lauren\b|\btommy hilfiger\b|\bcalvin klein\b|\barmani\b|\brolex\b|\bomega\b|\bpatek philippe\b|\btag heuer\b|\baudemars piguet\b|\bcartier\b/.test(n)) return CATS.BRAND;
  if (/\bair jordan\b|\bjordan \d|\bair force\b|\bair max\b|\byeezy\b|\bnew balance\b|\bchuck taylor\b|\bstan smith\b|\bdunk\b|\b(?:nike|adidas|puma|reebok|vans|converse)\b.*\b(?:shoe|sneaker|boot|runner)\b|\bsneaker\b|\b(?:shoe|sneaker|boot|runner)s?\b/.test(n)) return CATS.SNEAKER;
  if (/\bhandbag\b|\bpurse\b|\bsunglasses\b|\bjacket\b|\bdress\b|\bperfume\b|\bcologne\b|\bjewelry\b|\bnecklace\b|\bwatch\b.*\b(?:rolex|omega|patek|cartier|tag)\b/.test(n)) return CATS.FASHION;
  if (/\bburger\b|\bpizza\b|\btaco\b|\bsushi\b|\bcoffee\b|\btea\b|\bcheese\b|\bchicken\b|\bsoup\b|\bsalad\b|\bbread\b|\bpie\b|\bcake\b|\bice cream\b|\bbrownie\b|\bdoughnut\b|\bcookie\b|\bwaffle\b|\bpancake\b|\bchip\b|\bcereal\b|\bcandy\b|\bmargarita\b|\bmojito\b|\bcocktail\b|\bsmoothie\b|\blemonade\b|\bmilkshake\b|\bbeer\b|\bwine\b|\bwhiskey\b|\bbourbon\b|\btequila\b|\bvodka\b|\brum\b|\bgin\b|\bespresso\b|\blatte\b|\bcappuccino\b|\bfrappe\b|\bboba\b|\bjuice\b|\bsoda\b|\bsteak\b|\bpasta\b|\bramen\b|\bnachos\b|\bwings\b|\bfries\b|\blobster\b|\bshrimp\b|\bsandwich\b|\bburrito\b|\bquesadilla\b|\bcroissant\b|\bmuffin\b|\bmacaron\b|\bgelato\b|\bsorbet\b|\bchocolate\b|\bpopcorn\b/.test(n)) return CATS.FOOD;
  if (/\bpodcast\b/.test(n)) return CATS.PODCAST;
  if (/\bframework\b|\bprogramming language\b|\bweb framework\b|\bsoftware\b|\bide\b|\bcode editor\b|\bdatabase\b|\bcloud\b/.test(n)) return CATS.SOFTWARE;
  if (/\biphone\b|\bgalaxy\b|\bipad\b|\bmacbook\b|\bplaystation\b|\bxbox\b|\bcamera\b|\blaptop\b/.test(n)) return CATS.DEVICE;
  if (/\bpark\b|\bbridge\b|\blake\b|\bmountain\b|\bcity\b|\bcountry\b|\bbeach\b|\bcastle\b|\bmuseum\b|\btower\b/.test(n)) return CATS.PLACE;
  if (/\byoga\b|\bpilates\b|\bweightlifting\b|\bcycling\b|\bswimming\b|\brunning\b|\bhiking\b|\bclimbing\b|\bboxing\b|\bmartial arts\b|\bgardening\b|\bcooking\b|\bpainting\b|\bdancing\b|\bmeditation\b|\bsurfing\b|\bskiing\b|\bsnowboarding\b|\bskateboarding\b/.test(n)) return CATS.ACTIVITY;
  return CATS.GENERIC;
}

export function inferCategoryWithMood(label, hints, topicMood) {
  const cat = inferCategory(label, hints);
  if (cat !== CATS.GENERIC) return cat;
  const tn = normalize(hints.topicName || '');
  if (topicMood === 'food') return CATS.FOOD;
  if (topicMood === 'music') return CATS.MUSIC_ARTIST;
  if (topicMood === 'people') return CATS.PERSON;
  if (topicMood === 'places') return CATS.PLACE;
  if (topicMood === 'sports') {
    // Plural-tolerant (diverges from the script.js original, which missed
    // "Quarterbacks", "Legends", etc. — categorization is build-only now).
    if (/\bquarterbacks?\b|\bathletes?\b|\bplayers?\b|\bsprinters?\b|\bswimmers?\b|\bgolfers?\b|\btennis\b|\bboxers?\b|\bfighters?\b|\bchess\b|\bpainters?\b|\barchitects?\b|\bphotographers?\b|\bdesigners?\b|\bcomedians?\b|\bhosts?\b|\byoutubers?\b|\bstreamers?\b|\bolympians?\b|\bdrivers?\b|\blegends?\b/.test(tn)) return CATS.PERSON;
    return CATS.TEAM;
  }
  if (topicMood === 'sneakers') return CATS.SNEAKER;
  if (topicMood === 'fashion') return CATS.FASHION;
  if (topicMood === 'products') return CATS.PRODUCT;
  if (topicMood === 'tech') {
    if (/\bcar\b|\belectric car\b|\bclassic car\b|\bsmartphone\b|\blaptop\b|\bheadphone\b|\bcamera\b|\bsmartwatch\b|\bconsole\b|\bdevice\b/.test(tn) && !/\bbrand/.test(tn)) return CATS.DEVICE;
    return CATS.BRAND;
  }
  if (topicMood === 'culture') {
    if (/\bsneaker/.test(tn)) return CATS.SNEAKER;
    if (/\bwatch\b.*\bbrand\b|\bfashion\b|\bluxury\b|\bjewel/.test(tn)) return CATS.FASHION;
    if (/\bpodcast/.test(tn)) return CATS.PODCAST;
    if (/\bframework\b|\bprogramming\b|\bdatabase\b|\bsoftware\b|\bcode editor\b|\bide\b/.test(tn)) return CATS.SOFTWARE;
    if (/\bfitness\b|\bactivit|\bexercise\b|\bworkout\b|\bhobb/.test(tn)) return CATS.ACTIVITY;
    if (/\bcomic\b|\bsuperhero\b|\bvillain\b|\bcharacter\b|\banime\b|\bmanga\b|\bcartoon\b/.test(tn)) return CATS.PERSON;
    if (/\bsocial\b|\bnetwork\b|\bstartup\b|\bapp\b|\bbrowser\b|\bstreaming\b|\buniversit/.test(tn)) return CATS.BRAND;
    if (/\bbrand\b|\bcompan/.test(tn)) return CATS.BRAND;
  }
  return cat;
}

// Build-side category resolution. Wraps inferCategoryWithMood with topic-level
// corrections for cases where label keywords mislead (e.g. "Detroit Red Wings"
// matches the food regex, "Oklahoma City Thunder" the place regex): inside a
// sports "Teams/Clubs" topic everything is a team, inside a "Stadiums" topic
// everything is a place.
export function categoryForBuild(label, hints, topicMood) {
  const cat = inferCategoryWithMood(label, hints, topicMood);
  const tn = normalize(hints.topicName || '');
  // Topics about brands or chains contain companies — the right image is the
  // official logo (P154, contain+pad), not a storefront/product photo.
  if (/\bbrands?\b|\bchains\b|\bfast food\b/.test(tn)) return CATS.BRAND;
  if (topicMood === 'sports') {
    if (/\bstadiums?\b|\barenas?\b|\bballparks?\b/.test(tn)) return CATS.PLACE;
    if (/\bteams?\b|\bclubs?\b|\bfranchises?\b/.test(tn) && cat !== CATS.PERSON) return CATS.TEAM;
  }
  return cat;
}

export function topicWikiHints(topicName) {
  if (!topicName) return [];
  const tn = normalize(topicName);
  const hints = [];
  if (/\bcomic\b|\bvillain\b|\bsuperhero\b|\bmarvel\b|\bdc\b/.test(tn)) hints.push('comics', 'character', 'fictional character');
  if (/\bnfl\b|\bfootball\b/.test(tn)) hints.push('American football', 'NFL');
  if (/\bnba\b|\bbasketball\b/.test(tn)) hints.push('basketball', 'NBA');
  if (/\bmlb\b|\bbaseball\b/.test(tn)) hints.push('baseball');
  if (/\bsoccer\b|\bfootball club\b|\bpremier league\b/.test(tn)) hints.push('football club', 'soccer');
  if (/\bpodcast/.test(tn)) hints.push('podcast');
  if (/\bstartup\b|\bcompan|\bbrand\b/.test(tn)) hints.push('company');
  if (/\bwatch\b|\bluxury\b/.test(tn)) hints.push('watchmaker', 'luxury', 'watch');
  if (/\bframework\b|\bprogramming\b|\bjavascript\b|\bweb\b/.test(tn)) hints.push('software', 'framework', 'programming');
  if (/\bdatabase\b/.test(tn)) hints.push('database', 'software');
  if (/\bcloud\b/.test(tn)) hints.push('cloud computing', 'computing');
  if (/\bfitness\b|\bactivit|\bexercise\b|\bworkout\b/.test(tn)) hints.push('exercise', 'sport');
  if (/\bhobb/.test(tn)) hints.push('hobby');
  if (/\bconsole\b|\bvideo game\b|\bgaming\b/.test(tn)) hints.push('video game', 'gaming');
  if (/\bcar\b|\bautomob|\bvehicle\b/.test(tn)) hints.push('automobile', 'car');
  if (/\bphone\b|\bsmartphone\b/.test(tn)) hints.push('smartphone', 'mobile phone');
  if (/\bsnack\b|\bcandy\b|\bfood\b|\bdrink\b|\bfast food\b|\brestaurant\b/.test(tn)) hints.push('food', 'cuisine');
  if (/\bsneaker\b|\bshoe\b/.test(tn)) hints.push('shoe', 'sneaker', 'footwear');
  if (/\banime\b/.test(tn)) hints.push('anime', 'manga');
  if (/\bcartoon\b|\banimated\b/.test(tn)) hints.push('animated series', 'cartoon');
  if (/\breality\b.*\btv\b|\breality show\b/.test(tn)) hints.push('television series', 'reality television');
  if (/\bsitcom\b/.test(tn)) hints.push('sitcom', 'television series');
  if (/\bapp\b/.test(tn)) hints.push('application', 'mobile app');
  if (/\bsocial media\b|\bsocial network\b/.test(tn)) hints.push('social media', 'website');
  if (/\bstreaming\b/.test(tn)) hints.push('streaming service', 'streaming');
  if (/\bbrowser\b/.test(tn)) hints.push('web browser');
  return hints;
}

export function wikiHintsForCategory(cat) {
  const map = {
    [CATS.MOVIE]: ['film'],
    [CATS.TV]: ['TV series', 'television series'],
    [CATS.PERSON]: null,
    [CATS.MUSIC_ARTIST]: ['musician', 'band', 'singer'],
    [CATS.MUSIC_ALBUM]: ['album'],
    [CATS.MUSIC_TRACK]: ['song'],
    [CATS.GAME]: ['video game', 'game'],
    [CATS.TEAM]: ['team', 'sports team'],
    [CATS.FOOD]: ['food', 'dish'],
    [CATS.PLACE]: ['place', 'city'],
    [CATS.DEVICE]: ['device', 'product'],
    [CATS.BRAND]: ['company', 'brand', 'corporation'],
    [CATS.PODCAST]: ['podcast'],
    [CATS.SOFTWARE]: ['software', 'programming'],
    [CATS.ACTIVITY]: ['exercise', 'sport', 'activity'],
  };
  return map[cat] || null;
}

// Band detection for music artists (ported from the MUSIC_ARTIST branch of
// resolveImageURL): bands get saliency cropping, solo artists get face cropping.
export function isBandArtist(label) {
  const cl = cleanLabel(label);
  return /\bband\b|\bthe\s/i.test(label) || /\bboys\b|\bgirls\b|\bbrothers\b|\bdirection\b|\bpink\b|\bclan\b|\bday\b|\bpunk\b/i.test(cl);
}

// Categories rendered as logos: object-fit contain with padding, SVG-derived images allowed.
export const LOGO_CATS = new Set([CATS.LOGO, CATS.BRAND, CATS.TEAM, CATS.GAME, CATS.SOFTWARE, CATS.PODCAST]);
// Categories rendered full-bleed (object-fit cover) and thus needing a focal point.
export const COVER_CATS = new Set([CATS.PERSON, CATS.MUSIC_ARTIST, CATS.FOOD, CATS.PLACE, CATS.ACTIVITY]);
// Person-like categories: require a detected face for auto-acceptance.
export const FACE_CATS = new Set([CATS.PERSON, CATS.MUSIC_ARTIST]);
