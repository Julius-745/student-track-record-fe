<script setup lang="ts">
import { onMounted, computed, watch, ref } from 'vue'
import { useDataStore } from '@/stores/useDataStore'
import { useModalStore } from '@/stores/useModalStore'
import DataTable from '@/components/ui/DataTable.vue'
import Button from '@/components/ui/Button.vue'
import { watchDebounced } from '@vueuse/core'
import { Plus, Trophy, AlertTriangle } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

const dataStore = useDataStore()
const modalStore = useModalStore()
const search = ref('')
const page = ref(1)
const { pelaporan, isLoading } = storeToRefs(dataStore)

const fetchPelaporan = () => {
  dataStore.fetchPelaporan({
    page: page.value,
    limit: 10,
    search: search.value,
  })
}

// Watch search with debounce
watchDebounced(
  search,
  () => {
    page.value = 1
    fetchPelaporan()
  },
  { debounce: 500, maxWait: 1000 },
)

watch(page, () => {
  fetchPelaporan()
})

onMounted(() => {
  // Always fetch fresh data on mount to ensure store is sync
  fetchPelaporan()
})

// Transform data for display - backend already joins siswa and guru
const joinedPelaporan = computed(() => {
  return pelaporan.value.map((report: any) => {
    return {
      ...report,
      nama_siswa: report.siswa?.nama || 'Unknown',
      nama_guru: report.guru?.nama || 'Unknown',
      tanggal_display: new Date(report.tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    }
  })
})

const columns = [
  { key: 'tanggal_display', label: 'Tanggal' },
  { key: 'jenis_pelaporan', label: 'Jenis' },
  { key: 'nama_siswa', label: 'Siswa' },
  { key: 'nama_guru', label: 'Pelapor' },
  { key: 'deskripsi', label: 'Deskripsi' },
]

const openCreateModal = () => {
  modalStore.openModal('ADD_REPORT')
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">Riwayat Pelaporan</h2>
        <p class="text-gray-500">Catatan prestasi dan pelanggaran siswa</p>
      </div>
      <Button @click="openCreateModal">
        <Plus class="mr-2 h-4 w-4" />
        Buat Laporan
      </Button>
    </div>

    <DataTable :columns="columns" :data="joinedPelaporan" :is-loading="isLoading">
      <template #jenis_pelaporan="{ item }">
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          :class="
            item.jenis_pelaporan === 'prestasi'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          "
        >
          <Trophy v-if="item.jenis_pelaporan === 'prestasi'" class="mr-1 h-3 w-3" />
          <AlertTriangle v-else class="mr-1 h-3 w-3" />
          {{ item.jenis_pelaporan === 'prestasi' ? 'Prestasi' : 'Pelanggaran' }}
        </span>
      </template>
    </DataTable>
  </div>
</template>
