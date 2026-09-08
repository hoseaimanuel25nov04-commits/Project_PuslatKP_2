# Setup Dashboard Puslat KP di Laragon

Paket ini isinya:
```
laragon_project/
├── database/
│   ├── schema.sql        <- struktur tabel (jalankan pertama)
│   └── seed_iku.sql      <- isi 24 indikator IKU + rincian anak (jalankan kedua)
├── api/
│   ├── config.php        <- koneksi database + password admin
│   ├── iku_get.php        <- GET data dashboard IKU
│   ├── iku_save.php       <- POST simpan perubahan dari Panel Admin IKU
│   ├── peserta_get.php    <- GET data peserta pelatihan
│   └── peserta_upload.php <- POST upload/upsert peserta dari Excel
├── dashboard_iku_bulanan.jsx
└── dashboard_peserta_pelatihan.jsx
```

## 1. Taruh folder proyek

Salin folder `laragon_project` ke `C:\laragon\www\`, lalu ganti namanya
sesuai selera, misalnya `dashboard-puslatkp`. Jadi strukturnya:
```
C:\laragon\www\dashboard-puslatkp\
├── database\
├── api\
└── ...
```

## 2. Buat database

1. Buka Laragon → klik **Database** (atau **Menu → MySQL → HeidiSQL** /
   arahkan browser ke `http://localhost/phpmyadmin`).
2. Jalankan seluruh isi `database/schema.sql` (bikin database
   `dashboard_puslatkp` + semua tabel).
3. Jalankan seluruh isi `database/seed_iku.sql` (isi 24 indikator IKU +
   rincian anak; nilai bulanan masih kosong — nanti diisi lewat Panel
   Admin).
4. Dashboard Peserta Pelatihan **tidak perlu di-seed** — datanya
   langsung terisi begitu kamu upload file Excel rekap lewat Panel
   Admin di dashboard.

## 3. Sesuaikan `api/config.php` (kalau perlu)

Default Laragon biasanya sudah cocok (`host=localhost`,
`user=root`, password kosong). Kalau kamu mengganti setting MySQL
Laragon, sesuaikan di bagian atas file ini. Password admin dashboard
(`ADMIN_KEY`) juga diatur di sini — harus **sama persis** dengan
`ADMIN_PASSWORD` di kedua file `.jsx`.

## 4. Jalankan Laragon

Klik **Start All** di Laragon. Karena folder proyek ada di `www/`,
otomatis bisa diakses lewat:
- `http://dashboard-puslatkp.test/api/iku_get.php` (auto-virtualhost), atau
- `http://localhost/dashboard-puslatkp/api/iku_get.php`

Coba buka salah satu URL itu di browser — kalau muncul JSON
(`{"data":[...], "updatedAt":null}`), berarti backend & database
sudah nyambung.

## 5. Sambungkan file .jsx ke backend

Di bagian atas `dashboard_iku_bulanan.jsx` dan
`dashboard_peserta_pelatihan.jsx`, ada baris:
```js
const API_BASE = "/api";
```
- Kalau dashboard **dibuka dari domain Laragon yang sama**
  (misalnya kamu taruh file `.jsx` itu dan render lewat server yang
  sama di `dashboard-puslatkp.test`), biarkan `"/api"` apa adanya.
- Kalau dashboard dibuka dari tempat lain (misalnya masih lewat
  Claude/artifact, atau app React terpisah), ganti jadi URL lengkap,
  misalnya:
  ```js
  const API_BASE = "http://dashboard-puslatkp.test/api";
  // atau
  const API_BASE = "http://localhost/dashboard-puslatkp/api";
  ```

## Catatan lain

- Password admin default: **111** (sama seperti sebelumnya, dipakai
  di kedua dashboard dan juga dicek ulang di server lewat header
  `X-Admin-Key`).
- Upload Excel di Dashboard Peserta Pelatihan sekarang **tidak perlu
  digabung manual** — server yang urus dedup (NIK + Nama Pelatihan +
  Tanggal Pelatihan) lewat `UNIQUE KEY` di database, jadi upload
  ulang file yang sama aman, tidak dobel.
- Semua backend PHP di sini pakai **PDO + prepared statement**
  (aman dari SQL injection dasar), koneksi tunggal ke database
  `dashboard_puslatkp`.
