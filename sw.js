/**
 * G Architects — Service Worker
 * Version: 1.0.0
 * Strategy: Cache-first for static assets, network-first for HTML
 */

const CACHE_NAME = 'garchitects-v1';
const STATIC_CACHE = 'garchitects-static-v1';
const DYNAMIC_CACHE = 'garchitects-dynamic-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/articles.html',
  '/manifest.json',
  '/css/styles.css',
  '/js/main.js',
  '/js/cms-loader.js',
  '/js/vendor/marked.min.js',
  '/js/vendor/js-yaml.min.js',
  '/fonts/fonts.css',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@200;300;400;500&display=swap',
  'https://res.cloudinary.com/dh4efeksi/image/upload/f_webp,g_auto,w_192/garchitects/COMPANY%20LOGO.png',
  'https://res.cloudinary.com/dh4efeksi/image/upload/f_webp,g_auto,w_512/garchitects/COMPANY%20LOGO.png'
];

// Install event — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { credentials: 'same-origin' })));
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
            .map((name) => caches.delete(name))
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch event — caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip cross-origin requests (except Cloudinary fonts)
  if (url.origin !== location.origin && !url.hostname.includes('cloudinary.com') && !url.hostname.includes('fonts.googleapis.com') && !url.hostname.includes('fonts.gstatic.com')) {
    return;
  }

  // HTML pages — Network-first, fallback to cache, then offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
    return;
  }

  // Static assets (CSS, JS, fonts, images) — Cache-first
  if (isStaticAsset(request)) {
    event.respondWith(cacheFirstStrategy(request, STATIC_CACHE));
    return;
  }

  // API/CMS content — Network-first with short timeout
  if (url.pathname.startsWith('/content/') || url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE, 3000));
    return;
  }

  // Default — network-first
  event.respondWith(networkFirstStrategy(request, DYNAMIC_CACHE));
});

// Cache-first strategy — for static assets
async function cacheFirstStrategy(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  if (cached) {
    // Return cached, update in background
    event.waitUntil(updateCacheInBackground(request, cache));
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return offline fallback for images
    if (request.destination === 'image') {
      return new Response('', { status: 404 });
    }
    throw error;
  }
}

// Network-first strategy — for HTML and dynamic content
async function networkFirstStrategy(request, cacheName, timeout = 5000) {
  const cache = await caches.open(cacheName);

  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout))
    ]);

    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await cache.match(request);
    if (cached) return cached;

    // Offline fallback for HTML
    if (request.headers.get('accept')?.includes('text/html')) {
      const offline = await cache.match(OFFLINE_URL);
      if (offline) return offline;
      return new Response(
        `<!DOCTYPE html><html><head><title>Offline</title><meta name="viewport" content="width=device-width, initial-scale=1"><style>body{font-family:sans-serif;text-align:center;padding:3rem;background:#080808;color:#F5F0E8;}button{background:#C9A96E;color:#080808;border:none;padding:1rem 2rem;font-size:1rem;cursor:pointer;margin-top:1rem;}</style></head><body><h1>You're Offline</h1><p>Check your connection and try again.</p><button onclick="window.location.reload()">Retry</button></body></html>`,
        { headers: { 'Content-Type': 'text/html' } }
      );
    }

    throw error;
  }
}

// Update cache in background (stale-while-revalidate)
async function updateCacheInBackground(request, cache) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
  } catch (error) {
    // Silently fail
  }
}

// Check if request is for static asset
function isStaticAsset(request) {
  const url = new URL(request.url);
  const staticExtensions = ['.css', '.js', '.woff', '.woff2', '.ttf', '.eot', '.png', '.jpg', '.jpeg', '.webp', '.svg', '.ico', '.woff2'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         url.pathname.startsWith('/fonts/') ||
         url.pathname.startsWith('/css/') ||
         url.pathname.startsWith('/js/') ||
         url.hostname.includes('fonts.gstatic.com') ||
         url.hostname.includes('cloudinary.com');
}

// Background sync for form submissions (future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'contact-form-sync') {
    event.waitUntil(syncContactForm());
  }
});

async function syncContactForm() {
  // Future: sync offline form submissions
  console.log('[SW] Background sync triggered');
}

// Push notifications (future enhancement)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'https://res.cloudinary.com/dh4efeksi/image/upload/f_webp,g_auto,w_192/garchitects/COMPANY%20LOGO.png',
        badge: 'https://res.cloudinary.com/dh4efeksi/image/upload/f_webp,g_auto,w_96/garchitects/COMPANY%20LOGO.png',
        vibrate: [200, 100, 200],
        data: { url: data.url || '/' }
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

// Message from main thread (e.g., skip waiting)
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});

console.log('[SW] Service Worker loaded');