<script setup lang="ts">
import Button from '@/components/ui/Button.vue'
import { AlertTriangle, Loader2 } from 'lucide-vue-next'

interface Props {
  title?: string
  message?: string
  loading?: boolean
}

withDefaults(defineProps<Props>(), {
  title: 'Konfirmasi Hapus',
  message: 'Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.',
  loading: false,
})

const emit = defineEmits(['submit', 'cancel'])

const onConfirm = () => {
  emit('submit')
}

const onCancel = () => {
  emit('cancel')
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <div class="flex items-center gap-4">
      <div class="flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
        <AlertTriangle class="h-6 w-6 text-red-600" aria-hidden="true" />
      </div>
      <div>
        <h3 class="text-lg font-semibold text-gray-900 leading-6">{{ title }}</h3>
        <p class="mt-2 text-sm text-gray-500">{{ message }}</p>
      </div>
    </div>

    <div class="mt-4 flex justify-end gap-3">
      <Button variant="outline" @click="onCancel" :disabled="loading"> Batal </Button>
      <Button variant="destructive" @click="onConfirm" :disabled="loading">
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        Hapus
      </Button>
    </div>
  </div>
</template>
