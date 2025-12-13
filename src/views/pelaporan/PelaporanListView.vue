<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useDataStore } from '@/stores/useDataStore'
import { useModalStore } from '@/stores/useModalStore'
import DataTable from '@/components/ui/DataTable.vue'
import Button from '@/components/ui/Button.vue'
import { Plus, Eye, User, FileText } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

const dataStore = useDataStore()
const modalStore = useModalStore()
const { pelaporan, siswa, guru, isLoading } = storeToRefs(dataStore)

onMounted(() => {
  // Ensure we have joined data
  if (siswa.value.length === 0 || guru.value.length === 0 || pelaporan.value.length === 0) {
    dataStore.fetchInitialData()
  }
})

// Join data for display (naive client-side join)
const joinedPelaporan = computed(() => {
  return pelaporan.value.map((report) => {
    const s = siswa.value.find((s) => s.id === report.siswa_id)
    const g = guru.value.find((g) => g.id === report.guru_id)
    return {
      ...report,
      nama_siswa: s ? s.nama : 'Unknown',
      nama_guru: g ? g.nama : 'Unknown',
      tanggal: new Date(report.tanggal).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }),
    }
  })
})

const columns = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'jenis_pelaporan', label: 'Jenis' },
  { key: 'nama_siswa', label: 'Siswa' },
  { key: 'nama_guru', label: 'Pelapor' },
  { key: 'poin', label: 'Poin' },
  // { key: 'actions', label: 'Detail', class: 'text-right' }, // Placeholder for detail view
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
      <template #jenis="{ item }">
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          :class="
            item.jenis === 'prestasi' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          "
        >
          <Trophy v-if="item.jenis === 'prestasi'" class="mr-1 h-3 w-3" />
          <AlertTriangle v-else class="mr-1 h-3 w-3" />
          {{ item.jenis === 'prestasi' ? 'Prestasi' : 'Pelanggaran' }}
        </span>
      </template>
    </DataTable>
  </div>
</template>
