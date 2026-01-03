<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/useAuthStore'
import { useModalStore } from '@/stores/useModalStore'
import { useDataStore } from '@/stores/useDataStore'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  FileText,
  LogOut,
  Menu,
  X,
  UserCheck,
} from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import GlobalModal from '@/components/ui/GlobalModal.vue'
import OfflineWarning from '@/components/OfflineWarning.vue'
import Alert from '@/components/ui/Alert.vue'
import { useAlert } from '@/lib/useAlert'
import GuruForm from '@/components/forms/GuruForm.vue'
import PelaporanForm from '@/components/forms/PelaporanForm.vue'
import SiswaForm from '@/components/forms/SiswaForm.vue'
import DeleteConfirmation from '@/components/modals/DeleteConfirmation.vue'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const modalStore = useModalStore()
const dataStore = useDataStore()
const { alert, hideAlert } = useAlert()

const { user } = storeToRefs(authStore)
const { type: modalType, contextData: modalContextData } = storeToRefs(modalStore)

onMounted(() => {
  // Ensure refresh timer is running if user is authenticated
  if (authStore.isAuthenticated) {
    authStore.startRefreshTokenTimer()
  }
})

// Dynamic Modal Component Mapping
const modalComponent = computed(() => {
  switch (modalType.value) {
    case 'CREATE_SISWA':
    case 'EDIT_SISWA':
      return SiswaForm
    case 'CREATE_ADMIN_GURU':
      return GuruForm
    case 'ADD_REPORT':
    case 'EDIT_REPORT':
      return PelaporanForm
    case 'CONFIRM_DELETE':
      return DeleteConfirmation
    default:
      return null
  }
})

const onModalCreateSiswaValues = async (values: any) => {
  await dataStore.addSiswa(values)
  modalStore.closeModal()
}

const onModalEditSiswaValues = async (values: any) => {
  const id = modalContextData.value?.id
  if (id) {
    await dataStore.updateSiswa(id, values)
    modalStore.closeModal()
  }
}

const onModalCreateGuruValues = async (values: any) => {
  const id = modalContextData.value?.id
  if (id) {
    await dataStore.updateGuru(id, values)
  } else {
    await dataStore.addGuru(values)
  }
  modalStore.closeModal()
}

const onModalAddReportValues = async (values: any) => {
  await dataStore.addPelaporan(values)
  modalStore.closeModal()
}

const onModalEditReportValues = async (values: any) => {
  const id = modalContextData.value?.id
  if (id) {
    await dataStore.updatePelaporan(id, values)
    modalStore.closeModal()
  }
}

const onModalConfirmDelete = async () => {
  const { id, type } = modalContextData.value || {}
  if (!id || !type) return

  if (type === 'siswa') await dataStore.deleteSiswa(id)
  else if (type === 'guru') await dataStore.deleteGuru(id)
  else if (type === 'pelaporan') await dataStore.deletePelaporan(id)

  modalStore.closeModal()
}

const dynamicModalProps = computed(() => {
  switch (modalType.value) {
    case 'EDIT_SISWA':
      return {
        initialData: modalContextData.value,
        loading: dataStore.isLoading,
      }
    case 'CREATE_SISWA':
      return {
        loading: dataStore.isLoading,
      }
    case 'CREATE_ADMIN_GURU':
      return {
        initialData: modalContextData.value,
        loading: dataStore.isLoading,
      }
    case 'ADD_REPORT':
      return {
        loading: dataStore.isLoading,
      }
    case 'EDIT_REPORT':
      return {
        initialData: modalContextData.value,
        loading: dataStore.isLoading,
      }
    case 'CONFIRM_DELETE':
      return {
        loading: dataStore.isLoading,
        title: modalContextData.value?.title,
        message: modalContextData.value?.message,
      }
    default:
      return {}
  }
})

const handleModalSubmit = async (values: any) => {
  try {
    switch (modalType.value) {
      case 'CREATE_SISWA':
        await onModalCreateSiswaValues(values)
        break
      case 'EDIT_SISWA':
        await onModalEditSiswaValues(values)
        break
      case 'CREATE_ADMIN_GURU':
        await onModalCreateGuruValues(values)
        break
      case 'ADD_REPORT':
        await onModalAddReportValues(values)
        break
      case 'EDIT_REPORT':
        await onModalEditReportValues(values)
        break
      case 'CONFIRM_DELETE':
        await onModalConfirmDelete()
        break
    }
  } catch (error) {
    console.error('Modal submit error:', error)
  }
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'guru'] },
  { name: 'Siswa', href: '/siswa', icon: Users, roles: ['admin', 'guru'] },
  { name: 'Guru', href: '/guru', icon: UserCheck, roles: ['admin'] },
  { name: 'Pelaporan', href: '/pelaporan', icon: FileText, roles: ['admin', 'guru'] },
]

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
    <!-- Offline Warning Banner -->
    <OfflineWarning />

    <!-- Global Alert -->
    <Transition
      enter-active-class="transform ease-out duration-300 transition"
      enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
      enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
      leave-active-class="transition ease-in duration-100"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="alert.show"
        class="fixed top-4 right-4 z-50 w-full max-w-sm overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5"
      >
        <Alert :type="alert.type" :message="alert.message" @click="hideAlert" />
      </div>
    </Transition>

    <!-- Desktop Sidebar (Hidden on mobile) -->
    <aside
      class="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 bg-white border-r border-gray-200 z-30"
    >
      <div class="flex h-16 items-center px-6 border-b border-gray-100">
        <h1 class="text-xl font-bold text-gray-900 tracking-tight">SMPN 4 Probolinggo</h1>
      </div>

      <nav class="mt-6 flex flex-col gap-1 px-3 flex-1">
        <template v-for="item in navigation" :key="item.name">
          <router-link
            v-if="item.roles.includes(user?.role || '')"
            :to="item.href"
            class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors"
            :class="[
              route.path === item.href
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
            ]"
          >
            <component :is="item.icon" class="h-5 w-5" />
            {{ item.name }}
          </router-link>
        </template>
      </nav>

      <div class="border-t border-gray-100 p-4">
        <div
          class="flex items-center gap-3 px-2 mb-4 cursor-pointer"
          @click="router.push('/profile')"
        >
          <div
            class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold"
          >
            {{ user?.nama?.charAt(0) }}
          </div>
          <div class="overflow-hidden">
            <p class="truncate text-sm font-medium text-gray-900">{{ user?.nama }}</p>
            <p class="truncate text-xs text-gray-500">{{ user?.posisi }}</p>
          </div>
        </div>
        <button
          @click="handleLogout"
          class="flex w-full items-center gap-3 rounded-md px-2 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut class="h-5 w-5" />
          Sign out
        </button>
      </div>
    </aside>

    <!-- Main Content Wrapper -->
    <div class="flex-1 flex flex-col min-h-screen lg:ml-64 pb-16 lg:pb-0">
      <!-- Mobile Header -->
      <header
        class="sticky top-0 z-20 flex h-16 items-center justify-between bg-white px-4 shadow-sm lg:hidden bg-opacity-90 backdrop-blur-sm"
      >
        <div>
          <h1 class="text-lg font-bold text-gray-900 tracking-tight">SMPN 4 Probolinggo</h1>
          <p class="text-xs text-gray-500" v-if="route.name">
            {{ String(route.name).charAt(0).toUpperCase() + String(route.name).slice(1) }}
          </p>
        </div>
        <div class="flex items-center gap-2 cursor-pointer" @click="router.push('/profile')">
          <div
            class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xs"
          >
            {{ user?.nama?.charAt(0) }}
          </div>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-4 lg:p-8">
        <router-view v-slot="{ Component }">
          <transition
            name="fade"
            mode="out-in"
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition duration-150 ease-in"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>

    <!-- Bottom Navigation (Mobile Only) -->
    <div
      class="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 lg:hidden pb-safe"
    >
      <nav class="flex justify-around items-center h-16">
        <template v-for="item in navigation" :key="item.name">
          <router-link
            v-if="item.roles.includes(user?.role || '')"
            :to="item.href"
            class="flex flex-col items-center justify-center w-full h-full space-y-1 text-xs font-medium transition-colors"
            :class="[
              route.path === item.href ? 'text-blue-600' : 'text-gray-500 hover:text-gray-900',
            ]"
          >
            <component :is="item.icon" class="h-6 w-6" />
            <span class="text-[10px]">{{ item.name }}</span>
          </router-link>
        </template>
      </nav>
    </div>

    <GlobalModal>
      <component
        :is="modalComponent"
        v-bind="dynamicModalProps"
        @submit="handleModalSubmit"
        @cancel="modalStore.closeModal()"
      />
    </GlobalModal>
  </div>
</template>
