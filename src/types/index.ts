export interface Siswa {
  id: string
  rombel: string
  nama: string
  nipd: string
  jenis_kelamin: 'L' | 'P'
  nisn?: string
  tempat_lahir: string
  tanggal_lahir: string
  nik?: string
  agama?: string
  alamat?: string
  rt?: string
  rw?: string
  dusun?: string
  kelurahan?: string
  kecamatan?: string
  kode_pos?: string
  jenis_tinggal?: string
  alat_transportasi?: string
  no_hp?: string
  email: string
  skhun?: string
  penerima_kps?: boolean
  no_kps?: string
  pelaporans?: Pelaporan[]
}

export type UserRole = 'guru' | 'admin'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface Guru {
  id: string
  nip: string
  nama: string
  posisi: string
  email: string
  password?: string
  role: UserRole
}

export type JenisPelaporan = 'prestasi' | 'pelanggaran'

export interface Pelaporan {
  id: string
  siswa_id: string
  guru_id: string
  jenis_pelaporan: JenisPelaporan
  deskripsi: string
  tanggal: string // ISO Date string
  siswa?: Siswa // For relations
  guru?: Guru // For relations
}

// Helper for UI
export interface Breadcrumb {
  label: string
  to?: string
}
