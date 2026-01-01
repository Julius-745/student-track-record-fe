// src/stores/useAuthStore.ts
import { defineStore } from 'pinia'
import type { Guru } from '@/types'
import api, { setAuthToken, setRefreshToken } from '@/services/api'
import { ref, computed } from 'vue'
import { jwtDecode } from 'jwt-decode'
import { useAlert } from '@/lib/useAlert'
import { set as idbSet, get as idbGet, del as idbDel } from 'idb-keyval'

interface JWTPayload {
  exp: number
  iat: number
  sub: string
  email: string
  role: string
}

export const useAuthStore = defineStore(
  'auth',
  () => {
    const { showError, showSuccess } = useAlert()
    const user = ref<Guru | null>(null)
    const accessToken = ref<string | null>(null)
    const refreshTokenTimeout = ref<number | null>(null)
    const isOnline = ref(navigator.onLine)

    const isAuthenticated = computed(() => !!accessToken.value && !isTokenExpired())

    // Listen to online/offline events
    window.addEventListener('online', () => {
      isOnline.value = true
      // Try to refresh token when coming back online
      if (accessToken.value && isTokenExpired()) {
        refreshToken()
      }
    })

    window.addEventListener('offline', () => {
      isOnline.value = false
    })

    function isTokenExpired(): boolean {
      if (!accessToken.value) return true

      try {
        const decoded = jwtDecode<JWTPayload>(accessToken.value)
        const currentTime = Math.floor(Date.now() / 1000)
        return decoded.exp < currentTime
      } catch (error) {
        return true
      }
    }

    function getTokenExpiryTime(): number | null {
      if (!accessToken.value) return null

      try {
        const decoded = jwtDecode<JWTPayload>(accessToken.value)
        return decoded.exp * 1000
      } catch (error) {
        return null
      }
    }

    function startRefreshTokenTimer() {
      if (refreshTokenTimeout.value) {
        clearTimeout(refreshTokenTimeout.value)
      }

      const expiryTime = getTokenExpiryTime()
      if (!expiryTime) return

      const timeout = expiryTime - Date.now() - 60 * 1000

      if (timeout > 0) {
        refreshTokenTimeout.value = window.setTimeout(() => {
          refreshToken()
        }, timeout)
      } else {
        refreshToken()
      }
    }

    function stopRefreshTokenTimer() {
      if (refreshTokenTimeout.value) {
        clearTimeout(refreshTokenTimeout.value)
        refreshTokenTimeout.value = null
      }
    }

    // Sync token to IndexedDB for Service Worker access
    async function syncTokenToServiceWorker(token: string | null) {
      try {
        if (token) {
          await idbSet('auth_token', token)
        } else {
          await idbDel('auth_token')
        }

        // Notify service worker about token change
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({
            type: 'TOKEN_UPDATE',
            token: token,
          })
        }
      } catch (error) {
        console.error('Failed to sync token to service worker:', error)
      }
    }

    async function login(email: string, pass: string) {
      // Check if online
      if (!isOnline.value) {
        const msg = 'Tidak ada koneksi internet. Silakan coba lagi.'
        showError(msg)
        throw new Error(msg)
      }

      try {
        const res = await api.post('/auth/login', { email, password: pass })
        const { user: userData, accessToken: token } = res.data

        // Store token in memory only (more secure than localStorage)
        accessToken.value = token
        setAuthToken(token) // Update API token
        user.value = userData
        
        // Sync to IndexedDB for service worker
        await syncTokenToServiceWorker(token)
        
        // Start automatic token refresh
        startRefreshTokenTimer()

        showSuccess('Login Berhasil')
        return userData
      } catch (error: any) {
        console.error('Login error:', error)
        if (error.response && error.response.status === 401) {
          showError('Email atau password salah')
          
          throw new Error('Email atau password salah')
        }
        const msg = error.response?.data?.message || error.message || 'Terjadi kesalahan sistem'
        showError(msg)
        throw new Error(msg)
      }
    }

    async function refreshToken() {
      // Don't attempt refresh if offline
      if (!isOnline.value) {
        console.log('Offline - skipping token refresh')
        return false
      }

      try {
        const res = await api.post('/auth/refresh')
        const { accessToken: newToken, user: userData } = res.data

        accessToken.value = newToken
        setAuthToken(newToken) // Update API token

        if (userData) {
          user.value = userData
        }

        // Sync to IndexedDB for service worker
        await syncTokenToServiceWorker(newToken)

        startRefreshTokenTimer()

        return true
      } catch (error) {
        console.error('Token refresh failed:', error)
        logout()
        return false
      }
    }

    async function logout() {
      stopRefreshTokenTimer()
      
      api.post('/auth/logout').catch(() => {})
      
      accessToken.value = null
      setAuthToken(null) // Clear API token
      
      user.value = null
      
      // Clear from IndexedDB
      await syncTokenToServiceWorker(null)
      
      showSuccess('Berhasil logout')
    }

    // Try to restore session on app startup
    async function checkAuth() {
      try {
        // Try to restore from IndexedDB first (for PWA refresh)
        const storedToken = await idbGet<string>('auth_token')
        
        if (storedToken && !isTokenExpired()) {
          accessToken.value = storedToken
          setAuthToken(storedToken) // Set API token immediately
          // Still try to refresh to get latest user data
        }

        // Try to get a new access token using refresh token (in HttpOnly cookie)
        const res = await api.post('/auth/refresh')
        const { accessToken: token, refreshToken: refreshToken, user: userData } = res.data

        accessToken.value = token
        setAuthToken(token)
        setRefreshToken(refreshToken) // Update API token
        user.value = userData
        
        await syncTokenToServiceWorker(token)
        
        startRefreshTokenTimer()
        
        return true
      } catch (error) {
        console.log('Session check failed')
        // No valid refresh token, user needs to login
        accessToken.value = null
        setAuthToken(null)
        user.value = null
        await syncTokenToServiceWorker(null)
        return false
      }
    }

    return {
      user,
      accessToken,
      isAuthenticated,
      isOnline,
      login,
      logout,
      checkAuth,
      refreshToken,
      isTokenExpired,
      startRefreshTokenTimer,
      stopRefreshTokenTimer,
    }
  },
  {
    persist: {
      // @ts-ignore
      paths: ['user'],
    },
  },
)