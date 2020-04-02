var CACHE_NAME = '{{ strtolower(APP_NAME) }}-v{{ APP_VERSION }}';
var filesToCache = [
    '/offline',
    '/style.min.css',
    '/script.min.js',
    '/logo.png'
];

self.addEventListener('install', function (event) {
    event.waitUntil(caches.open(CACHE_NAME).then(function (cache) {
        return cache.addAll(filesToCache);
    }));
});

self.addEventListener('activate', function (event) {
    event.waitUntil(caches.keys().then(function (cacheNames) {
        return Promise.all(cacheNames.filter(function (cacheName) {
            return cacheName != CACHE_NAME
        }).map(function (cacheName) {
            return caches.delete(cacheName);
        }));
    }));
});

self.addEventListener('fetch', (event) => {
    event.respondWith(caches.match(event.request).then(function (response) {
        return response || fetch(event.request).catch(function () {
            return caches.match('/offline');
        });
    }));
});
