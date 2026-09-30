const CACHE_NAME = "prayer-times-v3";
const toCache = [
  ".",
  "index.html",
  "manifest.json",
  "service-worker.js",
  "icons/icon-192x192.png",
  "icons/icon-512x512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(toCache))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && (res.status === 200 || res.type === "opaque")) {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy).catch(() => {}));
        }
        return res;
      })
      .catch(() =>
        caches.match(req).then((cached) => cached || caches.match("index.html"))
      )
  );
});
