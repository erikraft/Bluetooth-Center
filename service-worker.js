
const CACHE_NAME = 'bt-transfer-cache-v1';
const FILES_TO_CACHE = [
  '.',
  'index.html',
  'styles.css',
  'script.js',
  'manifest.json',
  'service-worker.js',
  'assets/Bluetooth.png',
  'assets/connected.mp3'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      }))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request).then(resp => resp || fetch(evt.request))
  );
});
