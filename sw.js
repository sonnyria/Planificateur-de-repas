const CACHE_NAME = 'meal-planner-cache-v1';
const APP_SHELL_URLS = [
  '/',
  '/index.html',
  '/icon.svg',
  '/manifest.json'
];

// On install, cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache and caching app shell');
        return cache.addAll(APP_SHELL_URLS);
      })
  );
});

// On fetch, use a cache-first strategy
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // For API calls to Google, always go to the network.
  if (event.request.url.includes('generativelanguage.googleapis.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // If the resource is in the cache, return it
        if (cachedResponse) {
          return cachedResponse;
        }

        // If not in cache, fetch it from the network
        return fetch(event.request)
          .then((networkResponse) => {
            // Clone the response because it's a stream and can be consumed only once.
            const responseToCache = networkResponse.clone();
            
            if (networkResponse && networkResponse.status === 200) {
               caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
            }

            // Return the network response
            return networkResponse;
          })
          .catch((error) => {
            console.error('Fetching from network failed:', error);
            // This is where you might return a fallback page if you have one.
          });
      })
  );
});

// On activate, clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Tell the active service worker to take control of the page immediately.
  return self.clients.claim();
});
