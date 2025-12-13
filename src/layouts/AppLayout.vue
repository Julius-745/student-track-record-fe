<script setup lang="ts">
import { ref, computed } from 'vue'
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
import GuruForm from '@/components/forms/GuruForm.vue'
import PelaporanForm from '@/components/forms/PelaporanForm.vue'
import SiswaForm from '@/components/forms/SiswaForm.vue'
import { storeToRefs } from 'pinia'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const modalStore = useModalStore()
const dataStore = useDataStore()

const { user } = storeToRefs(authStore)
const { type: modalType, contextData: modalContextData } = storeToRefs(modalStore)

// Dynamic Modal Component Mapping
const modalComponent = computed(() => {
  switch (modalType.value) {
    case 'CREATE_SISWA':
    case 'EDIT_SISWA':
      return SiswaForm
    case 'CREATE_ADMIN_GURU':
      return GuruForm
    case 'ADD_REPORT':
      return PelaporanForm
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

const dynamicModalProps = computed(() => {
  switch (modalType.value) {
    case 'EDIT_SISWA':
      return {
        initialData: modalContextData.value,
        loading: dataStore.isLoading,
        onSubmit: onModalEditSiswaValues,
      }
    case 'CREATE_SISWA':
      return {
        loading: dataStore.isLoading,
        onSubmit: onModalCreateSiswaValues,
      }
    case 'CREATE_ADMIN_GURU':
      return {
        initialData: modalContextData.value, // if context is present, it's edit mode
        loading: dataStore.isLoading,
        onSubmit: onModalCreateGuruValues,
      }
    case 'ADD_REPORT':
      return {
        loading: dataStore.isLoading,
        onSubmit: onModalAddReportValues,
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
    }
  } catch (error) {
    console.error('Modal submit error:', error)
  }
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['admin', 'guru'] },
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
        <div class="flex items-center gap-3 px-2 mb-4">
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
        <div class="flex items-center gap-2">
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
        <!-- Logout on Mobile Bottom Nav? Or Profile? For now let's add a small profile/logout button or just rely on Header? 
                 Common pattern is Profile tab or putting logout in a settings accessible place. 
                 Let's add a 'More' or just assume the profile icon in header can logout? 
                 Actually, let's just add a Logout button to the header or rely on a Profile page. 
                 Since there is no profile page, let's put Logout as a small icon in the header. 
            -->
      </nav>
    </div>

    <GlobalModal>
      <!-- We will inject content dynamically based on store type -->
      <component :is="modalComponent" v-bind="dynamicModalProps" @submit="handleModalSubmit" />
    </GlobalModal>
  </div>
</template>
