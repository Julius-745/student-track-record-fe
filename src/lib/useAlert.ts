// src/composables/useAlert.ts
import { ref } from 'vue'

export type AlertType = 'success' | 'warning' | 'error' | 'info'

interface AlertState {
  show: boolean
  type: AlertType
  title?: string
  message: string
}

// Global state
const alertState = ref<AlertState>({
  show: false,
  type: 'info',
  message: '',
})

export function useAlert() {
  const timeoutId = ref<number | null>(null)

  const showAlert = (
    type: AlertType, 
    message: string, 
    title?: string,
    duration = 5000
  ) => {
    // Clear existing timeout
    if (timeoutId.value) {
      clearTimeout(timeoutId.value)
      timeoutId.value = null
    }

    alertState.value = {
      show: true,
      type,
      message,
      title,
    }

    if (duration > 0) {
      timeoutId.value = window.setTimeout(() => {
        hideAlert()
      }, duration)
    }
  }

  const showSuccess = (message: string, title?: string, duration?: number) => {
    showAlert('success', message, title, duration)
  }

  const showWarning = (message: string, title?: string, duration?: number) => {
    showAlert('warning', message, title, duration)
  }

  const showError = (message: string, title?: string, duration?: number) => {
    showAlert('error', message, title, duration)
  }

  const showInfo = (message: string, title?: string, duration?: number) => {
    showAlert('info', message, title, duration)
  }

  const hideAlert = () => {
    alertState.value.show = false
  }

  return {
    alert: alertState,
    showAlert,
    showSuccess,
    showWarning,
    showError,
    showInfo,
    hideAlert,
  }
}