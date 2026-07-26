/* DoseBenders service worker
   Network-first for the app shell so a deploy is picked up immediately,
   falling back to cache when offline. Static assets are cache-first.

   Bump CACHE_VERSION whenever you deploy and want clients to refresh. */

const CACHE_VERSION = 'db-v9';
const SHELL = [
  '/',
  '/index.html',
  '/config.js',
  '/favicon.svg',
  '/apple-touch-icon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/site.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      // addAll fails the whole install if any one item 404s, so add
      // individually and tolerate misses.
      .then((cache) => Promise.all(
        SHELL.map((url) => cache.add(url).catch(() => null))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle same-origin GETs. Supabase, fonts and the CDN go straight
  // to the network so auth and sync are never served stale.
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isDocument = req.mode === 'navigate' ||
                     (req.headers.get('accept') || '').includes('text/html');

  if (isDocument) {
    // Network first: always prefer a fresh deploy, fall back to cache.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((c) => c.put('/index.html', copy));
          return res;
        })
        .catch(() => caches.match('/index.html').then((r) => r || caches.match('/')))
    );
    return;
  }

  // Static assets: cache first, then network.
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res && res.status === 200 && res.type === 'basic') {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(req, copy));
      }
      return res;
    }).catch(() => undefined))
  );
});
