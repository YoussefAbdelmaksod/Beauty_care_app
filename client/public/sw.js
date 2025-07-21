const CACHE_NAME = 'beauty-care-v1.0.0';
const STATIC_CACHE = 'beauty-care-static-v1.0.0';
const DYNAMIC_CACHE = 'beauty-care-dynamic-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/index.css',
  '/manifest.json',
  // Add your CSS and JS bundles here when built
];

// API endpoints to cache for offline use
const API_CACHE_PATTERNS = [
  /\/api\/products/,
  /\/api\/pharmacies/,
  /\/api\/analysis/,
];

// Network-first patterns (always try network first)
const NETWORK_FIRST_PATTERNS = [
  /\/api\/chat/,
  /\/api\/analysis\/image/,
  /\/api\/analysis\/text/,
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Static assets cached successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Failed to cache static assets:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => {
              return cacheName !== STATIC_CACHE && 
                     cacheName !== DYNAMIC_CACHE &&
                     cacheName !== CACHE_NAME;
            })
            .map(cacheName => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      })
      .then(() => {
        console.log('[SW] Service worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Handle different types of requests with appropriate strategies
  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Network-first strategy for real-time APIs
    if (NETWORK_FIRST_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await networkFirstStrategy(request);
    }
    
    // Cache-first strategy for API data that can be stale
    if (API_CACHE_PATTERNS.some(pattern => pattern.test(url.pathname))) {
      return await cacheFirstStrategy(request);
    }
    
    // Stale-while-revalidate for navigation requests
    if (request.mode === 'navigate') {
      return await staleWhileRevalidateStrategy(request);
    }
    
    // Cache-first strategy for static assets
    return await cacheFirstStrategy(request);
    
  } catch (error) {
    console.error('[SW] Request failed:', error);
    
    // Return offline fallback if available
    if (request.mode === 'navigate') {
      const cache = await caches.open(STATIC_CACHE);
      const fallback = await cache.match('/index.html');
      return fallback || new Response('Offline', { status: 503 });
    }
    
    return new Response('Network error', { status: 503 });
  }
}

// Network-first strategy - try network, fallback to cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, trying cache for:', request.url);
    const cache = await caches.open(DYNAMIC_CACHE);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    throw error;
  }
}

// Cache-first strategy - try cache, fallback to network
async function cacheFirstStrategy(request) {
  const cache = await caches.open(STATIC_CACHE);
  let cachedResponse = await cache.match(request);
  
  if (!cachedResponse) {
    const dynamicCache = await caches.open(DYNAMIC_CACHE);
    cachedResponse = await dynamicCache.match(request);
  }
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    throw error;
  }
}

// Stale-while-revalidate strategy
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cachedResponse = await cache.match(request);
  
  // Fetch from network in background
  const networkPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return await networkPromise;
}

// Handle background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'skin-analysis-sync') {
    event.waitUntil(syncSkinAnalysis());
  }
  
  if (event.tag === 'chat-message-sync') {
    event.waitUntil(syncChatMessages());
  }
});

async function syncSkinAnalysis() {
  try {
    // Get pending analyses from IndexedDB or localStorage
    const pendingAnalyses = JSON.parse(localStorage.getItem('pendingAnalyses') || '[]');
    
    for (const analysis of pendingAnalyses) {
      try {
        const response = await fetch('/api/analysis/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(analysis)
        });
        
        if (response.ok) {
          // Remove from pending list
          const updatedPending = pendingAnalyses.filter(p => p.id !== analysis.id);
          localStorage.setItem('pendingAnalyses', JSON.stringify(updatedPending));
          
          // Notify client of success
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'ANALYSIS_SYNCED',
                data: analysis
              });
            });
          });
        }
      } catch (error) {
        console.error('[SW] Failed to sync analysis:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

async function syncChatMessages() {
  try {
    const pendingMessages = JSON.parse(localStorage.getItem('pendingChatMessages') || '[]');
    
    for (const message of pendingMessages) {
      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(message)
        });
        
        if (response.ok) {
          const updatedPending = pendingMessages.filter(m => m.id !== message.id);
          localStorage.setItem('pendingChatMessages', JSON.stringify(updatedPending));
          
          self.clients.matchAll().then(clients => {
            clients.forEach(client => {
              client.postMessage({
                type: 'MESSAGE_SYNCED',
                data: message
              });
            });
          });
        }
      } catch (error) {
        console.error('[SW] Failed to sync message:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Chat sync failed:', error);
  }
}

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  
  const options = {
    title: data.title || 'Beauty Care',
    body: data.body || 'لديك تحديث جديد في تطبيق Beauty Care',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    data: data.url || '/',
    actions: [
      {
        action: 'open',
        title: 'فتح',
        icon: '/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'إغلاق'
      }
    ],
    tag: data.tag || 'general',
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200]
  };
  
  event.waitUntil(
    self.registration.showNotification(options.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.tag);
  
  event.notification.close();
  
  if (event.action === 'close') {
    return;
  }
  
  const urlToOpen = event.notification.data || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' })
      .then(clients => {
        // Check if app is already open
        for (const client of clients) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app is not open
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Periodic background sync for app updates
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);
  
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent());
  }
});

async function syncContent() {
  try {
    // Fetch latest products and cache them
    const productsResponse = await fetch('/api/products');
    if (productsResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put('/api/products', productsResponse.clone());
    }
    
    // Fetch latest pharmacies
    const pharmaciesResponse = await fetch('/api/pharmacies');
    if (pharmaciesResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put('/api/pharmacies', pharmaciesResponse.clone());
    }
    
    console.log('[SW] Content synced successfully');
  } catch (error) {
    console.error('[SW] Content sync failed:', error);
  }
}

// Handle service worker messages from clients
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
  
  if (event.data && event.data.type === 'CACHE_ANALYSIS') {
    // Cache analysis for offline sync
    const analysis = event.data.analysis;
    const pendingAnalyses = JSON.parse(localStorage.getItem('pendingAnalyses') || '[]');
    pendingAnalyses.push(analysis);
    localStorage.setItem('pendingAnalyses', JSON.stringify(pendingAnalyses));
    
    // Register background sync
    self.registration.sync.register('skin-analysis-sync').catch(() => {
      console.log('[SW] Background sync not supported');
    });
  }
});

console.log('[SW] Service worker script loaded');
