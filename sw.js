// Jednoduchý Service Worker pro PWA na GitHub Pages
const CACHE_NAME = 'porce-app-cache-v1';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Navigace: network-first, fallback cache
  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req).then(res => {
        const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); return res;
      }).catch(() => caches.match(req).then(m => m || caches.match('./index.html')))
    );
    return;
  }

  // Statické & CDN: stale-while-revalidate
  if(url.origin !== self.location.origin || req.destination === 'script' || req.destination === 'style' || req.destination === 'image'){
    event.respondWith(
      caches.match(req).then(cached => {
        const net = fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); return res; }).catch(()=>cached);
        return cached || net;
      })
    );
    return;
  }

  // Default: cache-first, fallback network
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone(); caches.open(CACHE_NAME).then(c => c.put(req, copy)); return res;
    }))
  );
});
