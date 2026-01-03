<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useDataStore } from '@/stores/useDataStore'
import { useAuthStore } from '@/stores/useAuthStore'
import type { Pelaporan } from '@/types'
import { storeToRefs } from 'pinia'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import AutocompleteInput from '../ui/AutoCompleteInput.vue'
import { Loader2 } from 'lucide-vue-next'

interface Props {
  initialData?: Pelaporan | null
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
    jenis_pelaporan: z.enum(['prestasi', 'pelanggaran'] as const),
    deskripsi: z.string().min(1, 'Deskripsi wajib diisi'),
    tanggal: z.string().min(1, 'Tanggal wajib diisi'),
  }),
)

const { handleSubmit, errors, defineField, setValues, resetForm } = useForm({
  validationSchema,
  initialValues: {
    siswa_id: '',
    tanggal: new Date().toISOString().split('T')[0],
    jenis_pelaporan: 'pelanggaran',
  },
})

const [siswa_id] = defineField('siswa_id')
const [jenis_pelaporan] = defineField('jenis_pelaporan')
const [deskripsi] = defineField('deskripsi')
const [tanggal] = defineField('tanggal')

watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      setValues({
        siswa_id: newVal.siswa_id,
        jenis_pelaporan: newVal.jenis_pelaporan,
        deskripsi: newVal.deskripsi,
        tanggal: newVal.tanggal ? new Date(newVal.tanggal).toISOString().split('T')[0] : '',
      })
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  // Append current user (Guru) ID
  if (user.value) {
    emit('submit', { ...values, guru_id: user.value.id })
  }
})



// Search function for autocomplete using store's fetchSiswa
const searchSiswa = async (query: string) => {
  try {
    await dataStore.fetchSiswa({
      search: query,
      limit: 10,
    })

    return siswa.value.map((s) => ({
      value: s.id,
      label: s.nama,
      subtitle: `${s.rombel} - ${s.nipd}`,
    }))
  } catch (error) {
    console.error('Error searching siswa:', error)
    return []
  }
}

// Initial options from store + the one from initialData if editing
const initialSiswaOptions = computed(() => {
  const storeOptions = siswa.value.map((s) => ({
    value: s.id,
    label: s.nama,
    subtitle: `${s.rombel} - ${s.nipd}`,
  }))

  // If we have initialData and the student is not in storeOptions, add it
  if (props.initialData?.siswa && !storeOptions.find((o) => o.value === props.initialData?.siswa?.id)) {
    storeOptions.unshift({
      value: props.initialData.siswa.id,
      label: props.initialData.siswa.nama,
      subtitle: `${props.initialData.siswa.rombel} - ${props.initialData.siswa.nipd}`,
    })
  }

  return storeOptions
})

// Fetch initial siswa data on component mount
onMounted(async () => {
  if (siswa.value.length === 0) {
    try {
      await dataStore.fetchSiswa({ page: 1, limit: 10 })
    } catch (error) {
      console.error('Error loading initial siswa:', error)
    }
  }
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <!-- Autocomplete Siswa Input -->
    <AutocompleteInput
      v-model="siswa_id"
      label="Siswa"
      placeholder="Cari nama siswa..."
      :search-fn="searchSiswa"
      :initial-options="initialSiswaOptions"
      :error="errors.siswa_id"
      :debounce-ms="300"
    />

    <div class="space-y-2">
      <label class="text-sm font-medium">Jenis Laporan</label>
      <div class="flex gap-4">
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="prestasi"
            v-model="jenis_pelaporan"
            class="text-blue-600 focus:ring-blue-600"
          />
          <span class="text-sm">Prestasi</span>
        </label>
        <label class="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="pelanggaran"
            v-model="jenis_pelaporan"
            class="text-red-600 focus:ring-red-600"
          />
          <span class="text-sm">Pelanggaran</span>
        </label>
      </div>
      <span v-if="errors.jenis_pelaporan" class="text-sm text-red-500">{{ errors.jenis_pelaporan }}</span>
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
        {{ initialData?.id ? 'Perbarui Laporan' : 'Simpan Laporan' }}
      </Button>
    </div>
  </form>
</template>
