-- ============================================================
-- Skema Database — Dashboard IKU & Dashboard Peserta Pelatihan
-- Puslat KP (Pusat Pelatihan Kelautan dan Perikanan)
--
-- Cara pakai di Laragon:
-- 1. Buka HeidiSQL / phpMyAdmin dari menu Laragon.
-- 2. Jalankan seluruh isi file ini (akan membuat database baru
--    bernama `dashboard_puslatkp` beserta semua tabelnya).
-- 3. Lanjutkan dengan menjalankan seed_iku.sql untuk mengisi
--    24 indikator IKU + rincian anaknya (nilai bulanan tetap
--    kosong, diisi lewat Panel Admin).
-- ============================================================

CREATE DATABASE IF NOT EXISTS dashboard_puslatkp
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE dashboard_puslatkp;

-- ============================================================
-- 1) DASHBOARD IKU
-- ============================================================

-- Satu baris = satu indikator utama (no 1-24) ATAU satu rincian
-- anak (kode a,b,c,...). Anak menunjuk ke induknya lewat parent_id.
CREATE TABLE IF NOT EXISTS iku_item (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  parent_id     INT NULL,
  no_urut       INT NULL,                 -- nomor indikator utama (1-24); NULL kalau ini anak
  kode          VARCHAR(10) NULL,         -- kode anak (a, b, c, ...); NULL kalau ini induk
  nama          VARCHAR(500) NOT NULL,
  satuan        VARCHAR(50) NULL,
  target_tahun  DECIMAL(14,2) NULL,
  urutan        INT NOT NULL DEFAULT 0,   -- urutan tampil di dalam induknya
  CONSTRAINT fk_iku_item_parent FOREIGN KEY (parent_id)
    REFERENCES iku_item(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Target & realisasi PER BULAN (m=1..12) untuk tiap item (induk maupun anak)
CREATE TABLE IF NOT EXISTS iku_bulanan (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  item_id    INT NOT NULL,
  bulan      TINYINT NOT NULL,            -- 1-12
  target     DECIMAL(14,2) NULL,
  realisasi  DECIMAL(14,2) NULL,
  UNIQUE KEY uniq_item_bulan (item_id, bulan),
  CONSTRAINT fk_iku_bulanan_item FOREIGN KEY (item_id)
    REFERENCES iku_item(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- NKO yang ditimpa manual oleh admin (per periode: tahun / tw1-4 / m1-12)
CREATE TABLE IF NOT EXISTS iku_nko_override (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  item_id      INT NOT NULL,
  periode_key  VARCHAR(10) NOT NULL,      -- 'tahun', 'tw1'..'tw4', 'm1'..'m12'
  nilai        DECIMAL(14,2) NULL,
  UNIQUE KEY uniq_item_periode (item_id, periode_key),
  CONSTRAINT fk_iku_override_item FOREIGN KEY (item_id)
    REFERENCES iku_item(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Satu baris saja: menyimpan kapan data IKU terakhir disimpan
CREATE TABLE IF NOT EXISTS iku_meta (
  id          TINYINT PRIMARY KEY DEFAULT 1,
  updated_at  DATETIME NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO iku_meta (id, updated_at) VALUES (1, NULL)
  ON DUPLICATE KEY UPDATE id = id;

-- ============================================================
-- 2) DASHBOARD PESERTA PELATIHAN
-- ============================================================

CREATE TABLE IF NOT EXISTS peserta (
  id                     INT AUTO_INCREMENT PRIMARY KEY,
  no_asal                VARCHAR(20) NULL,
  nama                   VARCHAR(255) NOT NULL,
  nik                    VARCHAR(20) NOT NULL,
  no_telp                VARCHAR(30) NULL,
  tempat_lahir           VARCHAR(100) NULL,
  tanggal_lahir_raw      VARCHAR(50) NULL,
  kota_kabupaten         VARCHAR(150) NULL,
  provinsi               VARCHAR(150) NULL,
  jenis_kelamin          VARCHAR(20) NULL,
  alamat                 TEXT NULL,
  pendidikan_terakhir    VARCHAR(100) NULL,
  nama_pelatihan         VARCHAR(300) NULL,
  sektor_pelatihan       VARCHAR(150) NULL,
  bidang_klaster         VARCHAR(200) NULL,
  program_pelatihan      VARCHAR(300) NULL,
  dukungan_prioritas     VARCHAR(200) NULL,
  tanggal_pelatihan_raw  VARCHAR(100) NULL,   -- teks asli, mis. "17 JULI 2026 - 29 JULI 2026"
  tanggal_mulai          DATE NULL,
  tanggal_selesai        DATE NULL,
  tahun                  SMALLINT NULL,
  bulan                  TINYINT NULL,        -- 1-12, dari tanggal_mulai
  triwulan               TINYINT NULL,        -- 1-4, dari tanggal_mulai
  minggu_bulan           TINYINT NULL,        -- 1-5, minggu ke berapa DALAM bulan itu
  no_sertifikat          VARCHAR(100) NULL,
  dedup_key              VARCHAR(400) NOT NULL,  -- nik|nama_pelatihan|tanggal_pelatihan_raw
  created_at             DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at             DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_dedup (dedup_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_peserta_periode ON peserta (tahun, bulan, triwulan, minggu_bulan);
CREATE INDEX idx_peserta_nama ON peserta (nama);
CREATE INDEX idx_peserta_nik ON peserta (nik);
CREATE INDEX idx_peserta_program ON peserta (program_pelatihan(100));
