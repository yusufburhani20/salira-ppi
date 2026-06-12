// ─── SALIRA Service Worker — Full PWA ────────────────────────────────────────
// Strategi:
//   • Aset statis (JS/CSS/image dari /build/) → Cache First (performa terbaik)
//   • Font eksternal (bunny.net)              → Stale While Revalidate
//   • Navigasi halaman                        → Network First + offline fallback
//   • Inertia XHR & API calls                → Network Only (auth sensitive)
// ─────────────────────────────────────────────────────────────────────────────

const CACHE_VERSION = 'salira-pwa-v2';
const STATIC_CACHE  = `${CACHE_VERSION}-static`;
const FONT_CACHE    = `${CACHE_VERSION}-fonts`;

// Aset yang selalu di-pre-cache saat install
const PRECACHE_ASSETS = [
  '/offline.html',
  '/favicon.ico',
  '/images/Salira.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/manifest.json',
];

// ─── INSTALL ─────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  // Aktifkan SW baru langsung tanpa tunggu tab lama ditutup
  self.skipWaiting();
});

// ─── ACTIVATE ────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !name.startsWith(CACHE_VERSION))
          .map((name) => {
            console.log('[PWA] Menghapus cache lama:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Ambil kendali semua tab yang sudah terbuka tanpa perlu refresh
  self.clients.claim();
});

// ─── FETCH ───────────────────────────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ① Hanya tangani GET request dari origin yang sama atau font bunny.net
  if (request.method !== 'GET') return;

  const isSameOrigin = url.origin === self.location.origin;
  const isBunnyFont  = url.hostname === 'fonts.bunny.net';

  if (!isSameOrigin && !isBunnyFont) return;

  // ② Bypass total untuk Inertia XHR — biarkan browser & Inertia handle sendiri
  if (request.headers.has('X-Inertia')) return;

  // ③ Font → Stale While Revalidate
  if (isBunnyFont) {
    event.respondWith(staleWhileRevalidate(request, FONT_CACHE));
    return;
  }

  // ④ Aset statis dari Vite build (/build/...) → Cache First
  if (url.pathname.startsWith('/build/') || url.pathname.startsWith('/images/') || url.pathname === '/favicon.ico') {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // ⑤ Navigasi halaman (buka URL di browser) → Network First + offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // ⑥ Semua lainnya (API calls, dll) → Network Only
  // Biarkan pass-through, tidak di-intercept
});

// ─── STRATEGY: Cache First ───────────────────────────────────────────────────
// Cocok untuk aset yang jarang berubah (JS/CSS dengan hash, gambar)
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) return cachedResponse;

  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch {
    // Tidak ada cache, tidak ada jaringan → browser handle error
    return new Response('Aset tidak tersedia offline.', { status: 503 });
  }
}

// ─── STRATEGY: Stale While Revalidate ────────────────────────────────────────
// Sajikan dari cache segera, perbarui cache di background
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  }).catch(() => null);

  return cachedResponse || fetchPromise;
}

// ─── STRATEGY: Network First + Offline Fallback ───────────────────────────────
// Coba jaringan dulu. Kalau gagal → tampilkan /offline.html
async function networkFirstWithOfflineFallback(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch {
    // Jaringan gagal → coba cache dulu
    const cachedPage = await caches.match(request);
    if (cachedPage) return cachedPage;

    // Tidak ada cache → tampilkan halaman offline
    const offlinePage = await caches.match('/offline.html');
    return offlinePage || new Response('<h1>Anda sedang offline</h1>', {
      headers: { 'Content-Type': 'text/html' },
    });
  }
}

// ─── PUSH NOTIFICATIONS ──────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('[PWA SW] Push event received with no data.');
    return;
  }

  let data = {};
  try {
    data = event.data.json();
  } catch (e) {
    data = {
      title: 'SALIRA',
      body: event.data.text()
    };
  }

  const title = data.title || 'SALIRA';
  const options = {
    body: data.body || '',
    icon: data.icon || '/images/icon-192.png',
    badge: data.badge || '/favicon.ico',
    data: {
      action_url: data.action_url || '/dashboard'
    },
    // Vibrate patterns on supported devices
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Buka Aplikasi' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const actionUrl = event.notification.data?.action_url || '/dashboard';
  const targetUrl = new URL(actionUrl, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window open with this origin
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url === targetUrl && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If a window is open on a different page of the same origin, navigate & focus
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if ('focus' in client && 'navigate' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      // If no windows are open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
