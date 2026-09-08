-- ============================================================
-- Seed data — 24 indikator IKU + rincian anak (struktur & target
-- tahunan saja; nilai per bulan sengaja dikosongkan, isi lewat
-- Panel Admin dashboard).
-- Jalankan SETELAH schema.sql.
-- ============================================================

USE dashboard_puslatkp;

-- Kosongkan dulu supaya seed ini bisa dijalankan ulang dengan aman
SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE iku_nko_override;
TRUNCATE TABLE iku_bulanan;
TRUNCATE TABLE iku_item;
SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 1, NULL, 'Persentase Lulusan Pelatihan KP Kompeten yang Terserap di Dunia Usaha, Dunia Industri dan/atau Dunia Kerja (DUDIKA) (%)', '%', 76.0, 1);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Lulusan Pelatihan KP Kompeten  BPPP Medan yang Terserap di Dunia Usaha, Dunia Industri dan/atau Dunia Kerja (DUDIKA) (orang)', 'orang', 607.0, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Lulusan Pelatihan KP Kompeten  BPPP Tegal  yang Terserap di Dunia Usaha, Dunia Industri dan/atau Dunia Kerja (DUDIKA)(orang)', 'orang', 9120.0, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Lulusan Pelatihan KP Kompeten  BPPP Banyuwangi  yang Terserap di Dunia Usaha, Dunia Industri dan/atau Dunia Kerja (DUDIKA)(orang)', 'orang', 1266.0, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Lulusan Pelatihan KP Kompeten  BPPP Bitung yang Terserap di Dunia Usaha, Dunia Industri dan/atau Dunia Kerja (DUDIKA) (orang)', 'orang', 472.0, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Lulusan Pelatihan KP Kompeten  BPPP Ambon yang Terserap di Dunia Usaha, Dunia Industri dan/atau Dunia Kerja (DUDIKA) (orang)', 'orang', 836.0, 5);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 2, NULL, 'Persentase Peserta Pelatihan Masyarakat KP yang Menerapkan Kompetensi Hasil Pelatihan (%)', '%', 75.0, 2);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Persentase Peserta Pelatihan Masyarakat KP BPPP Medan yang Menerapkan Kompetensi Hasil Pelatihan ', '%', 75.0, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Persentase Peserta Pelatihan Masyarakat KP BPPP Tegal yang Menerapkan Kompetensi Hasil Pelatihan ', '%', 75.0, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Persentase Peserta Pelatihan Masyarakat KP BPPP Banyuwangi yang Menerapkan Kompetensi Hasil Pelatihan ', '%', 75.0, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Persentase Peserta Pelatihan Masyarakat KP BPPP Bitung  yang Menerapkan Kompetensi Hasil Pelatihan ', '%', 75.0, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Persentase Peserta Pelatihan Masyarakat KP BPPP Ambon yang Menerapkan Kompetensi Hasil Pelatihan ', '%', 75.0, 5);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'f', 'Masyarakat Kelautan dan Perikanan yang dilatih BPPP Medan (orang) ', 'orang', 1398.0, 6);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'g', 'Masyarakat Kelautan dan Perikanan yang dilatih   BPPP Tegal (orang) ', 'orang', 14000.0, 7);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'h', 'Masyarakat Kelautan dan Perikanan yang dilatih  BPPP Banyuwangi (orang) ', 'orang', 2765.0, 8);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'i', 'Masyarakat Kelautan dan Perikanan yang dilatih  BPPP Bitung (orang) ', 'orang', 1120.0, 9);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'j', 'Masyarakat Kelautan dan Perikanan yang dilatih  BPPP Ambon (orang) ', 'orang', 1600.0, 10);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 3, NULL, 'Layanan Gerai Awak Kapal Perikanan Indonesia di Luar Negeri (laporan)', 'laporan', 2.0, 3);
SET @parent_id = LAST_INSERT_ID();

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 4, NULL, 'Perangkat Pelatihan Kelautan dan Perikanan yang ditetapkan (paket modul)', 'paket modul', 5.0, 4);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Naskah perangkat pelatihan kelautan dan perikanan BPPP Medan (dokumen)', 'dokumen', 1.0, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Naskah perangkat pelatihan kelautan dan perikanan BPPP Tegal (dokumen)', 'dokumen', 1.0, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Naskah perangkat pelatihan kelautan dan perikanan BPPP Banyuwangi (dokumen)', 'dokumen', 1.0, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Naskah perangkat pelatihan kelautan dan perikanan BPPP Bitung (dokumen)', 'dokumen', 1.0, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Naskah perangkat pelatihan kelautan dan perikanan BPPP Ambon (dokumen)', 'dokumen', 1.0, 5);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'f', 'Naskah perangkat pelatihan kelautan dan perikanan BPPA Sukamandi (dokumen)', 'dokumen', 1.0, 6);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 5, NULL, 'Bahan Ajar Pelatihan Kelautan dan Perikanan Berbasis Kaji Terap (paket bahan ajar)', 'paket bahan ajar', 1.0, 5);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Proposal Inovasi Pelatihan Berbasis Kaji Terap Bidang Kelautan dan Perikanan BPPP Medan (proposal)', 'proposal', 1.0, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Proposal Inovasi Pelatihan Berbasis Kaji Terap Bidang Kelautan dan Perikanan BPPP Tegal (proposal)', 'proposal', 1.0, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Proposal Inovasi Pelatihan Berbasis Kaji Terap Bidang Kelautan dan Perikanan BPPP Banyuwangi (proposal)', 'proposal', 1.0, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Proposal Inovasi Pelatihan Berbasis Kaji Terap Bidang Kelautan dan Perikanan BPPP Bitung (proposal)', 'proposal', 1.0, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Proposal Inovasi Pelatihan Berbasis Kaji Terap Bidang Kelautan dan Perikanan BPPP Ambon (proposal)', 'proposal', 1.0, 5);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 6, NULL, 'Persentase Perangkat Pelatihan Kelautan dan Perikanan yang diterapkan dalam Penyelenggaraan Pelatihan (%)', '%', 75.0, 6);
SET @parent_id = LAST_INSERT_ID();

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 7, NULL, 'Peraturan Pelatihan Kelautan dan Perikanan yang diusulkan (Dokumen)', 'Dokumen', 5.0, 7);
SET @parent_id = LAST_INSERT_ID();

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 8, NULL, 'Persentase Pelaksanaan Kerja Sama Lingkup Pusat Pelatihan KP yang telah Disepakati (%)', '%', 50.0, 8);
SET @parent_id = LAST_INSERT_ID();

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 9, NULL, 'Sertifikasi Kelembagaan Pelatihan sesuai Standar Lembaga Pelatihan (Sertifikat)', 'Sertifikat', 7.0, 9);
SET @parent_id = LAST_INSERT_ID();

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 10, NULL, 'Persentase usulan sertifikasi program diklat masyarakat bidang Kelautan dan Perikanan yang disahkan sesuai dengan peraturan yang berlaku (%)', '%', 75.0, 10);
SET @parent_id = LAST_INSERT_ID();

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 11, NULL, 'Persentase Realisasi PNBP Lingkup Pusat Pelatihan KP  (%)', '%', 80.0, 11);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Nilai PNBP Satker BPPP Medan (Rupiah Miliar)', 'Rupiah Miliar', 0.52, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Nilai PNBP Satker BPPP Tegal (Rupiah Miliar)', 'Rupiah Miliar', '22.52', 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Nilai PNBP Satker BPPP Banyuwangi (Rupiah Miliar)', 'Rupiah Miliar', 0.83, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Nilai PNBP Satker BPPP Bitung (Rupiah Miliar)', 'Rupiah Miliar', 0.2, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Nilai PNBP Satker BPPP Ambon (Rupiah Miliar)', 'Rupiah Miliar', 0.95, 5);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'f', 'Nilai PNBP Satker BPPA Sukamandi (Rupiah Miliar)', 'Rupiah Miliar', '1.03', 6);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 12, NULL, 'Sarana Prasarana Pelatihan KP yang ditingkatkan kapasitasnya (Paket)', 'Paket', 6.0, 12);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Sarana Pelatihan KP yang ditingkatkan kapasitasnya di BPPP Medan', '%', 1.0, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Sarana Prasarana Pelatihan KP yang ditingkatkan kapasitasnya di BPPP Tegal', '%', 2.0, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Sarana Pelatihan KP yang ditingkatkan kapasitasnya di BPPP Banyuwangi', '%', 1.0, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Sarana Pelatihan KP yang ditingkatkan kapasitasnya di BPPP Bitung', '%', 1.0, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Sarana Pelatihan KP yang ditingkatkan kapasitasnya di BPPP Ambon', '%', 1.0, 5);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 13, NULL, 'Persentase aparatur KKP yang menerapkan kompetensi hasil pelatihan (%)', '%', 75.0, 13);
SET @parent_id = LAST_INSERT_ID();

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 14, NULL, 'Persentase Tenaga Pelatihan yang Mengikuti Pengembangan Kompetensi Sesuai Standar Pelatih (%)', '%', 20.0, 14);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Penyiapan Data Kebutuhan Pengembangan Kompetensi Tenaga Pelatih di BPPP Medan (Dokumen)', 'Dokumen', 1.0, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Penyiapan Data Kebutuhan Pengembangan Kompetensi Tenaga Pelatih di BPPP Tegal (Dokumen)', 'Dokumen', 1.0, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Penyiapan Data Kebutuhan Pengembangan Kompetensi Tenaga Pelatih di BPPP Banyuwangi (Dokumen)', 'Dokumen', 1.0, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Penyiapan Data Kebutuhan Pengembangan Kompetensi Tenaga Pelatih di BPPP Bitung (Dokumen)', 'Dokumen', 1.0, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Penyiapan Data Kebutuhan Pengembangan Kompetensi Tenaga Pelatih di BPPP Ambon (Dokumen)', 'Dokumen', 1.0, 5);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'f', 'Penyiapan Data Kebutuhan Pengembangan Kompetensi Tenaga Pelatih di BPPP Sukamandi (Dokumen)', 'Dokumen', 1.0, 6);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 15, NULL, 'Persentase Unit Eselon II KKP yang Mengimplementasikan Model Corporate University (Corpu) (%)', '%', 20.0, 15);
SET @parent_id = LAST_INSERT_ID();

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 16, NULL, 'Persentase layanan dukungan manajemen internal Pusat Pelatihan KP (%)', '%', 100.0, 16);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Persentase layanan dukungan manajemen internal BPPP Medan (%)', '%', 100.0, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Persentase layanan dukungan manajemen internal BPPP Tegal (%)', '%', 100.0, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Persentase layanan dukungan manajemen internal BPPP Banyuwangi (%)', '%', 100.0, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Persentase layanan dukungan manajemen internal BPPP Bitung (%)', '%', 100.0, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Persentase layanan dukungan manajemen internal BPPP Ambon (%)', '%', 100.0, 5);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'f', 'Persentase layanan dukungan manajemen internal BPPA Sukamandi (%)', '%', 100.0, 6);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 17, NULL, 'Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja Pusat Pelatihan KP (%)', '%', 86.0, 17);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja BPPP MEdan (%)', '%', 86.0, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja BPPP Tegal (%)', '%', 86.0, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja BPPP Banyuwangi (%)', '%', 86.0, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja BPPP Bitung (%)', '%', 86.0, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja BPPP Ambon (%)', '%', 86.0, 5);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'f', 'Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja BPPA Sukamandi (%)', '%', 86.0, 6);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 18, NULL, 'Indeks Profesionalitas ASN Pusat Pelatihan KP (indeks)', 'indeks', 83.0, 18);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Indeks Profesionalitas ASN BPPP Medan (Indeks)', 'Indeks', NULL, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Indeks Profesionalitas ASN BPPPTegal (Indeks)', 'Indeks', NULL, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Indeks Profesionalitas ASN BPPP Banyuwangi (Indeks)', 'Indeks', NULL, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Indeks Profesionalitas ASN BPPP Bitung (Indeks)', 'Indeks', NULL, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Indeks Profesionalitas ASN BPPP Ambon (Indeks)', 'Indeks', NULL, 5);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'f', 'Indeks Profesionalitas ASN BPPP Sukamandi (Indeks)', 'Indeks', NULL, 6);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 19, NULL, 'Penilaian Mandiri SAKIP Pusat Pelatihan KP (Nilai)', 'Nilai', 81.0, 19);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Penilaian Mandiri SAKIP BPPP Medan (Nilai)', 'Nilai', NULL, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Penilaian Mandiri SAKIP BPPP Tegal (Nilai)', 'Nilai', NULL, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Penilaian Mandiri SAKIP BPPP Banyuwangi (Nilai)', 'Nilai', NULL, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Penilaian Mandiri SAKIP BPPP Bitung (Nilai)', 'Nilai', NULL, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Penilaian Mandiri SAKIP BPPP Ambon (Nilai)', 'Nilai', NULL, 5);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'f', 'Penilaian Mandiri SAKIP BPPP Sukamandi (Nilai)', 'Nilai', NULL, 6);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 20, NULL, 'Persentase rencana umum pengadaan PBJ yang diumumkan pada SIRUP Pusat Pelatihan KP (%)', '%', 77.0, 20);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Persentase Rencana Umum Pengadaan PBJ yang diumumkan pada SIRUP BPPP Medan (%)', '%', NULL, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Persentase Rencana Umum Pengadaan PBJ yang diumumkan pada SIRUP BPPP Tegal (%)', '%', NULL, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Persentase Rencana Umum Pengadaan PBJ yang diumumkan pada SIRUP BPPP Banyuwangi (%)', '%', NULL, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Persentase Rencana Umum Pengadaan PBJ yang diumumkan pada SIRUP BPPP Bitung (%)', '%', NULL, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Persentase Rencana Umum Pengadaan PBJ yang diumumkan pada SIRUP BPPP Ambon (%)', '%', NULL, 5);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'f', 'Persentase Rencana Umum Pengadaan PBJ yang diumumkan pada SIRUP BPPP Sukamandi (%)', '%', NULL, 6);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 21, NULL, 'Nilai Pengawasan Kearsipan Internal Pusat Pelatihan KP (Nilai)', 'Nilai', 81.0, 21);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Nilai Pengawasan Kearsipan Internal BPPP Medan (Nilai)', 'Nilai', NULL, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Nilai Pengawasan Kearsipan Internal BPPP Tegal (Nilai)', 'Nilai', NULL, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Nilai Pengawasan Kearsipan Internal BPPP Banyuwangi (Nilai)', 'Nilai', NULL, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Nilai Pengawasan Kearsipan Internal BPPP Bitung (Nilai)', 'Nilai', NULL, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Nilai Pengawasan Kearsipan Internal BPPP Ambon (Nilai)', 'Nilai', NULL, 5);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'f', 'Nilai Pengawasan Kearsipan Internal BPPP Sukamandi (Nilai)', 'Nilai', NULL, 6);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 22, NULL, 'Presentase usulan inovasi lingkup Pusat Pelatihan KP (%)', '%', 50.0, 22);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Jumlah Usulan Proposal Inovasi Pelayanan Publik (IPP) Satker BPPP Medan (Proposal)', 'Proposal', NULL, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Jumlah Usulan Proposal Inovasi Pelayanan Publik (IPP) Satker BPPP Tegal (Proposal)', 'Proposal', NULL, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Jumlah Usulan Proposal Inovasi Pelayanan Publik (IPP) Satker BPPP Banyuwangi (Proposal)', 'Proposal', NULL, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Jumlah Usulan Proposal Inovasi Pelayanan Publik (IPP) Satker BPPP Bitung (Proposal)', 'Proposal', NULL, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Jumlah Usulan Proposal Inovasi Pelayanan Publik (IPP) Satker BPPP Ambon (Proposal)', 'Proposal', NULL, 5);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'f', 'Jumlah Usulan Proposal Inovasi Pelayanan Publik (IPP) Satker BPPP Sukamandi (Proposal)', 'Proposal', NULL, 6);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 23, NULL, 'Nilai Keterbukaan Informasi Pelayanan Publik Lingkup Pusat Pelatihan KP (Nilai)', 'Nilai', 78.0, 23);
SET @parent_id = LAST_INSERT_ID();
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'a', 'Nilai Keterbukaan Informasi Publik BPPP Medan (Nilai)', 'Nilai', NULL, 1);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'b', 'Nilai Keterbukaan Informasi Publik BPPP Tegal (Nilai)', 'Nilai', NULL, 2);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'c', 'Nilai Keterbukaan Informasi Publik BPPP Banyuwangi (Nilai)', 'Nilai', NULL, 3);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'd', 'Nilai Keterbukaan Informasi Publik BPPP Bitung (Nilai)', 'Nilai', NULL, 4);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'e', 'Nilai Keterbukaan Informasi Publik BPPP Ambon (Nilai)', 'Nilai', NULL, 5);
INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (@parent_id, NULL, 'f', 'Nilai Keterbukaan Informasi Publik BPPP Sukamandi (Nilai)', 'Nilai', NULL, 6);

INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, 24, NULL, 'Unit Kerja lingkup Pusat Pelatihan KP yang dibangun untuk diusulkan menuju Wilayah Bebas dari Korupsi (WBK) (Satker)', 'Satker', 1.0, 24);
SET @parent_id = LAST_INSERT_ID();
