var staticCacheName = "pwa-currency-converter-v1";

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(staticCacheName).then(function(cache) {
      cache
        .addAll([
          "/",
          "js/app.565676f5.js",
          "js/chunk-vendors.8e15b4b0.js",
          "css/app.e12af5ed.css",
          "css/chunk-vendors.3f7932d1.css",
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
});

self.addEventListener("fetch", function(event) {
<<<<<<< HEAD
=======
  var url = new URL(event.request.url);

>>>>>>> 4c2c33a114e331dd405ae1840da84f5366492de9
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cachNames) {
<<<<<<< HEAD
=======
      console.log("activated", cachNames);
>>>>>>> 4c2c33a114e331dd405ae1840da84f5366492de9
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
