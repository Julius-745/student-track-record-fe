import AxiosMockAdapter from 'axios-mock-adapter'
import api from './api'
import { dbService } from './db'

// Initialize mock adapter
// delayResponse: 500 simulates network latency
const mock = new AxiosMockAdapter(api, { delayResponse: 500 })

// --- Auth Routes ---
mock.onPost('/auth/login').reply(async (config) => {
  const { email, password } = JSON.parse(config.data)
  try {
    // Basic mock login logic
    await dbService.init()
    const guruList = await dbService.getGuru()
    const user = guruList.find((g) => g.email === email && g.password === password)

    if (user) {
      return [
        200,
        {
          accessToken: 'mock-jwt-token-' + user.id,
          user: {
            id: user.id,
            email: user.email,
            nama: user.nama,
            role: user.role,
          },
        },
      ]
    }
    return [401, { message: 'Invalid credentials' }]
  } catch (e) {
    return [500, { message: 'Internal Server Error' }]
  }
})

mock.onPost('/auth/logout').reply(200, { message: 'Logged out' })

// --- Siswa Routes ---
mock.onGet('/siswa').reply(async () => {
  await dbService.init()
  const data = await dbService.getSiswa()
  return [200, data]
})

mock.onPost('/siswa').reply(async (config) => {
  const data = JSON.parse(config.data)
  const newItem = await dbService.createSiswa(data)
  return [201, newItem]
})

mock.onPut(new RegExp('/siswa/*')).reply(async (config) => {
  // Extract ID from URL: /siswa/{id}
  const id = config.url?.split('/').pop()
  if (!id) return [400, { message: 'ID required' }]

  const data = JSON.parse(config.data)
  try {
    const updated = await dbService.updateSiswa(id, data)
    return [200, updated]
  } catch (e) {
    return [404, { message: 'Siswa not found' }]
  }
})

mock.onDelete(new RegExp('/siswa/*')).reply(async (config) => {
  const id = config.url?.split('/').pop()
  if (!id) return [400, { message: 'ID required' }]

  try {
    await dbService.deleteSiswa(id)
    return [200, { message: 'Deleted' }]
  } catch (e) {
    return [404, { message: 'Siswa not found' }]
  }
})

// --- Guru Routes ---
mock.onGet('/guru').reply(async () => {
  await dbService.init()
  const data = await dbService.getGuru()
  return [200, data]
})

mock.onPost('/guru').reply(async (config) => {
  const data = JSON.parse(config.data)
  const newItem = await dbService.createGuru(data)
  return [201, newItem]
})

mock.onPut(new RegExp('/guru/*')).reply(async (config) => {
  const id = config.url?.split('/').pop()
  if (!id) return [400, { message: 'ID required' }]

  const data = JSON.parse(config.data)
  try {
    const updated = await dbService.updateGuru(id, data)
    return [200, updated]
  } catch (e) {
    return [404, { message: 'Guru not found' }]
  }
})

mock.onDelete(new RegExp('/guru/*')).reply(async (config) => {
  const id = config.url?.split('/').pop()
  if (!id) return [400, { message: 'ID required' }]

  try {
    await dbService.deleteGuru(id)
    return [200, { message: 'Deleted' }]
  } catch (e) {
    return [404, { message: 'Guru not found' }]
  }
})

// --- Pelaporan Routes ---
mock.onGet('/pelaporan').reply(async () => {
  await dbService.init()
  const data = await dbService.getPelaporan()
  return [200, data]
})

mock.onPost('/pelaporan').reply(async (config) => {
  const data = JSON.parse(config.data)
  const newItem = await dbService.createPelaporan(data)
  return [201, newItem]
})

export default mock
