# PUSLATKP Management Hub (Performance Portal)

Aplikasi web dashboard pelaporan aktivitas dan kinerja tim Pusat Pelatihan Kelautan dan Perikanan (PUSLATKP) Kementerian Kelautan dan Perikanan (KKP). Dilengkapi sistem **Jenis Data Dinamis** (Form Builder otomatis tanpa ubah kode), validasi silang Bulanan vs Mingguan, batas tenggang deadline otomatis, ekspor/impor Excel cerdas, dan kontrol hak akses 3 peran (Admin, UPT, Publik).

---

## ⚡ CARA CEPAT MENJALANKAN (1-KLIK)

Aplikasi ini sudah dilengkapi skrip peluncur otomatis yang mendeteksi Node.js bawaan Laragon:

### Opsi A: Menggunakan `run.bat` (Paling Praktis)
Cukup klik ganda berkas **`run.bat`** di dalam folder `c:\laragon\www\laragon_project\run.bat` atau `puslatkp-hub\run.bat`.

Skrip ini akan secara otomatis:
1. Menghubungkan PATH ke Node.js v22 Laragon.
2. Memeriksa dependensi.
3. Menjalankan server Vite di `http://localhost:5173/` dan membuka browser Anda secara otomatis.

### Opsi B: Melalui Terminal (PowerShell / Command Prompt)
```powershell
# Set path ke Node.js Laragon jika belum terdaftar global
$env:PATH = "C:\laragon\bin\nodejs\node-v22.21.1-win-x64;$env:PATH"

# Masuk ke folder aplikasi
cd c:\laragon\www\laragon_project\puslatkp-hub

# Jalankan server development
npm run dev
```
Buka browser pada alamat: [http://localhost:5173/](http://localhost:5173/)

---

## 🎯 Mode Demo (Siap Pakai Tanpa Setup Database)

Jika Anda belum menghubungkan proyek Supabase, aplikasi **langsung dapat dicoba secara penuh** melalui *In-Browser Mock Engine (Local Storage)* bawaan:

- **👑 Masuk sebagai Admin**:
  - Klik tombol biru **👑 Masuk Admin** di halaman login (atau isi manual: `admin@kp.go.id` / `admin`).
  - Akses: Semua menu, Kelola Akun UPT, Kelola Jenis Data (Form Builder), Rekap & Ekspor Semua UPT.
- **🏢 Masuk sebagai UPT**:
  - Klik tombol hijau **🏢 Masuk UPT** di halaman login (atau isi manual: `upt@kp.go.id` / `upt`).
  - Akses: Dashboard, Daily Activity, Input Data (BPPP Jakarta).
- **🌐 Akses Publik**:
  - Klik tautan **Tampilan Publik** di bawah formulir login atau kunjungi [http://localhost:5173/?page=publik](http://localhost:5173/?page=publik).
  - Akses: Portal agregat tanpa sidebar, tanpa login, seluruh data identitas pribadi (Nama/NIK/Telp/Alamat) disembunyikan otomatis demi privasi.

---

## 🚀 Fitur Unggulan

1. **Sistem Jenis Data Dinamis (Core Feature)**:
   - Admin dapat menambah Jenis Data baru (mis. *Data Peserta Pelatihan KNMP*, *Data Bimtek*, *Data Aset Sarpras*) langsung dari UI web tanpa sentuh kode pemrograman sama sekali.
   - Kolom-kolom pada setiap level (Tahun, Triwulan, Bulan, Minggu) dapat dikonfigurasi tipe datanya (angka, teks, tanggal, pilihan dropdown), diset wajib diisi, ditandai sebagai identitas sensitif, serta diatur urutannya dengan drag-and-drop (`@dnd-kit`).
   - Form pada sisi UPT langsung menyesuaikan secara real-time.

2. **4 Tingkat Periode Pelaporan**:
   - **Tahun**: Target / rencana rekapitulasi tahunan.
   - **Triwulan (I–IV)**: Capaian triwulanan.
   - **Bulan**: Data detail per-orang/per-baris lengkap (18 kolom bawaan untuk peserta pelatihan, atau kolom kustom lainnya).
   - **Minggu (1–4)**: Rekap progres angka mingguan.

3. **Validasi Cerdas Bulanan vs Mingguan**:
   - Membandingkan otomatis jumlah baris data individu di tab Bulan dengan akumulasi angka pada 4 Minggu di bulan tersebut.
   - Menampilkan status ✓ Sesuai (hijau) atau ⚠ Selisih (merah peringatan non-blocking).

4. **Aturan Batas Waktu (Deadline) Otomatis**:
   - Mengikuti aturan masa tenggang 1 periode berikutnya:
     - Minggu $N$ $\rightarrow$ deadline akhir Minggu $N+1$
     - Bulan $M$ $\rightarrow$ deadline akhir Bulan $M+1$
     - Triwulan $Q$ $\rightarrow$ deadline akhir Triwulan $Q+1$
   - Form UPT otomatis terkunci (*read-only*) setelah melewati deadline. Hanya Admin yang dapat mengedit atau membuka kunci.

5. **Impor & Ekspor Excel (SheetJS)**:
   - **Pencocokan Kolom Otomatis (Fuzzy Column Matcher)** saat UPT mengunggah file Excel.
   - Kolom tak dikenal otomatis disimpan di kolom cadangan `data_ekstra` dan dicatat ke `audit_log` untuk ditinjau Admin.
   - **Ekspor Gabungan Multi-Sheet (Admin)**: 1 workbook Excel berisi sheet per-level (Tahun, Triwulan, Bulan, Minggu), sheet Validasi, dan sheet Kolom Tidak Dikenal.

---

## 🛠️ Tech Stack

- **Frontend**: React 18/19, Vite, Tailwind CSS (Design System Tokens)
- **Icons**: Lucide React
- **Backend & Database**: Supabase (PostgreSQL, Auth, Row Level Security, Edge Functions)
- **Excel Engine**: SheetJS (`xlsx`) sisi klien
- **Drag-and-Drop**: `@dnd-kit/core` & `@dnd-kit/sortable`
- **Routing**: SPA State-based Navigation (Zero-dependency router)

---

## 📋 Panduan Menghubungkan ke Supabase Live

Saat Anda siap menghubungkan aplikasi ke backend Supabase cloud:

### 1. Buat Proyek di Supabase
1. Buka [https://supabase.com](https://supabase.com) dan buat akun/login.
2. Klik **New Project**, beri nama `puslatkp-management-hub`, pilih wilayah terdekat (*Singapore*), dan buat database password.

### 2. Jalankan Skema Database (SQL Editor)
1. Buka menu **SQL Editor** pada bilah kiri dashboard Supabase.
2. Buka file `supabase/schema.sql` di proyek ini, salin seluruh kodenya.
3. Tempelkan ke SQL Editor Supabase, lalu klik tombol **Run**.
4. Seluruh tabel, view (`v_publik_rekap`), fungsi RLS (`is_admin`, `my_upt_key`, `period_is_locked`), kebijakan keamanan (RLS), 10 UPT awal, periode 2026 lengkap, dan Jenis Data default *"Data Peserta Pelatihan"* (18 kolom) langsung aktif.

### 3. Buat Akun Administrator Pertama
1. Di dashboard Supabase, buka menu **Authentication** $\rightarrow$ **Users** $\rightarrow$ **Add User** $\rightarrow$ **Create User**.
2. Masukkan email (misal: `admin@puslatkp.kkp.go.id`) dan password Anda. Centang **Auto Confirm User**.
3. Salin **User UID** user tersebut.
4. Kembali ke menu **SQL Editor**, jalankan perintah SQL berikut (ganti `UID_ANDA_DISINI`):
   ```sql
   insert into profiles (id, role, upt_key, nama_lengkap)
   values ('UID_ANDA_DISINI', 'admin', null, 'Super Administrator PUSLATKP');
   ```

### 4. Isi Berkas `.env`
Salin file `.env.example` menjadi `.env` di folder `puslatkp-hub`:
```bash
copy .env.example .env
```
Isi kredensial dari Supabase (**Project Settings** $\rightarrow$ **API**):
```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsIn...
```
Simpan file. Vite akan langsung berpindah secara otomatis dari mode demo ke database Supabase live!

### 5. Deploy Supabase Edge Function (`create-upt-user`)
Edge Function ini digunakan oleh Admin untuk membuat akun UPT baru:
```bash
# Login ke Supabase CLI
npx supabase login

# Hubungkan proyek
npx supabase link --project-ref <PROJECT_ID_ANDA>

# Deploy function
npx supabase functions deploy create-upt-user
```

---

## 🌐 Deploy ke Vercel / Netlify

1. Unggah proyek ke repositori GitHub / GitLab.
2. Buka [https://vercel.com](https://vercel.com) $\rightarrow$ **Add New Project** $\rightarrow$ Pilih repositori Anda.
3. Set **Root Directory** ke `puslatkp-hub` (jika disimpan dalam subfolder).
4. Tambahkan Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Klik **Deploy**.

---

## 📖 Panduan Admin: Cara Membuat Jenis Data & Kolom Baru Tanpa Bantuan Programmer

1. **Membuat Jenis Data Baru**:
   - Login sebagai Admin $\rightarrow$ Buka menu **Kelola Jenis Data** di sidebar.
   - Klik tombol **+ Buat Jenis Data Baru**.
   - Masukkan Judul (misal: `Data Peserta Bimtek Kelautan`) dan Deskripsi.
   - Centang *Tampilkan rekap ke Publik* jika data agregatnya boleh dilihat umum.
   - Klik **Buat & Atur Kolom**.

2. **Menambah Kolom Formulir**:
   - Pilih tingkatan level: **Tahun**, **Triwulan**, **Bulan**, atau **Minggu**.
   - Klik **+ Tambah Kolom**:
     - *Label Kolom*: Nama yang tampil di form input.
     - *Tipe Data*: `angka`, `teks`, `tanggal`, atau `pilihan` (dropdown).
     - *Wajib diisi*: Centang jika wajib diisi sebelum menyimpan.
     - *Kolom identitas (🔒)*: Centang jika berisi NIK, Nama, Telepon, atau Alamat. Sistem akan menyembunyikan kolom ini secara otomatis dari rekap publik.
   - Geser ikon grip titik enam untuk mengubah urutan kolom.
   - Klik ikon mata untuk menonaktifkan kolom tanpa menghapus riwayat data lama.

Semua perubahan formulir yang dibuat Admin langsung tampil seketika di akun UPT saat membuka menu **Input Data** tanpa perlu *redeploy* kode.
