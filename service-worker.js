const CACHE_VERSION = "onelink-pwa-v2";
const CACHE_NAME = `onelink-cache-${CACHE_VERSION}`;

const ASSETS_TO_CACHE = [
  "/src/index.html",
  "/src/styles.css",
  "/src/app.js",
  "/src/manifest.json",
  "/public/icons/ol-192.svg",
  "/public/icons/ol-512.svg",
  "/public/images/fleet/prado.jpeg",
  "/public/images/fleet/pajero.jpeg",
  "/public/images/fleet/corolla.jpeg",
  "/public/images/fleet/accord.jpeg",
  "/public/images/fleet/tucson.jpeg",
  "/public/images/fleet/sportage.jpeg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("onelink-cache-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match("/src/index.html"))
    );
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request).then((networkResponse) => {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
        return networkResponse;
      });
    })
  );
});
