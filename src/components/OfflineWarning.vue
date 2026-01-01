<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { WifiOff, Wifi } from 'lucide-vue-next'

const isOnline = ref(navigator.onLine)
const showReconnectedMessage = ref(false)
let reconnectedTimeout: number | null = null

const updateOnlineStatus = () => {
  const wasOffline = !isOnline.value
  isOnline.value = navigator.onLine

  // Show "reconnected" message briefly when coming back online
  if (wasOffline && isOnline.value) {
    showReconnectedMessage.value = true

    if (reconnectedTimeout) {
      clearTimeout(reconnectedTimeout)
    }

    reconnectedTimeout = window.setTimeout(() => {
      showReconnectedMessage.value = false
    }, 3000)
  }
}

onMounted(() => {
  window.addEventListener('online', updateOnlineStatus)
  window.addEventListener('offline', updateOnlineStatus)
})

onUnmounted(() => {
  window.removeEventListener('online', updateOnlineStatus)
  window.removeEventListener('offline', updateOnlineStatus)

  if (reconnectedTimeout) {
    clearTimeout(reconnectedTimeout)
  }
})
</script>

<template>
  <!-- Offline Warning Banner -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform -translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform -translate-y-full opacity-0"
  >
    <div
      v-if="!isOnline"
      class="fixed top-0 left-0 right-0 z-50 bg-error-600 text-white shadow-lg"
      role="alert"
    >
      <div class="container mx-auto px-4 py-3">
        <div class="flex items-center justify-center gap-3">
          <WifiOff class="h-5 w-5 animate-pulse" />
          <div class="flex-1 text-center sm:text-left">
            <p class="font-semibold text-sm sm:text-base">Tidak ada koneksi internet</p>
            <p class="text-xs sm:text-sm opacity-90 mt-0.5">
              Aplikasi memerlukan koneksi internet untuk berfungsi. Mohon periksa koneksi Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Reconnected Message (Brief notification) -->
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="transform translate-y-full opacity-0"
    enter-to-class="transform translate-y-0 opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="transform translate-y-0 opacity-100"
    leave-to-class="transform translate-y-full opacity-0"
  >
    <div
      v-if="showReconnectedMessage"
      class="fixed bottom-20 lg:bottom-8 left-4 right-4 lg:left-auto lg:right-8 z-50"
    >
      <div
        class="bg-success-600 text-white rounded-lg shadow-xl px-4 py-3 max-w-md mx-auto lg:mx-0"
      >
        <div class="flex items-center gap-3">
          <Wifi class="h-5 w-5 flex-shrink-0" />
          <div>
            <p class="font-semibold text-sm">Koneksi kembali!</p>
            <p class="text-xs opacity-90">Anda sudah terhubung ke internet.</p>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>
