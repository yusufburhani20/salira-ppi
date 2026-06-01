const CACHE_NAME = 'salira-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/favicon.ico',
  '/images/Salira.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/manifest.json'
];

// Event Install - menyimpan aset statis utama ke dalam cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Event Activate - membersihkan cache versi lama jika ada
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Event Fetch - Memprioritaskan Jaringan, jika gagal/offline mengambil dari Cache
self.addEventListener('fetch', (event) => {
  // Hanya proses request bermetode GET dan yang berasal dari domain yang sama
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        // Jika offline atau jaringan gagal, cari kecocokan di cache
        return caches.match(event.request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
        });
      })
  );
});
