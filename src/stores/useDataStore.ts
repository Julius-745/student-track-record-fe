import { defineStore } from 'pinia'
import type { Siswa, Guru, Pelaporan } from '@/types'
import { useAlert } from '@/lib/useAlert'
import api from '@/services/api'
import { ref } from 'vue'

export const useDataStore = defineStore('data', () => {
  const siswa = ref<Siswa[]>([])
  const siswaMeta = ref({ page: 1, limit: 10, total: 0, last_page: 1 })
  const guru = ref<Guru[]>([])
  const guruMeta = ref({ page: 1, limit: 10, total: 0, last_page: 1 })
  const pelaporan = ref<Pelaporan[]>([])
  const pelaporanMeta = ref({ page: 1, limit: 10, total: 0, last_page: 1 })
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const { showError, showSuccess } = useAlert()

  async function fetchSiswa(
    params: { page?: number; limit?: number; search?: string; rombel?: string } = {},
  ) {
    isLoading.value = true
    try {
      const res = await api.get('/siswa', { params })
      siswa.value = res.data.data
      siswaMeta.value = res.data.meta
    } catch (e: any) {
      error.value = e.message
      showError(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchInitialData(
    isAdmin: boolean,
  ) {
    isLoading.value = true
    error.value = null
    try {
    const promises = [
      api.get('/pelaporan', { params: { page: 1, limit: 10 } }).then((res) => res.data),
    ]
    
    // Only fetch guru if admin
    if (isAdmin) {
      promises.push(api.get('/guru', { params: { page: 1, limit: 10 } }).then((res) => res.data))
      promises.push(api.get('/siswa', { params: { page: 1, limit: 10 } }).then((res) => res.data))
    }
    
    const results = await Promise.all(promises)
    
    pelaporan.value = results[0].data
    pelaporanMeta.value = results[0].meta
    
    if (isAdmin) {
      siswa.value = results[1].data
      siswaMeta.value = results[1].meta
      guru.value = results[2].data
      guruMeta.value = results[2].meta
    }
    } catch (e: any) {
      error.value = e.message
      showError(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Siswa Actions
  async function addSiswa(data: Omit<Siswa, 'id'>) {
    isLoading.value = true
    try {
      const res = await api.post('/siswa', data)
      siswa.value.push(res.data)
      showSuccess('Berhasil menambahkan siswa')
    } catch (e: any) {
      error.value = e.message
      showError(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateSiswa(id: string, data: Partial<Siswa>) {
    isLoading.value = true
    try {
      const res = await api.put(`/siswa/${id}`, data)
      const index = siswa.value.findIndex((s) => s.id === id)
      if (index !== -1) {
        siswa.value[index] = res.data
        showSuccess('Berhasil memperbarui data siswa')
      }
    } catch (e: any) {
      error.value = e.message
      showError(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteSiswa(id: string) {
    isLoading.value = true
    try {
      await api.delete(`/siswa/${id}`)
      siswa.value = siswa.value.filter((s) => s.id !== id)
      showSuccess('Berhasil menghapus data siswa')
    } catch (e: any) {
      error.value = e.message
      showError(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchGuru(
    params: { page?: number; limit?: number; search?: string; role?: string } = {},
  ) {
    isLoading.value = true
    try {
      const res = await api.get('/guru', { params })
      guru.value = res.data.data
      guruMeta.value = res.data.meta
    } catch (e: any) {
      error.value = e.message
      showError(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPelaporan(
    params: { page?: number; limit?: number; search?: string; jenis_pelaporan?: string } = {},
  ) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get('/pelaporan', { params })
      pelaporan.value = res.data.data || []
      pelaporanMeta.value = res.data.meta || { page: 1, limit: 10, total: 0, last_page: 1 }
    } catch (e: any) {
      error.value = e.message
      pelaporan.value = []
      pelaporanMeta.value = { page: 1, limit: 10, total: 0, last_page: 1 }
      showError(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Guru Actions
  async function addGuru(data: Omit<Guru, 'id'>) {
    isLoading.value = true
    try {
      const res = await api.post('/guru', data)
      guru.value.push(res.data)
      showSuccess('Berhasil menambahkan guru')
    } catch (e: any) {
      error.value = e.message
      showError(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updateGuru(id: string, data: Partial<Guru>) {
    isLoading.value = true
    try {
      const res = await api.put(`/guru/${id}`, data)
      const index = guru.value.findIndex((g) => g.id === id)
      if (index !== -1) {
        guru.value[index] = res.data
        showSuccess('Berhasil memperbarui data guru')
      }
    } catch (e: any) {
      error.value = e.message
      showError(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deleteGuru(id: string) {
    isLoading.value = true
    try {
      await api.delete(`/guru/${id}`)
      guru.value = guru.value.filter((g) => g.id !== id)
      showSuccess('Berhasil menghapus data guru')
    } catch (e: any) {
      error.value = e.message
      showError(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Pelaporan Actions
  async function addPelaporan(data: Omit<Pelaporan, 'id'>) {
    isLoading.value = true
    try {
      const res = await api.post('/pelaporan', data)
      pelaporan.value.push(res.data)
      showSuccess('Berhasil membuat laporan')
    } catch (e: any) {
      error.value = e.message
      showError(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function updatePelaporan(id: string, data: Partial<Pelaporan>) {
    isLoading.value = true
    try {
      const res = await api.put(`/pelaporan/${id}`, data)
      const index = pelaporan.value.findIndex((g) => g.id === id)
      if (index !== -1) {
        pelaporan.value[index] = res.data
        showSuccess('Berhasil memperbarui laporan')
      }
    } catch (e: any) {
      error.value = e.message
      showError(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function deletePelaporan(id: string) {
    isLoading.value = true
    try {
      await api.delete(`/pelaporan/${id}`)
      pelaporan.value = pelaporan.value.filter((g) => g.id !== id)
      showSuccess('Berhasil menghapus laporan')
    } catch (e: any) {
      error.value = e.message
      showError(e.message)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  return {
    siswa,
    siswaMeta,
    guru,
    guruMeta,
    pelaporan,
    pelaporanMeta,
    isLoading,
    error,
    fetchInitialData,
    fetchSiswa,
    fetchGuru,
    fetchPelaporan,
    addSiswa,
    updateSiswa,
    deleteSiswa,
    addGuru,
    updateGuru,
    deleteGuru,
    addPelaporan,
    updatePelaporan,
    deletePelaporan,
  }
})
