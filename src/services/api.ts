import axios from 'axios'
import { useAlert } from '@/lib/useAlert'
import router from '@/router'

let authToken: string | null = null
let refreshToken: string | null = null

export const setAuthToken = (token: string | null) => {
  authToken = token
}

export const setRefreshToken = (token: string | null) => {
  refreshToken = token
}

// Create an axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    // Inject token if it exists
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { showError } = useAlert()

    // Handle global errors like 401 Unauthorized
    if (error.response) {
      if (error.response.status === 401) {
        // Clear auth tokens
        authToken = null
        refreshToken = null

        // Clear localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')

        // Show error message
        if (!error.config.url.includes('/auth/refresh')) {
          showError('Sesi Anda telah berakhir. Silakan login kembali.')
          router.push('/login')
        }
      } else if (error.response.status >= 500) {
        showError('Terjadi kesalahan pada server. Silakan coba lagi nanti.')
      }
    } else if (error.code === 'ERR_NETWORK') {
      showError('Tidak dapat terhubung ke server. Periksa koneksi internet Anda.')
    }

    return Promise.reject(error)
  },
)

export default api
