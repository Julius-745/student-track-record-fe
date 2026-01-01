import { useAuthStore } from "./stores/useAuthStore"

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/',
      })

      console.log('Service Worker registered:', registration)

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'TOKEN_EXPIRED') {
          // Handle token expiration
          const authStore = useAuthStore()
          authStore.refreshToken()
        }
      })

      // Update on new version
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing
        newWorker?.addEventListener('statechange', () => {
          if (newWorker.state === 'activated') {
            console.log('Service Worker updated')
            // Optionally notify user to refresh
          }
        })
      })
    } catch (error) {
      console.error('Service Worker registration failed:', error)
    }
  }
}