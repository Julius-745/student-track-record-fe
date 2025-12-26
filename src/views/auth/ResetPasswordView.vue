<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Lock, CheckCircle, XCircle } from 'lucide-vue-next'
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
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Loading State -->
      <div v-if="isValidating" class="text-center">
        <div
          class="animate-spin mx-auto h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full"
        ></div>
        <p class="mt-4 text-gray-600">Memvalidasi token...</p>
      </div>

      <!-- Token Error State -->
      <div v-else-if="tokenError" class="text-center">
        <div class="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
          <XCircle class="h-8 w-8 text-red-600" />
        </div>
        <h2 class="mt-6 text-2xl font-bold text-gray-900">Link Tidak Valid</h2>
        <p class="mt-2 text-gray-600">{{ tokenError }}</p>
        <div class="mt-6 space-y-3">
          <Button @click="router.push('/forgot-password')" class="w-full"> Minta Link Baru </Button>
          <Button variant="outline" @click="router.push('/login')" class="w-full">
            Kembali ke Login
          </Button>
        </div>
      </div>

      <!-- Success State -->
      <div v-else-if="success" class="text-center">
        <div class="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
          <CheckCircle class="h-8 w-8 text-green-600" />
        </div>
        <h2 class="mt-6 text-2xl font-bold text-gray-900">Password Berhasil Diubah!</h2>
        <p class="mt-2 text-gray-600">
          Password Anda telah berhasil diperbarui. Silakan login dengan password baru Anda.
        </p>
        <Button class="mt-6" @click="router.push('/login')"> Login Sekarang </Button>
      </div>

      <!-- Form State -->
      <div v-else>
        <div class="text-center">
          <div class="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
            <Lock class="h-8 w-8 text-blue-600" />
          </div>
          <h2 class="mt-6 text-2xl font-bold text-gray-900">Reset Password</h2>
          <p class="mt-2 text-gray-600">Masukkan password baru Anda.</p>
        </div>

        <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
          <div class="space-y-4">
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password Baru
              </label>
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Minimal 6 karakter"
              />
            </div>

            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
                Konfirmasi Password
              </label>
              <input
                id="confirmPassword"
                v-model="confirmPassword"
                type="password"
                required
                class="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ulangi password baru"
              />
            </div>
          </div>

          <div v-if="error" class="text-red-600 text-sm text-center bg-red-50 py-2 rounded-lg">
            {{ error }}
          </div>

          <Button type="submit" :disabled="isLoading" class="w-full">
            {{ isLoading ? 'Menyimpan...' : 'Simpan Password Baru' }}
          </Button>
        </form>
      </div>
    </div>
  </div>
</template>
