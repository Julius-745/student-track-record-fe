<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { Siswa } from '@/types'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { Loader2 } from 'lucide-vue-next'

interface Props {
  initialData?: Siswa | null
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['submit'])

const validationSchema = toTypedSchema(
  z.object({
    nama: z.string().min(1, 'Nama wajib diisi'),
    rombel: z.string().min(1, 'Rombel wajib diisi'),
    nisn: z.string().optional(),
    jenis_kelamin: z.enum(['L', 'P'] as const),
    tempat_lahir: z.string().min(1, 'Tempat lahir wajib diisi'),
    tanggal_lahir: z.string().min(1, 'Tanggal lahir wajib diisi'),
    nik: z.string().optional(),
    alamat: z.string().optional(),
    no_hp: z.string().optional(),
    email: z.string().email('Email tidak valid').min(1, 'Email wajib diisi'),
  }),
)

const { handleSubmit, errors, defineField, resetForm, setValues } = useForm({
  validationSchema,
})

const [nama] = defineField('nama')
const [rombel] = defineField('rombel')
const [nisn] = defineField('nisn')
const [jenis_kelamin] = defineField('jenis_kelamin')
const [tempat_lahir] = defineField('tempat_lahir')
const [tanggal_lahir] = defineField('tanggal_lahir')
const [alamat] = defineField('alamat')
const [no_hp] = defineField('no_hp')
const [email] = defineField('email')

watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      setValues({
        nama: newVal.nama,
        rombel: newVal.rombel,
        nisn: newVal.nisn,
        jenis_kelamin: newVal.jenis_kelamin as 'L' | 'P',
        tempat_lahir: newVal.tempat_lahir,
        tanggal_lahir: newVal.tanggal_lahir,
        alamat: newVal.alamat,
        no_hp: newVal.no_hp,
        email: newVal.email,
        // Add others as needed
      })
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  emit('submit', values)
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Input label="Nama Lengkap" v-model="nama" :error="errors.nama" placeholder="Nama Siswa" />
      <Input label="Rombel" v-model="rombel" :error="errors.rombel" placeholder="Kelas 7A" />
      <Input label="NISN" v-model="nisn" :error="errors.nisn" />

      <div class="space-y-2">
        <label class="text-sm font-medium">Jenis Kelamin</label>
        <select
          v-model="jenis_kelamin"
          class="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600"
        >
          <option value="L">Laki-laki</option>
          <option value="P">Perempuan</option>
        </select>
        <span v-if="errors.jenis_kelamin" class="text-sm text-red-500">{{
          errors.jenis_kelamin
        }}</span>
      </div>

      <Input label="Tempat Lahir" v-model="tempat_lahir" :error="errors.tempat_lahir" />
      <Input
        label="Tanggal Lahir"
        type="date"
        v-model="tanggal_lahir"
        :error="errors.tanggal_lahir"
      />
      <Input label="Alamat" v-model="alamat" :error="errors.alamat" class="md:col-span-2" />
      <Input label="No HP" v-model="no_hp" :error="errors.no_hp" />
      <Input label="Email" type="email" v-model="email" :error="errors.email" />
    </div>

    <div class="flex justify-end gap-3 pt-4">
      <slot name="actions">
        <Button type="submit" :disabled="loading">
          <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
          Simpan
        </Button>
      </slot>
    </div>
  </form>
</template>
