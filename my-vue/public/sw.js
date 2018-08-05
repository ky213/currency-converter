var staticCacheName = "pwa-currency-converter-v3";

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      cache
        .addAll([
          "/",
          "js/app.d560a909.js",
          "js/chunk-vendors.264ee0bf.js",
          "css/app.97137703.css",
          "css/chunk-vendors.3f7932d1.css",
          "img/europe.png",
          "https://restcountries.eu/rest/v2/all?fields=name;flag;currencies"
        ])
        .then(async function() {
          const result = await cache.match(
            "https://restcountries.eu/rest/v2/all?fields=name;flag;currencies"
          );
          const countries = await result.json();
          const flagList = countries.map(({ flag }) => flag);
          cache.addAll(flagList);
        });
    })
  );
  self.skipWaiting();
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.open(staticCacheName).then(function(cache) {
      return cache.match(event.request).then(function(response) {
        return (
          response ||
          fetch(event.request).then(function(response) {
            cache.put(event.request, response.clone());
            return response;
          })
        );
      });
    })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cachNames) {
      cachNames.forEach(function(cachName) {
        if (
          cachName.startsWith("pwa-currency-converter") &&
          cachName !== staticCacheName
        )
          caches.delete(cachName);
      });
    })
  );
});
