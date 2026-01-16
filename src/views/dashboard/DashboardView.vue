<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useDataStore } from '@/stores/useDataStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { storeToRefs } from 'pinia'
import { Users, FileText, Trophy, AlertTriangle, Calendar, Loader2 } from 'lucide-vue-next'

const dataStore = useDataStore()
const { user } = storeToRefs(useAuthStore())
const { siswaMeta } = storeToRefs(dataStore)

const isFiltering = ref(false)
const stats = ref({
  prestasi: 0,
  pelanggaran: 0,
  total: 0,
})

// Default date range: current month
const now = new Date()
const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
const lastDay = new Date().toISOString().split('T')[0]

const startDate = ref(firstDay)
const endDate = ref(lastDay)

const loadStats = async () => {
  isFiltering.value = true
  try {
    const data = await dataStore.fetchStats({
      startDate: startDate.value,
      endDate: endDate.value,
    })
    stats.value = data
  } finally {
    isFiltering.value = false
  }
}

onMounted(async () => {
  await dataStore.fetchInitialData(user.value?.role === 'admin')
  await loadStats()
})

watch([startDate, endDate], loadStats)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">Dashboard</h2>
        <p class="text-gray-500">Ringkasan data dan statistik sekolah</p>
      </div>

      <!-- Date Filter -->
      <div
        class="flex flex-row items-center gap-2 sm:gap-3 bg-white p-2 sm:p-3 rounded-xl border shadow-sm overflow-hidden relative"
      >
        <div
          v-if="isFiltering"
          class="absolute inset-0 bg-white/50 backdrop-blur-[1px] z-10 flex items-center justify-center"
        >
          <Loader2 class="h-4 w-4 text-blue-600 animate-spin" />
        </div>

        <div class="flex items-center gap-1.5 sm:gap-2">
          <Calendar class="hidden xs:block h-4 w-4 text-gray-400" />
          <input
            type="date"
            v-model="startDate"
            class="text-[13px] sm:text-sm border-none focus:ring-0 p-0 w-[105px] sm:w-32 bg-transparent"
          />
        </div>
        <div class="text-gray-300">|</div>
        <div class="flex items-center gap-1.5 sm:gap-2">
          <input
            type="date"
            v-model="endDate"
            class="text-[13px] sm:text-sm border-none focus:ring-0 p-0 w-[105px] sm:w-32 bg-transparent"
          />
        </div>
      </div>
    </div>

    <!-- Stats Grid -->
    <div class="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Total Siswa (Admin Only) -->
      <div
        v-if="user?.role === 'admin'"
        class="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Siswa</p>
            <p class="mt-2 text-3xl font-bold text-gray-900">{{ siswaMeta.total }}</p>
          </div>
          <div
            class="rounded-xl bg-blue-50 p-3 text-blue-600 transition-colors group-hover:bg-blue-100"
          >
            <Users class="h-6 w-6" />
          </div>
        </div>
        <div class="absolute bottom-0 left-0 h-1 w-full bg-blue-600"></div>
      </div>

      <!-- Total Pelaporan -->
      <div
        class="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Total Laporan</p>
            <p
              class="mt-2 text-3xl font-bold text-gray-900 transition-opacity duration-200"
              :class="{ 'opacity-50': isFiltering }"
            >
              {{ stats.total }}
            </p>
          </div>
          <div
            class="rounded-xl bg-orange-50 p-3 text-orange-600 transition-colors group-hover:bg-orange-100"
          >
            <FileText class="h-6 w-6" />
          </div>
        </div>
        <div class="absolute bottom-0 left-0 h-1 w-full bg-orange-600"></div>
        <div class="mt-2 text-xs text-gray-400">Semua laporan dalam periode ini</div>
      </div>

      <!-- Prestasi -->
      <div
        class="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Prestasi</p>
            <p
              class="mt-2 text-3xl font-bold text-green-600 transition-opacity duration-200"
              :class="{ 'opacity-50': isFiltering }"
            >
              {{ stats.prestasi }}
            </p>
          </div>
          <div
            class="rounded-xl bg-green-50 p-3 text-green-600 transition-colors group-hover:bg-green-100"
          >
            <Trophy class="h-6 w-6" />
          </div>
        </div>
        <div class="absolute bottom-0 left-0 h-1 w-full bg-green-600"></div>
      </div>

      <!-- Pelanggaran -->
      <div
        class="group relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-500">Pelanggaran</p>
            <p
              class="mt-2 text-3xl font-bold text-red-600 transition-opacity duration-200"
              :class="{ 'opacity-50': isFiltering }"
            >
              {{ stats.pelanggaran }}
            </p>
          </div>
          <div
            class="rounded-xl bg-red-50 p-3 text-red-600 transition-colors group-hover:bg-red-100"
          >
            <AlertTriangle class="h-6 w-6" />
          </div>
        </div>
        <div class="absolute bottom-0 left-0 h-1 w-full bg-red-600"></div>
      </div>
    </div>

    <!-- Quick Actions / Recent Activity Placeholder (Visual Polish) -->
    <div class="grid gap-6 lg:grid-cols-2">
      <div
        class="rounded-2xl border bg-white p-6 shadow-sm flex flex-col justify-center items-center text-center"
      >
        <div class="bg-blue-50 p-4 rounded-full mb-4">
          <FileText class="h-8 w-8 text-blue-600" />
        </div>
        <h3 class="text-lg font-bold text-gray-900">Butuh Bantuan?</h3>
        <p class="text-sm text-gray-500 mt-1">
          Gunakan menu di samping untuk melihat data siswa atau membuat laporan baru.
        </p>
        <button
          @click="$router.push('/siswa')"
          class="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Lihat Data Siswa
        </button>
      </div>
    </div>
  </div>
</template>
