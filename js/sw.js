/**
 * WIRED DIFFERENTLY — Service Worker
 * Full offline capability via cache-first strategy
 * Version the cache name to force updates when files change
 */

const CACHE_NAME = 'wired-differently-v1';

const ASSETS = [
  /* Root */
  '/wired-differently/',
  '/wired-differently/index.html',
  '/wired-differently/toc.html',
  '/wired-differently/manifest.json',

  /* Styles */
  '/wired-differently/css/style.css',
  '/wired-differently/css/print.css',

  /* Scripts */
  '/wired-differently/js/app.js',

  /* Icons */
  '/wired-differently/icons/icon.svg',
  '/wired-differently/icons/icon-16.png',
  '/wired-differently/icons/icon-32.png',
  '/wired-differently/icons/icon-72.png',
  '/wired-differently/icons/icon-96.png',
  '/wired-differently/icons/icon-128.png',
  '/wired-differently/icons/icon-144.png',
  '/wired-differently/icons/icon-152.png',
  '/wired-differently/icons/icon-180.png',
  '/wired-differently/icons/icon-192.png',
  '/wired-differently/icons/icon-512.png',

  /* Chapters */
  '/wired-differently/chapters/ch01.html',
  '/wired-differently/chapters/ch02.html',
  '/wired-differently/chapters/ch03.html',
  '/wired-differently/chapters/ch04.html',
  '/wired-differently/chapters/ch05.html',
  '/wired-differently/chapters/ch06.html',
  '/wired-differently/chapters/ch07.html',
  '/wired-differently/chapters/ch08.html',
  '/wired-differently/chapters/ch09.html',
  '/wired-differently/chapters/ch10.html',
  '/wired-differently/chapters/ch11.html',
  '/wired-differently/chapters/ch12.html',
  '/wired-differently/chapters/ch13.html',
  '/wired-differently/chapters/ch14.html',
  '/wired-differently/chapters/ch15.html',
  '/wired-differently/chapters/ch16.html',
  '/wired-differently/chapters/ch17.html',
  '/wired-differently/chapters/ch18.html',
  '/wired-differently/chapters/ch19.html',
  '/wired-differently/chapters/ch20.html',
  '/wired-differently/chapters/ch21.html',
  '/wired-differently/chapters/ch22.html',
  '/wired-differently/chapters/ch23.html',
  '/wired-differently/chapters/ch24.html',
  '/wired-differently/chapters/ch25.html',
  '/wired-differently/chapters/ch26.html',
  '/wired-differently/chapters/ch27.html',
];

/* ============================================================
   Install — cache everything
   ============================================================ */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

/* ============================================================
   Activate — delete old caches
   ============================================================ */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

/* ============================================================
   Fetch — cache-first, network fallback
   ============================================================ */
self.addEventListener('fetch', event => {
  /* Only handle GET requests */
  if (event.request.method !== 'GET') return;

  /* Skip cross-origin requests (Google Fonts etc) */
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) {
    /* For Google Fonts: try network, fall back gracefully */
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
      event.respondWith(
        caches.open(CACHE_NAME + '-fonts').then(fontCache =>
          fontCache.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(response => {
              fontCache.put(event.request, response.clone());
              return response;
            }).catch(() => new Response('', { status: 408 }));
          })
        )
      );
    }
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cached => {
        if (cached) return cached;

        /* Not in cache — fetch from network and cache it */
        return fetch(event.request)
          .then(response => {
            /* Only cache valid responses */
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            const toCache = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, toCache));
            return response;
          })
          .catch(() => {
            /* Offline fallback for HTML pages */
            if (event.request.headers.get('accept')?.includes('text/html')) {
              return caches.match('/wired-differently/index.html');

            }
          });
      })
  );
});
