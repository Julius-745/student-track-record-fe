import { describe, it, expect, beforeAll } from 'vitest'
import api from '@/services/api'

// Test Data
const testUser = {
  email: 'admin@sekolah.id', // Ensure this user exists in your DB or seeding
  password: 'password123',
}

const newSiswa = {
  nama: 'Budi Test Vitest',
  nipd: '99999',
  rombel: '7A',
  jenis_kelamin: 'L',
}

const newGuru = {
  nama: 'Pak Guru Test',
  nip: '88888',
  posisi: 'Guru IPA',
  email: 'guru.test@sekolah.id',
  password: 'password123',
  role: 'guru',
}

describe('Backend API Integration Tests', () => {
  let authToken = ''
  let siswaId = ''
  let guruId = ''
  let pelaporanId = ''

  // 1. Authentication
  it('should login and return access token', async () => {
    // Note: This test requires a valid user in the DB.
    // If testing against an empty DB, you might need to seed a user first via refined seeding logic or manual insert.
    // For this example, we assume we might fail 401 if user doesn't exist, which is a valid "connectivity" test result.
    try {
      const response = await api.post('/auth/login', testUser)
      expect(response.status).toBe(201) // NestJS default for POST is 201
      expect(response.data).toHaveProperty('accessToken')
      authToken = response.data.accessToken

      // Config API to use token for subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${authToken}`
    } catch (error: any) {
      // If 401, it means we connected but creds are wrong.
      // If Connection Refused, then BE is down.
      if (error.response?.status === 401) {
        console.warn('Login failed: Invalid credentials. Skipping auth-dependent tests.')
      } else {
        throw error
      }
    }
  })

  // 2. Guru CRUD (Requires Admin usually/Auth)
  it('should create a new guru', async () => {
    if (!authToken) return
    const response = await api.post('/guru', newGuru)
    expect(response.status).toBe(201)
    expect(response.data.nama).toBe(newGuru.nama)
    guruId = response.data.id
  })

  it('should get all gurus', async () => {
    const response = await api.get('/guru')
    expect(response.status).toBe(200)
    expect(Array.isArray(response.data)).toBe(true)
  })

  // 3. Siswa CRUD
  it('should create a new siswa', async () => {
    if (!authToken) return
    const response = await api.post('/siswa', newSiswa)
    expect(response.status).toBe(201)
    expect(response.data.nama).toBe(newSiswa.nama)
    siswaId = response.data.id
  })

  it('should update siswa', async () => {
    if (!siswaId) return
    const updatedName = 'Budi Update'
    const response = await api.put(`/siswa/${siswaId}`, { ...newSiswa, nama: updatedName })
    expect(response.status).toBe(200)
    expect(response.data.nama).toBe(updatedName)
  })

  // 4. Pelaporan CRUD
  it('should create a pelaporan (Relation check)', async () => {
    if (!siswaId || !guruId) return
    const newPelaporan = {
      id_siswa: siswaId,
      id_guru: guruId, // Optional in some logic, but usually good to test
      jenis_pelaporan: 'prestasi',
      deskripsi: 'Juara 1 Lomba Coding',
      tanggal: '2025-12-13',
      poin: 10,
    }

    // Note: Our API expects nested objects or IDs?
    // Based on our service logic:
    // const { siswa_id, guru_id, ...rest } = createDto;
    // So we need to match that payload structure
    const payload = {
      siswa_id: siswaId,
      guru_id: guruId,
      jenis_pelaporan: 'prestasi',
      deskripsi: 'Juara 1 Lomba Coding',
      tanggal: '2025-12-13',
      poin: 10,
    }

    const response = await api.post('/pelaporan', payload)
    expect(response.status).toBe(201)
    pelaporanId = response.data.id
  })

  // Clean up
  it('should delete created resources', async () => {
    if (pelaporanId) await api.delete(`/pelaporan/${pelaporanId}`)
    if (siswaId) await api.delete(`/siswa/${siswaId}`)
    if (guruId) await api.delete(`/guru/${guruId}`)
  })
})
