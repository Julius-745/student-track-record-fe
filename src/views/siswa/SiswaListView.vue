<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { watchDebounced } from '@vueuse/core'
import { useDataStore } from '@/stores/useDataStore'
import { useModalStore } from '@/stores/useModalStore'
import DataTable from '@/components/ui/DataTable.vue'
import Button from '@/components/ui/Button.vue'
import { Plus, Pencil, Trash2, Eye } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

// Use stores directly
const dataStore = useDataStore()
const modalStore = useModalStore()

// Destructure reactive state using storeToRefs
const { siswa, siswaMeta, isLoading } = storeToRefs(dataStore)
const search = ref('')
const rombel = ref('')
const page = ref(1)

const fetchSiswa = () => {
  dataStore.fetchSiswa({
    page: page.value,
    limit: 10,
    search: search.value,
    rombel: rombel.value || undefined, // Send undefined if empty string
  })
}

// Watch search with debounce
watchDebounced(
  search,
  () => {
    page.value = 1
    fetchSiswa()
  },
  { debounce: 500, maxWait: 1000 },
)

// Watch filter immediately
watch(rombel, () => {
  page.value = 1
  fetchSiswa()
})

watch(page, () => {
  fetchSiswa()
})

onMounted(() => {
  // Always fetch fresh data on mount to ensure store is sync
  fetchSiswa()
})

const columns = [
  { key: 'nama', label: 'Nama' },
  { key: 'nipd', label: 'NIPD' },
  { key: 'rombel', label: 'Kelas' },
  { key: 'jenis_kelamin', label: 'L/P' },
  // { key: 'poin', label: 'Poin' }, // Removed
  { key: 'actions', label: 'Aksi', class: 'text-right' },
]

const openCreateModal = () => {
  modalStore.openModal('CREATE_SISWA')
}

const editSiswa = (bg: any) => {
  modalStore.openModal('EDIT_SISWA', bg)
}

const handleDelete = async (id: string) => {
  if (confirm('Apakah anda yakin ingin menghapus data ini?')) {
    await dataStore.deleteSiswa(id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">Data Siswa</h2>
        <p class="text-gray-500">Kelola data siswa SMPN 4 Probolinggo</p>
      </div>
      <Button @click="openCreateModal">
        <Plus class="mr-2 h-4 w-4" />
        Tambah Siswa
      </Button>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative w-full sm:w-64">
        <input
          v-model="search"
          type="text"
          placeholder="Cari Nama / NIPD..."
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div class="w-full sm:w-48">
        <select
          v-model="rombel"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Semua Kelas</option>
          <option
            v-for="cls in ['7A', '7B', '7C', '8A', '8B', '8C', '9A', '9B', '9C']"
            :key="cls"
            :value="cls"
          >
            {{ cls }}
          </option>
        </select>
      </div>
    </div>

    <DataTable :columns="columns" :data="siswa" :is-loading="isLoading">
      <template #actions="{ item }">
        <div class="flex justify-end gap-2">
          <Button variant="ghost" size="icon" @click="$router.push(`/siswa/${item.id}`)">
            <Eye class="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" @click="editSiswa(item)">
            <Pencil class="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="sm" @click="handleDelete(item.id)">
            <Trash2 class="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </template>
    </DataTable>

    <!-- Pagination -->
    <div class="flex items-center justify-between border-t border-gray-200 pt-4" v-if="siswaMeta">
      <div class="text-sm text-gray-700">
        Menampilkan halaman <span class="font-medium">{{ siswaMeta.page }}</span> dari
        <span class="font-medium">{{ siswaMeta.last_page }}</span>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" :disabled="siswaMeta.page === 1" @click="page--">
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="siswaMeta.page === siswaMeta.last_page"
          @click="page++"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>
