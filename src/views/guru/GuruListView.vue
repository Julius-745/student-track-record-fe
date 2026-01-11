<script setup lang="ts">
import { onMounted, watch, ref } from 'vue'
import { useDataStore } from '@/stores/useDataStore'
import { watchDebounced } from '@vueuse/core'
import { useModalStore } from '@/stores/useModalStore'
import DataTable from '@/components/ui/DataTable.vue'
import Button from '@/components/ui/Button.vue'
import { Plus, Pencil, Trash2, Shield, User, Key, X, Copy, Check, FileUp } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import api from '@/services/api'

const dataStore = useDataStore()
const modalStore = useModalStore()
const search = ref('')
const role = ref('')
const page = ref(1)
const orderBy = ref('nama')
const order = ref<'ASC' | 'DESC'>('DESC')
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
    role: role.value || undefined,
    orderBy: orderBy.value,
    order: order.value,
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
  { key: 'nama', label: 'Nama', sortable: true },
  { key: 'nip', label: 'NIP', sortable: true },
  { key: 'posisi', label: 'Posisi', sortable: true },
  { key: 'email', label: 'Email', sortable: true },
  { key: 'role', label: 'Role', sortable: true },
  { key: 'actions', label: 'Aksi', class: 'text-right' },
]

const handleSort = (payload: { orderBy: string; order: 'ASC' | 'DESC' }) => {
  orderBy.value = payload.orderBy
  order.value = payload.order
  fetchGuru()
}

const openCreateModal = () => {
  modalStore.openModal('CREATE_ADMIN_GURU')
}

const editGuru = (item: any) => {
  modalStore.openModal('CREATE_ADMIN_GURU', item)
}

const handleDelete = (id: string) => {
  modalStore.openModal('CONFIRM_DELETE', {
    id,
    type: 'guru',
    title: 'Hapus Guru',
    message: 'Apakah Anda yakin ingin menghapus data guru ini?',
  })
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

const fileInput = ref<HTMLInputElement | null>(null)

const triggerImport = () => {
  fileInput.value?.click()
}

const handleImport = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  const formData = new FormData()
  formData.append('file', file)

  try {
    await dataStore.importGuru(formData)
    // Reset file input
    target.value = ''
  } catch (error) {
    console.error('Import failed:', error)
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
      <div class="flex gap-2">
        <input
          ref="fileInput"
          type="file"
          accept=".csv"
          class="hidden"
          @change="handleImport"
        />
        <Button variant="outline" @click="triggerImport">
          <FileUp class="mr-2 h-4 w-4" />
          Impor CSV
        </Button>
        <Button @click="openCreateModal">
          <Plus class="mr-2 h-4 w-4" />
          Tambah Guru
        </Button>
      </div>
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
          <option v-for="cls in ['guru', 'admin']" :key="cls" :value="cls">
            {{ cls }}
          </option>
        </select>
      </div>
    </div>

    <DataTable
      :columns="columns"
      :data="guru"
      :is-loading="isLoading"
      :order-by="orderBy"
      :order="order"
      @sort="handleSort"
    >
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
            variant="outline"
            size="icon"
            title="Reset Password"
            @click="handleGenerateLink(item)"
          >
            <Key class="h-4 w-4 text-orange-500" />
          </Button>
          <Button variant="outline" size="icon" @click="editGuru(item)">
            <Pencil class="h-4 w-4 text-gray-500" />
          </Button>
          <Button variant="outline" size="icon" @click="handleDelete(item.id)">
            <Trash2 class="h-4 w-4 text-red-500" />
          </Button>
        </div>
      </template>
    </DataTable>

    <div class="flex items-center justify-between border-t border-gray-200 pt-4" v-if="guruMeta">
      <div class="text-sm text-gray-700">
        Menampilkan halaman <span class="font-medium">{{ guruMeta.page }}</span> dari
        <span class="font-medium">{{ guruMeta.last_page }}</span>
      </div>
      <div class="flex gap-2">
        <Button variant="outline" size="sm" :disabled="guruMeta.page === 1" @click="page--">
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="guruMeta.page === guruMeta.last_page"
          @click="page++"
        >
          Next
        </Button>
      </div>
    </div>

    <!-- Reset Link Modal -->
    <div
      v-if="showResetModal"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 transform transition-all"
    >
      <div
        class="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all"
      >
        <div
          class="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50"
        >
          <h3 class="text-lg font-semibold text-gray-900">Link Reset Password</h3>
          <button
            @click="closeResetModal"
            class="text-gray-400 hover:text-gray-600 transition-colors rounded-full p-1 hover:bg-gray-100"
          >
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="p-6">
          <div v-if="resetLinkLoading" class="flex flex-col items-center justify-center py-8">
            <div
              class="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mb-4"
            ></div>
            <p class="text-gray-500 text-sm">Sedang membuat magic link...</p>
          </div>

          <div v-else>
            <p class="text-sm text-gray-600 mb-3">
              Magic Link untuk <strong>{{ selectedGuruName }}</strong
              >:
            </p>
            <div class="relative group">
              <input
                readonly
                :value="resetLink"
                class="w-full pr-12 bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent block p-3 transition-shadow"
              />
              <button
                @click="copyToClipboard"
                class="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-blue-600 transition-colors"
                title="Salin Link"
              >
                <div class="p-1 rounded-md hover:bg-blue-50 transition-colors">
                  <Check v-if="copied" class="h-5 w-5 text-green-500" />
                  <Copy v-else class="h-5 w-5" />
                </div>
              </button>
            </div>
            <div
              class="mt-5 text-xs text-orange-700 bg-orange-50 p-4 rounded-lg border border-orange-100 flex items-start"
            >
              <div class="mr-2 mt-0.5 text-orange-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path
                    d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
                  />
                  <line x1="12" x2="12" y1="9" y2="13" />
                  <line x1="12" x2="12.01" y1="17" y2="17" />
                </svg>
              </div>
              <div>
                <strong>PENTING:</strong> Link ini bersifat rahasia dan hanya berlaku selama 10
                menit. Segera berikan link ini kepada pengguna yang bersangkutan.
              </div>
            </div>
          </div>
        </div>

        <div class="bg-gray-50 px-6 py-4 flex justify-end">
          <Button
            @click="closeResetModal"
            class="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 mb-0 shadow-sm"
            >Tutup</Button
          >
        </div>
      </div>
    </div>
  </div>
</template>
