const cacheName = 'Tracing Paper';

// Cache all the files to make a PWA
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(cacheName).then(cache => {
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

// Our service worker will intercept all fetch requests
// and check if we have cached the file
// if so it will serve the cached file
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(cacheName)
      .then(cache => cache.match(event.request, { ignoreSearch: true }))
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
