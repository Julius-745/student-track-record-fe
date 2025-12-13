import type { Siswa, Guru, Pelaporan } from '@/types'

const STORAGE_KEYS = {
  SISWA: 'str_siswa',
  GURU: 'str_guru',
  PELAPORAN: 'str_pelaporan',
}

const DELAY_MS = 300

const delay = () => new Promise((resolve) => setTimeout(resolve, DELAY_MS))

// Initial Mock Data
const MOCK_GURU: Guru[] = [
  {
    id: 'g1',
    nip: '198001012005011001',
    nama: 'Budi Santoso',
    posisi: 'Guru Matematika',
    email: 'budi@sekolah.id',
    role: 'guru',
    password: 'password123',
  },
  {
    id: 'admin1',
    nip: '199001012015011001',
    nama: 'Super Admin',
    posisi: 'Administrator',
    email: 'admin@sekolah.id',
    role: 'admin',
    password: 'admin',
  },
]

export const dbService = {
  // --- Generic Helpers ---
  getItem<T>(key: string): T[] {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : []
  },

  setItem<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data))
  },

  async init() {
    await delay()
    if (!localStorage.getItem(STORAGE_KEYS.GURU)) {
      this.setItem(STORAGE_KEYS.GURU, MOCK_GURU)
    }
    if (!localStorage.getItem(STORAGE_KEYS.SISWA)) {
      this.setItem(STORAGE_KEYS.SISWA, [])
    }
  },

  // --- SISWA ---
  async getSiswa(): Promise<Siswa[]> {
    await delay()
    return this.getItem<Siswa>(STORAGE_KEYS.SISWA)
  },

  async createSiswa(data: Omit<Siswa, 'id'>): Promise<Siswa> {
    await delay()
    const list = this.getItem<Siswa>(STORAGE_KEYS.SISWA)
    // Explicitly cast or ensure data matches via spread, ID is overwritten
    const newItem: Siswa = {
      ...data,
      id: crypto.randomUUID(),
      // Ensure optional fields are at least undefined if missing in data (though omit handles this)
    } as Siswa
    list.push(newItem)
    this.setItem(STORAGE_KEYS.SISWA, list)
    return newItem
  },

  async updateSiswa(id: string, data: Partial<Siswa>): Promise<Siswa> {
    await delay()
    const list = this.getItem<Siswa>(STORAGE_KEYS.SISWA)
    const index = list.findIndex((i) => i.id === id)
    if (index === -1) throw new Error('Siswa not found')

    // Spread ensures type safety usually, but valid objects might have optional keys
    // mismatched if not careful.
    const updated = { ...list[index], ...data } as Siswa
    list[index] = updated
    this.setItem(STORAGE_KEYS.SISWA, list)
    return updated
  },

  async deleteSiswa(id: string): Promise<void> {
    await delay()
    const list = this.getItem<Siswa>(STORAGE_KEYS.SISWA)
    const filtered = list.filter((i) => i.id !== id)
    this.setItem(STORAGE_KEYS.SISWA, filtered)
  },

  // --- GURU ---
  async getGuru(): Promise<Guru[]> {
    await delay()
    return this.getItem<Guru>(STORAGE_KEYS.GURU)
  },

  async createGuru(data: Omit<Guru, 'id'>): Promise<Guru> {
    await delay()
    const list = this.getItem<Guru>(STORAGE_KEYS.GURU)
    const newItem: Guru = { ...data, id: crypto.randomUUID() } as Guru
    list.push(newItem)
    this.setItem(STORAGE_KEYS.GURU, list)
    return newItem
  },

  async updateGuru(id: string, data: Partial<Guru>): Promise<Guru> {
    await delay()
    const list = this.getItem<Guru>(STORAGE_KEYS.GURU)
    const index = list.findIndex((i) => i.id === id)
    if (index === -1) throw new Error('Guru not found')

    const updated = { ...list[index], ...data } as Guru
    list[index] = updated
    this.setItem(STORAGE_KEYS.GURU, list)
    return updated
  },

  async deleteGuru(id: string): Promise<void> {
    await delay()
    const list = this.getItem<Guru>(STORAGE_KEYS.GURU)
    const filtered = list.filter((i) => i.id !== id)
    this.setItem(STORAGE_KEYS.GURU, filtered)
  },

  // --- PELAPORAN ---
  async getPelaporan(): Promise<Pelaporan[]> {
    await delay()
    return this.getItem<Pelaporan>(STORAGE_KEYS.PELAPORAN)
  },

  async createPelaporan(data: Omit<Pelaporan, 'id'>): Promise<Pelaporan> {
    await delay()
    const list = this.getItem<Pelaporan>(STORAGE_KEYS.PELAPORAN)
    const newItem: Pelaporan = { ...data, id: crypto.randomUUID() }
    list.push(newItem)
    this.setItem(STORAGE_KEYS.PELAPORAN, list)
    return newItem
  },
}
