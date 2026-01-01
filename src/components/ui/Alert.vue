<script setup lang="ts">
import { computed } from 'vue'
import type { AlertType } from '@/types'

interface Props {
  type?: AlertType
  message: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
})

const alertStyles: Record<
  AlertType,
  {
    bg: string
    border: string
    text: string
    icon: string
  }
> = {
  success: {
    bg: 'bg-success-100',
    border: 'border-success-500',
    text: 'text-success-700',
    icon: 'text-success-500',
  },
  warning: {
    bg: 'bg-warning-100',
    border: 'border-warning-500',
    text: 'text-warning-700',
    icon: 'text-warning-500',
  },
  error: {
    bg: 'bg-error-100',
    border: 'border-error-500',
    text: 'text-error-700',
    icon: 'text-error-500',
  },
  info: {
    bg: 'bg-info-100',
    border: 'border-info-500',
    text: 'text-info-700',
    icon: 'text-info-500',
  },
}

const styles = computed(() => alertStyles[props.type])

const title = computed(() => props.type.charAt(0).toUpperCase() + props.type.slice(1))
</script>

<template>
  <div
    :class="[styles.bg, styles.text, styles.border, 'border px-4 py-3 rounded relative']"
    role="alert"
  >
    <div>
      <sup class="font-bold mr-2">{{ title }}</sup>
    </div>
    <span class="block sm:inline"> {{ message }}</span>

    <span class="absolute top-0 bottom-0 right-0 px-4 py-3 cursor-pointer">
      <svg
        class="fill-current h-6 w-6"
        :class="styles.icon"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
      >
        <title>Close</title>
        <path
          d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"
        />
      </svg>
    </span>
  </div>
</template>
