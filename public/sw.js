const CACHE = 'forgefit-shell-v1'
const APP_SHELL = ['/', '/index.html', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  const request = event.request
  event.respondWith(
    fetch(request).then((response) => {
      if (response.ok && new URL(request.url).origin === self.location.origin) {
        const copy = response.clone()
        caches.open(CACHE).then((cache) => cache.put(request, copy))
      }
      return response
    }).catch(() => caches.match(request).then((cached) => cached || caches.match('/index.html')))
  )
})
