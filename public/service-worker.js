const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "./src/index.js",
  "/styles.css",
  "./dist/bundle.js",
  "./dist/manifest.json",
  "./src/db.js"
];

const STATIC_CACHE = "static-cache-v1";
const RUNTIME_CACHE = "runtime-cache";

self.addEventListener("install", event => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", event => {
  const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
  event.waitUntil(
    caches
      .keys()
      .then(cacheNames => {
        // return array of cache names that are old to delete
        return cacheNames.filter(
          cacheName => !currentCaches.includes(cacheName)
        );
      })
      .then(cachesToDelete => {
        return Promise.all(
          cachesToDelete.map(cacheToDelete => {
            return caches.delete(cacheToDelete);
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  // non GET requests are not cached and requests to other origins are not cached
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    event.respondWith(fetch(event.request));
    return;
  }
console.log(event.request)
  // handle runtime GET requests for data from /api routes
  if (event.request.url.includes("/api/")) {
    // make network request and fallback to cache if network request fails (offline)
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(event.request)
          .then(response => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => caches.match(event.request));
      })
    );
    return;
  }

  // use cache first for all other requests for performance
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      // request is not in cache. make network request and cache the response
      return caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(event.request).then(response => {
          return cache.put(event.request, response.clone()).then(() => {
            return response;
          });
        });
      });
    })
  );
});











// const CACHE_NAME = "static-cache-v6";
// const DATA_CACHE_NAME = "data-cache-v3";

// // install
// self.addEventListener("install", function (evt) {
//   evt.waitUntil(
//     caches.open(CACHE_NAME).then(cache => {
//       console.log("Your files were pre-cached successfully!");
//       return cache.addAll(FILES_TO_CACHE);
//     })
//   );

//   self.skipWaiting();
// });

// // activate
// self.addEventListener("activate", function (evt) {
//   evt.waitUntil(
//     caches.keys().then(keyList => {
//       return Promise.all(
//         keyList.map(key => {
//           if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
//             console.log("Removing old cache data", key);
//             return caches.delete(key);
//           }
//         })
//       );
//     })
//   );

//   self.clients.claim();
// });

// // fetch
// // self.addEventListener("fetch", function(evt) {
// //   console.log(evt.request);
// //   if (evt.request.url.includes("/api/")) {
// //     evt.respondWith(
// //       caches.open(DATA_CACHE_NAME).then(cache => {
// //         return fetch(evt.request)
// //           .then(response => {
// //             // If the response was good, clone it and store it in the cache.
// //             if (response.status === 200) {
// //               cache.put(evt.request.url, response.clone());
// //             }

// //             return response;
// //           })
// //           .catch(err => {
// //             // Network request failed, try to get it from the cache.
// //             return cache.match(evt.request);
// //           });
// //       }).catch(err => console.log(err))
// //     );

// //     return;
// // }});
// self.addEventListener("fetch", event => {
//   if (event.request.url.startsWith(self.location.origin)) {
//     event.respondWith(
//       caches.match(event.request).then(cachedResponse => {
//         if (cachedResponse) {
//           return cachedResponse;
//         }

//         return caches.open("runtime").then(cache => {
//           return fetch(event.request).then(response => {
//             return cache.put(event.request, response.clone()).then(() => {
//               return response;
//             });
//           });
//         });
//       })
//     );
//   }
// });