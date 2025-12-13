import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ModalType = 'CREATE_SISWA' | 'EDIT_SISWA' | 'CREATE_ADMIN_GURU' | 'ADD_REPORT' | null

export const useModalStore = defineStore('modal', () => {
  const isOpen = ref(false)
  const type = ref<ModalType>(null)
  const contextData = ref<any | null>(null)

  function openModal(modalType: ModalType, data: any = null) {
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
