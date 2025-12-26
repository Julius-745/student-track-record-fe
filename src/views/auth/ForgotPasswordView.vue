<script setup lang="ts">
import { Lock, ArrowLeft } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div class="mx-auto h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
          <Lock class="h-8 w-8 text-blue-600" />
        </div>
        <h2 class="mt-6 text-2xl font-bold text-gray-900">Lupa Password?</h2>
        <p class="mt-4 text-gray-600">
          Untuk alasan keamanan, pemulihan password dilakukan secara manual.
        </p>
        <div class="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
          <p class="text-sm text-blue-800 font-medium">Instruksi:</p>
          <ul class="mt-2 text-sm text-blue-700 list-disc list-inside space-y-1">
            <li>Hubungi Administrator Sekolah secara langsung.</li>
            <li>Administrator akan memverifikasi identitas Anda.</li>
            <li>Anda akan diberikan <strong>Link Reset Password</strong> khusus (Magic Link).</li>
            <li>Link tersebut hanya berlaku selama <strong>10 menit</strong>.</li>
          </ul>
        </div>

        <div class="mt-8">
          <Button @click="router.push('/login')" class="w-full"> Kembali ke Login </Button>
        </div>
      </div>
    </div>
  </div>
</template>
