<script setup lang="ts">
import { computed } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useDataStore } from '@/stores/useDataStore'
import { useAuthStore } from '@/stores/useAuthStore'
import { storeToRefs } from 'pinia'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { Loader2 } from 'lucide-vue-next'

interface Props {
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['submit'])

const dataStore = useDataStore()
const authStore = useAuthStore()
const { siswa } = storeToRefs(dataStore)
const { user } = storeToRefs(authStore)

const validationSchema = toTypedSchema(
  z.object({
    siswa_id: z.string().min(1, 'Pilih siswa'),
    jenis: z.enum(['prestasi', 'pelanggaran'] as const),
    deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
    tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  }),
)

const { handleSubmit, errors, defineField } = useForm({
  validationSchema,
  initialValues: {
    tanggal: new Date().toISOString().split('T')[0],
    jenis: 'pelanggaran',
  },
})

const [siswa_id] = defineField('siswa_id')
const [jenis] = defineField('jenis')
const [deskripsi] = defineField('deskripsi')
const [tanggal] = defineField('tanggal')

const onSubmit = handleSubmit((values) => {
  // Append current user (Guru) ID
  if (user.value) {
    emit('submit', { ...values, guru_id: user.value.id })
  }
})

// Ensure students are loaded
if (siswa.value.length === 0) {
  dataStore.fetchInitialData()
}
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <div class="space-y-2">
      <label class="text-sm font-medium">Siswa</label>
      <select
        v-model="siswa_id"
        class="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <option value="" disabled>Pilih Siswa</option>
        <option v-for="s in siswa" :key="s.id" :value="s.id">{{ s.nama }} ({{ s.rombel }})</option>
      </select>
      <span v-if="errors.siswa_id" class="text-sm text-red-500">{{ errors.siswa_id }}</span>
    </div>

    <div class="space-y-2">
      <label class="text-sm font-medium">Jenis Laporan</label>
      <div class="flex gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="prestasi"
            v-model="jenis"
            class="text-blue-600 focus:ring-blue-600"
          />
          <span class="text-sm">Prestasi</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="pelanggaran"
            v-model="jenis"
            class="text-red-600 focus:ring-red-600"
          />
          <span class="text-sm">Pelanggaran</span>
        </label>
      </div>
      <span v-if="errors.jenis" class="text-sm text-red-500">{{ errors.jenis }}</span>
    </div>

    <Input label="Tanggal" type="date" v-model="tanggal" :error="errors.tanggal" />

    <div class="space-y-2">
      <label class="text-sm font-medium">Deskripsi</label>
      <textarea
        v-model="deskripsi"
        rows="4"
        class="flex w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        :class="{ 'border-red-500 focus-visible:ring-red-500': errors.deskripsi }"
        placeholder="Deskripsikan detail kejadian atau prestasi..."
      ></textarea>
      <span v-if="errors.deskripsi" class="text-sm text-red-500">{{ errors.deskripsi }}</span>
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <Button type="submit" :disabled="loading">
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        Simpan Laporan
      </Button>
    </div>
  </form>
</template>
