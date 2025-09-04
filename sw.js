// Simple image cache: stale-while-revalidate for faster repeat views
const CACHE = 'br-img-v1';
const ALLOW = [
  'image.tmdb.org',
  'upload.wikimedia.org',
  'commons.wikimedia.org',
  'api.tvmaze.com',
  'is1-ssl.mzstatic.com','is2-ssl.mzstatic.com','is3-ssl.mzstatic.com','is4-ssl.mzstatic.com',
  'lastfm.freetls.fastly.net',
  'theaudiodb.com',
  'cdn.pixabay.com','pixabay.com',
  'images.unsplash.com',
  'images.pexels.com'
];

self.addEventListener('install', (e)=> self.skipWaiting());
self.addEventListener('activate', (e)=> self.clients.claim());

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.destination === 'image' && ALLOW.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

async function staleWhileRevalidate(req){
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const network = fetch(req).then(res => {
    if (res && res.ok) cache.put(req, res.clone());
    return res;
  }).catch(()=>null);
  return cached || network || fetch(req, { cache: 'reload' }).catch(()=>cached);
}