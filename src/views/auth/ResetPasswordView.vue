<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Lock, CheckCircle, XCircle, ArrowRight, Loader2 } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import api from '@/services/api'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const password = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const isValidating = ref(true)
const error = ref('')
const tokenError = ref('')
const success = ref(false)

// Get token from URL query params
const token = route.query.token as string

onMounted(async () => {
  if (!token) {
    tokenError.value = 'Token reset tidak valid atau tidak ditemukan.'
    isValidating.value = false
    return
  }

  // Validate token with backend
  try {
    await api.get(`/auth/validate-reset-token?token=${token}`)
    isValidating.value = false
  } catch (e: any) {
    tokenError.value = e.response?.data?.message || 'Token tidak valid atau sudah kadaluarsa.'
    isValidating.value = false
  }
})

const handleSubmit = async () => {
  if (password.value.length < 6) {
    error.value = 'Password minimal 6 karakter'
    return
  }

  if (password.value !== confirmPassword.value) {
    error.value = 'Password tidak cocok'
    return
  }

  isLoading.value = true
  error.value = ''

  try {
    await api.post('/auth/reset-password', {
      token,
      password: password.value,
    })
    success.value = true
  } catch (e: any) {
    error.value = e.response?.data?.message || 'Terjadi kesalahan. Silakan coba lagi.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
    <div class="absolute inset-0 bg-grid-white/[0.2] bg-[length:20px_20px]" />
    <div class="max-w-md w-full relative z-10">
      <div class="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/20">
        
        <!-- Loading State -->
        <div v-if="isValidating" class="text-center py-10">
          <Loader2 class="mx-auto h-12 w-12 animate-spin text-indigo-600" />
          <h3 class="mt-4 text-lg font-medium text-gray-900">Memvalidasi Token</h3>
          <p class="text-gray-500 text-sm">Mohon tunggu sebentar...</p>
        </div>

        <!-- Token Error State -->
        <div v-else-if="tokenError" class="text-center">
          <div class="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
            <XCircle class="h-8 w-8 text-red-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Link Tidak Valid</h2>
          <p class="text-gray-600 mb-8">{{ tokenError }}</p>
          <div class="space-y-3">
            <Button @click="router.push('/forgot-password')" class="w-full bg-indigo-600 hover:bg-indigo-700"> Minta Link Baru </Button>
            <Button variant="outline" @click="router.push('/login')" class="w-full">
              Kembali ke Login
            </Button>
          </div>
        </div>

        <!-- Success State -->
        <div v-else-if="success" class="text-center">
          <div class="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-6">
            <CheckCircle class="h-8 w-8 text-green-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Password Berhasil Diubah!</h2>
          <p class="text-gray-600 mb-8">
            Password Anda telah berhasil diperbarui. Silakan login dengan password baru Anda.
          </p>
          <Button class="w-full bg-indigo-600 hover:bg-indigo-700" @click="router.push('/login')"> 
            Login Sekarang 
            <ArrowRight class="ml-2 h-4 w-4" />
          </Button>
        </div>

        <!-- Form State -->
        <div v-else>
          <div class="text-center mb-8">
            <div class="mx-auto h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
              <Lock class="h-6 w-6 text-indigo-600" />
            </div>
            <h2 class="text-2xl font-bold text-gray-900">Reset Password</h2>
            <p class="text-sm text-gray-600">Masukkan password baru untuk akun Anda.</p>
          </div>

          <form class="space-y-6" @submit.prevent="handleSubmit">
            <div class="space-y-4">
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 mb-1">
                  Password Baru
                </label>
                <div class="relative">
                  <input
                    id="password"
                    v-model="password"
                    type="password"
                    required
                    class="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    placeholder="Minimal 6 karakter"
                  />
                </div>
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 mb-1">
                  Konfirmasi Password
                </label>
                <div class="relative">
                  <input
                    id="confirmPassword"
                    v-model="confirmPassword"
                    type="password"
                    required
                    class="block w-full px-4 py-3 rounded-lg border border-gray-300 bg-white/50 focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                    placeholder="Ulangi password baru"
                  />
                </div>
              </div>
            </div>

            <div v-if="error" class="p-4 rounded-lg bg-red-50 border border-red-100 flex items-start">
              <XCircle class="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              <span class="text-sm text-red-700">{{ error }}</span>
            </div>

            <Button type="submit" :disabled="isLoading" class="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base shadow-lg hover:shadow-indigo-500/30 transition-all">
              <Loader2 v-if="isLoading" class="mr-2 h-5 w-5 animate-spin" />
              {{ isLoading ? 'Menyimpan Perubahan...' : 'Simpan Password Baru' }}
            </Button>
          </form>
        </div>
      </div>
          
      <div class="mt-8 text-center">
        <p class="text-white/80 text-sm">
          &copy; {{ new Date().getFullYear() }} Student Track Record. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>
