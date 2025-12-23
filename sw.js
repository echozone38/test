// PWA Service Worker – cache-first
const CACHE_NAME = 'tabulka-porci-cache-v4';
const ASSETS = [
  './',
  'index.html',
  'manifest.json',
  'icons/icon-192.png',
  'icons/icon-512.png'
];
self.addEventListener('install', (event) => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))); self.skipWaiting(); });
self.addEventListener('activate', (event) => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => (k !== CACHE_NAME ? caches.delete(k) : undefined))))); self.clients.claim(); });
self.addEventListener('fetch', (event) => { const req = event.request; if (req.method === 'GET') { event.respondWith(caches.match(req).then(cached => { return ( cached || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE_NAME).then(cache => { try { if (req.url.startsWith(self.location.origin)) cache.put(req, copy); } catch(e) {} }); return res; }).catch(() => cached) ); })); } });
