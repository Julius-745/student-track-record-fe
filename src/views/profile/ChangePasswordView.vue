<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, CheckCircle } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import api from '@/services/api'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const isLoading = ref(false)
const error = ref('')
const success = ref(false)

const handleSubmit = async () => {
  error.value = ''

  if (!currentPassword.value) {
    error.value = 'Password saat ini harus diisi'
    return
  }

  if (newPassword.value.length < 6) {
    error.value = 'Password baru minimal 6 karakter'
    return
  }

  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Password baru tidak cocok'
    return
  }

  isLoading.value = true

  try {
    await api.post('/auth/change-password', {
      currentPassword: currentPassword.value,
      newPassword: newPassword.value,
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
  <div class="max-w-md mx-auto space-y-6">
    <!-- Header -->
    <div class="flex items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">Ubah Password</h2>
        <p class="text-gray-500">Perbarui password akun Anda</p>
      </div>
    </div>

    <!-- Success State -->
    <div
      v-if="success"
      class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center"
    >
      <div class="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
        <CheckCircle class="h-8 w-8 text-green-600" />
      </div>
      <h3 class="mt-4 text-lg font-semibold text-gray-900">Password Berhasil Diubah!</h3>
      <p class="mt-2 text-gray-600">Password Anda telah berhasil diperbarui.</p>
      <Button class="mt-6" @click="router.push('/profile')"> Kembali ke Profil </Button>
    </div>

    <!-- Form -->
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="currentPassword" class="block text-sm font-medium text-gray-700">
            Password Saat Ini
          </label>
          <input
            id="currentPassword"
            v-model="currentPassword"
            type="password"
            required
            class="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Masukkan password saat ini"
          />
        </div>

        <div>
          <label for="newPassword" class="block text-sm font-medium text-gray-700">
            Password Baru
          </label>
          <input
            id="newPassword"
            v-model="newPassword"
            type="password"
            required
            class="mt-1 appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Minimal 6 karakter"
          />
        </div>

        <div>
          <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
            Konfirmasi Password Baru
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

        <div v-if="error" class="text-red-600 text-sm text-center bg-red-50 py-2 rounded-lg">
          {{ error }}
        </div>

        <div class="pt-4 flex gap-3">
          <Button type="button" variant="outline" class="flex-1" @click="router.push('/profile')">
            Batal
          </Button>
          <Button type="submit" :disabled="isLoading" class="flex-1">
            {{ isLoading ? 'Menyimpan...' : 'Simpan' }}
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>
