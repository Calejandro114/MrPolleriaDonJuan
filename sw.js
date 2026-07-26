/* sw.js - Service Worker básico para PWA */
const CACHE_NAME = 'donjuan-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './css/globales/base.css',
  './img/logo.webp'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});