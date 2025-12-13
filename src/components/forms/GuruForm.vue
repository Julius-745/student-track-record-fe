<script setup lang="ts">
import { watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import type { Guru } from '@/types'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { Loader2 } from 'lucide-vue-next'

interface Props {
  initialData?: Guru | null
  loading?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits(['submit'])

const validationSchema = toTypedSchema(
  z.object({
    nama: z.string().min(1, 'Nama wajib diisi'),
    nip: z.string().min(1, 'NIP wajib diisi'),
    email: z.string().email('Email tidak valid'),
    posisi: z.string().min(1, 'Posisi wajib diisi'),
    role: z.enum(['guru', 'admin'] as const),
    password: z.string().min(6, 'Password minimal 6 karakter').optional(), // Optional for edit if not changing
  }),
)

const { handleSubmit, errors, defineField, resetForm, setValues } = useForm({
  validationSchema,
})

const [nama] = defineField('nama')
const [nip] = defineField('nip')
const [email] = defineField('email')
const [posisi] = defineField('posisi')
const [role] = defineField('role')
const [password] = defineField('password')

watch(
  () => props.initialData,
  (newVal) => {
    if (newVal) {
      setValues({
        nama: newVal.nama,
        nip: newVal.nip,
        email: newVal.email,
        posisi: newVal.posisi,
        role: newVal.role,
        password: '', // Don't populate password
      })
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const onSubmit = handleSubmit((values) => {
  // If editing and password is empty, remove it so it doesn't get updated
  if (props.initialData && !values.password) {
    delete values.password
  }
  emit('submit', values)
})
</script>

<template>
  <form @submit.prevent="onSubmit" class="space-y-4">
    <Input label="Nama Lengkap" v-model="nama" :error="errors.nama" />
    <Input label="NIP" v-model="nip" :error="errors.nip" />
    <Input label="Email" type="email" v-model="email" :error="errors.email" />
    <Input
      label="Posisi/Jabatan"
      v-model="posisi"
      :error="errors.posisi"
      placeholder="Guru Matematika"
    />

    <div class="space-y-2">
      <label class="text-sm font-medium">Role</label>
      <select
        v-model="role"
        class="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-blue-600"
      >
        <option value="guru">Guru</option>
        <option value="admin">Administrator</option>
      </select>
      <span v-if="errors.role" class="text-sm text-red-500">{{ errors.role }}</span>
    </div>

    <Input
      label="Password"
      type="password"
      v-model="password"
      :error="errors.password"
      :placeholder="initialData ? 'Biarkan kosong jika tidak diubah' : '••••••'"
    />

    <div class="flex justify-end gap-3 pt-4">
      <Button type="submit" :disabled="loading">
        <Loader2 v-if="loading" class="mr-2 h-4 w-4 animate-spin" />
        Simpan
      </Button>
    </div>
  </form>
</template>
