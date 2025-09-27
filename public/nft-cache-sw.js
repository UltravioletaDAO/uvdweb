// NFT Cache Service Worker for UltraVioleta DAO
const CACHE_NAME = 'uvd-nft-cache-v3';
const IPFS_CACHE_NAME = 'uvd-ipfs-cache-v3';
const CACHE_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

// IPFS gateways for fallback
const IPFS_GATEWAYS = [
  'https://ipfs.io',
  'https://gateway.pinata.cloud',
  'https://cloudflare-ipfs.com',
  'https://gateway.ipfs.io'
];

// URLs to cache on install
const STATIC_CACHE_URLS = [
  '/logo.png',
  '/uvd.png'
];

// Install event - cache static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.all(
        STATIC_CACHE_URLS.map(url =>
          cache.add(url).catch(() => console.log(`Failed to cache: ${url}`))
        )
      );
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name.startsWith('uvd-') && name !== CACHE_NAME && name !== IPFS_CACHE_NAME)
          .map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Helper function to check if URL is IPFS
function isIPFSUrl(url) {
  return url.includes('/ipfs/') || url.includes('gateway.pinata.cloud') || url.includes('cloudflare-ipfs.com');
}

// Helper function to check if response is valid
function isValidResponse(response) {
  if (!response || response.status !== 200 || response.type === 'error') {
    return false;
  }
  const contentType = response.headers.get('content-type');
  return contentType && (
    contentType.includes('image') ||
    contentType.includes('video') ||
    contentType.includes('application/json')
  );
}

// Helper function to try multiple IPFS gateways
async function fetchFromIPFSGateways(request) {
  const url = new URL(request.url);
  const ipfsHash = url.pathname.split('/ipfs/')[1];

  if (!ipfsHash) return fetch(request);

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const gatewayUrl = `${gateway}/ipfs/${ipfsHash}`;
      const response = await fetch(gatewayUrl);
      if (isValidResponse(response)) {
        return response;
      }
    } catch (error) {
      console.warn(`Gateway ${gateway} failed:`, error);
    }
  }

  // If all gateways fail, try the original request
  return fetch(request);
}

// Fetch event - serve from cache or network
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle IPFS content specially
  if (isIPFSUrl(url.href)) {
    event.respondWith(
      caches.open(IPFS_CACHE_NAME).then(async cache => {
        // Try cache first
        const cachedResponse = await cache.match(request);

        if (cachedResponse) {
          const cachedTime = cachedResponse.headers.get('sw-cache-time');
          if (cachedTime && (Date.now() - parseInt(cachedTime)) < CACHE_DURATION) {
            return cachedResponse;
          }
        }

        // If not in cache or expired, fetch from network
        try {
          const response = await fetchFromIPFSGateways(request);

          if (isValidResponse(response)) {
            // Clone the response before caching
            const responseToCache = response.clone();

            // Add cache timestamp header
            const headers = new Headers(responseToCache.headers);
            headers.append('sw-cache-time', Date.now().toString());

            const cachedResponseWithTime = new Response(
              responseToCache.body,
              {
                status: responseToCache.status,
                statusText: responseToCache.statusText,
                headers: headers
              }
            );

            // Cache the response
            cache.put(request, cachedResponseWithTime);

            return response;
          }
        } catch (error) {
          console.error('Fetch failed:', error);
          // Return cached version even if expired
          if (cachedResponse) {
            return cachedResponse;
          }
        }

        // If all fails, return offline response
        return new Response('Offline - Content not available', {
          status: 503,
          statusText: 'Service Unavailable'
        });
      })
    );
  }

  // Handle local metadata requests
  if (url.pathname.startsWith('/echoes/metadata/')) {
    event.respondWith(
      caches.match(request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request).then(response => {
          if (!response || response.status !== 200) {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(request, responseToCache);
          });

          return response;
        }).catch(() => {
          return new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        });
      })
    );
  }
});

// Message event - handle cache operations
self.addEventListener('message', event => {
  if (event.data.action === 'clearCache') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(name => name.startsWith('uvd-'))
            .map(name => caches.delete(name))
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }

  if (event.data.action === 'getCacheSize') {
    event.waitUntil(
      Promise.all([
        caches.open(CACHE_NAME),
        caches.open(IPFS_CACHE_NAME)
      ]).then(async ([cache, ipfsCache]) => {
        const [cacheKeys, ipfsCacheKeys] = await Promise.all([
          cache.keys(),
          ipfsCache.keys()
        ]);

        event.ports[0].postMessage({
          size: cacheKeys.length + ipfsCacheKeys.length,
          details: {
            static: cacheKeys.length,
            ipfs: ipfsCacheKeys.length
          }
        });
      })
    );
  }
});