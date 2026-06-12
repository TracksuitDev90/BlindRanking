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
  Q600: { descriptions: { en: { value: 'fast food chain' } }, claims: { P154: [{ mainsnak: { datavalue: { value: 'Test Chain logo.svg' } } }] } }
};

globalThis.fetch = async (url) => {
  const u = new URL(typeof url === 'string' ? url : url.url);
  const host = u.hostname;
  const q = u.searchParams;

  if (host === 'en.wikipedia.org' && q.get('action') === 'query' && q.get('titles')) {
    const page = WIKI_PAGES[q.get('titles')];
    return json({ query: { pages: [page || { title: q.get('titles'), missing: true }] } });
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
  if (host === 'commons.wikimedia.org') return json({ query: { pages: [] } });
  if (host === 'upload.wikimedia.org') {
    if (u.pathname.includes('dead')) return new Response('gone', { status: 404 });
    return img(photoJpeg, 'image/jpeg');
  }

  if (host === 'api.themoviedb.org' && u.pathname === '/3/search/movie') {
    if ((q.get('query') || '').toLowerCase() === 'test movie') {
      return json({ results: [{ id: 555, title: 'Test Movie', release_date: '2020-01-01', poster_path: '/test-movie.jpg' }] });
    }
    return json({ results: [] });
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
