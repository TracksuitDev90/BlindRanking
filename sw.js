// Simple image cache: stale-while-revalidate for faster repeat views
const CACHE = 'br-img-v2';
const ALLOW = [
  'image.tmdb.org',
  'upload.wikimedia.org',
  'commons.wikimedia.org',
  'api.tvmaze.com',
  'static.tvmaze.com',
  'is1-ssl.mzstatic.com','is2-ssl.mzstatic.com','is3-ssl.mzstatic.com','is4-ssl.mzstatic.com','is5-ssl.mzstatic.com',
  'lastfm.freetls.fastly.net',
  'theaudiodb.com',
  'cdn.pixabay.com','pixabay.com',
  'images.unsplash.com',
  'images.pexels.com'
];

// Limit cache size to prevent unbounded growth
const MAX_CACHE_SIZE = 200;

self.addEventListener('install', (e) => self.skipWaiting());
self.addEventListener('activate', (e) => {
  // Clean old caches
  e.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.filter(n => n !== CACHE).map(n => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.destination === 'image' && ALLOW.includes(url.hostname)) {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});

async function staleWhileRevalidate(req) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(req);
  const network = fetch(req).then(async res => {
    if (res && res.ok) {
      cache.put(req, res.clone());
      // Trim cache if too large
      const keys = await cache.keys();
      if (keys.length > MAX_CACHE_SIZE) {
        for (let i = 0; i < keys.length - MAX_CACHE_SIZE; i++) {
          cache.delete(keys[i]);
        }
      }
    }
    return res;
  }).catch(() => null);
  return cached || network || fetch(req, { cache: 'reload' }).catch(() => cached);
}
