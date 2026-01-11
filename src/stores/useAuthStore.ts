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
    const refreshTokenValue = ref<string | null>(null)
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
        const { user: userData, accessToken: token, refreshToken: rToken } = res.data

        accessToken.value = token
        refreshTokenValue.value = rToken
        
        setAuthToken(token)
        setRefreshToken(rToken)
        
        user.value = userData
        
        await syncTokenToServiceWorker(token)
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
        const res = await api.post('/auth/refresh', { refreshToken: refreshTokenValue.value })
        const { accessToken: newToken, refreshToken: newRefreshToken, user: userData } = res.data

        accessToken.value = newToken
        refreshTokenValue.value = newRefreshToken || refreshTokenValue.value // Use new or keep old
        
        setAuthToken(newToken)
        setRefreshToken(refreshTokenValue.value)

        if (userData) {
          user.value = userData
        }

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
      refreshTokenValue.value = null
      setAuthToken(null)
      setRefreshToken(null)
      
      user.value = null
      
      await syncTokenToServiceWorker(null)
      
      showSuccess('Berhasil logout')
    }

    // Try to restore session on app startup
    async function checkAuth() {
      // If we already have a valid token in state (restored by pinia-plugin-persistedstate)
      if (accessToken.value && !isTokenExpired()) {
        setAuthToken(accessToken.value)
        setRefreshToken(refreshTokenValue.value)
        startRefreshTokenTimer()
        return true
      }

      // If token is expired or missing, try to refresh
      if (refreshTokenValue.value) {
        try {
          const success = await refreshToken()
          return success
        } catch (error) {
          console.log('Session restore via refresh failed')
          return false
        }
      }

      return false
    }

    return {
      user,
      accessToken,
      refreshTokenValue,
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
      pick: ['user', 'accessToken', 'refreshTokenValue'],
    },
  },
)