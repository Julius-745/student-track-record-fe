<script setup lang="ts">
import { onMounted, watch, ref} from 'vue'
import { useDataStore } from '@/stores/useDataStore'
import { watchDebounced } from '@vueuse/core'
import { useModalStore } from '@/stores/useModalStore'
import DataTable from '@/components/ui/DataTable.vue'
import Button from '@/components/ui/Button.vue'
import { Plus, Pencil, Trash2, Shield, User } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

const dataStore = useDataStore()
const modalStore = useModalStore()
const search = ref('')
const role = ref('')
const page = ref(1)
const { guru, guruMeta, isLoading } = storeToRefs(dataStore)

const fetchGuru = () => {
  dataStore.fetchGuru({
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
    fetchGuru()
  },
  { debounce: 500, maxWait: 1000 },
)

// Watch filter immediately
watch(role, () => {
  page.value = 1
  fetchGuru()
})

watch(page, () => {
  fetchGuru()
})

onMounted(() => {
  // Always fetch fresh data on mount to ensure store is sync
  fetchGuru()
})

const columns = [
  { key: 'nama', label: 'Nama' },
  { key: 'nip', label: 'NIP' },
  { key: 'posisi', label: 'Posisi' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'actions', label: 'Aksi', class: 'text-right' },
]

const openCreateModal = () => {
  modalStore.openModal('CREATE_ADMIN_GURU')
}

const editGuru = (item: any) => {
  modalStore.openModal('CREATE_ADMIN_GURU', item) // Re-use ID but we'll map logic in Layout
}

const handleDelete = async (id: string) => {
  if (confirm('Apakah anda yakin ingin menghapus data ini?')) {
    await dataStore.deleteGuru(id)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h2 class="text-2xl font-bold tracking-tight text-gray-900">Manajemen Guru & Admin</h2>
        <p class="text-gray-500">Kelola data pengajar dan administrator sistem</p>
      </div>
      <Button @click="openCreateModal">
        <Plus class="mr-2 h-4 w-4" />
        Tambah Guru
      </Button>
    </div>

    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative w-full sm:w-64">
        <input
          v-model="search"
          type="text"
          placeholder="Cari Nama / NIP..."
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>
      <div class="w-full sm:w-48">
        <select
          v-model="role"
          class="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">Semua Role</option>
          <option
            v-for="cls in ['Guru', 'Administrator']"
            :key="cls"
            :value="cls"
          >
            {{ cls }}
          </option>
        </select>
      </div>
    </div>

    <DataTable :columns="columns" :data="guru" :is-loading="isLoading">
      <template #role="{ item }">
        <span
          class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
          :class="
            item.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
          "
        >
          <Shield v-if="item.role === 'admin'" class="mr-1 h-3 w-3" />
          <User v-else class="mr-1 h-3 w-3" />
          {{ item.role === 'admin' ? 'Administrator' : 'Guru' }}
        </span>
      </template>

      <template #actions="{ item }">
        <div class="flex justify-end gap-2">
          <Button variant="ghost" size="icon" @click="editGuru(item)">
            <Pencil class="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" @click="handleDelete(item.id)">
            <Trash2 class="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </template>
    </DataTable>
  </div>
</template>
