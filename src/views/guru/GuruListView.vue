<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useDataStore } from '@/stores/useDataStore'
import { watchDebounced } from '@vueuse/core'
import { useModalStore } from '@/stores/useModalStore'
import DataTable from '@/components/ui/DataTable.vue'
import Button from '@/components/ui/Button.vue'
import { Plus, Pencil, Trash2, Shield, User, Key, X, Copy, Check } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import api from '@/services/api'

const dataStore = useDataStore()
const modalStore = useModalStore()
const search = ref('')
const role = ref('')
const page = ref(1)
const { guru, guruMeta, isLoading } = storeToRefs(dataStore)

// Reset Link Modal State
const showResetModal = ref(false)
const resetLink = ref('')
const resetLinkLoading = ref(false)
const copied = ref(false)
const selectedGuruName = ref('')

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

const handleGenerateLink = async (guruItem: any) => {
  resetLinkLoading.value = true
  selectedGuruName.value = guruItem.nama
  resetLink.value = ''
  showResetModal.value = true

  try {
    const res = await api.post('/auth/generate-reset-link', { userId: guruItem.id })
    resetLink.value = res.data.resetLink
  } catch (e: any) {
    alert(e.response?.data?.message || 'Gagal membuat link reset password')
    showResetModal.value = false
  } finally {
    resetLinkLoading.value = false
  }
}

const copyToClipboard = () => {
  navigator.clipboard.writeText(resetLink.value)
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 2000)
}

const closeResetModal = () => {
  showResetModal.value = false
  resetLink.value = ''
  copied.value = false
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
          <option v-for="cls in ['Guru', 'Administrator']" :key="cls" :value="cls">
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
          <Button
            variant="ghost"
            size="icon"
            title="Reset Password"
            @click="handleGenerateLink(item)"
          >
            <Key class="h-4 w-4 text-orange-500" />
          </Button>
          <Button variant="ghost" size="icon" @click="editGuru(item)">
            <Pencil class="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="ghost" size="icon" @click="handleDelete(item.id)">
            <Trash2 class="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </template>
    </DataTable>

    <!-- Reset Link Modal -->
    <div
      v-if="showResetModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4"
    >
      <div class="w-full max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-900">Link Reset Password</h3>
          <button @click="closeResetModal" class="text-gray-400 hover:text-gray-500">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="p-6">
          <div v-if="resetLinkLoading" class="flex justify-center py-8">
            <div
              class="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"
            ></div>
          </div>

          <div v-else>
            <p class="text-sm text-gray-600 mb-2">
              Magic Link untuk <strong>{{ selectedGuruName }}</strong
              >:
            </p>
            <div class="relative">
              <input
                readonly
                :value="resetLink"
                class="w-full pr-10 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
              />
              <button
                @click="copyToClipboard"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-blue-600"
                title="Salin Link"
              >
                <Check v-if="copied" class="h-5 w-5 text-green-500" />
                <Copy v-else class="h-5 w-5" />
              </button>
            </div>
            <p
              class="mt-4 text-xs text-orange-600 bg-orange-50 p-3 rounded border border-orange-200"
            >
              <strong>PENTING:</strong> Link ini hanya berlaku selama 10 menit. Segera berikan link
              ini kepada pengguna yang bersangkutan.
            </p>
          </div>
        </div>

        <div class="bg-gray-50 px-6 py-3 flex justify-end">
          <Button @click="closeResetModal">Tutup</Button>
        </div>
      </div>
    </div>
  </div>
</template>
