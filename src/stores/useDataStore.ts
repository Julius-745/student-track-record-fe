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

  // Helper for consistent API action handling
  async function handleAction<T>(
    action: () => Promise<T>,
    successMessage: string,
    refreshFn?: () => Promise<void>,
  ) {
    isLoading.value = true
    error.value = null
    try {
      const result = await action()
      if (refreshFn) await refreshFn()
      showSuccess(successMessage)
      return result
    } catch (e: any) {
      const errorMessage = e.message || 'An error occurred'
      error.value = errorMessage
      showError(errorMessage)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Fetching Functions
  async function fetchSiswa(
    params: {
      page?: number
      limit?: number
      search?: string
      rombel?: string
      orderBy?: string
      order?: 'ASC' | 'DESC'
    } = {},
  ) {
    isLoading.value = true
    siswa.value = []
    try {
      const res = await api.get('/siswa', { params })
      siswa.value = res.data.data
      siswaMeta.value = res.data.meta
    } catch (e: any) {
      const errorMessage = e.message || 'An error occurred'
      error.value = errorMessage
      showError(errorMessage)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchGuru(
    params: {
      page?: number
      limit?: number
      search?: string
      role?: string
      orderBy?: string
      order?: 'ASC' | 'DESC'
    } = {},
  ) {
    isLoading.value = true
    try {
      const res = await api.get('/guru', { params })
      guru.value = res.data.data
      guruMeta.value = res.data.meta
    } catch (e: any) {
      const errorMessage = e.message || 'An error occurred'
      error.value = errorMessage
      showError(errorMessage)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPelaporan(
    params: {
      page?: number
      limit?: number
      search?: string
      jenis_pelaporan?: string
      orderBy?: string
      order?: 'ASC' | 'DESC'
    } = {},
  ) {
    isLoading.value = true
    error.value = null
    try {
      const res = await api.get('/pelaporan', { params })
      pelaporan.value = res.data.data || []
      pelaporanMeta.value = res.data.meta || { page: 1, limit: 10, total: 0, last_page: 1 }
    } catch (e: any) {
      const errorMessage = e.message || 'An error occurred'
      error.value = errorMessage
      pelaporan.value = []
      pelaporanMeta.value = { page: 1, limit: 10, total: 0, last_page: 1 }
      showError(errorMessage)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchStats(params: { startDate?: string; endDate?: string } = {}) {
    try {
      const res = await api.get('/pelaporan/stats', { params })
      return res.data
    } catch (e: any) {
      console.error('Error fetching stats:', e)
      return { prestasi: 0, pelanggaran: 0, total: 0 }
    }
  }

  async function fetchInitialData(isAdmin: boolean) {
    isLoading.value = true
    error.value = null
    try {
      const promises = [
        api.get('/pelaporan', { params: { page: 1, limit: 10 } }).then((res) => res.data),
      ]

      if (isAdmin) {
        promises.push(api.get('/guru', { params: { page: 1, limit: 10 } }).then((res) => res.data))
        promises.push(api.get('/siswa', { params: { page: 1, limit: 10 } }).then((res) => res.data))
      }

      const results = await Promise.all(promises)

      pelaporan.value = results[0].data
      pelaporanMeta.value = results[0].meta

      if (isAdmin) {
        guru.value = results[1].data
        guruMeta.value = results[1].meta
        siswa.value = results[2].data
        siswaMeta.value = results[2].meta
      }
    } catch (e: any) {
      const errorMessage = e.message || 'An error occurred'
      error.value = errorMessage
      showError(errorMessage)
      throw e
    } finally {
      isLoading.value = false
    }
  }

  // Refresh Helpers
  const refreshSiswa = () =>
    fetchSiswa({
      page: 1,
      limit: 10,
      search: '',
      rombel: '',
      orderBy: 'nama',
      order: 'DESC',
    })

  const refreshGuru = () =>
    fetchGuru({
      page: 1,
      limit: 10,
      search: '',
      role: '',
      orderBy: 'nama',
      order: 'DESC',
    })

  const refreshPelaporan = () =>
    fetchPelaporan({
      page: 1,
      limit: 10,
      search: '',
      jenis_pelaporan: '',
      orderBy: 'deskripsi',
      order: 'DESC',
    })

  // Siswa Actions
  const addSiswa = (data: Omit<Siswa, 'id'>) =>
    handleAction(() => api.post('/siswa', data), 'Berhasil menambahkan siswa', refreshSiswa)

  const updateSiswa = (id: string, data: Partial<Siswa>) =>
    handleAction(() => api.put(`/siswa/${id}`, data), 'Berhasil memperbarui data siswa', refreshSiswa)

  const deleteSiswa = (id: string) =>
    handleAction(() => api.delete(`/siswa/${id}`), 'Berhasil menghapus data siswa', refreshSiswa)

  const importSiswa = (formData: FormData) =>
    handleAction(
      () => api.post('/siswa/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
      'Berhasil mengimpor data siswa',
      refreshSiswa,
    )

  // Guru Actions
  const addGuru = (data: Omit<Guru, 'id'>) =>
    handleAction(() => api.post('/guru', data), 'Berhasil menambahkan guru', refreshGuru)

  const updateGuru = (id: string, data: Partial<Guru>) =>
    handleAction(() => api.put(`/guru/${id}`, data), 'Berhasil memperbarui data guru', refreshGuru)

  const deleteGuru = (id: string) =>
    handleAction(() => api.delete(`/guru/${id}`), 'Berhasil menghapus data guru', refreshGuru)

  const importGuru = (formData: FormData) =>
    handleAction(
      () => api.post('/guru/import', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
      'Berhasil mengimpor data guru',
      refreshGuru,
    )

  // Pelaporan Actions
  const addPelaporan = (data: Omit<Pelaporan, 'id'>) =>
    handleAction(() => api.post('/pelaporan', data), 'Berhasil membuat laporan', refreshPelaporan)

  const updatePelaporan = (id: string, data: Partial<Pelaporan>) =>
    handleAction(
      () => api.put(`/pelaporan/${id}`, data),
      'Berhasil memperbarui laporan',
      refreshPelaporan,
    )

  const deletePelaporan = (id: string) =>
    handleAction(() => api.delete(`/pelaporan/${id}`), 'Berhasil menghapus laporan', refreshPelaporan)

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
    fetchStats,
    addSiswa,
    updateSiswa,
    deleteSiswa,
    importSiswa,
    addGuru,
    updateGuru,
    deleteGuru,
    importGuru,
    addPelaporan,
    updatePelaporan,
    deletePelaporan,
  }
})
