var CACHE = 'tatusigry-v2';

// Cache on install
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE).then(function(cache) {
      return cache.addAll([
        './',
        './index.html',
        './manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

// Clean old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k){ return k !== CACHE; })
            .map(function(k){ return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});

// Cache first — працює офлайн, при наявності інтернету оновлює кеш у фоні
self.addEventListener('fetch', function(e) {
  e.respondWith(
    caches.open(CACHE).then(function(cache) {
      return cache.match(e.request).then(function(cached) {
        var fetchPromise = fetch(e.request).then(function(response) {
          if (response && response.status === 200) {
            cache.put(e.request, response.clone());
          }
          return response;
        }).catch(function() { return cached; });

        // Return cached immediately if exists, fetch in background
        return cached || fetchPromise;
      });
    })
  );
});
