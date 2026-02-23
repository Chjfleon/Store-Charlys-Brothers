// ═══════════════════════════════════════════════
//  SERVICE WORKER — Charlys Brothers
//  Guarda todo en caché para funcionar sin WiFi
// ═══════════════════════════════════════════════

const CACHE = 'charlys-v3';
const RUNTIME = 'charlys-runtime-v2';

// Recursos core a cachear
const CORE_RESOURCES = [
  '/',
  '/index.html',
  '/offline.html',
  '/icon.png',
  '/icon-512.png',
  '/charlys-brothers-favicon-black.ico'
];

// Recursos externos a cachear en la primera apertura con internet
const CDN_RESOURCES = [
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Familjen+Grotesk:wght@400;500;600;700&display=swap',
];

// ── INSTALL: guarda los recursos CDN en caché ──
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      const core = CORE_RESOURCES.map(url =>
        fetch(url).then(r => { if (r && r.ok) cache.put(url, r); }).catch(() => {})
      );
      const cdn = CDN_RESOURCES.map(url =>
        fetch(url, { mode: 'cors' }).then(r => { if (r && r.ok) cache.put(url, r); }).catch(() => {})
      );
      return Promise.allSettled([...core, ...cdn]);
    }).then(() => self.skipWaiting())
  );
});

// ── ACTIVATE: limpia cachés viejas ──
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// ── FETCH: sirve desde caché si no hay internet ──
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  const url = new URL(e.request.url);

  // Prefer cached response and update in background (stale-while-revalidate)
  const isAsset = CDN_RESOURCES.some(r => e.request.url.startsWith(r)) ||
    url.hostname.includes('fonts.gstatic.com') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico)$/i);

  if (isAsset) {
    e.respondWith(
      caches.match(e.request).then(cached => {
        const network = fetch(e.request).then(resp => {
          if (resp && resp.ok) { const clone = resp.clone(); caches.open(RUNTIME).then(c => c.put(e.request, clone)); }
          return resp;
        }).catch(() => null);
        // return cached if present, otherwise wait for network
        return cached || network;
      })
    );
    return;
  }

  // Navigation: network-first with timeout, fallback to cache then offline page
  if (e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('index.html')) {
    const networkWithTimeout = new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), 3000);
      fetch(e.request).then(resp => { clearTimeout(timeout); resolve(resp); }).catch(() => resolve(null));
    });

    e.respondWith(
      networkWithTimeout.then(resp => {
        if (resp && resp.ok) {
          const clone = resp.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return resp;
        }
        return caches.match(e.request).then(cached => cached || caches.match('/offline.html'));
      })
    );
    return;
  }

  // Default: try cache, then network
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      if (resp && resp.ok) { const clone = resp.clone(); caches.open(RUNTIME).then(c => c.put(e.request, clone)); }
      return resp;
    }).catch(() => caches.match('/offline.html')))
  );
});
