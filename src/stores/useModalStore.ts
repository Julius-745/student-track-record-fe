import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ModalType =
  | 'CREATE_SISWA'
  | 'EDIT_SISWA'
  | 'CREATE_ADMIN_GURU'
  | 'ADD_REPORT'
  | 'EDIT_REPORT'
  | 'CONFIRM_DELETE'
  | null

export const useModalStore = defineStore('modal', () => {
  const isOpen = ref(false)
  const type = ref<ModalType>(null)
  const contextData = ref<unknown | null>(null)

  function openModal(modalType: ModalType, data: unknown = null) {
    isOpen.value = true
    type.value = modalType
    contextData.value = data
  }

  function closeModal() {
    isOpen.value = false
    type.value = null
    contextData.value = null
  }

  return {
    isOpen,
    type,
    contextData,
    openModal,
    closeModal,
  }
})
