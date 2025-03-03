self.addEventListener('push', function(event) {
    const data = event.data.json();
    const title = data.title || 'Default Title';
    const options = {
        body: data.body || 'Default body',
        icon: '/icons/icon-192x192.png', // Changed from 'path/to/icon.png'
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});
const CACHE_NAME = 'pwa-demo-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.webmanifest',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install Event: Caches necessary assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('Opened cache');
            return cache.addAll(urlsToCache);
        })
    );
});

// Activate Event: Cleans up old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        console.log('Deleting old cache:', cache);
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
});

// Fetch Event: Serves files from cache when available
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
