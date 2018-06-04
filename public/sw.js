const movieStaticCache = 'pwakanda-static-v1';
const movieDataCache = 'pwakanda-data-v1';
const movieImageCache = 'pwakanda-images-v1';

const wakandaCaches = [movieStaticCache, movieDataCache, movieImageCache];

const urlsToCache = [
  '/',
  '/css/style.css',
  '/js/app.bundle.js',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css',
  'https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js',
  'https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js'
];
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');
  self.skipWaiting();
  event.waitUntil(precache());
});

self.addEventListener('activate', event => {
  console.log('[serviceWorker] Activated');
  if (self.clients && clients.claim) {
    clients.claim();
  }
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (
            key !== movieStaticCache &&
            (key !== movieDataCache) & (key !== movieImageCache)
          )
            return caches.delete(key);
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  const requestUrl = event.request.url;
  const clonedRequest = event.request.clone();

  if (requestUrl.startsWith('https://image.tmdb.org/t/p/')) {
    event.respondWith(fetchAndUpdate(movieImageCache, clonedRequest));
  } else if (requestUrl.match(/\/api\//)) {
    if (requestUrl.match(/\/api\/movies\/popular/)) {
      event.respondWith(
        caches
          .match('/api/movies/')
          .then(
            response =>
              response || fetchAndUpdate(movieDataCache, clonedRequest)
          )
      );
      return;
    }
    event.respondWith(fetchAndUpdate(movieDataCache, clonedRequest));
  } else {
    event.respondWith(
      caches.match(clonedRequest).then(response => {
        return response || fetchAndUpdate(movieStaticCache, clonedRequest);
      })
    );
  }
});

/**
 * precache App Shell
 */
function precache() {
  return caches.open(movieStaticCache).then(cache => {
    console.log('[ServiceWorker] Caching app shell');
    return cache.addAll(urlsToCache);
  });
}

/**
 * Attempt to fetch request from cache
 * @param request
 */
function serveFromCache(request) {
  const cloneRequest = request.clone();
  const res = caches.open(movieStaticCache).then(cache => {
    return cache.match(request).then(response => {
      return (
        response ||
        fetch(cloneRequest).then(networkResponse => {
          caches.open(movieDataCache).then(cache => {
            cache.put(request, networkResponse);

            return networkResponse;
          });
        })
      );
    });
  });

  return res;
}

/**
 * Fetch from network and update cache
 * @param request
 */
function fetchAndUpdate(cacheName, request) {
  return caches.open(cacheName).then(function(cache) {
    return cache.match(request).then(cacheResponse => {
      if (cacheResponse) {
        console.log('[ServiceWorker] fetching from cache.');
        return cacheResponse;
      }

      return fetch(request)
        .then(function(response) {
          if (response.status === 404)
            return new Response("So sorry that page doesn't exist.");

          console.log('[ServiceWorker] fetching from network.');
          if (!request.url.startsWith('chrome-extension://')) {
            cache.put(request.url, response.clone());
          }

          return response;
        })
        .catch(() => new Response('Oh nooooo! Server is down.'));
    });
  });
}
