-- ==========================================================
-- PUSLATKP MANAGEMENT HUB — SUPABASE SCHEMA LENGKAP
-- Jalankan seluruh file ini di Supabase SQL Editor
-- ==========================================================

create extension if not exists "pgcrypto";

-- ==========================
-- 1. PROFIL & UPT
-- ==========================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','upt')),
  upt_key text,
  nama_lengkap text,
  created_at timestamptz default now()
);

create table if not exists upt_list (
  key text primary key,
  label text not null,
  aktif boolean default true
);

-- ==========================
-- 2. JENIS DATA (9 Jenis Data berpasangan)
-- ==========================
create table if not exists jenis_data (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  judul text not null,
  deskripsi text,
  level_utama text not null default 'minggu' check (level_utama in ('minggu','bulan')),
  butuh_input_bulanan boolean default true,
  pasangan_mingguan_id uuid references jenis_data(id),
  publik_boleh_lihat boolean default false,
  aktif boolean default true,
  dibuat_oleh uuid references profiles(id),
  created_at timestamptz default now()
);

-- Skrip alter untuk instalasi yang sudah ada sebelumnya
alter table jenis_data add column if not exists level_utama text not null default 'minggu' check (level_utama in ('minggu','bulan'));
alter table jenis_data add column if not exists butuh_input_bulanan boolean default true;
alter table jenis_data add column if not exists pasangan_mingguan_id uuid references jenis_data(id);

-- ==========================
-- 3. PERIODE (satu tabel semua level, semua Jenis Data)
-- ==========================
create table if not exists periods (
  id uuid primary key default gen_random_uuid(),
  level text not null check (level in ('tahun','triwulan','bulan','minggu')),
  tahun int not null,
  triwulan_ke int check (triwulan_ke between 1 and 4),
  bulan int check (bulan between 1 and 12),
  minggu_ke int check (minggu_ke between 1 and 4),
  tanggal_mulai date not null,
  tanggal_selesai date not null,
  deadline date not null,
  label text,
  unique (level, tahun, triwulan_ke, bulan, minggu_ke)
);

-- ==========================
-- 4. FORM BUILDER — kolom per Jenis Data per level
-- ==========================
create table if not exists field_definitions (
  id uuid primary key default gen_random_uuid(),
  jenis_data_id uuid not null references jenis_data(id) on delete cascade,
  level text not null check (level in ('tahun','triwulan','bulan','minggu')),
  field_key text not null,
  label text not null,
  tipe text not null default 'teks' check (tipe in ('angka','teks','teks_panjang','tanggal','pilihan')),
  opsi_pilihan text[],
  wajib boolean default false,
  is_identitas boolean default false,
  urutan int not null default 0,
  aktif boolean default true,
  dibuat_oleh uuid references profiles(id),
  created_at timestamptz default now(),
  unique (jenis_data_id, level, field_key)
);

-- ==========================
-- 5. DATA REKAP MINGGUAN / NILAI
-- ==========================
create table if not exists rekap_nilai (
  id uuid primary key default gen_random_uuid(),
  jenis_data_id uuid not null references jenis_data(id) on delete cascade,
  upt_key text not null references upt_list(key),
  period_id uuid not null references periods(id) on delete cascade,
  field_key text not null,
  value numeric,
  value_text text,
  updated_at timestamptz default now(),
  updated_by uuid references profiles(id),
  unique (jenis_data_id, upt_key, period_id, field_key)
);

alter table rekap_nilai add column if not exists value_text text;

-- ==========================
-- 6. DATA DETAIL PER-BARIS (level bulan)
-- ==========================
create table if not exists data_entries (
  id uuid primary key default gen_random_uuid(),
  jenis_data_id uuid not null references jenis_data(id) on delete cascade,
  upt_key text not null references upt_list(key),
  period_id uuid not null references periods(id) on delete cascade,
  nama text,
  nik text,
  data_json jsonb not null default '{}'::jsonb,
  data_ekstra jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  created_by uuid references profiles(id),
  unique (jenis_data_id, upt_key, period_id, nik)
);
create index if not exists idx_data_entries_json on data_entries using gin (data_json);

-- ==========================
-- 7. DAILY ACTIVITY
-- ==========================
create table if not exists daily_activity (
  id uuid primary key default gen_random_uuid(),
  upt_key text not null references upt_list(key),
  tanggal date not null,
  status text not null default 'draft' check (status in ('draft','proses','selesai')),
  uraian text,
  pic text[],
  deskripsi text,
  lingkup text check (lingkup in ('internal_puslat','internal_kkp','internal_eksternal','eksternal')),
  output text,
  foto_url text,
  dokumen_url text,
  hambatan boolean default false,
  hambatan_keterangan text,
  interaksi text,
  feedback text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ==========================
-- 8. AUDIT LOG
-- ==========================
create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  actor_upt_key text,
  action text not null,
  detail jsonb,
  created_at timestamptz default now()
);

-- ==========================
-- 9. VIEW PUBLIK
-- ==========================
create or replace view v_publik_rekap as
  select
    de.jenis_data_id,
    jd.judul as jenis_data_judul,
    de.period_id,
    p.label as period_label,
    p.level,
    p.tahun,
    p.bulan,
    count(*) as total_baris
  from data_entries de
  join jenis_data jd on jd.id = de.jenis_data_id
  join periods p on p.id = de.period_id
  where jd.publik_boleh_lihat = true
  group by de.jenis_data_id, jd.judul, de.period_id, p.label, p.level, p.tahun, p.bulan;

-- ==========================
-- 10. FUNCTIONS & RLS HELPER
-- ==========================
create or replace function is_admin() returns boolean
language sql security definer set search_path = public as $$
  select exists (select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

create or replace function my_upt_key() returns text
language sql security definer set search_path = public as $$
  select upt_key from profiles where id = auth.uid();
$$;

create or replace function period_is_locked(p_id uuid) returns boolean
language sql stable as $$
  select (select deadline from periods where id = p_id) < current_date;
$$;

-- FUNGSI BANTU: Total dari Jenis Data pasangan (mingguan) untuk 1 bulan
create or replace function total_pasangan_mingguan(
  p_jenis_data_bulan_id uuid, p_upt_key text, p_field_key text,
  p_tahun int, p_bulan int
) returns numeric language sql stable as $$
  select coalesce(sum(rn.value), 0)
  from rekap_nilai rn
  join periods p on p.id = rn.period_id
  join jenis_data jd_bulan on jd_bulan.id = p_jenis_data_bulan_id
  where rn.jenis_data_id = jd_bulan.pasangan_mingguan_id
    and rn.upt_key = p_upt_key and rn.field_key = p_field_key
    and p.level = 'minggu' and p.tahun = p_tahun and p.bulan = p_bulan;
$$;

-- ==========================
-- 11. ROW LEVEL SECURITY
-- ==========================
alter table profiles enable row level security;
create policy "profiles_select_own" on profiles for select using (id = auth.uid() or is_admin());
create policy "profiles_insert_admin" on profiles for insert with check (is_admin());
create policy "profiles_update_admin" on profiles for update using (is_admin());
create policy "profiles_delete_admin" on profiles for delete using (is_admin());

alter table upt_list enable row level security;
create policy "upt_list_read" on upt_list for select using (true);
create policy "upt_list_admin_write" on upt_list for all using (is_admin()) with check (is_admin());

alter table periods enable row level security;
create policy "periods_read" on periods for select using (true);
create policy "periods_admin_write" on periods for all using (is_admin()) with check (is_admin());

alter table jenis_data enable row level security;
create policy "jenis_data_read" on jenis_data for select using (true);
create policy "jenis_data_admin_write" on jenis_data for all using (is_admin()) with check (is_admin());

alter table field_definitions enable row level security;
create policy "field_def_read" on field_definitions for select using (true);
create policy "field_def_admin_write" on field_definitions for all using (is_admin()) with check (is_admin());

alter table rekap_nilai enable row level security;
create policy "rekap_select" on rekap_nilai for select using (is_admin() or upt_key = my_upt_key());
create policy "rekap_insert" on rekap_nilai for insert with check (
  is_admin() or (upt_key = my_upt_key() and not period_is_locked(period_id))
);
create policy "rekap_update" on rekap_nilai for update using (
  is_admin() or (upt_key = my_upt_key() and not period_is_locked(period_id))
);
create policy "rekap_delete" on rekap_nilai for delete using (
  is_admin() or (upt_key = my_upt_key() and not period_is_locked(period_id))
);

alter table data_entries enable row level security;
create policy "entries_select" on data_entries for select using (is_admin() or upt_key = my_upt_key());
create policy "entries_insert" on data_entries for insert with check (
  is_admin() or (upt_key = my_upt_key() and not period_is_locked(period_id))
);
create policy "entries_update" on data_entries for update using (
  is_admin() or (upt_key = my_upt_key() and not period_is_locked(period_id))
);
create policy "entries_delete" on data_entries for delete using (
  is_admin() or (upt_key = my_upt_key() and not period_is_locked(period_id))
);

alter table daily_activity enable row level security;
create policy "daily_select" on daily_activity for select using (is_admin() or upt_key = my_upt_key());
create policy "daily_insert" on daily_activity for insert with check (is_admin() or upt_key = my_upt_key());
create policy "daily_update" on daily_activity for update using (is_admin() or upt_key = my_upt_key());
create policy "daily_delete" on daily_activity for delete using (is_admin() or upt_key = my_upt_key());

alter table audit_log enable row level security;
create policy "audit_admin_read" on audit_log for select using (is_admin());
create policy "audit_insert" on audit_log for insert with check (auth.role() = 'authenticated');

grant select on v_publik_rekap to anon;

-- ==========================
-- 12. SEED DATA — UPT LIST
-- ==========================
insert into upt_list (key, label, aktif) values
  ('upt_jakarta',      'BPPP Jakarta',       true),
  ('upt_medan',        'BPPP Medan',         true),
  ('upt_banyuwangi',   'BPPP Banyuwangi',    true),
  ('upt_tegal',        'BPPP Tegal',         true),
  ('upt_bitung',       'BPPP Bitung',        true),
  ('upt_ambon',        'BPPP Ambon',         true),
  ('upt_padang',       'BPPP Padang',        true),
  ('upt_pontianak',    'BPPP Pontianak',     true),
  ('upt_makassar',     'BPPP Makassar',      true),
  ('upt_sorong',       'BPPP Sorong',        true)
on conflict (key) do nothing;

-- ==========================
-- 13. SEED DATA — 9 JENIS DATA BERPASANGAN
-- ==========================

-- Grup 1: Masyarakat
insert into jenis_data (id, key, judul, deskripsi, level_utama, butuh_input_bulanan, pasangan_mingguan_id, publik_boleh_lihat, aktif) values
  ('11111111-0001-0000-0000-000000000001', 'masyarakat', 'Masyarakat', 'Data mingguan pelatihan masyarakat: pagu, realisasi, peserta, dan metode.', 'minggu', false, null, true, true)
on conflict (key) do nothing;

insert into jenis_data (id, key, judul, deskripsi, level_utama, butuh_input_bulanan, pasangan_mingguan_id, publik_boleh_lihat, aktif) values
  ('11111111-0002-0000-0000-000000000002', 'data_masyarakat', 'Data Masyarakat', 'Rincian data per-orang peserta pelatihan masyarakat.', 'bulan', true, '11111111-0001-0000-0000-000000000001', true, true)
on conflict (key) do nothing;

-- Grup 2: Aparatur
insert into jenis_data (id, key, judul, deskripsi, level_utama, butuh_input_bulanan, pasangan_mingguan_id, publik_boleh_lihat, aktif) values
  ('11111111-0003-0000-0000-000000000003', 'aparatur', 'Aparatur', 'Data mingguan pelatihan aparatur: kategori, pagu, realisasi, dan peserta.', 'minggu', false, null, true, true)
on conflict (key) do nothing;

insert into jenis_data (id, key, judul, deskripsi, level_utama, butuh_input_bulanan, pasangan_mingguan_id, publik_boleh_lihat, aktif) values
  ('11111111-0004-0000-0000-000000000004', 'data_aparatur', 'Data Aparatur', 'Rincian data per-orang peserta pelatihan aparatur.', 'bulan', true, '11111111-0003-0000-0000-000000000003', true, true)
on conflict (key) do nothing;

-- Grup 3: Instruktur & WI
insert into jenis_data (id, key, judul, deskripsi, level_utama, butuh_input_bulanan, pasangan_mingguan_id, publik_boleh_lihat, aktif) values
  ('11111111-0005-0000-0000-000000000005', 'data_instruktur_dan_wi', 'Data Instruktur dan WI', 'Data mingguan instruktur dan widyaiswara berdasarkan jenjang dan keahlian.', 'minggu', false, null, true, true)
on conflict (key) do nothing;

insert into jenis_data (id, key, judul, deskripsi, level_utama, butuh_input_bulanan, pasangan_mingguan_id, publik_boleh_lihat, aktif) values
  ('11111111-0006-0000-0000-000000000006', 'data_instruktur_dan_widyaiswara', 'Data Instruktur dan Widyaiswara', 'Rincian data per-orang instruktur dan widyaiswara.', 'bulan', true, '11111111-0005-0000-0000-000000000005', true, true)
on conflict (key) do nothing;

-- Grup 4: Finansial
insert into jenis_data (id, key, judul, deskripsi, level_utama, butuh_input_bulanan, pasangan_mingguan_id, publik_boleh_lihat, aktif) values
  ('11111111-0007-0000-0000-000000000007', 'data_belanja_modal', 'Data Belanja Modal', 'Data mingguan belanja modal: volume, pagu, realisasi anggaran dan fisik.', 'minggu', false, null, false, true),
  ('11111111-0008-0000-0000-000000000008', 'capaian_anggaran_jenis_belanja', 'Data Capaian Anggaran per Jenis Belanja', 'Pagu & realisasi belanja pegawai, barang, dan modal.', 'minggu', false, null, false, true),
  ('11111111-0009-0000-0000-000000000009', 'capaian_anggaran_sumber_dana', 'Data Capaian Anggaran per Sumber Dana', 'Pagu & realisasi sumber dana RM, PNBP/BLU, dan SBSN.', 'minggu', false, null, false, true)
on conflict (key) do nothing;

-- ==========================
-- 14. SEED DATA — FIELD DEFINITIONS
-- ==========================
-- 1. Masyarakat (Minggu)
insert into field_definitions (jenis_data_id, level, field_key, label, tipe, wajib, urutan) values
  ('11111111-0001-0000-0000-000000000001', 'minggu', 'nama_pelatihan', 'Nama Pelatihan/Judul Pelatihan', 'teks', true, 1),
  ('11111111-0001-0000-0000-000000000001', 'minggu', 'jumlah_peserta', 'Jumlah Peserta', 'angka', true, 2),
  ('11111111-0001-0000-0000-000000000001', 'minggu', 'tanggal_pelatihan', 'Tanggal Pelatihan', 'tanggal', false, 3),
  ('11111111-0001-0000-0000-000000000001', 'minggu', 'pagu_anggaran', 'Pagu Anggaran (Rp)', 'angka', false, 4),
  ('11111111-0001-0000-0000-000000000001', 'minggu', 'realisasi_anggaran', 'Realisasi Anggaran (Rp)', 'angka', false, 5),
  ('11111111-0001-0000-0000-000000000001', 'minggu', 'sumber_dana', 'Sumber Dana', 'pilihan', false, 6),
  ('11111111-0001-0000-0000-000000000001', 'minggu', 'bidang_kompetensi', 'Bidang Kompetensi (Sesuai E-Laut)', 'pilihan', false, 7),
  ('11111111-0001-0000-0000-000000000001', 'minggu', 'program_prioritas', 'Program Prioritas', 'pilihan', false, 8),
  ('11111111-0001-0000-0000-000000000001', 'minggu', 'metode_pelatihan', 'Metode Pelatihan', 'pilihan', false, 9),
  ('11111111-0001-0000-0000-000000000001', 'minggu', 'link_laporan_pelatihan', 'Link Laporan Pelatihan', 'teks', false, 10)
on conflict (jenis_data_id, level, field_key) do nothing;

update field_definitions set opsi_pilihan = ARRAY['RM','PNBP','BLU','SBSN']
where jenis_data_id = '11111111-0001-0000-0000-000000000001' and field_key = 'sumber_dana';

update field_definitions set opsi_pilihan = ARRAY['Luring','Blended','Full Online']
where jenis_data_id = '11111111-0001-0000-0000-000000000001' and field_key = 'metode_pelatihan';

-- 2. Data Masyarakat (Bulan)
insert into field_definitions (jenis_data_id, level, field_key, label, tipe, wajib, is_identitas, urutan) values
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'no_urut', 'No', 'teks', false, false, 1),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'penyelenggara_pelatihan', 'Penyelenggara Pelatihan', 'teks', false, false, 2),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'nama', 'Nama Lulusan Pelatihan', 'teks', true, true, 3),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'nik', 'NIK', 'teks', true, true, 4),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'tempat_lahir', 'Tempat Lahir', 'teks', false, false, 5),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'tanggal_lahir', 'Tanggal Lahir', 'tanggal', false, false, 6),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'jenis_kelamin', 'Jenis Kelamin (L/P)', 'pilihan', false, false, 7),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'pendidikan_terakhir', 'Pendidikan Terakhir', 'pilihan', false, false, 8),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'no_telepon', 'Nomor Tlp.', 'teks', false, true, 9),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'alamat', 'Alamat', 'teks', false, true, 10),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'provinsi', 'Provinsi', 'teks', false, false, 11),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'kab_kota', 'Kab/Kota', 'teks', false, false, 12),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'bidang_pelatihan', 'Bidang Pelatihan', 'teks', false, false, 13),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'jenis_pelatihan_dukungan_program_terobosan', 'Jenis Pelatihan Dukungan Program Terobosan', 'teks', false, false, 14),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'nama_pelatihan', 'Nama Pelatihan', 'teks', true, false, 15),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'tanggal_pelatihan', 'Tanggal Pelatihan', 'tanggal', false, false, 16),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'no_sertifikat_pelatihan', 'No Sertifikat Pelatihan', 'teks', false, false, 17),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'link_sertifikat_pelatihan_by_name', 'Link Sertifikat Pelatihan by Name', 'teks', false, false, 18),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'no_kusuka', 'No KUSUKA', 'teks', false, false, 19),
  ('11111111-0002-0000-0000-000000000002', 'bulan', 'jenis_pelatihan', 'Jenis Pelatihan', 'pilihan', false, false, 20)
on conflict (jenis_data_id, level, field_key) do nothing;

update field_definitions set opsi_pilihan = ARRAY['Laki-laki','Perempuan']
where jenis_data_id = '11111111-0002-0000-0000-000000000002' and field_key = 'jenis_kelamin';

update field_definitions set opsi_pilihan = ARRAY['SD','SMP','SMA/SMK','D1','D2','D3','D4/S1','S2','S3']
where jenis_data_id = '11111111-0002-0000-0000-000000000002' and field_key = 'pendidikan_terakhir';

-- 3. Aparatur (Minggu)
insert into field_definitions (jenis_data_id, level, field_key, label, tipe, wajib, urutan) values
  ('11111111-0003-0000-0000-000000000003', 'minggu', 'nama_pelatihan', 'Nama Pelatihan/Judul Pelatihan', 'teks', true, 1),
  ('11111111-0003-0000-0000-000000000003', 'minggu', 'kategori_pelatihan', 'Kategori Pelatihan', 'pilihan', false, 2),
  ('11111111-0003-0000-0000-000000000003', 'minggu', 'jumlah_peserta', 'Jumlah Peserta', 'angka', true, 3),
  ('11111111-0003-0000-0000-000000000003', 'minggu', 'tanggal_pelatihan', 'Tanggal Pelatihan', 'tanggal', false, 4),
  ('11111111-0003-0000-0000-000000000003', 'minggu', 'pagu_anggaran', 'Pagu Anggaran (Rp)', 'angka', false, 5),
  ('11111111-0003-0000-0000-000000000003', 'minggu', 'realisasi_anggaran', 'Realisasi Anggaran (Rp)', 'angka', false, 6),
  ('11111111-0003-0000-0000-000000000003', 'minggu', 'sumber_dana', 'Sumber Dana', 'pilihan', false, 7),
  ('11111111-0003-0000-0000-000000000003', 'minggu', 'asal_instansi', 'Asal Instansi', 'teks', false, 8),
  ('11111111-0003-0000-0000-000000000003', 'minggu', 'metode_pelatihan', 'Metode Pelatihan', 'pilihan', false, 9)
on conflict (jenis_data_id, level, field_key) do nothing;

update field_definitions set opsi_pilihan = ARRAY['Struktural','Fungsional','Teknis','Manajerial']
where jenis_data_id = '11111111-0003-0000-0000-000000000003' and field_key = 'kategori_pelatihan';

-- 4. Data Aparatur (Bulan)
insert into field_definitions (jenis_data_id, level, field_key, label, tipe, wajib, is_identitas, urutan) values
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'nama', 'Nama Lulusan Pelatihan', 'teks', true, true, 1),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'nik', 'NIK', 'teks', true, true, 2),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'tempat_tanggal_lahir', 'Tempat & Tanggal Lahir', 'teks', false, false, 3),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'jenis_kelamin', 'Jenis Kelamin (L/P)', 'pilihan', false, false, 4),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'nip', 'NIP', 'teks', false, true, 5),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'jabatan', 'Jabatan', 'teks', false, false, 6),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'pangkat_gol_ruang', 'Pangkat/Gol. Ruang', 'teks', false, false, 7),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'pendidikan_terakhir', 'Pendidikan Terakhir', 'pilihan', false, false, 8),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'no_telepon', 'Nomor Tlp.', 'teks', false, true, 9),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'unit_kerja_eselon_i', 'Unit Kerja Eselon I', 'teks', false, false, 10),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'unit_kerja', 'Unit Kerja', 'teks', false, false, 11),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'alamat_kantor', 'Alamat Kantor', 'teks', false, false, 12),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'nama_pelatihan', 'Nama Pelatihan', 'teks', true, false, 13),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'jenis_diklat', 'Jenis Diklat', 'pilihan', false, false, 14),
  ('11111111-0004-0000-0000-000000000004', 'bulan', 'tanggal_pelatihan', 'Tanggal Pelatihan', 'tanggal', false, false, 15)
on conflict (jenis_data_id, level, field_key) do nothing;

-- 5. Data Instruktur dan WI (Minggu)
insert into field_definitions (jenis_data_id, level, field_key, label, tipe, wajib, urutan) values
  ('11111111-0005-0000-0000-000000000005', 'minggu', 'jumlah_instruktur_wi', 'Jumlah Instruktur dan Widyaiswara', 'angka', true, 1),
  ('11111111-0005-0000-0000-000000000005', 'minggu', 'jenjang_jabatan_instruktur', 'Jenjang Jabatan Instruktur', 'pilihan', false, 2),
  ('11111111-0005-0000-0000-000000000005', 'minggu', 'jenjang_jabatan_widyaiswara', 'Jenjang Jabatan Widyaiswara', 'pilihan', false, 3),
  ('11111111-0005-0000-0000-000000000005', 'minggu', 'instruktur_berdasarkan_keahlian', 'Instruktur Berdasarkan Keahlian', 'angka', false, 4),
  ('11111111-0005-0000-0000-000000000005', 'minggu', 'widyaiswara_berdasarkan_keahlian', 'Widyaiswara Berdasarkan Keahlian', 'angka', false, 5)
on conflict (jenis_data_id, level, field_key) do nothing;

-- 6. Data Instruktur dan Widyaiswara (Bulan)
insert into field_definitions (jenis_data_id, level, field_key, label, tipe, wajib, is_identitas, urutan) values
  ('11111111-0006-0000-0000-000000000006', 'bulan', 'nama', 'Nama Lengkap', 'teks', true, false, 1),
  ('11111111-0006-0000-0000-000000000006', 'bulan', 'nip', 'NIP', 'teks', true, true, 2),
  ('11111111-0006-0000-0000-000000000006', 'bulan', 'jenis_kelamin', 'Jenis Kelamin', 'pilihan', false, false, 3),
  ('11111111-0006-0000-0000-000000000006', 'bulan', 'jabatan', 'Jabatan', 'teks', false, false, 4),
  ('11111111-0006-0000-0000-000000000006', 'bulan', 'bidang_keahlian', 'Bidang Keahlian', 'teks', false, false, 5),
  ('11111111-0006-0000-0000-000000000006', 'bulan', 'pendidikan', 'Pendidikan', 'pilihan', false, false, 6),
  ('11111111-0006-0000-0000-000000000006', 'bulan', 'status_asn', 'Status ASN (PNS/PPPK)', 'pilihan', false, false, 7)
on conflict (jenis_data_id, level, field_key) do nothing;

-- 7. Data Belanja Modal (Minggu)
insert into field_definitions (jenis_data_id, level, field_key, label, tipe, wajib, urutan) values
  ('11111111-0007-0000-0000-000000000007', 'minggu', 'judul_kegiatan', 'Judul Kegiatan', 'teks', true, 1),
  ('11111111-0007-0000-0000-000000000007', 'minggu', 'volume', 'Volume', 'angka', false, 2),
  ('11111111-0007-0000-0000-000000000007', 'minggu', 'satuan', 'Satuan', 'teks', false, 3),
  ('11111111-0007-0000-0000-000000000007', 'minggu', 'pagu_anggaran', 'Pagu Anggaran (Rp)', 'angka', false, 4),
  ('11111111-0007-0000-0000-000000000007', 'minggu', 'sumber_dana', 'Sumber Dana', 'pilihan', false, 5),
  ('11111111-0007-0000-0000-000000000007', 'minggu', 'realisasi_anggaran', 'Realisasi Anggaran (Rp)', 'angka', false, 6),
  ('11111111-0007-0000-0000-000000000007', 'minggu', 'realisasi_fisik', 'Realisasi Fisik (%)', 'angka', false, 7),
  ('11111111-0007-0000-0000-000000000007', 'minggu', 'progress_pelaksanaan', 'Progress Pelaksanaan', 'teks_panjang', false, 8),
  ('11111111-0007-0000-0000-000000000007', 'minggu', 'permasalahan', 'Permasalahan', 'teks_panjang', false, 9)
on conflict (jenis_data_id, level, field_key) do nothing;

-- 8. Capaian Anggaran per Jenis Belanja (Minggu)
insert into field_definitions (jenis_data_id, level, field_key, label, tipe, wajib, urutan) values
  ('11111111-0008-0000-0000-000000000008', 'minggu', 'pagu_belanja_pegawai', 'Pagu Belanja Pegawai (Rp)', 'angka', false, 1),
  ('11111111-0008-0000-0000-000000000008', 'minggu', 'realisasi_belanja_pegawai', 'Realisasi Belanja Pegawai (Rp)', 'angka', false, 2),
  ('11111111-0008-0000-0000-000000000008', 'minggu', 'pagu_belanja_barang', 'Pagu Belanja Barang (Rp)', 'angka', false, 3),
  ('11111111-0008-0000-0000-000000000008', 'minggu', 'realisasi_belanja_barang', 'Realisasi Belanja Barang (Rp)', 'angka', false, 4),
  ('11111111-0008-0000-0000-000000000008', 'minggu', 'pagu_belanja_modal', 'Pagu Belanja Modal (Rp)', 'angka', false, 5),
  ('11111111-0008-0000-0000-000000000008', 'minggu', 'realisasi_belanja_modal', 'Realisasi Belanja Modal (Rp)', 'angka', false, 6)
on conflict (jenis_data_id, level, field_key) do nothing;

-- 9. Capaian Anggaran per Sumber Dana (Minggu)
insert into field_definitions (jenis_data_id, level, field_key, label, tipe, wajib, urutan) values
  ('11111111-0009-0000-0000-000000000009', 'minggu', 'pagu_rm', 'Pagu RM (Rp)', 'angka', false, 1),
  ('11111111-0009-0000-0000-000000000009', 'minggu', 'realisasi_rm', 'Realisasi RM (Rp)', 'angka', false, 2),
  ('11111111-0009-0000-0000-000000000009', 'minggu', 'pagu_pnbp_blu', 'Pagu PNBP/BLU (Rp)', 'angka', false, 3),
  ('11111111-0009-0000-0000-000000000009', 'minggu', 'realisasi_pnbp_blu', 'Realisasi PNBP/BLU (Rp)', 'angka', false, 4),
  ('11111111-0009-0000-0000-000000000009', 'minggu', 'pagu_sbsn', 'Pagu SBSN (Rp)', 'angka', false, 5),
  ('11111111-0009-0000-0000-000000000009', 'minggu', 'realisasi_sbsn', 'Realisasi SBSN (Rp)', 'angka', false, 6)
on conflict (jenis_data_id, level, field_key) do nothing;

-- ==========================
-- 15. SEED DATA — PERIODS 2026 LENGKAP
-- ==========================

-- TAHUN 2026
insert into periods (level, tahun, triwulan_ke, bulan, minggu_ke, tanggal_mulai, tanggal_selesai, deadline, label)
values ('tahun', 2026, null, null, null, '2026-01-01', '2026-12-31', '2027-06-30', 'Tahun 2026')
on conflict (level, tahun, triwulan_ke, bulan, minggu_ke) do nothing;

-- TRIWULAN 2026
insert into periods (level, tahun, triwulan_ke, bulan, minggu_ke, tanggal_mulai, tanggal_selesai, deadline, label) values
  ('triwulan', 2026, 1, null, null, '2026-01-01', '2026-03-31', '2026-06-30', 'Triwulan I 2026'),
  ('triwulan', 2026, 2, null, null, '2026-04-01', '2026-06-30', '2026-09-30', 'Triwulan II 2026'),
  ('triwulan', 2026, 3, null, null, '2026-07-01', '2026-09-30', '2026-12-31', 'Triwulan III 2026'),
  ('triwulan', 2026, 4, null, null, '2026-10-01', '2026-12-31', '2027-03-31', 'Triwulan IV 2026')
on conflict (level, tahun, triwulan_ke, bulan, minggu_ke) do nothing;

-- BULAN 2026 (deadline = akhir bulan berikutnya)
insert into periods (level, tahun, triwulan_ke, bulan, minggu_ke, tanggal_mulai, tanggal_selesai, deadline, label) values
  ('bulan', 2026, 1, 1,  null, '2026-01-01', '2026-01-31', '2026-02-28', 'Januari 2026'),
  ('bulan', 2026, 1, 2,  null, '2026-02-01', '2026-02-28', '2026-03-31', 'Februari 2026'),
  ('bulan', 2026, 1, 3,  null, '2026-03-01', '2026-03-31', '2026-04-30', 'Maret 2026'),
  ('bulan', 2026, 2, 4,  null, '2026-04-01', '2026-04-30', '2026-05-31', 'April 2026'),
  ('bulan', 2026, 2, 5,  null, '2026-05-01', '2026-05-31', '2026-06-30', 'Mei 2026'),
  ('bulan', 2026, 2, 6,  null, '2026-06-01', '2026-06-30', '2026-07-31', 'Juni 2026'),
  ('bulan', 2026, 3, 7,  null, '2026-07-01', '2026-07-31', '2026-08-31', 'Juli 2026'),
  ('bulan', 2026, 3, 8,  null, '2026-08-01', '2026-08-31', '2026-09-30', 'Agustus 2026'),
  ('bulan', 2026, 3, 9,  null, '2026-09-01', '2026-09-30', '2026-10-31', 'September 2026'),
  ('bulan', 2026, 4, 10, null, '2026-10-01', '2026-10-31', '2026-11-30', 'Oktober 2026'),
  ('bulan', 2026, 4, 11, null, '2026-11-01', '2026-11-30', '2026-12-31', 'November 2026'),
  ('bulan', 2026, 4, 12, null, '2026-12-01', '2026-12-31', '2027-01-31', 'Desember 2026')
on conflict (level, tahun, triwulan_ke, bulan, minggu_ke) do nothing;

-- MINGGU 2026 — 48 minggu
insert into periods (level, tahun, triwulan_ke, bulan, minggu_ke, tanggal_mulai, tanggal_selesai, deadline, label) values
  ('minggu', 2026, 1, 1,  1, '2026-01-01', '2026-01-07', '2026-01-14', 'Minggu 1 Jan 2026'),
  ('minggu', 2026, 1, 1,  2, '2026-01-08', '2026-01-14', '2026-01-21', 'Minggu 2 Jan 2026'),
  ('minggu', 2026, 1, 1,  3, '2026-01-15', '2026-01-21', '2026-01-28', 'Minggu 3 Jan 2026'),
  ('minggu', 2026, 1, 1,  4, '2026-01-22', '2026-01-31', '2026-02-07', 'Minggu 4 Jan 2026'),
  ('minggu', 2026, 1, 2,  1, '2026-02-01', '2026-02-07', '2026-02-14', 'Minggu 1 Feb 2026'),
  ('minggu', 2026, 1, 2,  2, '2026-02-08', '2026-02-14', '2026-02-21', 'Minggu 2 Feb 2026'),
  ('minggu', 2026, 1, 2,  3, '2026-02-15', '2026-02-21', '2026-02-28', 'Minggu 3 Feb 2026'),
  ('minggu', 2026, 1, 2,  4, '2026-02-22', '2026-02-28', '2026-03-07', 'Minggu 4 Feb 2026'),
  ('minggu', 2026, 1, 3,  1, '2026-03-01', '2026-03-07', '2026-03-14', 'Minggu 1 Mar 2026'),
  ('minggu', 2026, 1, 3,  2, '2026-03-08', '2026-03-14', '2026-03-21', 'Minggu 2 Mar 2026'),
  ('minggu', 2026, 1, 3,  3, '2026-03-15', '2026-03-21', '2026-03-28', 'Minggu 3 Mar 2026'),
  ('minggu', 2026, 1, 3,  4, '2026-03-22', '2026-03-31', '2026-04-07', 'Minggu 4 Mar 2026'),
  ('minggu', 2026, 2, 4,  1, '2026-04-01', '2026-04-07', '2026-04-14', 'Minggu 1 Apr 2026'),
  ('minggu', 2026, 2, 4,  2, '2026-04-08', '2026-04-14', '2026-04-21', 'Minggu 2 Apr 2026'),
  ('minggu', 2026, 2, 4,  3, '2026-04-15', '2026-04-21', '2026-04-28', 'Minggu 3 Apr 2026'),
  ('minggu', 2026, 2, 4,  4, '2026-04-22', '2026-04-30', '2026-05-07', 'Minggu 4 Apr 2026'),
  ('minggu', 2026, 2, 5,  1, '2026-05-01', '2026-05-07', '2026-05-14', 'Minggu 1 Mei 2026'),
  ('minggu', 2026, 2, 5,  2, '2026-05-08', '2026-05-14', '2026-05-21', 'Minggu 2 Mei 2026'),
  ('minggu', 2026, 2, 5,  3, '2026-05-15', '2026-05-21', '2026-05-28', 'Minggu 3 Mei 2026'),
  ('minggu', 2026, 2, 5,  4, '2026-05-22', '2026-05-31', '2026-06-07', 'Minggu 4 Mei 2026'),
  ('minggu', 2026, 2, 6,  1, '2026-06-01', '2026-06-07', '2026-06-14', 'Minggu 1 Jun 2026'),
  ('minggu', 2026, 2, 6,  2, '2026-06-08', '2026-06-14', '2026-06-21', 'Minggu 2 Jun 2026'),
  ('minggu', 2026, 2, 6,  3, '2026-06-15', '2026-06-21', '2026-06-28', 'Minggu 3 Jun 2026'),
  ('minggu', 2026, 2, 6,  4, '2026-06-22', '2026-06-30', '2026-07-07', 'Minggu 4 Jun 2026'),
  ('minggu', 2026, 3, 7,  1, '2026-07-01', '2026-07-07', '2026-07-14', 'Minggu 1 Jul 2026'),
  ('minggu', 2026, 3, 7,  2, '2026-07-08', '2026-07-14', '2026-07-21', 'Minggu 2 Jul 2026'),
  ('minggu', 2026, 3, 7,  3, '2026-07-15', '2026-07-21', '2026-07-28', 'Minggu 3 Jul 2026'),
  ('minggu', 2026, 3, 7,  4, '2026-07-22', '2026-07-31', '2026-08-07', 'Minggu 4 Jul 2026'),
  ('minggu', 2026, 3, 8,  1, '2026-08-01', '2026-08-07', '2026-08-14', 'Minggu 1 Agu 2026'),
  ('minggu', 2026, 3, 8,  2, '2026-08-08', '2026-08-14', '2026-08-21', 'Minggu 2 Agu 2026'),
  ('minggu', 2026, 3, 8,  3, '2026-08-15', '2026-08-21', '2026-08-28', 'Minggu 3 Agu 2026'),
  ('minggu', 2026, 3, 8,  4, '2026-08-22', '2026-08-31', '2026-09-07', 'Minggu 4 Agu 2026'),
  ('minggu', 2026, 3, 9,  1, '2026-09-01', '2026-09-07', '2026-09-14', 'Minggu 1 Sep 2026'),
  ('minggu', 2026, 3, 9,  2, '2026-09-08', '2026-09-14', '2026-09-21', 'Minggu 2 Sep 2026'),
  ('minggu', 2026, 3, 9,  3, '2026-09-15', '2026-09-21', '2026-09-28', 'Minggu 3 Sep 2026'),
  ('minggu', 2026, 3, 9,  4, '2026-09-22', '2026-09-30', '2026-10-07', 'Minggu 4 Sep 2026'),
  ('minggu', 2026, 4, 10, 1, '2026-10-01', '2026-10-07', '2026-10-14', 'Minggu 1 Okt 2026'),
  ('minggu', 2026, 4, 10, 2, '2026-10-08', '2026-10-14', '2026-10-21', 'Minggu 2 Okt 2026'),
  ('minggu', 2026, 4, 10, 3, '2026-10-15', '2026-10-21', '2026-10-28', 'Minggu 3 Okt 2026'),
  ('minggu', 2026, 4, 10, 4, '2026-10-22', '2026-10-31', '2026-11-07', 'Minggu 4 Okt 2026'),
  ('minggu', 2026, 4, 11, 1, '2026-11-01', '2026-11-07', '2026-11-14', 'Minggu 1 Nov 2026'),
  ('minggu', 2026, 4, 11, 2, '2026-11-08', '2026-11-14', '2026-11-21', 'Minggu 2 Nov 2026'),
  ('minggu', 2026, 4, 11, 3, '2026-11-15', '2026-11-21', '2026-11-28', 'Minggu 3 Nov 2026'),
  ('minggu', 2026, 4, 11, 4, '2026-11-22', '2026-11-30', '2026-12-07', 'Minggu 4 Nov 2026'),
  ('minggu', 2026, 4, 12, 1, '2026-12-01', '2026-12-07', '2026-12-14', 'Minggu 1 Des 2026'),
  ('minggu', 2026, 4, 12, 2, '2026-12-08', '2026-12-14', '2026-12-21', 'Minggu 2 Des 2026'),
  ('minggu', 2026, 4, 12, 3, '2026-12-15', '2026-12-21', '2026-12-28', 'Minggu 3 Des 2026'),
  ('minggu', 2026, 4, 12, 4, '2026-12-22', '2026-12-31', '2027-01-07', 'Minggu 4 Des 2026')
on conflict (level, tahun, triwulan_ke, bulan, minggu_ke) do nothing;
