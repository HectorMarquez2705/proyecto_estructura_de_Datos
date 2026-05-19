/* miMicro — Service Worker v1 */
const CACHE = 'mimicro-v1';

const PRECACHE = [
  '/',
  '/splash/',
  '/login/',
  '/static/global.css',
  '/static/manifest.json',
  '/static/icons/icon-192.png',
  '/static/icons/icon-512.png',
  '/static/icons/apple-touch-icon.png',
  '/static/shared/auth.js',
  '/static/shared/api.js',
  '/static/shared/layout.js',
  '/static/shared/socket.js',
  '/static/favicon.svg',
];

/* ── Instalación: pre-cachear assets estáticos ─────────────── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

/* ── Activación: eliminar caches viejas ─────────────────────── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Intercepción de requests ─────────────────────────────── */
const API_PREFIXES = [
  '/auth/', '/lineas/', '/micros/', '/gps/', '/routing/',
  '/notificaciones/', '/eta/', '/rutas/', '/tarjeta/',
  '/socket.io/',
];

self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);

  /* Ignorar: no-GET, otros orígenes, devtools */
  if (request.method !== 'GET') return;
  if (url.origin !== self.location.origin) return;

  /* Endpoints de API → Network-first (sin caché) */
  if (API_PREFIXES.some(p => url.pathname.startsWith(p))) {
    e.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  /* Assets estáticos y páginas → Cache-first, luego Network */
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;

      return fetch(request).then(response => {
        /* Solo cachear respuestas OK del mismo origen */
        if (
          response &&
          response.status === 200 &&
          response.type === 'basic'
        ) {
          const clone = response.clone();
          caches.open(CACHE).then(c => c.put(request, clone));
        }
        return response;
      }).catch(() => {
        /* Sin red y sin caché → mostrar splash offline */
        return caches.match('/splash/') || caches.match('/');
      });
    })
  );
});
