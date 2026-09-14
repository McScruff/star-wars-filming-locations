var CACHE_NAME = 'tpis-v1';
var APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './data/locations.json',
  './assets/images/banner.jpg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', function(event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(APP_SHELL);
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(keys.filter(function(key) {
        return key !== CACHE_NAME;
      }).map(function(key) {
        return caches.delete(key);
      }));
    })
  );
  self.clients.claim();
});

// Same-origin GET requests: stale-while-revalidate, so the app works
// offline and picks up updates (e.g. new locations.json entries) in the
// background. Cross-origin requests (Nominatim, Google Maps, Wikimedia
// Commons photos, what3words) are left alone and go straight to network.
self.addEventListener('fetch', function(event) {
  var req = event.request;
  if (req.method !== 'GET') return;

  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(req).then(function(cached) {
      var fetchPromise = fetch(req).then(function(res) {
        if (res && res.status === 200) {
          var resClone = res.clone();
          caches.open(CACHE_NAME).then(function(cache) { cache.put(req, resClone); });
        }
        return res;
      }).catch(function() { return cached; });
      return cached || fetchPromise;
    })
  );
});
