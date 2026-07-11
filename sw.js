/**
 * WIRED DIFFERENTLY — Service Worker
 * Fresh content online, complete-book fallback offline.
 */

const APP_CACHE = 'wired-differently-app-v13';
const ASSET_CACHE = 'wired-differently-assets-v1';
const CACHE_PREFIX = 'wired-differently-';

const scoped = path => new URL(path, self.registration.scope).href;

const APP_FILES = [
  './',
  './index.html',
  './toc.html',
  './offline.html',
  './manifest.json',
  './css/style.css',
  './css/print.css',
  './js/app.js',
  ...Array.from({ length: 27 }, (_, i) =>
    `./chapters/ch${String(i + 1).padStart(2, '0')}.html`)
];

const IMMUTABLE_ASSETS = [
  './images/bookcover.webp',
  './fonts/lora-var.woff2',
  './fonts/lora-var-italic.woff2',
  './fonts/dmsans-var.woff2',
  ...[16, 32, 72, 96, 128, 144, 152, 180, 192, 512]
    .map(size => `./icons/icon-${size}.png`)
];

self.addEventListener('install', event => {
  event.waitUntil(Promise.all([
    caches.open(APP_CACHE).then(cache => cache.addAll(APP_FILES.map(scoped))),
    caches.open(ASSET_CACHE).then(cache => cache.addAll(IMMUTABLE_ASSETS.map(scoped)))
  ]).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key.startsWith(CACHE_PREFIX) &&
          key !== APP_CACHE && key !== ASSET_CACHE)
        .map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(APP_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return (await caches.match(request)) || caches.match(scoped('./offline.html'));
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  const refresh = fetch(request).then(async response => {
    if (response && response.ok) {
      const cache = await caches.open(APP_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  return cached || refresh;
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    const cache = await caches.open(ASSET_CACHE);
    await cache.put(request, response.clone());
  }
  return response;
}

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) return;

  if (event.request.mode === 'navigate' ||
      event.request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(networkFirst(event.request));
    return;
  }

  if (url.pathname.endsWith('.css') || url.pathname.endsWith('.js') ||
      url.pathname.endsWith('manifest.json')) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  event.respondWith(cacheFirst(event.request));
});
