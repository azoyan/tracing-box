const CACHE_NAME = 'Tracing Paper';

// Cache all the files to make a PWA
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // Our application only has two files here index.html and manifest.json
      // but you can add more such as style.css as your app grows
      return cache.addAll([
        '/',
        './android-chrome-192x192.png',
        './apple-touch-icon.png',
        './browserconfig.xml',
        './favicon-16x16.png',
        './favicon-32x32.png',
        './favicon.ico',
        './mstile-70x70.png',
        './mstile-144x144.png',
        './mstile-150x150.png',
        './mstile-310x150.png',
        './mstile-310x310.png',
        './pencil-square.svg',
        './safari-pinned-tab.svg',
        './script.js',
        './index.html',
        './manifest.json'
      ]);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

// Our service worker will intercept all fetch requests
// and check if we have cached the file
// if so it will serve the cached file
self.addEventListener('fetch', event => {
  event.respondWith(async () => {
      const cache = await caches.open(CACHE_NAME);

      // match the request to our cache
      const cachedResponse = await cache.match(event.request);

      // check if we got a valid response
      if (cachedResponse !== undefined) {
          // Cache hit, return the resource
          return cachedResponse;
      } else {
        // Otherwise, go to the network
          return fetch(event.request)
      };
  });
});