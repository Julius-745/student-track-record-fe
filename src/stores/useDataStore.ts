import { defineStore } from 'pinia'
import type { Siswa, Guru, Pelaporan } from '@/types'
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
    } finally {
      isLoading.value = false
    }
  }

  async function fetchInitialData() {
    isLoading.value = true
    error.value = null
    try {
      const [siswaRes, guruRes, pelaporanRes] = await Promise.all([
        api.get('/siswa', { params: { page: 1, limit: 10 } }).then((res) => res.data),
        api.get('/guru', { params: { page: 1, limit: 10 } }).then((res) => res.data),
        api.get('/pelaporan', { params: { page: 1, limit: 10 } }).then((res) => res.data),
      ])
      siswa.value = siswaRes.data
      siswaMeta.value = siswaRes.meta
      guru.value = guruRes.data
      guruMeta.value = guruRes.meta
      pelaporan.value = pelaporanRes.data
      pelaporanMeta.value = pelaporanRes.meta
    } catch (e: any) {
      error.value = e.message
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
    } catch (e: any) {
      error.value = e.message
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
      }
    } catch (e: any) {
      error.value = e.message
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
    } catch (e: any) {
      error.value = e.message
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function fetchGuru(
    params: { page?: number; limit?: number; search?: string; rombel?: string } = {},
  ) {
    isLoading.value = true
    try {
      const res = await api.get('/guru', { params })
      guru.value = res.data.data
      guruMeta.value = res.data.meta
    } catch (e: any) {
      error.value = e.message
    } finally {
      isLoading.value = false
    }
  }

  async function fetchPelaporan(
    params: { page?: number; limit?: number; search?: string; rombel?: string } = {},
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
    } catch (e: any) {
      error.value = e.message
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
      }
    } catch (e: any) {
      error.value = e.message
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
    } catch (e: any) {
      error.value = e.message
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
    } catch (e: any) {
      error.value = e.message
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
      }
    } catch (e: any) {
      error.value = e.message
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
    } catch (e: any) {
      error.value = e.message
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
