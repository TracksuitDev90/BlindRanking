// Offline test double: replaces global fetch with canned API responses and
// sharp-generated images, so the full build pipeline can run without network.
// Used via:  node --import ./test/mock-fetch.mjs build.js  (with BR_ROOT set).
import sharp from 'sharp';

const photoJpeg = await sharp({
  create: { width: 800, height: 1200, channels: 3, background: { r: 180, g: 120, b: 90 } }
})
  .composite([{
    input: await sharp({
      create: { width: 300, height: 400, channels: 3, background: { r: 240, g: 230, b: 210 } }
    }).jpeg().toBuffer(),
    left: 250, top: 200
  }])
  .jpeg().toBuffer();

const logoPng = await sharp({
  create: { width: 600, height: 600, channels: 4, background: { r: 30, g: 90, b: 200, alpha: 1 } }
}).png().toBuffer();

// A distinct green photo: the mocked vision gate "recognizes" it as the right
// picture for items whose default image it rejects.
const greenJpeg = await sharp({
  create: { width: 800, height: 1000, channels: 3, background: { r: 40, g: 200, b: 60 } }
}).jpeg().toBuffer();

const json = obj => new Response(JSON.stringify(obj), { status: 200, headers: { 'content-type': 'application/json' } });
const img = (bytes, type) => new Response(bytes, { status: 200, headers: { 'content-type': type } });

const WIKI_PAGES = {
  'Test QB': {
    title: 'Test QB', description: 'American football quarterback',
    pageprops: { wikibase_item: 'Q100' },
    pageimage: 'Test_QB.jpg',
    thumbnail: { source: 'https://upload.wikimedia.org/test-qb.jpg', width: 800, height: 1200 }
  },
  'Wrong Guy': {
    title: 'Wrong Guy', description: 'Australian cricketer',
    pageprops: { wikibase_item: 'Q400' },
    pageimage: 'Wrong_Guy.jpg',
    thumbnail: { source: 'https://upload.wikimedia.org/wrong-guy.jpg', width: 800, height: 1200 }
  },
  'Test Burger': {
    title: 'Test Burger', description: 'hamburger dish',
    pageprops: { wikibase_item: 'Q200' },
    pageimage: 'Test_Burger.jpg',
    thumbnail: { source: 'https://upload.wikimedia.org/test-burger.jpg', width: 800, height: 1200 }
  },
  'Test Brand': {
    title: 'Test Brand', description: 'technology company',
    pageprops: { wikibase_item: 'Q300' }
  },
  'Test Island': {
    title: 'Test Island', description: 'island in the test ocean',
    pageprops: { wikibase_item: 'Q500' },
    pageimage: 'Flag_of_Test_Island.svg',
    thumbnail: { source: 'https://upload.wikimedia.org/thumb/Flag_of_Test_Island.svg/1000px-Flag_of_Test_Island.svg.png', width: 1000, height: 600 }
  },
  // Redirect into a section of a broader article → never trusted.
  'Sour Thing': {
    title: 'Dip Thing', description: 'dip', redirect: { from: 'Sour Thing', to: 'Dip Thing', tofragment: 'Flavors' },
    pageprops: { wikibase_item: 'Q701' }, pageimage: 'Dip_Thing.jpg',
    thumbnail: { source: 'https://upload.wikimedia.org/dip-thing.jpg', width: 800, height: 1000 }
  },
  // Redirect to a differently named subject → inexact (review, or the gate).
  'Fizzy Pop': {
    title: 'Cola Drink', description: 'soft drink', redirect: { from: 'Fizzy Pop', to: 'Cola Drink' },
    pageprops: { wikibase_item: 'Q702' }, pageimage: 'Cola_Drink.jpg',
    thumbnail: { source: 'https://upload.wikimedia.org/cola-drink.jpg', width: 800, height: 1000 }
  },
  'Test Soda': {
    title: 'Test Soda', description: 'soft drink',
    pageprops: { wikibase_item: 'Q703' }, pageimage: 'Test_Soda_glass.jpg',
    thumbnail: { source: 'https://upload.wikimedia.org/test-soda-glass.jpg', width: 800, height: 1000 }
  },
  // Car model whose label trips the brand regex; its entity also has a logo.
  'Tesla Model Z': {
    title: 'Tesla Model Z', description: 'electric car model',
    pageprops: { wikibase_item: 'Q704' }, pageimage: 'Tesla_Model_Z_front.jpg',
    thumbnail: { source: 'https://upload.wikimedia.org/tesla-model-z-front.jpg', width: 1000, height: 700 }
  },
  'Twin Title (2001 film)': {
    title: 'Twin Title (2001 film)', description: '2001 film', pageprops: { wikibase_item: 'Q705' }
  },
  'Test Channel': {
    title: 'Test Channel', description: 'YouTube channel', pageprops: { wikibase_item: 'Q706' },
    pageimage: 'Test_Channel.jpg',
    thumbnail: { source: 'https://upload.wikimedia.org/test-channel.jpg', width: 800, height: 1000 }
  },
  'Test City': {
    title: 'Test City', description: 'city in England', pageprops: { wikibase_item: 'Q707' },
    pageimage: 'Test_City_skyline.jpg',
    thumbnail: { source: 'https://upload.wikimedia.org/test-city.jpg', width: 1000, height: 700 }
  },
  'Test Game': {
    title: 'Test Game', description: 'card game', pageprops: { wikibase_item: 'Q708' },
    pageimage: 'Pyrkon_2018_Test_Game_Cosplay.jpg',
    thumbnail: { source: 'https://upload.wikimedia.org/test-game-cosplay.jpg', width: 800, height: 1000 }
  },
  '2000 Test Team season': {
    title: '2000 Test Team season', description: 'American football team season', pageprops: { wikibase_item: 'Q709' },
    pageimage: 'Some_Player_2000.jpg',
    thumbnail: { source: 'https://upload.wikimedia.org/some-player.jpg', width: 800, height: 1000 }
  },
  'Test Chain': {
    title: 'Test Chain', description: 'fast food restaurant chain',
    pageprops: { wikibase_item: 'Q600' },
    pageimage: 'Test_Chain_2020.svg',
    thumbnail: { source: 'https://upload.wikimedia.org/thumb/Test_Chain_2020.svg/1000px-Test_Chain_2020.svg.png', width: 1000, height: 1000 }
  }
};

const WIKIDATA = {
  Q100: { descriptions: { en: { value: 'American football quarterback' } }, claims: { P18: [{ mainsnak: { datavalue: { value: 'Test QB.jpg' } } }] } },
  Q400: { descriptions: { en: { value: 'Australian cricketer' } }, claims: { P18: [{ mainsnak: { datavalue: { value: 'Wrong Guy.jpg' } } }] } },
  Q200: { descriptions: { en: { value: 'dish' } }, claims: {} },
  Q300: { descriptions: { en: { value: 'technology company' } }, claims: { P154: [{ mainsnak: { datavalue: { value: 'Test Brand logo.svg' } } }] } },
  Q500: { descriptions: { en: { value: 'island' } }, claims: { P18: [{ mainsnak: { datavalue: { value: 'Test Island beach.jpg' } } }] } },
  Q600: { descriptions: { en: { value: 'fast food chain' } }, claims: { P154: [{ mainsnak: { datavalue: { value: 'Test Chain logo.svg' } } }] } },
  Q701: { descriptions: { en: { value: 'dip' } }, claims: {} },
  Q702: { descriptions: { en: { value: 'soft drink' } }, claims: {} },
  Q703: { descriptions: { en: { value: 'soft drink' } }, claims: {} },
  Q704: { descriptions: { en: { value: 'electric car model' } }, claims: { P154: [{ mainsnak: { datavalue: { value: 'Tesla Model Z logo.svg' } } }] } },
  Q705: { descriptions: { en: { value: '2001 film' } }, claims: { P4947: [{ mainsnak: { datavalue: { value: '777' } } }] } },
  Q706: { descriptions: { en: { value: 'YouTube channel' } }, claims: { P31: [{ mainsnak: { datavalue: { value: { id: 'Q17558136' } } } }] } },
  Q707: { descriptions: { en: { value: 'city in England' } }, claims: { P154: [{ mainsnak: { datavalue: { value: 'Test City logo.svg' } } }] } },
  Q708: { descriptions: { en: { value: 'card game' } }, claims: { P18: [{ mainsnak: { datavalue: { value: 'Test Game box.jpg' } } }] } },
  Q709: { descriptions: { en: { value: 'American football team season' } }, claims: { P5138: [{ mainsnak: { datavalue: { value: { id: 'Q710' } } } }] } },
  Q710: { descriptions: { en: { value: 'American football team' } }, claims: { P154: [{ mainsnak: { datavalue: { value: 'Test Team logo.svg' } } }] } }
};

// Mocked Claude vision gate: VISION_MATCH items match whatever the picture;
// any other item matches only the distinct green picture, else "mismatch".
const VISION_MATCH = new Set(['Test Movie', 'Twin Title', 'Test Brand', 'Test Chain', 'Test Burger',
  'Fizzy Pop', 'Tesla Model Z', 'Test Game', '2000 Test Team season']);
async function anthropicMessages(body, headers) {
  const key = typeof headers?.get === 'function' ? headers.get('x-api-key') : headers?.['x-api-key'];
  if (key === 'bad-key') {
    return new Response(JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'invalid x-api-key' } }),
      { status: 401, headers: { 'content-type': 'application/json' } });
  }
  const content = body.messages[0].content;
  const text = content.find(b => b.type === 'text').text;
  const label = /Item: "([^"]+)"/.exec(text)[1];
  const imgBytes = Buffer.from(content.find(b => b.type === 'image').source.data, 'base64');
  const { channels } = await sharp(imgBytes).stats();
  const green = channels[1].mean > channels[0].mean + 60;
  const verdict = VISION_MATCH.has(label) || green
    ? { depicts: `a picture of ${label}`, verdict: 'match', confidence: 0.95, reason: 'clearly the item' }
    : { depicts: 'something else entirely', verdict: 'mismatch', confidence: 0.9, reason: 'not the item' };
  return json({
    id: 'msg_mock', type: 'message', role: 'assistant', model: body.model,
    content: [{ type: 'text', text: JSON.stringify(verdict) }],
    stop_reason: 'end_turn', stop_sequence: null,
    usage: { input_tokens: 100, output_tokens: 50 }
  });
}

globalThis.fetch = async (url, init = {}) => {
  const u = new URL(typeof url === 'string' ? url : (url.url || String(url)));
  const host = u.hostname;
  const q = u.searchParams;

  if (host === 'api.anthropic.com' && u.pathname === '/v1/messages') {
    return anthropicMessages(JSON.parse(init.body), init.headers);
  }

  if (host === 'en.wikipedia.org' && q.get('action') === 'query' && q.get('titles')) {
    const page = WIKI_PAGES[q.get('titles')];
    if (!page) return json({ query: { pages: [{ title: q.get('titles'), missing: true }] } });
    const { redirect, ...rest } = page;
    return json({ query: { ...(redirect ? { redirects: [redirect] } : {}), pages: [rest] } });
  }
  if (host === 'en.wikipedia.org' && q.get('generator') === 'search') {
    return json({ query: { pages: [] } });
  }
  if (host === 'www.wikidata.org' && q.get('action') === 'wbgetentities') {
    const id = q.get('ids');
    return json({ entities: { [id]: WIKIDATA[id] || {} } });
  }
  if (host === 'commons.wikimedia.org' && u.pathname.startsWith('/wiki/Special:FilePath/')) {
    return u.pathname.includes('logo') ? img(logoPng, 'image/png') : img(photoJpeg, 'image/jpeg');
  }
  if (host === 'commons.wikimedia.org' && q.get('generator') === 'search' && /Test Soda/.test(q.get('gsrsearch') || '')) {
    return json({ query: { pages: [{ title: 'File:Test Soda can.jpg', imageinfo: [{
      url: 'https://upload.wikimedia.org/green/test-soda-can.jpg', thumburl: 'https://upload.wikimedia.org/green/test-soda-can.jpg',
      width: 800, height: 1000, mime: 'image/jpeg' }] }] } });
  }
  if (host === 'commons.wikimedia.org') return json({ query: { pages: [] } });
  if (host === 'upload.wikimedia.org') {
    if (u.pathname.includes('dead')) return new Response('gone', { status: 404 });
    if (u.pathname.includes('/green/')) return img(greenJpeg, 'image/jpeg');
    return img(photoJpeg, 'image/jpeg');
  }

  if (host === 'api.themoviedb.org' && u.pathname === '/3/search/movie') {
    if ((q.get('query') || '').toLowerCase() === 'test movie') {
      return json({ results: [{ id: 555, title: 'Test Movie', release_date: '2020-01-01', poster_path: '/test-movie.jpg' }] });
    }
    // Two films share a title: the search returns the wrong one first; the
    // Wikidata P4947 ID (777) names the right one.
    if (/twin title/i.test(q.get('query') || '')) {
      return json({ results: [{ id: 111, title: 'Twin Title', release_date: '2001-05-01', poster_path: '/wrong-twin.jpg' }] });
    }
    return json({ results: [] });
  }
  if (host === 'api.themoviedb.org' && u.pathname === '/3/movie/777') {
    return json({ id: 777, title: 'Twin Title', release_date: '2001-09-01', poster_path: '/right-twin.jpg' });
  }
  if (host === 'api.themoviedb.org') return json({ results: [] });
  if (host === 'image.tmdb.org') return img(photoJpeg, 'image/jpeg');

  if (host === 'webservice.fanart.tv') return json({});
  if (host === 'musicbrainz.org') return json({ artists: [] });
  if (host === 'itunes.apple.com') return json({ results: [] });
  if (host === 'api.tvmaze.com') return new Response('not found', { status: 404 });
  if (host === 'api.openverse.org') return json({ results: [] });
  if (host === 'pixabay.com') return json({ hits: [] });
  if (host === 'example.com') return img(photoJpeg, 'image/jpeg'); // override-URL test

  console.error(`mock-fetch: unmocked URL ${u}`);
  return new Response('unmocked', { status: 599 });
};
