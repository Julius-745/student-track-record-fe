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
const jenis_pelaporan = ref('')
const page = ref(1)
const orderBy = ref('created_at')
const order = ref<'ASC' | 'DESC'>('DESC')
const { pelaporan, pelaporanMeta, isLoading } = storeToRefs(dataStore)

const fetchPelaporan = () => {
  dataStore.fetchPelaporan({
    page: page.value,
    limit: 10,
    search: search.value,
    jenis_pelaporan: jenis_pelaporan.value || undefined,
    orderBy: orderBy.value,
    order: order.value,
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

watch(jenis_pelaporan, () => {
  page.value = 1
  fetchPelaporan()
})

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
  { key: 'tanggal', label: 'Tanggal', sortable: true },
  { key: 'jenis_pelaporan', label: 'Jenis', sortable: true },
  { key: 'siswa.nama', label: 'Siswa', sortable: true },
  { key: 'guru.nama', label: 'Pelapor', sortable: true },
  { key: 'deskripsi', label: 'Deskripsi', sortable: true },
]

const handleSort = (payload: { orderBy: string; order: 'ASC' | 'DESC' }) => {
  orderBy.value = payload.orderBy
  order.value = payload.order
  fetchPelaporan()
}

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

    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative w-full sm:w-64">
        <input
          v-model="search"
          type="text"
          placeholder="Cari Nama Siswa / Guru / Deskripsi ..."
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div class="w-full sm:w-48">
        <select
          v-model="jenis_pelaporan"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Semua Jenis</option>
          <option v-for="cls in ['prestasi', 'pelanggaran']" :key="cls" :value="cls">
            {{ cls }}
          </option>
        </select>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :data="joinedPelaporan"
      :is-loading="isLoading"
      :order-by="orderBy"
      :order="order"
      @sort="handleSort"
    >
      <template #tanggal="{ item }">
        {{ item.tanggal_display }}
      </template>
      <template #["siswa.nama"]="{ item }">
        {{ item.nama_siswa }}
      </template>
      <template #["guru.nama"]="{ item }">
        {{ item.nama_guru }}
      </template>
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
      <template #deskripsi="{ item }">
        <span class="font-bold">
          {{ item.deskripsi }}
        </span>
      </template>
    </DataTable>

    <div
      class="flex items-center justify-between border-t border-gray-200 pt-4"
      v-if="pelaporanMeta"
    >
      <div class="text-sm text-gray-700">
        Menampilkan halaman <span class="font-medium">{{ pelaporanMeta.page }}</span> dari
        <span class="font-medium">{{ pelaporanMeta.last_page }}</span>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" :disabled="pelaporanMeta.page === 1" @click="page--">
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="pelaporanMeta.page === pelaporanMeta.last_page"
          @click="page++"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>
