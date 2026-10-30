// AXIOX Arena Service Worker — Network-first: önce internetten taze dosya, yoksa önbellek
const CACHE_NAME = 'axiox-cache-v1-2';

self.addEventListener('install', function(e) { self.skipWaiting(); });

self.addEventListener('activate', function(e) {
  e.waitUntil(Promise.all([
    caches.keys().then(function(keys) {
      return Promise.all(keys.map(function(key) { if (key !== CACHE_NAME) return caches.delete(key); }));
    }),
    self.clients.claim()
  ]));
});

self.addEventListener('fetch', function(e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(function(response) {
      if (response.ok) {
        const kopya = response.clone();
        caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, kopya); });
      }
      return response;
    }).catch(function() {
      return caches.match(e.request).then(function(cached) { return cached || caches.match('./'); });
    })
  );
});
