<script setup lang="ts">
import {
  TransitionRoot,
  TransitionChild,
  Dialog,
  DialogPanel,
  DialogTitle,
  DialogDescription,
} from '@headlessui/vue'
import { useModalStore } from '@/stores/useModalStore'
import { X } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const modalStore = useModalStore()
const { isOpen, type: modalType } = storeToRefs(modalStore)

const closeModal = () => {
  modalStore.closeModal()
}

const modalTitle = computed(() => {
  switch (modalType.value) {
    case 'CREATE_SISWA':
      return 'Tambah Siswa'
    case 'EDIT_SISWA':
      return 'Edit Siswa'
    case 'CREATE_ADMIN_GURU':
      return 'Tambah Guru / Admin'
    case 'ADD_REPORT':
      return 'Buat Laporan'
    default:
      return ''
  }
})
</script>

<template>
  <TransitionRoot appear :show="isOpen" as="template">
    <Dialog as="div" @close="closeModal" class="relative z-50">
      <TransitionChild
        as="template"
        enter="ease-out duration-300"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="ease-in duration-200"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
      </TransitionChild>

      <div class="fixed inset-0 z-10 overflow-y-auto">
        <div
          class="flex min-h-full min-w-full items-center justify-center text-center sm:justify-center"
        >
          <TransitionChild
            as="template"
            enter="ease-out duration-300"
            enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enter-to="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leave-from="opacity-100 translate-y-0 sm:scale-100"
            leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <DialogPanel
              class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6"
            >
              <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                <button
                  type="button"
                  class="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  @click="closeModal"
                >
                  <span class="sr-only">Close</span>
                  <X class="h-6 w-6" aria-hidden="true" />
                </button>
              </div>

              <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <DialogTitle v-if="modalType !== 'CONFIRM_DELETE'" as="h3" class="text-base font-semibold leading-6 text-gray-900 mb-4">
                  <span v-if="modalType === 'CREATE_SISWA'">Tambah Siswa</span>
                  <span v-else-if="modalType === 'EDIT_SISWA'">Edit Siswa</span>
                  <span v-else-if="modalType === 'CREATE_ADMIN_GURU'">Tambah Guru/Admin</span>
                  <span v-else-if="modalType === 'ADD_REPORT'">Tambah Laporan</span>
                </DialogTitle>

                <div class="mt-2 text-left">
                  <!-- Dynamic Form Slot Content could go here, but for now we might simple use v-if based on type in the parent or here -->
                  <slot />
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
