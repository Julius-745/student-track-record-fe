<script setup lang="ts">
import { onMounted } from 'vue'
import { useDataStore } from '@/stores/useDataStore'
import { storeToRefs } from 'pinia'
import { Users, FileText } from 'lucide-vue-next'

const dataStore = useDataStore()
const { siswa, pelaporan } = storeToRefs(dataStore)

onMounted(() => {
  dataStore.fetchInitialData()
})
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h2>
    <div class="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <!-- Stats Cards -->
      <div class="rounded-xl border bg-white p-6 shadow-sm flex items-center justify-between">
        <div>
          <h3 class="text-sm font-medium text-gray-500">Total Siswa</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ siswa.length }}</p>
        </div>
        <div class="p-3 bg-blue-50 rounded-full">
          <Users class="h-6 w-6 text-blue-600" />
        </div>
      </div>
      <div class="rounded-xl border bg-white p-6 shadow-sm flex items-center justify-between">
        <div>
          <h3 class="text-sm font-medium text-gray-500">Total Pelaporan</h3>
          <p class="mt-2 text-3xl font-bold text-gray-900">{{ pelaporan.length }}</p>
        </div>
        <div class="p-3 bg-orange-50 rounded-full">
          <FileText class="h-6 w-6 text-orange-600" />
        </div>
      </div>
    </div>
  </div>
</template>
