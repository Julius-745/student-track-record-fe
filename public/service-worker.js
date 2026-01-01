// public/service-worker.js
import { get as idbGet } from 'idb-keyval'
import { useRouter } from 'vue-router'

const router = useRouter()

const CACHE_NAME = 'pwa-cache-v1'
const OFFLINE_URL = '/offline.html'

// Install event - cache offline page
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        OFFLINE_URL,
        '/',
        '/manifest.json',
        // Add other critical assets
      ])
    })
  )
  self.skipWaiting()
})

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Listen for token updates from app
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'TOKEN_UPDATE') {
    // Token is already in IndexedDB, just acknowledge
    console.log('Service worker received token update')
  }
})

// Fetch event - handle requests with authentication
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin API requests
  if (url.origin === self.location.origin && url.pathname.startsWith('/api')) {
    event.respondWith(handleAuthenticatedRequest(request))
  } else {
    // Use cache-first strategy for static assets
    event.respondWith(handleStaticAsset(request))
  }
})

async function handleAuthenticatedRequest(request) {
  try {
    // Get token from IndexedDB
    const token = await idbGet('auth_token')

    // Clone the request and add auth header
    const headers = new Headers(request.headers)
    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const authenticatedRequest = new Request(request, { headers })

    // Try network first
    const response = await fetch(authenticatedRequest)

    // Handle 401 - token expired
    if (response.status === 401) {
      // Token expired, notify app to refresh
      const clients = await self.clients.matchAll()

      clients.forEach((client) => {
        client.postMessage({ type: 'TOKEN_EXPIRED' })
      })

      router.push('/login')
    }

    // Cache successful responses (except auth endpoints)
    if (response.ok && !request.url.includes('/auth/')) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }

    return response
  } catch (error) {
    // Network failed, try cache
    const cached = await caches.match(request)
    if (cached) {
      return cached
    }

    // No cache, return offline page for navigation requests
    if (request.mode === 'navigate') {
      return caches.match(OFFLINE_URL)
    }

    return new Response('Offline', { status: 503 })
  }
}

async function handleStaticAsset(request) {
  // Cache-first strategy for static assets
  const cached = await caches.match(request)
  if (cached) {
    return cached
  }

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME)
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    return new Response('Offline', { status: 503 })
  }
}