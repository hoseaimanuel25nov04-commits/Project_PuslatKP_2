/**
 * mockClient.js
 * In-browser fallback engine with localStorage persistence.
 * Aktif otomatis saat file .env belum diisi credentials Supabase.
 * Mendukung autentikasi, CRUD tabel, query builder filter (.eq, .in, .order, .limit, .single),
 * dan pre-seeded data 2026 lengkap (9 Jenis Data berpasangan).
 */

const STORAGE_KEY = 'puslatkp_mock_db_v2'
const SESSION_KEY = 'puslatkp_mock_session_v1'

const DEFAULT_UPTS = [
  { key: 'upt_jakarta', label: 'BPPP Jakarta', aktif: true },
  { key: 'upt_medan', label: 'BPPP Medan', aktif: true },
  { key: 'upt_banyuwangi', label: 'BPPP Banyuwangi', aktif: true },
  { key: 'upt_tegal', label: 'BPPP Tegal', aktif: true },
  { key: 'upt_bitung', label: 'BPPP Bitung', aktif: true },
  { key: 'upt_ambon', label: 'BPPP Ambon', aktif: true },
  { key: 'upt_padang', label: 'BPPP Padang', aktif: true },
  { key: 'upt_pontianak', label: 'BPPP Pontianak', aktif: true },
  { key: 'upt_makassar', label: 'BPPP Makassar', aktif: true },
  { key: 'upt_sorong', label: 'BPPP Sorong', aktif: true },
]

const DEFAULT_PROFILES = [
  { id: 'usr-admin-1', role: 'admin', upt_key: null, nama_lengkap: 'Super Admin PUSLATKP', email: 'admin@kp.go.id', password: 'admin' },
  { id: 'usr-upt-1', role: 'upt', upt_key: 'upt_jakarta', nama_lengkap: 'BPPP Jakarta', email: 'upt@kp.go.id', password: 'upt' },
]

// 9 JENIS DATA RESMI
const JD_MASYARAKAT_MINGGU_ID = '11111111-0001-0000-0000-000000000001'
const JD_MASYARAKAT_BULAN_ID  = '11111111-0002-0000-0000-000000000002'
const JD_APARATUR_MINGGU_ID   = '11111111-0003-0000-0000-000000000003'
const JD_APARATUR_BULAN_ID    = '11111111-0004-0000-0000-000000000004'
const JD_INSTRUKTUR_MINGGU_ID = '11111111-0005-0000-0000-000000000005'
const JD_INSTRUKTUR_BULAN_ID  = '11111111-0006-0000-0000-000000000006'
const JD_BELANJA_MODAL_ID     = '11111111-0007-0000-0000-000000000007'
const JD_ANGGARAN_BELANJA_ID  = '11111111-0008-0000-0000-000000000008'
const JD_ANGGARAN_DANA_ID     = '11111111-0009-0000-0000-000000000009'

const DEFAULT_JENIS_DATA = [
  // GRUP 1: MASYARAKAT
  {
    id: JD_MASYARAKAT_MINGGU_ID,
    key: 'masyarakat',
    judul: 'Masyarakat',
    deskripsi: 'Data mingguan pelatihan masyarakat: pagu, realisasi anggaran, jumlah peserta, dan metode.',
    level_utama: 'minggu',
    butuh_input_bulanan: false,
    pasangan_mingguan_id: null,
    publik_boleh_lihat: true,
    aktif: true,
  },
  {
    id: JD_MASYARAKAT_BULAN_ID,
    key: 'data_masyarakat',
    judul: 'Data Masyarakat',
    deskripsi: 'Rincian data per-orang peserta pelatihan masyarakat (lengkap dengan identitas dan sertifikat).',
    level_utama: 'bulan',
    butuh_input_bulanan: true,
    pasangan_mingguan_id: JD_MASYARAKAT_MINGGU_ID,
    publik_boleh_lihat: true,
    aktif: true,
  },

  // GRUP 2: APARATUR
  {
    id: JD_APARATUR_MINGGU_ID,
    key: 'aparatur',
    judul: 'Aparatur',
    deskripsi: 'Data mingguan pelatihan aparatur: kategori diklat, jumlah peserta, pagu, realisasi, dan metode.',
    level_utama: 'minggu',
    butuh_input_bulanan: false,
    pasangan_mingguan_id: null,
    publik_boleh_lihat: true,
    aktif: true,
  },
  {
    id: JD_APARATUR_BULAN_ID,
    key: 'data_aparatur',
    judul: 'Data Aparatur',
    deskripsi: 'Rincian data per-orang aparatur peserta pelatihan.',
    level_utama: 'bulan',
    butuh_input_bulanan: true,
    pasangan_mingguan_id: JD_APARATUR_MINGGU_ID,
    publik_boleh_lihat: true,
    aktif: true,
  },

  // GRUP 3: INSTRUKTUR & WIDYAISWARA
  {
    id: JD_INSTRUKTUR_MINGGU_ID,
    key: 'data_instruktur_dan_wi',
    judul: 'Data Instruktur dan WI',
    deskripsi: 'Data mingguan instruktur dan widyaiswara berdasarkan jenjang jabatan dan keahlian.',
    level_utama: 'minggu',
    butuh_input_bulanan: false,
    pasangan_mingguan_id: null,
    publik_boleh_lihat: true,
    aktif: true,
  },
  {
    id: JD_INSTRUKTUR_BULAN_ID,
    key: 'data_instruktur_dan_widyaiswara',
    judul: 'Data Instruktur dan Widyaiswara',
    deskripsi: 'Rincian data per-orang tenaga pendidik instruktur dan widyaiswara.',
    level_utama: 'bulan',
    butuh_input_bulanan: true,
    pasangan_mingguan_id: JD_INSTRUKTUR_MINGGU_ID,
    publik_boleh_lihat: true,
    aktif: true,
  },

  // GRUP 4: FINANSIAL (Minggu saja, tanpa pasangan)
  {
    id: JD_BELANJA_MODAL_ID,
    key: 'data_belanja_modal',
    judul: 'Data Belanja Modal',
    deskripsi: 'Data mingguan belanja modal: volume, realisasi anggaran, realisasi fisik, progress, dan hambatan.',
    level_utama: 'minggu',
    butuh_input_bulanan: false,
    pasangan_mingguan_id: null,
    publik_boleh_lihat: false,
    aktif: true,
  },
  {
    id: JD_ANGGARAN_BELANJA_ID,
    key: 'data_capaian_anggaran_per_jenis_belanja',
    judul: 'Data Capaian Anggaran per Jenis Belanja',
    deskripsi: 'Data mingguan pagu & realisasi belanja pegawai, belanja barang, dan belanja modal.',
    level_utama: 'minggu',
    butuh_input_bulanan: false,
    pasangan_mingguan_id: null,
    publik_boleh_lihat: false,
    aktif: true,
  },
  {
    id: JD_ANGGARAN_DANA_ID,
    key: 'data_capaian_anggaran_per_sumber_dana',
    judul: 'Data Capaian Anggaran per Sumber Dana',
    deskripsi: 'Data mingguan pagu & realisasi sumber dana RM, PNBP/BLU, dan SBSN.',
    level_utama: 'minggu',
    butuh_input_bulanan: false,
    pasangan_mingguan_id: null,
    publik_boleh_lihat: false,
    aktif: true,
  },
]

const DEFAULT_FIELDS = [
  // 1. Masyarakat (Minggu)
  { id: 'f-1-1', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, level: 'minggu', field_key: 'nama_pelatihan', label: 'Nama Pelatihan/Judul Pelatihan', tipe: 'teks', wajib: true, urutan: 1, aktif: true },
  { id: 'f-1-2', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, level: 'minggu', field_key: 'jumlah_peserta', label: 'Jumlah Peserta', tipe: 'angka', wajib: true, urutan: 2, aktif: true },
  { id: 'f-1-3', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, level: 'minggu', field_key: 'tanggal_pelatihan', label: 'Tanggal Pelatihan', tipe: 'tanggal', wajib: false, urutan: 3, aktif: true },
  { id: 'f-1-4', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, level: 'minggu', field_key: 'pagu_anggaran', label: 'Pagu Anggaran (Rp)', tipe: 'angka', wajib: false, urutan: 4, aktif: true },
  { id: 'f-1-5', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, level: 'minggu', field_key: 'realisasi_anggaran', label: 'Realisasi Anggaran (Rp)', tipe: 'angka', wajib: false, urutan: 5, aktif: true },
  { id: 'f-1-6', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, level: 'minggu', field_key: 'sumber_dana', label: 'Sumber Dana', tipe: 'pilihan', opsi_pilihan: ['RM', 'PNBP', 'BLU', 'SBSN'], wajib: false, urutan: 6, aktif: true },
  { id: 'f-1-7', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, level: 'minggu', field_key: 'bidang_kompetensi', label: 'Bidang Kompetensi (Sesuai E-Laut)', tipe: 'pilihan', opsi_pilihan: ['Kepelautan', 'Penangkapan Ikan', 'Permesinan Kapal', 'Budidaya Perikanan', 'Pengolahan Hasil Perikanan', 'Konservasi Perairan', 'Sosial Ekonomi KP'], wajib: false, urutan: 7, aktif: true },
  { id: 'f-1-8', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, level: 'minggu', field_key: 'program_prioritas', label: 'Program Prioritas', tipe: 'pilihan', opsi_pilihan: ['Ekonomi Biru 1 (Konservasi)', 'Ekonomi Biru 2 (Penangkapan Terukur)', 'Ekonomi Biru 3 (Budidaya Berkelanjutan)', 'Ekonomi Biru 4 (Pengawasan Wilayah)', 'Ekonomi Biru 5 (Pembersihan Sampah Plastik Laut)'], wajib: false, urutan: 8, aktif: true },
  { id: 'f-1-9', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, level: 'minggu', field_key: 'metode_pelatihan', label: 'Metode Pelatihan', tipe: 'pilihan', opsi_pilihan: ['Luring', 'Blended', 'Full Online'], wajib: false, urutan: 9, aktif: true },
  { id: 'f-1-10', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, level: 'minggu', field_key: 'link_laporan_pelatihan', label: 'Link Laporan Pelatihan', tipe: 'teks', wajib: false, urutan: 10, aktif: true },

  // 2. Data Masyarakat (Bulan)
  { id: 'f-2-1', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'no_urut', label: 'No', tipe: 'teks', wajib: false, urutan: 1, aktif: true },
  { id: 'f-2-2', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'penyelenggara_pelatihan', label: 'Penyelenggara Pelatihan', tipe: 'teks', wajib: false, urutan: 2, aktif: true },
  { id: 'f-2-3', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'nama', label: 'Nama Lulusan Pelatihan', tipe: 'teks', wajib: true, is_identitas: true, urutan: 3, aktif: true },
  { id: 'f-2-4', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'nik', label: 'NIK', tipe: 'teks', wajib: true, is_identitas: true, urutan: 4, aktif: true },
  { id: 'f-2-5', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'tempat_lahir', label: 'Tempat Lahir', tipe: 'teks', wajib: false, urutan: 5, aktif: true },
  { id: 'f-2-6', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'tanggal_lahir', label: 'Tanggal Lahir', tipe: 'tanggal', wajib: false, urutan: 6, aktif: true },
  { id: 'f-2-7', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'jenis_kelamin', label: 'Jenis Kelamin (L/P)', tipe: 'pilihan', opsi_pilihan: ['Laki-laki', 'Perempuan'], wajib: false, urutan: 7, aktif: true },
  { id: 'f-2-8', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'pendidikan_terakhir', label: 'Pendidikan Terakhir', tipe: 'pilihan', opsi_pilihan: ['SD', 'SMP', 'SMA/SMK', 'D1', 'D2', 'D3', 'D4/S1', 'S2', 'S3'], wajib: false, urutan: 8, aktif: true },
  { id: 'f-2-9', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'no_telepon', label: 'Nomor Tlp.', tipe: 'teks', wajib: false, is_identitas: true, urutan: 9, aktif: true },
  { id: 'f-2-10', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'alamat', label: 'Alamat', tipe: 'teks', wajib: false, is_identitas: true, urutan: 10, aktif: true },
  { id: 'f-2-11', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'provinsi', label: 'Provinsi', tipe: 'teks', wajib: false, urutan: 11, aktif: true },
  { id: 'f-2-12', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'kab_kota', label: 'Kab/Kota', tipe: 'teks', wajib: false, urutan: 12, aktif: true },
  { id: 'f-2-13', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'bidang_pelatihan', label: 'Bidang Pelatihan', tipe: 'teks', wajib: false, urutan: 13, aktif: true },
  { id: 'f-2-14', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'jenis_pelatihan_dukungan_program_terobosan', label: 'Jenis Pelatihan Dukungan Program Terobosan', tipe: 'teks', wajib: false, urutan: 14, aktif: true },
  { id: 'f-2-15', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'nama_pelatihan', label: 'Nama Pelatihan', tipe: 'teks', wajib: true, urutan: 15, aktif: true },
  { id: 'f-2-16', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'tanggal_pelatihan', label: 'Tanggal Pelatihan', tipe: 'tanggal', wajib: false, urutan: 16, aktif: true },
  { id: 'f-2-17', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'no_sertifikat_pelatihan', label: 'No Sertifikat Pelatihan', tipe: 'teks', wajib: false, urutan: 17, aktif: true },
  { id: 'f-2-18', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'link_sertifikat_pelatihan_by_name', label: 'Link Sertifikat Pelatihan by Name', tipe: 'teks', wajib: false, urutan: 18, aktif: true },
  { id: 'f-2-19', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'no_kusuka', label: 'No KUSUKA', tipe: 'teks', wajib: false, urutan: 19, aktif: true },
  { id: 'f-2-20', jenis_data_id: JD_MASYARAKAT_BULAN_ID, level: 'bulan', field_key: 'jenis_pelatihan', label: 'Jenis Pelatihan', tipe: 'pilihan', opsi_pilihan: ['Aspirasi', 'Reguler', 'Kerjasama', 'Mandiri'], wajib: false, urutan: 20, aktif: true },

  // 3. Aparatur (Minggu)
  { id: 'f-3-1', jenis_data_id: JD_APARATUR_MINGGU_ID, level: 'minggu', field_key: 'nama_pelatihan', label: 'Nama Pelatihan/Judul Pelatihan', tipe: 'teks', wajib: true, urutan: 1, aktif: true },
  { id: 'f-3-2', jenis_data_id: JD_APARATUR_MINGGU_ID, level: 'minggu', field_key: 'kategori_pelatihan', label: 'Kategori Pelatihan', tipe: 'pilihan', opsi_pilihan: ['Struktural', 'Fungsional', 'Teknis', 'Manajerial'], wajib: false, urutan: 2, aktif: true },
  { id: 'f-3-3', jenis_data_id: JD_APARATUR_MINGGU_ID, level: 'minggu', field_key: 'jumlah_peserta', label: 'Jumlah Peserta', tipe: 'angka', wajib: true, urutan: 3, aktif: true },
  { id: 'f-3-4', jenis_data_id: JD_APARATUR_MINGGU_ID, level: 'minggu', field_key: 'tanggal_pelatihan', label: 'Tanggal Pelatihan', tipe: 'tanggal', wajib: false, urutan: 4, aktif: true },
  { id: 'f-3-5', jenis_data_id: JD_APARATUR_MINGGU_ID, level: 'minggu', field_key: 'pagu_anggaran', label: 'Pagu Anggaran (Rp)', tipe: 'angka', wajib: false, urutan: 5, aktif: true },
  { id: 'f-3-6', jenis_data_id: JD_APARATUR_MINGGU_ID, level: 'minggu', field_key: 'realisasi_anggaran', label: 'Realisasi Anggaran (Rp)', tipe: 'angka', wajib: false, urutan: 6, aktif: true },
  { id: 'f-3-7', jenis_data_id: JD_APARATUR_MINGGU_ID, level: 'minggu', field_key: 'sumber_dana', label: 'Sumber Dana', tipe: 'pilihan', opsi_pilihan: ['RM', 'PNBP', 'BLU', 'SBSN'], wajib: false, urutan: 7, aktif: true },
  { id: 'f-3-8', jenis_data_id: JD_APARATUR_MINGGU_ID, level: 'minggu', field_key: 'asal_instansi', label: 'Asal Instansi', tipe: 'teks', wajib: false, urutan: 8, aktif: true },
  { id: 'f-3-9', jenis_data_id: JD_APARATUR_MINGGU_ID, level: 'minggu', field_key: 'metode_pelatihan', label: 'Metode Pelatihan', tipe: 'pilihan', opsi_pilihan: ['Luring', 'Blended', 'Full Online'], wajib: false, urutan: 9, aktif: true },

  // 4. Data Aparatur (Bulan)
  { id: 'f-4-1', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'nama', label: 'Nama Lulusan Pelatihan', tipe: 'teks', wajib: true, is_identitas: true, urutan: 1, aktif: true },
  { id: 'f-4-2', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'nik', label: 'NIK', tipe: 'teks', wajib: true, is_identitas: true, urutan: 2, aktif: true },
  { id: 'f-4-3', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'tempat_tanggal_lahir', label: 'Tempat & Tanggal Lahir', tipe: 'teks', wajib: false, urutan: 3, aktif: true },
  { id: 'f-4-4', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'jenis_kelamin', label: 'Jenis Kelamin (L/P)', tipe: 'pilihan', opsi_pilihan: ['Laki-laki', 'Perempuan'], wajib: false, urutan: 4, aktif: true },
  { id: 'f-4-5', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'nip', label: 'NIP', tipe: 'teks', wajib: false, is_identitas: true, urutan: 5, aktif: true },
  { id: 'f-4-6', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'jabatan', label: 'Jabatan', tipe: 'teks', wajib: false, urutan: 6, aktif: true },
  { id: 'f-4-7', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'pangkat_gol_ruang', label: 'Pangkat/Gol. Ruang', tipe: 'teks', wajib: false, urutan: 7, aktif: true },
  { id: 'f-4-8', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'pendidikan_terakhir', label: 'Pendidikan Terakhir', tipe: 'pilihan', opsi_pilihan: ['SMA/SMK', 'D3', 'D4/S1', 'S2', 'S3'], wajib: false, urutan: 8, aktif: true },
  { id: 'f-4-9', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'no_telepon', label: 'Nomor Tlp.', tipe: 'teks', wajib: false, is_identitas: true, urutan: 9, aktif: true },
  { id: 'f-4-10', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'unit_kerja_eselon_i', label: 'Unit Kerja Eselon I', tipe: 'teks', wajib: false, urutan: 10, aktif: true },
  { id: 'f-4-11', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'unit_kerja', label: 'Unit Kerja', tipe: 'teks', wajib: false, urutan: 11, aktif: true },
  { id: 'f-4-12', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'alamat_kantor', label: 'Alamat Kantor', tipe: 'teks', wajib: false, urutan: 12, aktif: true },
  { id: 'f-4-13', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'nama_pelatihan', label: 'Nama Pelatihan', tipe: 'teks', wajib: true, urutan: 13, aktif: true },
  { id: 'f-4-14', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'jenis_diklat', label: 'Jenis Diklat', tipe: 'pilihan', opsi_pilihan: ['Reguler', 'Full Online', 'Blended'], wajib: false, urutan: 14, aktif: true },
  { id: 'f-4-15', jenis_data_id: JD_APARATUR_BULAN_ID, level: 'bulan', field_key: 'tanggal_pelatihan', label: 'Tanggal Pelatihan', tipe: 'tanggal', wajib: false, urutan: 15, aktif: true },

  // 5. Data Instruktur dan WI (Minggu)
  { id: 'f-5-1', jenis_data_id: JD_INSTRUKTUR_MINGGU_ID, level: 'minggu', field_key: 'jumlah_instruktur_wi', label: 'Jumlah Instruktur dan Widyaiswara', tipe: 'angka', wajib: true, urutan: 1, aktif: true },
  { id: 'f-5-2', jenis_data_id: JD_INSTRUKTUR_MINGGU_ID, level: 'minggu', field_key: 'jenjang_jabatan_instruktur', label: 'Jenjang Jabatan Instruktur', tipe: 'pilihan', opsi_pilihan: ['Penyelia', 'Pertama', 'Muda', 'Madya'], wajib: false, urutan: 2, aktif: true },
  { id: 'f-5-3', jenis_data_id: JD_INSTRUKTUR_MINGGU_ID, level: 'minggu', field_key: 'jenjang_jabatan_widyaiswara', label: 'Jenjang Jabatan Widyaiswara', tipe: 'pilihan', opsi_pilihan: ['Pertama', 'Muda', 'Madya', 'Utama'], wajib: false, urutan: 3, aktif: true },
  { id: 'f-5-4', jenis_data_id: JD_INSTRUKTUR_MINGGU_ID, level: 'minggu', field_key: 'instruktur_berdasarkan_keahlian', label: 'Instruktur Berdasarkan Keahlian', tipe: 'angka', wajib: false, urutan: 4, aktif: true },
  { id: 'f-5-5', jenis_data_id: JD_INSTRUKTUR_MINGGU_ID, level: 'minggu', field_key: 'widyaiswara_berdasarkan_keahlian', label: 'Widyaiswara Berdasarkan Keahlian', tipe: 'angka', wajib: false, urutan: 5, aktif: true },

  // 6. Data Instruktur dan Widyaiswara (Bulan)
  { id: 'f-6-1', jenis_data_id: JD_INSTRUKTUR_BULAN_ID, level: 'bulan', field_key: 'nama', label: 'Nama Lengkap', tipe: 'teks', wajib: true, urutan: 1, aktif: true },
  { id: 'f-6-2', jenis_data_id: JD_INSTRUKTUR_BULAN_ID, level: 'bulan', field_key: 'nip', label: 'NIP', tipe: 'teks', wajib: true, is_identitas: true, urutan: 2, aktif: true },
  { id: 'f-6-3', jenis_data_id: JD_INSTRUKTUR_BULAN_ID, level: 'bulan', field_key: 'jenis_kelamin', label: 'Jenis Kelamin', tipe: 'pilihan', opsi_pilihan: ['Laki-laki', 'Perempuan'], wajib: false, urutan: 3, aktif: true },
  { id: 'f-6-4', jenis_data_id: JD_INSTRUKTUR_BULAN_ID, level: 'bulan', field_key: 'jabatan', label: 'Jabatan (Instruktur / Widyaiswara)', tipe: 'teks', wajib: false, urutan: 4, aktif: true },
  { id: 'f-6-5', jenis_data_id: JD_INSTRUKTUR_BULAN_ID, level: 'bulan', field_key: 'bidang_keahlian', label: 'Bidang Keahlian', tipe: 'teks', wajib: false, urutan: 5, aktif: true },
  { id: 'f-6-6', jenis_data_id: JD_INSTRUKTUR_BULAN_ID, level: 'bulan', field_key: 'pendidikan', label: 'Pendidikan', tipe: 'pilihan', opsi_pilihan: ['D3', 'D4/S1', 'S2', 'S3'], wajib: false, urutan: 6, aktif: true },
  { id: 'f-6-7', jenis_data_id: JD_INSTRUKTUR_BULAN_ID, level: 'bulan', field_key: 'status_asn', label: 'Status ASN (PNS/PPPK)', tipe: 'pilihan', opsi_pilihan: ['PNS', 'PPPK'], wajib: false, urutan: 7, aktif: true },

  // 7. Data Belanja Modal (Minggu)
  { id: 'f-7-1', jenis_data_id: JD_BELANJA_MODAL_ID, level: 'minggu', field_key: 'judul_kegiatan', label: 'Judul Kegiatan', tipe: 'teks', wajib: true, urutan: 1, aktif: true },
  { id: 'f-7-2', jenis_data_id: JD_BELANJA_MODAL_ID, level: 'minggu', field_key: 'volume', label: 'Volume', tipe: 'angka', wajib: false, urutan: 2, aktif: true },
  { id: 'f-7-3', jenis_data_id: JD_BELANJA_MODAL_ID, level: 'minggu', field_key: 'satuan', label: 'Satuan', tipe: 'teks', wajib: false, urutan: 3, aktif: true },
  { id: 'f-7-4', jenis_data_id: JD_BELANJA_MODAL_ID, level: 'minggu', field_key: 'pagu_anggaran', label: 'Pagu Anggaran (Rp)', tipe: 'angka', wajib: false, urutan: 4, aktif: true },
  { id: 'f-7-5', jenis_data_id: JD_BELANJA_MODAL_ID, level: 'minggu', field_key: 'sumber_dana', label: 'Sumber Dana', tipe: 'pilihan', opsi_pilihan: ['RM', 'PNBP', 'BLU', 'SBSN'], wajib: false, urutan: 5, aktif: true },
  { id: 'f-7-6', jenis_data_id: JD_BELANJA_MODAL_ID, level: 'minggu', field_key: 'realisasi_anggaran', label: 'Realisasi Anggaran (Rp)', tipe: 'angka', wajib: false, urutan: 6, aktif: true },
  { id: 'f-7-7', jenis_data_id: JD_BELANJA_MODAL_ID, level: 'minggu', field_key: 'realisasi_fisik', label: 'Realisasi Fisik (%)', tipe: 'angka', wajib: false, urutan: 7, aktif: true },
  { id: 'f-7-8', jenis_data_id: JD_BELANJA_MODAL_ID, level: 'minggu', field_key: 'progress_pelaksanaan', label: 'Progress Pelaksanaan', tipe: 'teks_panjang', wajib: false, urutan: 8, aktif: true },
  { id: 'f-7-9', jenis_data_id: JD_BELANJA_MODAL_ID, level: 'minggu', field_key: 'permasalahan', label: 'Permasalahan', tipe: 'teks_panjang', wajib: false, urutan: 9, aktif: true },

  // 8. Data Capaian Anggaran per Jenis Belanja (Minggu)
  { id: 'f-8-1', jenis_data_id: JD_ANGGARAN_BELANJA_ID, level: 'minggu', field_key: 'pagu_belanja_pegawai', label: 'Pagu Belanja Pegawai (Rp)', tipe: 'angka', wajib: false, urutan: 1, aktif: true },
  { id: 'f-8-2', jenis_data_id: JD_ANGGARAN_BELANJA_ID, level: 'minggu', field_key: 'realisasi_belanja_pegawai', label: 'Realisasi Belanja Pegawai (Rp)', tipe: 'angka', wajib: false, urutan: 2, aktif: true },
  { id: 'f-8-3', jenis_data_id: JD_ANGGARAN_BELANJA_ID, level: 'minggu', field_key: 'pagu_belanja_barang', label: 'Pagu Belanja Barang (Rp)', tipe: 'angka', wajib: false, urutan: 3, aktif: true },
  { id: 'f-8-4', jenis_data_id: JD_ANGGARAN_BELANJA_ID, level: 'minggu', field_key: 'realisasi_belanja_barang', label: 'Realisasi Belanja Barang (Rp)', tipe: 'angka', wajib: false, urutan: 4, aktif: true },
  { id: 'f-8-5', jenis_data_id: JD_ANGGARAN_BELANJA_ID, level: 'minggu', field_key: 'pagu_belanja_modal', label: 'Pagu Belanja Modal (Rp)', tipe: 'angka', wajib: false, urutan: 5, aktif: true },
  { id: 'f-8-6', jenis_data_id: JD_ANGGARAN_BELANJA_ID, level: 'minggu', field_key: 'realisasi_belanja_modal', label: 'Realisasi Belanja Modal (Rp)', tipe: 'angka', wajib: false, urutan: 6, aktif: true },

  // 9. Data Capaian Anggaran per Sumber Dana (Minggu)
  { id: 'f-9-1', jenis_data_id: JD_ANGGARAN_DANA_ID, level: 'minggu', field_key: 'pagu_rm', label: 'Pagu RM (Rp)', tipe: 'angka', wajib: false, urutan: 1, aktif: true },
  { id: 'f-9-2', jenis_data_id: JD_ANGGARAN_DANA_ID, level: 'minggu', field_key: 'realisasi_rm', label: 'Realisasi RM (Rp)', tipe: 'angka', wajib: false, urutan: 2, aktif: true },
  { id: 'f-9-3', jenis_data_id: JD_ANGGARAN_DANA_ID, level: 'minggu', field_key: 'pagu_pnbp_blu', label: 'Pagu PNBP/BLU (Rp)', tipe: 'angka', wajib: false, urutan: 3, aktif: true },
  { id: 'f-9-4', jenis_data_id: JD_ANGGARAN_DANA_ID, level: 'minggu', field_key: 'realisasi_pnbp_blu', label: 'Realisasi PNBP/BLU (Rp)', tipe: 'angka', wajib: false, urutan: 4, aktif: true },
  { id: 'f-9-5', jenis_data_id: JD_ANGGARAN_DANA_ID, level: 'minggu', field_key: 'pagu_sbsn', label: 'Pagu SBSN (Rp)', tipe: 'angka', wajib: false, urutan: 5, aktif: true },
  { id: 'f-9-6', jenis_data_id: JD_ANGGARAN_DANA_ID, level: 'minggu', field_key: 'realisasi_sbsn', label: 'Realisasi SBSN (Rp)', tipe: 'angka', wajib: false, urutan: 6, aktif: true },
]

function generatePeriods2026() {
  const periods = []

  // Tahun
  periods.push({
    id: 'p-yr-2026', level: 'tahun', tahun: 2026,
    tanggal_mulai: '2026-01-01', tanggal_selesai: '2026-12-31', deadline: '2027-06-30', label: 'Tahun 2026',
  })

  // Triwulan
  const qDates = [
    { q: 1, s: '2026-01-01', e: '2026-03-31', dl: '2026-06-30', label: 'Triwulan I 2026' },
    { q: 2, s: '2026-04-01', e: '2026-06-30', dl: '2026-09-30', label: 'Triwulan II 2026' },
    { q: 3, s: '2026-07-01', e: '2026-09-30', dl: '2026-12-31', label: 'Triwulan III 2026' },
    { q: 4, s: '2026-10-01', e: '2026-12-31', dl: '2027-03-31', label: 'Triwulan IV 2026' },
  ]
  qDates.forEach(q => {
    periods.push({
      id: `p-q-${q.q}`, level: 'triwulan', tahun: 2026, triwulan_ke: q.q,
      tanggal_mulai: q.s, tanggal_selesai: q.e, deadline: q.dl, label: q.label,
    })
  })

  // Bulan
  const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
  const monthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

  for (let m = 1; m <= 12; m++) {
    const s = `2026-${String(m).padStart(2, '0')}-01`
    const e = `2026-${String(m).padStart(2, '0')}-${monthDays[m - 1]}`
    const nextM = m === 12 ? 1 : m + 1
    const nextY = m === 12 ? 2027 : 2026
    const dl = `${nextY}-${String(nextM).padStart(2, '0')}-${monthDays[nextM - 1]}`

    periods.push({
      id: `p-m-${m}`, level: 'bulan', tahun: 2026, bulan: m,
      triwulan_ke: Math.ceil(m / 3),
      tanggal_mulai: s, tanggal_selesai: e, deadline: dl, label: `${monthNames[m - 1]} 2026`,
    })

    // 4 Minggu per bulan
    for (let w = 1; w <= 4; w++) {
      const wStart = (w - 1) * 7 + 1
      const wEnd = w === 4 ? monthDays[m - 1] : w * 7
      const ws = `2026-${String(m).padStart(2, '0')}-${String(wStart).padStart(2, '0')}`
      const we = `2026-${String(m).padStart(2, '0')}-${String(wEnd).padStart(2, '0')}`
      const wdl = `2026-${String(m).padStart(2, '0')}-${String(Math.min(wEnd + 7, monthDays[m - 1])).padStart(2, '0')}`

      periods.push({
        id: `p-w-${m}-${w}`, level: 'minggu', tahun: 2026, bulan: m, minggu_ke: w,
        triwulan_ke: Math.ceil(m / 3),
        tanggal_mulai: ws, tanggal_selesai: we, deadline: wdl, label: `Minggu ${w} ${monthNames[m - 1].slice(0, 3)} 2026`,
      })
    }
  }

  return periods
}

const DEFAULT_ACTIVITIES = [
  {
    id: 'act-1',
    upt_key: 'upt_jakarta',
    tanggal: '2026-09-02',
    status: 'selesai',
    uraian: 'Pelaksanaan Uji Kompetensi Keahlian Nautika Kapal Perikanan Angkatan III',
    pic: ['Dr. Hendra', 'Siti Rahma'],
    lingkup: 'internal_puslat',
    output: '30 Taruna dinyatakan kompeten dan lulus sertifikasi BNSP',
    hambatan: false,
    interaksi: 'Penguji LSP Kelautan',
    feedback: 'Fasilitas simulator berfungsi sangat baik',
  },
  {
    id: 'act-2',
    upt_key: 'upt_jakarta',
    tanggal: '2026-09-03',
    status: 'proses',
    uraian: 'Bimbingan Teknis Pengolahan Hasil Tangkap Mutu Higienis di Muara Baru',
    pic: ['Ahmad Fauzi', 'Dewi Lestari'],
    lingkup: 'internal_eksternal',
    output: 'Pendampingan 45 UMKM pengolah ikan teri nasi dan rajungan',
    hambatan: false,
    interaksi: 'Dinas KPKP DKI Jakarta',
    feedback: 'Antusiasme peserta sangat tinggi',
  },
]

const DEFAULT_ENTRIES = [
  {
    id: 'ent-1',
    jenis_data_id: JD_MASYARAKAT_BULAN_ID,
    upt_key: 'upt_jakarta',
    period_id: 'p-m-9',
    nama: 'Bambang Sudirjo',
    nik: '3171010101900001',
    data_json: {
      no_urut: '1',
      penyelenggara_pelatihan: 'BPPP Jakarta',
      nama: 'Bambang Sudirjo',
      nik: '3171010101900001',
      tempat_lahir: 'Jakarta',
      tanggal_lahir: '1990-05-12',
      jenis_kelamin: 'Laki-laki',
      pendidikan_terakhir: 'SMA/SMK',
      no_telepon: '081234567890',
      alamat: 'Jl. Bahari No. 12, Tanjung Priok',
      provinsi: 'DKI Jakarta',
      kab_kota: 'Jakarta Utara',
      bidang_pelatihan: 'Permesinan Kapal',
      jenis_pelatihan_dukungan_program_terobosan: 'Ekonomi Biru',
      nama_pelatihan: 'Pelatihan Mesin Perikanan Modern',
      tanggal_pelatihan: '2026-09-01',
      no_sertifikat_pelatihan: 'KP-2026-09-001',
      link_sertifikat_pelatihan_by_name: 'https://elaut.kkp.go.id/cert/001',
      no_kusuka: 'KSK-317101-001',
      jenis_pelatihan: 'Reguler',
    },
    data_ekstra: {},
    created_at: new Date().toISOString(),
  },
  {
    id: 'ent-2',
    jenis_data_id: JD_MASYARAKAT_BULAN_ID,
    upt_key: 'upt_jakarta',
    period_id: 'p-m-9',
    nama: 'Siti Nurhaliza',
    nik: '3172020202920002',
    data_json: {
      no_urut: '2',
      penyelenggara_pelatihan: 'BPPP Jakarta',
      nama: 'Siti Nurhaliza',
      nik: '3172020202920002',
      tempat_lahir: 'Surabaya',
      tanggal_lahir: '1992-08-20',
      jenis_kelamin: 'Perempuan',
      pendidikan_terakhir: 'D4/S1',
      no_telepon: '081298765432',
      alamat: 'Jl. Dermaga No. 45',
      provinsi: 'DKI Jakarta',
      kab_kota: 'Jakarta Barat',
      bidang_pelatihan: 'Pengolahan Hasil Perikanan',
      jenis_pelatihan_dukungan_program_terobosan: 'HACCP & Higiene',
      nama_pelatihan: 'Pelatihan Keamanan Pangan Olahan Ikan',
      tanggal_pelatihan: '2026-09-02',
      no_sertifikat_pelatihan: 'KP-2026-09-002',
      link_sertifikat_pelatihan_by_name: 'https://elaut.kkp.go.id/cert/002',
      no_kusuka: 'KSK-317101-002',
      jenis_pelatihan: 'Reguler',
    },
    data_ekstra: {},
    created_at: new Date().toISOString(),
  }
]

// Pre-seeded rekap mingguan bulan 9 (September 2026) untuk Masyarakat
const DEFAULT_REKAP = [
  // Minggu 1 September (2 peserta)
  { id: 'rn-1', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, upt_key: 'upt_jakarta', period_id: 'p-w-9-1', field_key: 'nama_pelatihan', value_text: 'Pelatihan Mesin Perikanan Modern' },
  { id: 'rn-2', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, upt_key: 'upt_jakarta', period_id: 'p-w-9-1', field_key: 'jumlah_peserta', value: 2 },
  { id: 'rn-3', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, upt_key: 'upt_jakarta', period_id: 'p-w-9-1', field_key: 'pagu_anggaran', value: 25000000 },
  { id: 'rn-4', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, upt_key: 'upt_jakarta', period_id: 'p-w-9-1', field_key: 'realisasi_anggaran', value: 23500000 },
  { id: 'rn-5', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, upt_key: 'upt_jakarta', period_id: 'p-w-9-1', field_key: 'sumber_dana', value_text: 'PNBP' },
  { id: 'rn-6', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, upt_key: 'upt_jakarta', period_id: 'p-w-9-1', field_key: 'metode_pelatihan', value_text: 'Luring' },

  // Minggu 2 September (1 peserta)
  { id: 'rn-7', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, upt_key: 'upt_jakarta', period_id: 'p-w-9-2', field_key: 'nama_pelatihan', value_text: 'Pelatihan Penanganan Mutu Ikan' },
  { id: 'rn-8', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, upt_key: 'upt_jakarta', period_id: 'p-w-9-2', field_key: 'jumlah_peserta', value: 1 },
  { id: 'rn-9', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, upt_key: 'upt_jakarta', period_id: 'p-w-9-2', field_key: 'pagu_anggaran', value: 15000000 },
  { id: 'rn-10', jenis_data_id: JD_MASYARAKAT_MINGGU_ID, upt_key: 'upt_jakarta', period_id: 'p-w-9-2', field_key: 'realisasi_anggaran', value: 14200000 },
]

function getInitialDB() {
  const existing = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
  if (existing) {
    try {
      return JSON.parse(existing)
    } catch (e) {
      console.error('Error parsing mock DB, resetting...', e)
    }
  }

  const initial = {
    upt_list: DEFAULT_UPTS,
    profiles: DEFAULT_PROFILES,
    jenis_data: DEFAULT_JENIS_DATA,
    field_definitions: DEFAULT_FIELDS,
    periods: generatePeriods2026(),
    daily_activity: DEFAULT_ACTIVITIES,
    data_entries: DEFAULT_ENTRIES,
    rekap_nilai: DEFAULT_REKAP,
    audit_log: [],
  }

  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial))
  }
  return initial
}

function saveDB(db) {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  }
}

class MockQueryBuilder {
  constructor(table) {
    this.table = table
    this.filters = []
    this.sorts = []
    this.limitCount = null
    this.isSingle = false
    this.countOnly = false
  }

  select(fields, options) {
    if (options?.head && options?.count) {
      this.countOnly = true
    }
    return this
  }

  eq(column, value) {
    this.filters.push(item => item[column] === value)
    return this
  }

  in(column, values) {
    this.filters.push(item => values.includes(item[column]))
    return this
  }

  order(column, options = {}) {
    this.sorts.push({ column, ascending: options.ascending !== false })
    return this
  }

  limit(count) {
    this.limitCount = count
    return this
  }

  single() {
    this.isSingle = true
    return this
  }

  async _execute() {
    const db = getInitialDB()

    if (this.table === 'v_publik_rekap') {
      const activePublikJd = db.jenis_data.filter(j => j.publik_boleh_lihat && j.aktif)
      const jdIds = activePublikJd.map(j => j.id)

      const map = {}
      db.data_entries.forEach(entry => {
        if (!jdIds.includes(entry.jenis_data_id)) return
        const key = `${entry.jenis_data_id}_${entry.period_id}`
        if (!map[key]) {
          const jd = activePublikJd.find(j => j.id === entry.jenis_data_id)
          const p = db.periods.find(p => p.id === entry.period_id)
          map[key] = {
            jenis_data_id: entry.jenis_data_id,
            jenis_data_judul: jd?.judul || '',
            period_id: entry.period_id,
            period_label: p?.label || '',
            level: p?.level || '',
            tahun: p?.tahun || 2026,
            bulan: p?.bulan || null,
            total_baris: 0,
          }
        }
        map[key].total_baris++
      })

      return Object.values(map)
    }

    let rows = [...(db[this.table] || [])]

    // Apply filters
    for (const filter of this.filters) {
      rows = rows.filter(filter)
    }

    // Apply sorting
    for (const sort of this.sorts) {
      rows.sort((a, b) => {
        const valA = a[sort.column]
        const valB = b[sort.column]
        if (valA < valB) return sort.ascending ? -1 : 1
        if (valA > valB) return sort.ascending ? 1 : -1
        return 0
      })
    }

    if (this.limitCount) {
      rows = rows.slice(0, this.limitCount)
    }

    return rows
  }

  then(resolve, reject) {
    return this._execute().then(rows => {
      if (this.countOnly) {
        return resolve({ count: rows.length, data: null, error: null })
      }
      if (this.isSingle) {
        return resolve({ data: rows[0] || null, error: rows.length === 0 ? { message: 'Not found' } : null })
      }
      return resolve({ data: rows, error: null, count: rows.length })
    }).catch(err => {
      resolve({ data: null, error: { message: err.message } })
    })
  }

  async insert(data) {
    const db = getInitialDB()
    if (!db[this.table]) db[this.table] = []

    const items = Array.isArray(data) ? data : [data]
    const inserted = items.map(item => ({
      id: item.id || `mock-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      created_at: new Date().toISOString(),
      ...item,
    }))

    db[this.table].push(...inserted)
    saveDB(db)

    return { data: Array.isArray(data) ? inserted : inserted[0], error: null }
  }

  async update(data) {
    const db = getInitialDB()
    if (!db[this.table]) return { data: null, error: null }

    let updatedCount = 0
    db[this.table] = db[this.table].map(item => {
      const match = this.filters.every(f => f(item))
      if (match) {
        updatedCount++
        return { ...item, ...data, updated_at: new Date().toISOString() }
      }
      return item
    })

    saveDB(db)
    return { data: updatedCount, error: null }
  }

  async upsert(data, options = {}) {
    const db = getInitialDB()
    if (!db[this.table]) db[this.table] = []

    const items = Array.isArray(data) ? data : [data]
    const onConflict = options.onConflict ? options.onConflict.split(',') : ['id']

    items.forEach(newItem => {
      const idx = db[this.table].findIndex(existing => {
        return onConflict.every(key => String(existing[key]) === String(newItem[key]))
      })

      if (idx >= 0) {
        db[this.table][idx] = { ...db[this.table][idx], ...newItem, updated_at: new Date().toISOString() }
      } else {
        db[this.table].push({
          id: newItem.id || `mock-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
          created_at: new Date().toISOString(),
          ...newItem,
        })
      }
    })

    saveDB(db)
    return { data: items, error: null }
  }

  async delete() {
    const db = getInitialDB()
    if (!db[this.table]) return { data: null, error: null }

    db[this.table] = db[this.table].filter(item => !this.filters.every(f => f(item)))
    saveDB(db)
    return { data: true, error: null }
  }
}

export const mockSupabase = {
  isMock: true,
  from(table) {
    return new MockQueryBuilder(table)
  },
  async rpc(funcName, params = {}) {
    const db = getInitialDB()
    if (funcName === 'total_pasangan_mingguan') {
      const { p_jenis_data_bulan_id, p_upt_key, p_field_key, p_tahun, p_bulan } = params
      const jdBulan = db.jenis_data.find(j => j.id === p_jenis_data_bulan_id)
      if (!jdBulan || !jdBulan.pasangan_mingguan_id) return { data: 0, error: null }

      const matchingPeriods = db.periods.filter(p => p.level === 'minggu' && p.tahun === Number(p_tahun) && p.bulan === Number(p_bulan))
      const periodIds = matchingPeriods.map(p => p.id)

      const sum = db.rekap_nilai
        .filter(r => r.jenis_data_id === jdBulan.pasangan_mingguan_id && r.upt_key === p_upt_key && r.field_key === p_field_key && periodIds.includes(r.period_id))
        .reduce((acc, r) => acc + (Number(r.value) || 0), 0)

      return { data: sum, error: null }
    }
    return { data: null, error: { message: `RPC function ${funcName} not found` } }
  },
  auth: {
    async getSession() {
      const raw = localStorage.getItem(SESSION_KEY)
      if (raw) {
        try {
          const user = JSON.parse(raw)
          return { data: { session: { user } }, error: null }
        } catch (e) {}
      }
      return { data: { session: null }, error: null }
    },

    onAuthStateChange(callback) {
      const handler = () => {
        const raw = localStorage.getItem(SESSION_KEY)
        const user = raw ? JSON.parse(raw) : null
        callback(user ? 'SIGNED_IN' : 'SIGNED_OUT', user ? { user } : null)
      }
      window.addEventListener('storage', handler)
      return {
        data: {
          subscription: {
            unsubscribe: () => window.removeEventListener('storage', handler),
          },
        },
      }
    },

    async signInWithPassword({ email, password }) {
      const db = getInitialDB()
      const user = db.profiles.find(p => p.email === email)

      if (!user) {
        return { data: null, error: { message: 'Akun tidak ditemukan. Gunakan admin@kp.go.id atau upt@kp.go.id' } }
      }

      const sessionUser = { id: user.id, email: user.email, user_metadata: { role: user.role } }
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser))
      window.dispatchEvent(new Event('storage'))

      return { data: { user: sessionUser, session: { user: sessionUser } }, error: null }
    },

    async signOut() {
      localStorage.removeItem(SESSION_KEY)
      window.dispatchEvent(new Event('storage'))
      return { error: null }
    },
  },

  functions: {
    async invoke(funcName, { body }) {
      if (funcName === 'create-upt-user') {
        const db = getInitialDB()
        if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
          return { data: null, error: { message: 'Format email tidak valid' } }
        }
        if (!body.password || String(body.password).length < 8) {
          return { data: null, error: { message: 'Password minimal 8 karakter' } }
        }
        const uptValid = db.upt_list.find(u => u.key === body.upt_key && u.aktif)
        if (!uptValid) {
          return { data: null, error: { message: `UPT '${body.upt_key}' tidak valid atau tidak aktif` } }
        }
        const existing = db.profiles.find(p => p.email === body.email)
        if (existing) {
          return { data: null, error: { message: 'Email sudah digunakan oleh akun lain' } }
        }
        const newId = `usr-upt-${Date.now()}`
        const newProfile = {
          id: newId,
          role: 'upt',
          upt_key: body.upt_key,
          nama_lengkap: body.nama_lengkap,
          email: body.email,
        }
        db.profiles.push(newProfile)
        saveDB(db)
        return { data: { success: true, user: newProfile }, error: null }
      }
      return { data: null, error: { message: 'Function not mocked' } }
    },
  },
}
