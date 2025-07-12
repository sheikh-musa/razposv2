self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open("static-cache-v1").then((cache) => {
      return cache.addAll(["/", "/favicon.ico", "/manifest.json", "/images/home.png", "/images/navbar.png", "/images/analytics.png"]);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== "static-cache-v1") {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
