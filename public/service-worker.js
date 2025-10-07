// Service Worker for UltraVioleta DAO
// Version: 1.0.0

const CACHE_NAME = 'uvd-cache-v1';
const DYNAMIC_CACHE = 'uvd-dynamic-v1';
const STATIC_CACHE = 'uvd-static-v1';

// Static assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/logo.png',
  '/logo192.png',
  '/logo512.png',
  '/static/css/main.css',
  '/static/js/main.js'
];

// Dynamic cache for API responses
const API_CACHE_URLS = [
  '/api/metrics',
  '/api/snapshot',
  '/api/token',
  '/api/safe',
  '/api/contributors'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[ServiceWorker] Pre-caching static assets');
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { mode: 'no-cors' })))
        .catch(err => {
          console.error('[ServiceWorker] Failed to cache:', err);
        });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('uvd-') && name !== CACHE_NAME && name !== DYNAMIC_CACHE && name !== STATIC_CACHE)
          .map(name => {
            console.log('[ServiceWorker] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests that aren't whitelisted
  if (url.origin !== location.origin) {
    const allowedOrigins = [
      'https://hub.snapshot.org',
      'https://api.coingecko.com',
      'https://safe-transaction-avalanche.safe.global'
    ];

    if (!allowedOrigins.some(origin => url.origin === origin)) {
      return;
    }
  }

  // API requests - Network first, fall back to cache (stale-while-revalidate)
  if (url.pathname.startsWith('/api/') || API_CACHE_URLS.includes(url.pathname)) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone the response before caching
          const responseToCache = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then(response => {
            if (response) {
              return response;
            }
            // Return offline fallback for API requests
            return new Response(JSON.stringify({
              error: 'Offline',
              message: 'Content not available offline'
            }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Static assets - Cache first, fall back to network
  if (request.url.match(/\.(js|css|png|jpg|jpeg|svg|gif|webp|woff|woff2|ttf|eot)$/)) {
    event.respondWith(
      caches.match(request).then((response) => {
        if (response) {
          // Update cache in background
          fetch(request).then((networkResponse) => {
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(request, networkResponse);
            });
          });
          return response;
        }
        return fetch(request).then((response) => {
          const responseToCache = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        });
      })
    );
    return;
  }

  // HTML pages - Network first with offline fallback
  if (request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
          return response;
        })
        .catch(() => {
          return caches.match(request).then(response => {
            if (response) {
              return response;
            }
            // Return offline page if available
            return caches.match('/offline.html');
          });
        })
    );
    return;
  }

  // Default - try network first, then cache
  event.respondWith(
    fetch(request).catch(() => {
      return caches.match(request);
    })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-applications') {
    event.waitUntil(syncApplications());
  }
});

async function syncApplications() {
  try {
    const cache = await caches.open('offline-applications');
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await fetch(request);
      if (response.ok) {
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('Sync failed:', error);
  }
}

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New update from UltraVioleta DAO',
    icon: '/logo192.png',
    badge: '/logo192.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    }
  };

  event.waitUntil(
    self.registration.showNotification('UltraVioleta DAO', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('https://ultravioleta.xyz')
  );
});