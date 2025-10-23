// Service Worker with Advanced Caching Strategy
const VERSION = 'v1.0.0';
const CACHE_NAME = `pwa-${VERSION}`;
const RUNTIME_CACHE = `runtime-${VERSION}`;

// Assets to precache
// Note: self.__WB_MANIFEST is replaced by Workbox InjectManifest plugin in production
const WORKBOX_MANIFEST = self.__WB_MANIFEST || [];
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  ...WORKBOX_MANIFEST
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys
          .filter(key => key !== CACHE_NAME && key !== RUNTIME_CACHE)
          .map(key => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return;

  // HTML requests - Network first with cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }

  // API requests - Network only with offline queue
  // SECURITY: Never cache API responses - they may contain user-specific data
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkOnlyStrategy(request));
    return;
  }

  // Static assets - Cache first with network fallback
  event.respondWith(cacheFirstStrategy(request));
});

// Network first strategy
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Return offline page
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }

    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

// Cache first strategy
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Update cache in background
    fetch(request).then(response => {
      if (response.ok) {
        caches.open(RUNTIME_CACHE).then(cache => {
          cache.put(request, response);
        });
      }
    }).catch(() => {});

    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

// Network only strategy (for API calls)
async function networkOnlyStrategy(request) {
  try {
    return await fetch(request);
  } catch (error) {
    // Queue request for later if offline
    await queueRequest(request);

    return new Response(
      JSON.stringify({ queued: true, offline: true }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 202
      }
    );
  }
}

// Queue request for when online
async function queueRequest(request) {
  const clonedRequest = request.clone();
  const body = await clonedRequest.text();

  // Send message to all clients to queue this request
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'QUEUE_REQUEST',
      request: {
        url: request.url,
        method: request.method,
        headers: [...request.headers],
        body: body
      }
    });
  });
}

// Background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(processQueue());
  }
});

async function processQueue() {
  // Notify clients to process their queues
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'PROCESS_QUEUE'
    });
  });
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};

  const title = data.title || 'Notification';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-96x96.png',
    data: data.data || {},
    actions: data.actions || []
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }

      // Open new window
      if (clients.openWindow) {
        return clients.openWindow('/');
      }
    })
  );
});

// Message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
