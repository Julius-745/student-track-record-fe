<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useAuthStore } from '@/stores/useAuthStore'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import { Loader2 } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const schema = toTypedSchema(
  z.object({
    email: z.string().email('Email tidak valid'),
    password: z.string().min(1, 'Password harus diisi'),
  }),
)

const { handleSubmit, errors, defineField, isSubmitting } = useForm({
  validationSchema: schema,
})

const [email] = defineField('email')
const [password] = defineField('password')

const errorMsg = ref('')

const onSubmit = handleSubmit(async (values) => {
  errorMsg.value = ''
  try {
    await authStore.login(values.email, values.password)
    router.push('/dashboard')
  } catch (e: any) {
    errorMsg.value = e.message || 'Login gagal'
  }
})
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
    <div class="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
      <div class="text-center">
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">Sign in</h2>
        <p class="mt-2 text-sm text-gray-600">Sistem Pelaporan Prestasi & Pelanggaran Siswa</p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="onSubmit">
        <div class="space-y-4 rounded-md shadow-sm">
          <Input
            id="email-address"
            v-model="email"
            type="email"
            label="Email address"
            placeholder="admin@sekolah.id"
            :error="errors.email"
          />
          <Input
            id="password"
            v-model="password"
            type="password"
            label="Password"
            placeholder="••••••••"
            :error="errors.password"
          />
        </div>

        <div v-if="errorMsg" class="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {{ errorMsg }}
        </div>

        <div>
          <Button type="submit" class="w-full" :disabled="isSubmitting">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Sign in
          </Button>
        </div>
      </form>

      <div class="text-center text-xs text-gray-400">
        <p>Demo Credentials:</p>
        <p>Admin: admin@sekolah.id / admin</p>
        <p>Guru: budi@sekolah.id / password123</p>
      </div>
    </div>
  </div>
</template>
