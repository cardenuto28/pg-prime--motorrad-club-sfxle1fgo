const CACHE_NAME = 'pg-prime-club-v2'
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.ico',
  '/icons/pwa-192x192.png',
  '/icons/pwa-512x512.png',
  '/icons/apple-touch-icon.png',
  '/offline.html',
]

// Install: Pre-cache basic static assets & app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS).catch((err) => {
          console.warn('[SW] Precaching non-critical error:', err)
        })
      })
      .then(() => self.skipWaiting()),
  )
})

// Activate: Clean old caches and claim clients immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', name)
              return caches.delete(name)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

// Fetch strategy:
// 1. Static assets & icons: Cache First, falling back to Network
// 2. Navigation / HTML pages: Network First, falling back to Cache or offline fallback
// 3. API & Data requests: Network First (or bypass cache for live auth/pocketbase)
self.addEventListener('fetch', (event) => {
  const request = event.request
  const url = new URL(request.url)

  // Skip non-GET requests and PocketBase API requests to avoid stale auth states
  if (request.method !== 'GET') {
    return
  }

  // Bypass PB API endpoints and skip cloud server functions from aggressive caching
  if (
    url.pathname.startsWith('/api/') ||
    url.hostname.includes('pocketbase') ||
    url.hostname.includes('goskip.dev')
  ) {
    return
  }

  // Navigation (HTML pages) -> Network first with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request)
          if (cachedResponse) {
            return cachedResponse
          }
          const offlinePage = await caches.match('/offline.html')
          if (offlinePage) {
            return offlinePage
          }
          return caches.match('/')
        }),
    )
    return
  }

  // Static Assets (Images, Fonts, Scripts, Stylesheets, Icons) -> Cache First with Network Fallback
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/assets/')
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          // Fetch update in background (Stale-While-Revalidate)
          fetch(request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, networkResponse)
                })
              }
            })
            .catch(() => {})
          return cachedResponse
        }

        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseToCache = networkResponse.clone()
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseToCache)
              })
            }
            return networkResponse
          })
          .catch(() => {
            // Fallback for images
            if (request.destination === 'image') {
              return caches.match('/icons/pwa-192x192.png')
            }
          })
      }),
    )
    return
  }

  // Default Network First
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache)
          })
        }
        return response
      })
      .catch(() => caches.match(request)),
  )
})
