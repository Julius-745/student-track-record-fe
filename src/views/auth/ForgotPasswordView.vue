<script setup lang="ts">
import { Lock, ArrowLeft, Info } from 'lucide-vue-next'
import Button from '@/components/ui/Button.vue'
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 py-12 px-4 sm:px-6 lg:px-8">
    <div class="absolute inset-0 bg-grid-white/[0.2] bg-[length:20px_20px]" />
    <div class="max-w-md w-full relative z-10">
      <div class="bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl p-8 border border-white/20">
        <div class="text-center mb-8">
          <div class="mx-auto h-12 w-12 rounded-xl bg-indigo-100 flex items-center justify-center mb-4">
            <Lock class="h-6 w-6 text-indigo-600" />
          </div>
          <h2 class="text-2xl font-bold text-gray-900">Lupa Password?</h2>
          <p class="text-sm text-gray-600 mt-2">
            Untuk alasan keamanan, pemulihan password dilakukan melalui prosedur manual.
          </p>
        </div>

        <div class="bg-blue-50/50 border border-blue-100 rounded-xl p-5 mb-8">
          <div class="flex items-start">
            <Info class="h-5 w-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h3 class="text-sm font-semibold text-blue-900">Instruksi Pemulihan</h3>
              <ul class="mt-2 text-sm text-blue-800 list-disc list-inside space-y-1.5 ml-1">
                <li>Hubungi <strong>Administrator Sekolah</strong> secara langsung.</li>
                <li>Administrator akan memverifikasi identitas Anda.</li>
                <li>Anda akan diberikan <strong>Link Reset Password</strong> (Magic Link).</li>
                <li>Link tersebut hanya berlaku selama <strong>10 menit</strong>.</li>
              </ul>
            </div>
          </div>
        </div>

        <div class="space-y-4">
          <Button @click="router.push('/login')" variant="outline" class="w-full border-gray-300 hover:bg-gray-50 h-11 text-base transition-all">
            <ArrowLeft class="mr-2 h-4 w-4" />
            Kembali ke Login
          </Button>
        </div>
      </div>

      <div class="mt-8 text-center">
        <p class="text-white/80 text-sm">
          &copy; {{ new Date().getFullYear() }} Student Track Record. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</template>
