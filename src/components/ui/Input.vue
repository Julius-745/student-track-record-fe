<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  modelValue: string | number | undefined
  label?: string
  type?: string
  placeholder?: string
  error?: string
  id?: string
  disabled?: boolean
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  placeholder: '',
  disabled: false,
  class: '',
})

const emit = defineEmits(['update:modelValue'])

const value = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const inputId = computed(() => props.id || `input-${Math.random().toString(36).substr(2, 9)}`)
</script>

<template>
  <div :class="cn('w-full space-y-2', props.class)">
    <label
      v-if="label"
      :for="inputId"
      class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {{ label }}
    </label>
    <input
      :id="inputId"
      v-model="value"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      class="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      :class="{ 'border-red-500 focus-visible:ring-red-500': error }"
    />
    <span v-if="error" class="text-sm font-medium text-red-500">{{ error }}</span>
  </div>
</template>
