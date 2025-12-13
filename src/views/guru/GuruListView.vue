<script setup lang="ts">
import { onMounted } from 'vue'
import { useDataStore } from '@/stores/useDataStore'
import { useModalStore } from '@/stores/useModalStore'
import DataTable from '@/components/ui/DataTable.vue'
import Button from '@/components/ui/Button.vue'
import { Plus, Pencil, Trash2, Shield, User } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'

const dataStore = useDataStore()
const modalStore = useModalStore()
const { guru, isLoading } = storeToRefs(dataStore)

onMounted(() => {
  if (guru.value.length === 0) {
    dataStore.fetchInitialData()
  }
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
