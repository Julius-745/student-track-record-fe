<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useModalStore } from '@/stores/useModalStore'
import api from '@/services/api'
import type { Siswa } from '@/types'
import Button from '@/components/ui/Button.vue'
import { ArrowLeft, Plus, User, Pencil, Trash2 } from 'lucide-vue-next'
import DataTable from '@/components/ui/DataTable.vue'

const route = useRoute()
const modalStore = useModalStore()
const jenis_pelaporan = ref('')
const siswa = ref<Siswa | null>(null)
const isLoading = ref(false)

const fetchDetail = async (jenis_pelaporan?: string) => {
  isLoading.value = true
  try {
    const res = await api.get(`/siswa/${route.params.id}${jenis_pelaporan ? `?jenis_pelaporan=${jenis_pelaporan}` : ''}`)
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
  if (!siswa.value) return

  modalStore.openModal('ADD_REPORT', {
    siswa_id: siswa.value.id,
    siswa_nama: siswa.value.nama,
    rombel: siswa.value.rombel,
    nipd: siswa.value.nipd,
    tanggal: new Date().toISOString(),
    deskripsi: '',
  })
}

const editPelaporan = (item: unknown) => {
  modalStore.openModal('EDIT_REPORT', item)
}

const handleDelete = (id: string) => {
  modalStore.openModal('CONFIRM_DELETE', {
    id,
    type: 'pelaporan',
    title: 'Hapus Laporan',
    message: 'Apakah Anda yakin ingin menghapus laporan ini?',
  })
}

const columns = [
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'jenis_pelaporan', label: 'Jenis' },
  { key: 'deskripsi', label: 'Deskripsi' },
  { key: 'guru_nama', label: 'Pelapor' },
  { key: 'actions', label: 'Aksi', class: 'text-right' },
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
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Total Prestasi</span>
              <span class="font-medium text-gray-900 text-center w-5 truncate bg-green-100 rounded">{{
                siswa.totalPrestasi || 0
              }}</span>
            </div>
             <div class="flex justify-between text-sm">
              <span class="text-gray-500">Total Pelanggaran</span>
              <span class="font-medium text-gray-900 text-center w-5 truncate bg-red-100 rounded">{{
                siswa.totalPelanggaran || 0
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Laporan Table -->
      <div class="lg:col-span-2 space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold text-gray-900">Riwayat Laporan</h3>
          <div class="flex flex-row gap-5">
          <select  v-model="jenis_pelaporan" @change="fetchDetail(jenis_pelaporan)"
          class="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600">
            <option selected value="">Semua</option>
            <option value="prestasi">Prestasi</option>
            <option value="pelanggaran">Pelanggaran</option>
          </select>
          <Button @click="openAddLaporanModal">
            <Plus class="mr-2 h-4 w-4" />
            Tambah Laporan
          </Button>
          </div>
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

          <template #actions="{ item }">
            <div class="flex justify-end gap-2">
              <Button variant="outline" size="icon" @click="editPelaporan(item)">
                <Pencil class="h-4 w-4 text-gray-500" />
              </Button>
              <Button variant="outline" size="icon" @click="handleDelete(item.id)">
                <Trash2 class="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </template>
        </DataTable>
      </div>
    </div>
  </div>
</template>
