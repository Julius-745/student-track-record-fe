<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useModalStore } from '@/stores/useModalStore'
import api from '@/services/api'
import type { Siswa } from '@/types'
import Button from '@/components/ui/Button.vue'
import { ArrowLeft, Plus, User } from 'lucide-vue-next'
import DataTable from '@/components/ui/DataTable.vue'

const route = useRoute()
const modalStore = useModalStore()
const siswa = ref<Siswa | null>(null)
const isLoading = ref(false)

const fetchDetail = async () => {
  isLoading.value = true
  try {
    const res = await api.get(`/siswa/${route.params.id}`)
    siswa.value = res.data
  } catch (e) {
    console.error(e)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchDetail()
})

const openAddLaporanModal = () => {
  // Pass siswa data to modal context if needed, or handle in store
  modalStore.openModal('ADD_REPORT', siswa.value)
}

const columns = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'jenis_pelaporan', label: 'Jenis' },
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'guru_nama', label: 'Pelapor' }, // Need to map this
]
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-4">
      <Button variant="ghost" size="icon" @click="$router.push('/siswa')">
        <ArrowLeft class="h-5 w-5 text-gray-500" />
      </Button>
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">Detail Siswa</h2>
        <p class="text-gray-500">Informasi lengkap dan riwayat laporan siswa</p>
      </div>
    </div>

    <div v-if="isLoading" class="flex justify-center py-12">
      <div
        class="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"
      ></div>
    </div>

    <div v-else-if="siswa" class="grid gap-6 lg:grid-cols-3">
      <!-- Profile Card -->
      <div class="lg:col-span-1 space-y-6">
        <div class="rounded-xl border bg-white p-6 shadow-sm">
          <div class="flex flex-col items-center">
            <div class="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center mb-4">
              <User class="h-12 w-12 text-blue-600" />
            </div>
            <h3 class="text-xl font-bold text-gray-900">{{ siswa.nama }}</h3>
            <p class="text-gray-500">{{ siswa.nipd }}</p>
            <span
              class="mt-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
            >
              Kelas {{ siswa.rombel }}
            </span>
          </div>

          <div class="mt-6 border-t border-gray-100 pt-6 space-y-3">
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Jenis Kelamin</span>
              <span class="font-medium text-gray-900">{{
                siswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'
              }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">No HP</span>
              <span class="font-medium text-gray-900">{{ siswa.no_hp || '-' }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Alamat</span>
              <span class="font-medium text-gray-900 text-right truncate w-40">{{
                siswa.alamat || '-'
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Laporan Table -->
      <div class="lg:col-span-2 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Riwayat Laporan</h3>
          <Button @click="openAddLaporanModal">
            <Plus class="mr-2 h-4 w-4" />
            Tambah Laporan
          </Button>
        </div>

        <DataTable
          :columns="columns"
          :data="siswa.pelaporans?.map((p) => ({ ...p, guru_nama: p.guru?.nama || '-' })) || []"
          :is-loading="false"
        >
          <template #jenis_pelaporan="{ item }">
            <span
              :class="[
                'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
                item.jenis_pelaporan === 'prestasi'
                  ? 'bg-green-50 text-green-700 ring-green-600/20'
                  : 'bg-red-50 text-red-700 ring-red-600/20',
              ]"
            >
              {{ item.jenis_pelaporan === 'prestasi' ? 'Prestasi' : 'Pelanggaran' }}
            </span>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>
