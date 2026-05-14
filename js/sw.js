/**
 * WIRED DIFFERENTLY — Service Worker
 * Full offline capability via cache-first strategy
 * Version the cache name to force updates when files change
 */

const CACHE_NAME = 'wired-differently-v1';

const ASSETS = [
  /* Root */
  '/',
  '/index.html',
  '/toc.html',
  '/manifest.json',

  /* Styles */
  '/css/style.css',
  '/css/print.css',

  /* Scripts */
  '/js/app.js',

  /* Icons */
  '/icons/icon.svg',
  '/icons/icon-16.png',
  '/icons/icon-32.png',
  '/icons/icon-72.png',
  '/icons/icon-96.png',
  '/icons/icon-128.png',
  '/icons/icon-144.png',
  '/icons/icon-152.png',
  '/icons/icon-180.png',
  '/icons/icon-192.png',
  '/icons/icon-512.png',

  /* Chapters */
  '/chapters/ch01.html',
  '/chapters/ch02.html',
  '/chapters/ch03.html',
  '/chapters/ch04.html',
  '/chapters/ch05.html',
  '/chapters/ch06.html',
  '/chapters/ch07.html',
  '/chapters/ch08.html',
  '/chapters/ch09.html',
  '/chapters/ch10.html',
  '/chapters/ch11.html',
  '/chapters/ch12.html',
  '/chapters/ch13.html',
  '/chapters/ch14.html',
  '/chapters/ch15.html',
  '/chapters/ch16.html',
  '/chapters/ch17.html',
  '/chapters/ch18.html',
  '/chapters/ch19.html',
  '/chapters/ch20.html',
  '/chapters/ch21.html',
  '/chapters/ch22.html',
  '/chapters/ch23.html',
  '/chapters/ch24.html',
  '/chapters/ch25.html',
  '/chapters/ch26.html',
  '/chapters/ch27.html',
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
              return caches.match('/index.html');
            }
          });
      })
  );
});
