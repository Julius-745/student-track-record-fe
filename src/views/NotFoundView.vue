<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Home, ArrowLeft } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'

const router = useRouter()

const goBack = () => {
  router.back()
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
    <div class="max-w-max w-full text-center">
      <main>
        <div class="flex flex-col items-center">
          <p class="text-9xl font-black text-blue-600 animate-bounce">404</p>
          <h1 class="mt-4 text-3xl font-bold tracking-tight text-gray-900 sm:text-5xl">Halaman tidak ditemukan</h1>
          <p class="mt-6 text-base leading-7 text-gray-600">Maaf, kami tidak dapat menemukan halaman yang Anda cari. Mungkin halaman tersebut telah dipindahkan atau dihapus.</p>
          
          <div class="mt-10 flex items-center justify-center gap-x-6">
            <Button variant="outline" @click="goBack" class="flex items-center gap-2">
              <ArrowLeft class="h-4 w-4" />
              Kembali
            </Button>
            <Button @click="goHome" class="flex items-center gap-2 shadow-lg shadow-blue-500/20">
              <Home class="h-4 w-4" />
              Halaman Utama
            </Button>
          </div>
        </div>
      </main>
      
      <div class="mt-16 sm:mt-24">
        <p class="text-sm font-semibold text-gray-400 uppercase tracking-wide">&copy; {{ new Date().getFullYear() }} SMPN 4 Probolinggo. All rights reserved.</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}
.animate-bounce {
  animation: bounce 2s infinite;
}
</style>
