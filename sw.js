// Angry Grannies – lar spillet virke uten nett (offline).
// Når du endrer spillet: øk tallet i VERSJON, så henter telefonene den nye versjonen.
const VERSJON = 'angry-grannies-v1';
const FILER = [
  './',
  './index.html',
  './cover.jpg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './manifest.webmanifest'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSJON).then(c => c.addAll(FILER)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSJON).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Viser lagret versjon med en gang (virker offline), og oppdaterer i bakgrunnen når det er nett.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.open(VERSJON).then(cache =>
      cache.match(e.request, { ignoreSearch: true }).then(lagret => {
        const nett = fetch(e.request).then(svar => {
          if (svar && svar.ok && new URL(e.request.url).origin === location.origin) cache.put(e.request, svar.clone());
          return svar;
        }).catch(() => lagret || cache.match('./index.html'));
        return lagret || nett;
      })
    )
  );
});
