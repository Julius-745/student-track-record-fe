<script setup lang="ts">
import { computed } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'
import { User, Mail, Briefcase, Shield, IdCard } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import Button from '@/components/ui/Button.vue'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()
const { user } = storeToRefs(authStore)

const roleLabel = computed(() => {
  return user.value?.role === 'admin' ? 'Administrator' : 'Guru'
})

const roleColor = computed(() => {
  return user.value?.role === 'admin'
    ? 'bg-purple-100 text-purple-800'
    : 'bg-blue-100 text-blue-800'
})

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="max-w-2xl mx-auto space-y-6">
    <!-- Header -->
    <div class="text-center">
      <h2 class="text-2xl font-bold tracking-tight text-gray-900">Profil Pengguna</h2>
      <p class="text-gray-500 mt-1">Informasi akun Anda</p>
    </div>

    <!-- Profile Card -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <!-- Avatar Section -->
      <div class="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
        <div class="flex flex-col items-center">
          <div
            class="h-24 w-24 rounded-full overflow-hidden bg-white shadow-lg flex items-center justify-center"
          >
            <img
              src="/android/android-launchericon-512-512.png"
              class="h-full w-full object-cover scale-125"
              alt="icon"
            />
          </div>
          <h3 class="mt-4 text-xl font-semibold text-white">{{ user?.nama || 'User' }}</h3>
          <span
            class="mt-2 inline-flex items-center rounded-full px-3 py-1 text-sm font-medium"
            :class="roleColor"
          >
            <Shield class="mr-1.5 h-4 w-4" />
            {{ roleLabel }}
          </span>
        </div>
      </div>

      <!-- Info Section -->
      <div class="p-6 space-y-4">
        <div class="grid gap-4">
          <!-- Email -->
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail class="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Email</p>
              <p class="text-gray-900">{{ user?.email || '-' }}</p>
            </div>
          </div>

          <!-- NIP -->
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <IdCard class="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">NIP</p>
              <p class="text-gray-900">{{ user?.nip || '-' }}</p>
            </div>
          </div>

          <!-- Posisi -->
          <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div class="flex-shrink-0">
              <div class="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Briefcase class="h-5 w-5 text-orange-600" />
              </div>
            </div>
            <div>
              <p class="text-sm font-medium text-gray-500">Posisi</p>
              <p class="text-gray-900">{{ user?.posisi || '-' }}</p>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="pt-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3">
          <Button variant="outline" class="flex-1" @click="router.push('/profile/change-password')">
            Ubah Password
          </Button>
          <Button variant="destructive" class="flex-1" @click="handleLogout"> Keluar </Button>
        </div>
      </div>
    </div>
  </div>
</template>
