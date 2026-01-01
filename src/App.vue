<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/useAuthStore'

const authStore = useAuthStore()

onMounted(() => {
  authStore.checkAuth()
})
</script>

<template>
  <RouterView />
</template>
