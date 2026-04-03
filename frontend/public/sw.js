const CACHE_NAME = 'medfind-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/medfind-icon-192.png',
  '/medfind-icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) return response;
        return fetch(event.request);
      })
  );
});

// Handle push notifications
self.addEventListener('push', event => {
  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/medfind-icon-192.png',
    badge: '/medfind-icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      { action: 'explore', title: 'View Reminder' },
      { action: 'close', title: 'Close' },
    ]
  };
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
