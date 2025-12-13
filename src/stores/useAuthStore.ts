import { defineStore } from 'pinia'
import type { Guru } from '@/types'
import api from '@/services/api'
import { ref } from 'vue'

export const useAuthStore = defineStore(
  'auth',
  () => {
    const user = ref<Guru | null>(null)
    const isAuthenticated = ref(false)

    async function login(email: string, pass: string) {
      try {
        const res = await api.post('/auth/login', { email, password: pass })
        const { user: userData, accessToken } = res.data

        localStorage.setItem('token', accessToken)
        user.value = userData
        isAuthenticated.value = true
      } catch (error: any) {
        console.error('Login error:', error)
        if (error.response && error.response.status === 401) {
          throw new Error('Email atau password salah')
        }
        throw new Error(
          error.response?.data?.message || error.message || 'Terjadi kesalahan sistem',
        )
      }
    }

    function logout() {
      api.post('/auth/logout').catch(() => {})
      localStorage.removeItem('token')
      user.value = null
      isAuthenticated.value = false
    }

    function checkAuth() {
      const token = localStorage.getItem('token')
      if (!token) {
        user.value = null
        isAuthenticated.value = false
      }
      // In real app, verify token with backend here or decoding JWT to get user
    }

    return {
      user,
      isAuthenticated,
      login,
      logout,
      checkAuth,
    }
  },
  {
    persist: true, // Requires pinia-plugin-persistedstate if you want auto persistence, otherwise manual
  },
)
