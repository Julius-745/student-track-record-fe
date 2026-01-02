<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { Search, ChevronDown, Loader2, X } from 'lucide-vue-next'

interface Option {
  value: string
  label: string
  subtitle?: string
}

interface Props {
  modelValue: string | undefined
  label?: string
  placeholder?: string
  error?: string
  searchFn: (query: string) => Promise<Option[]>
  debounceMs?: number
  disabled?: boolean
  initialOptions?: Option[]
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: 'Cari atau pilih...',
  debounceMs: 300,
  disabled: false,
  initialOptions: () => [],
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const searchQuery = ref('')
const options = ref<Option[]>(props.initialOptions)
const isOpen = ref(false)
const isLoading = ref(false)
const selectedOption = ref<Option | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const inputRef = ref<HTMLInputElement | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null

// Find initial selected option
onMounted(() => {
  if (props.modelValue) {
    const found = options.value.find((opt) => opt.value === props.modelValue)
    if (found) {
      selectedOption.value = found
      searchQuery.value = found.label
    }
  }
})

// Debounced search function
const performSearch = async (query: string) => {
  if (!query.trim()) {
    options.value = props.initialOptions
    return
  }

  isLoading.value = true
  try {
    const results = await props.searchFn(query)
    options.value = results
  } catch (error) {
    console.error('Search error:', error)
    options.value = []
  } finally {
    isLoading.value = false
  }
}

// Watch search query with debounce
watch(searchQuery, (newQuery) => {
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }

  debounceTimer = setTimeout(() => {
    performSearch(newQuery)
  }, props.debounceMs)
})

// Handle option selection
const selectOption = (option: Option) => {
  selectedOption.value = option
  searchQuery.value = option.label
  emit('update:modelValue', option.value)
  isOpen.value = false
}

// Handle input focus
const handleFocus = () => {
  isOpen.value = true
  if (options.value.length === 0 && !searchQuery.value) {
    options.value = props.initialOptions
  }
}

// Handle clear
const handleClear = () => {
  searchQuery.value = ''
  selectedOption.value = null
  emit('update:modelValue', '')
  options.value = props.initialOptions
  inputRef.value?.focus()
}

// Close dropdown when clicking outside
const handleClickOutside = (event: MouseEvent) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (debounceTimer) {
    clearTimeout(debounceTimer)
  }
})
</script>

<template>
  <div class="space-y-2" ref="dropdownRef">
    <label v-if="label" class="text-sm font-medium">{{ label }}</label>

    <div class="relative">
      <!-- Input Field -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          ref="inputRef"
          type="text"
          v-model="searchQuery"
          @focus="handleFocus"
          :placeholder="placeholder"
          :disabled="disabled"
          class="flex h-10 w-full rounded-md border border-gray-200 bg-white pl-9 pr-20 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
          :class="{ 'border-red-500 focus-visible:ring-red-500': error }"
        />

        <!-- Right Icons -->
        <div class="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          <button
            v-if="searchQuery"
            type="button"
            @click="handleClear"
            class="p-1 hover:bg-gray-100 rounded"
          >
            <X class="h-4 w-4 text-gray-400" />
          </button>

          <Loader2 v-if="isLoading" class="h-4 w-4 animate-spin text-gray-400" />

          <button type="button" @click="isOpen = !isOpen" class="p-1 hover:bg-gray-100 rounded">
            <ChevronDown
              class="h-4 w-4 text-gray-400 transition-transform"
              :class="{ 'rotate-180': isOpen }"
            />
          </button>
        </div>
      </div>

      <!-- Dropdown Options -->
      <div
        v-if="isOpen"
        class="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-auto"
      >
        <div v-if="options.length === 0 && !isLoading" class="px-3 py-2 text-sm text-gray-500">
          {{ searchQuery ? 'Tidak ada hasil ditemukan' : 'Ketik untuk mencari...' }}
        </div>

        <button
          v-for="option in options"
          :key="option.value"
          type="button"
          @click="selectOption(option)"
          class="w-full px-3 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors"
          :class="{
            'bg-blue-50 hover:bg-blue-100': selectedOption?.value === option.value,
          }"
        >
          <div class="text-sm font-medium">{{ option.label }}</div>
          <div v-if="option.subtitle" class="text-xs text-gray-500">{{ option.subtitle }}</div>
        </button>
      </div>
    </div>

    <!-- Error Message -->
    <span v-if="error" class="text-sm text-red-500">{{ error }}</span>
  </div>
</template>
