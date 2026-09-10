// React Tunes - Service Worker
// Estrategia: Network First para documentos HTML para recibir cambios inmediatamente,
// Cache First con actualización en background para assets estáticos.
// Los archivos de audio se almacenan en IndexedDB (no en este SW).

const CACHE_NAME = 'react-tunes-v6';

// ==================== INSTALL ====================
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      // Precargar el documento principal
      await cache.add('./').catch(() => {});
      await cache.add('./index.html').catch(() => {});
      await cache.add('./manifest.json').catch(() => {});

      // Auto-descubrir y precachear los assets JS/CSS del build (nombres hasheados)
      try {
        const htmlResponse = await fetch('./index.html', { cache: 'no-store' });
        const html = await htmlResponse.text();
        const assetUrls = [];
        const jsRegex = /src="([^"]+\.js)"/g;
        const cssRegex = /href="([^"]+\.css)"/g;
        const linkRegex = /href="(\.[^"]+\.(?:png|svg|ico|json))"/g;

        let match;
        while ((match = jsRegex.exec(html))) assetUrls.push(match[1]);
        while ((match = cssRegex.exec(html))) assetUrls.push(match[1]);
        while ((match = linkRegex.exec(html))) {
          const u = match[1];
          if (u.includes('.css')) continue;
          assetUrls.push(u);
        }

        console.log('[SW] Precacheando assets del build:', assetUrls);
        await Promise.allSettled(
          assetUrls.map(url => cache.add(url).catch(e => console.warn('[SW] No se pudo cachear:', url, e)))
        );
      } catch (e) {
        console.warn('[SW] No se pudieron descubrir assets:', e);
      }
    })
  );
  self.skipWaiting();
});

// ==================== ACTIVATE ====================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando nueva versión...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => {
            console.log('[SW] Eliminando caché antiguo:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// ==================== FETCH ====================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Google Fonts: cachear si está disponible
  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // Para navegación y documento index.html: Network First para refrescar en móviles
  if (request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html').then(res => res || caches.match('./')))
    );
    return;
  }

  // Cache First con actualización en background (Stale While Revalidate) para otros assets
  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) {
        const fetchUpdate = fetch(request).then(response => {
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        }).catch(() => null);

        event.waitUntil(fetchUpdate);
        return cached;
      }

      return fetch(request).then(response => {
        if (!response || response.status !== 200) return response;

        if (response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {});
        }

        return response;
      }).catch(() => {
        if (request.destination === 'document') {
          return caches.match('./index.html').then(res => res || caches.match('./'));
        }
        return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
      });
    })
  );
});

// ==================== MESSAGES ====================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});