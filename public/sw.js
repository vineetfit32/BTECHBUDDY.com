const CACHE_NAME = "btechbuddy-cache-v1";
const OFFLINE_URLS = [
  "/",
  "/notes",
  "/pyq",
  "/tools/sgpa-cgpa-calculator",
  "/tools/attendance-tracker",
  "/placement-hub",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS).catch((err) => {
        console.warn("Service worker cache prefetch notice:", err);
      });
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  // Stale-while-revalidate / network-first fallback
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // For PDF notes or sample notes, try Cache first, then network
  if (url.pathname.endsWith(".pdf") || url.pathname.startsWith("/sample-notes/")) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // For HTML pages and navigation, network first with cache fallback
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
