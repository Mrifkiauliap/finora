/* eslint-disable no-restricted-globals */
const CACHE_VERSION = 'v1.0.0';
const APP_SHELL_CACHE = `finora-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `finora-static-${CACHE_VERSION}`;

const PRECACHE_ROUTES = [
  '/',
  '/features',
  '/about',
  '/privacy',
  '/app',
  '/app/transactions',
  '/app/transactions/new',
  '/app/categories',
  '/app/budgets',
  '/app/goals',
  '/app/recurring',
  '/app/analytics',
  '/app/reports',
  '/app/settings',
  '/app/settings/backup',
  '/offline',
  '/manifest.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(async (cache) => {
      await Promise.allSettled(
        PRECACHE_ROUTES.map((url) => cache.add(new Request(url, { cache: 'reload' })))
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  const validCaches = new Set([APP_SHELL_CACHE, STATIC_CACHE]);
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !validCaches.has(k)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.headers.get('accept') || '').includes('text/html');
}

function isImmutableStatic(pathname) {
  return pathname.startsWith('/_next/static/');
}

function isIconOrManifest(pathname) {
  return (
    pathname.startsWith('/icons/') ||
    pathname === '/manifest.webmanifest' ||
    pathname === '/favicon.ico'
  );
}

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  // Strict same-origin policy: never cache or intercept cross-origin requests
  if (url.origin !== self.location.origin) return;
  // Never intercept /sw.js
  if (url.pathname === '/sw.js') return;

  if (isImmutableStatic(url.pathname)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      })
    );
    return;
  }

  if (isIconOrManifest(url.pathname)) {
    event.respondWith(
      caches.open(STATIC_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        const networkPromise = fetch(request)
          .then((res) => {
            if (res.ok) cache.put(request, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || networkPromise;
      })
    );
    return;
  }

  if (isNavigationRequest(request)) {
    event.respondWith(
      fetchWithTimeout(request, 3000)
        .then(async (networkResponse) => {
          if (networkResponse.ok) {
            const cache = await caches.open(APP_SHELL_CACHE);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        })
        .catch(async () => {
          const cache = await caches.open(APP_SHELL_CACHE);
          const cached = await cache.match(request);
          if (cached) return cached;
          const offlineFallback = await cache.match('/offline');
          if (offlineFallback) return offlineFallback;
          return new Response('Anda sedang offline.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
          });
        })
    );
  }
});

function fetchWithTimeout(request, timeoutMs) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Network timeout')), timeoutMs);
    fetch(request)
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}
