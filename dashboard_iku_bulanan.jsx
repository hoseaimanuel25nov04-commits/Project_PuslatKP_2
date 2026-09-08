import React, { useState, useEffect, useRef, useCallback } from "react";
import * as XLSX from "xlsx";
import {
  GraduationCap, Wrench, Globe2, BookOpen, Building2, Laptop2, FileText, Handshake,
  Award, ShieldCheck, TrendingUp, Package, UserCheck, Users, Landmark, ClipboardList,
  Search, BadgeCheck, BarChart3, ShoppingCart, Archive, Lightbulb, Eye, X, Download,
} from "lucide-react";

/* ============================================================
   DATA DEFAULT — struktur indikator (no, nama, satuan) diambil dari
   file "Capaian_IKU.xlsx" (sheet "Detil Capaian"), termasuk rincian
   anak (a, b, c, ...) tiap indikator. Data Target/Realisasi kini
   disusun PER BULAN (m1..m12) dan sengaja dikosongkan — admin
   mengisi dari awal lewat Panel Admin atau upload Excel.
   ============================================================ */

const DEFAULT_DATA = [{"no":1,"nama":"Persentase Lulusan Pelatihan KP Kompeten yang Terserap di Dunia Usaha, Dunia Industri dan/atau Dunia Kerja (DUDIKA) (%)","target":76.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","children":[{"kode":"a","nama":"Lulusan Pelatihan KP Kompeten  BPPP Medan yang Terserap di Dunia Usaha, Dunia Industri dan/atau Dunia Kerja (DUDIKA) (orang)","target":607.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"orang","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Lulusan Pelatihan KP Kompeten  BPPP Tegal  yang Terserap di Dunia Usaha, Dunia Industri dan/atau Dunia Kerja (DUDIKA)(orang)","target":9120.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"orang","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Lulusan Pelatihan KP Kompeten  BPPP Banyuwangi  yang Terserap di Dunia Usaha, Dunia Industri dan/atau Dunia Kerja (DUDIKA)(orang)","target":1266.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"orang","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Lulusan Pelatihan KP Kompeten  BPPP Bitung yang Terserap di Dunia Usaha, Dunia Industri dan/atau Dunia Kerja (DUDIKA) (orang)","target":472.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"orang","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Lulusan Pelatihan KP Kompeten  BPPP Ambon yang Terserap di Dunia Usaha, Dunia Industri dan/atau Dunia Kerja (DUDIKA) (orang)","target":836.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"orang","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":2,"nama":"Persentase Peserta Pelatihan Masyarakat KP yang Menerapkan Kompetensi Hasil Pelatihan (%)","target":75.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","children":[{"kode":"a","nama":"Persentase Peserta Pelatihan Masyarakat KP BPPP Medan yang Menerapkan Kompetensi Hasil Pelatihan ","target":75.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Persentase Peserta Pelatihan Masyarakat KP BPPP Tegal yang Menerapkan Kompetensi Hasil Pelatihan ","target":75.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Persentase Peserta Pelatihan Masyarakat KP BPPP Banyuwangi yang Menerapkan Kompetensi Hasil Pelatihan ","target":75.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Persentase Peserta Pelatihan Masyarakat KP BPPP Bitung  yang Menerapkan Kompetensi Hasil Pelatihan ","target":75.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Persentase Peserta Pelatihan Masyarakat KP BPPP Ambon yang Menerapkan Kompetensi Hasil Pelatihan ","target":75.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"f","nama":"Masyarakat Kelautan dan Perikanan yang dilatih BPPP Medan (orang) ","target":1398.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"orang","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"g","nama":"Masyarakat Kelautan dan Perikanan yang dilatih   BPPP Tegal (orang) ","target":14000.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"orang","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"h","nama":"Masyarakat Kelautan dan Perikanan yang dilatih  BPPP Banyuwangi (orang) ","target":2765.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"orang","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"i","nama":"Masyarakat Kelautan dan Perikanan yang dilatih  BPPP Bitung (orang) ","target":1120.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"orang","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"j","nama":"Masyarakat Kelautan dan Perikanan yang dilatih  BPPP Ambon (orang) ","target":1600.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"orang","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":3,"nama":"Layanan Gerai Awak Kapal Perikanan Indonesia di Luar Negeri (laporan)","target":2.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"laporan","children":[],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":4,"nama":"Perangkat Pelatihan Kelautan dan Perikanan yang ditetapkan (paket modul)","target":5.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"paket modul","children":[{"kode":"a","nama":"Naskah perangkat pelatihan kelautan dan perikanan BPPP Medan (dokumen)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"dokumen","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Naskah perangkat pelatihan kelautan dan perikanan BPPP Tegal (dokumen)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"dokumen","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Naskah perangkat pelatihan kelautan dan perikanan BPPP Banyuwangi (dokumen)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"dokumen","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Naskah perangkat pelatihan kelautan dan perikanan BPPP Bitung (dokumen)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"dokumen","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Naskah perangkat pelatihan kelautan dan perikanan BPPP Ambon (dokumen)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"dokumen","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"f","nama":"Naskah perangkat pelatihan kelautan dan perikanan BPPA Sukamandi (dokumen)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"dokumen","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":5,"nama":"Bahan Ajar Pelatihan Kelautan dan Perikanan Berbasis Kaji Terap (paket bahan ajar)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"paket bahan ajar","children":[{"kode":"a","nama":"Proposal Inovasi Pelatihan Berbasis Kaji Terap Bidang Kelautan dan Perikanan BPPP Medan (proposal)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"proposal","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Proposal Inovasi Pelatihan Berbasis Kaji Terap Bidang Kelautan dan Perikanan BPPP Tegal (proposal)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"proposal","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Proposal Inovasi Pelatihan Berbasis Kaji Terap Bidang Kelautan dan Perikanan BPPP Banyuwangi (proposal)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"proposal","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Proposal Inovasi Pelatihan Berbasis Kaji Terap Bidang Kelautan dan Perikanan BPPP Bitung (proposal)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"proposal","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Proposal Inovasi Pelatihan Berbasis Kaji Terap Bidang Kelautan dan Perikanan BPPP Ambon (proposal)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"proposal","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":6,"nama":"Persentase Perangkat Pelatihan Kelautan dan Perikanan yang diterapkan dalam Penyelenggaraan Pelatihan (%)","target":75.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","children":[],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":7,"nama":"Peraturan Pelatihan Kelautan dan Perikanan yang diusulkan (Dokumen)","target":5.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Dokumen","children":[],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":8,"nama":"Persentase Pelaksanaan Kerja Sama Lingkup Pusat Pelatihan KP yang telah Disepakati (%)","target":50.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","children":[],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":9,"nama":"Sertifikasi Kelembagaan Pelatihan sesuai Standar Lembaga Pelatihan (Sertifikat)","target":7.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Sertifikat","children":[],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":10,"nama":"Persentase usulan sertifikasi program diklat masyarakat bidang Kelautan dan Perikanan yang disahkan sesuai dengan peraturan yang berlaku (%)","target":75.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","children":[],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":11,"nama":"Persentase Realisasi PNBP Lingkup Pusat Pelatihan KP  (%)","target":80.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","children":[{"kode":"a","nama":"Nilai PNBP Satker BPPP Medan (Rupiah Miliar)","target":0.52,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Rupiah Miliar","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Nilai PNBP Satker BPPP Tegal (Rupiah Miliar)","target":"22.52","m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Rupiah Miliar","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Nilai PNBP Satker BPPP Banyuwangi (Rupiah Miliar)","target":0.83,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Rupiah Miliar","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Nilai PNBP Satker BPPP Bitung (Rupiah Miliar)","target":0.2,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Rupiah Miliar","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Nilai PNBP Satker BPPP Ambon (Rupiah Miliar)","target":0.95,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Rupiah Miliar","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"f","nama":"Nilai PNBP Satker BPPA Sukamandi (Rupiah Miliar)","target":"1.03","m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Rupiah Miliar","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":12,"nama":"Sarana Prasarana Pelatihan KP yang ditingkatkan kapasitasnya (Paket)","target":6.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Paket","children":[{"kode":"a","nama":"Sarana Pelatihan KP yang ditingkatkan kapasitasnya di BPPP Medan","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Sarana Prasarana Pelatihan KP yang ditingkatkan kapasitasnya di BPPP Tegal","target":2.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Sarana Pelatihan KP yang ditingkatkan kapasitasnya di BPPP Banyuwangi","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Sarana Pelatihan KP yang ditingkatkan kapasitasnya di BPPP Bitung","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Sarana Pelatihan KP yang ditingkatkan kapasitasnya di BPPP Ambon","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":13,"nama":"Persentase aparatur KKP yang menerapkan kompetensi hasil pelatihan (%)","target":75.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","children":[],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":14,"nama":"Persentase Tenaga Pelatihan yang Mengikuti Pengembangan Kompetensi Sesuai Standar Pelatih (%)","target":20.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","children":[{"kode":"a","nama":"Penyiapan Data Kebutuhan Pengembangan Kompetensi Tenaga Pelatih di BPPP Medan (Dokumen)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Dokumen","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Penyiapan Data Kebutuhan Pengembangan Kompetensi Tenaga Pelatih di BPPP Tegal (Dokumen)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Dokumen","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Penyiapan Data Kebutuhan Pengembangan Kompetensi Tenaga Pelatih di BPPP Banyuwangi (Dokumen)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Dokumen","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Penyiapan Data Kebutuhan Pengembangan Kompetensi Tenaga Pelatih di BPPP Bitung (Dokumen)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Dokumen","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Penyiapan Data Kebutuhan Pengembangan Kompetensi Tenaga Pelatih di BPPP Ambon (Dokumen)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Dokumen","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"f","nama":"Penyiapan Data Kebutuhan Pengembangan Kompetensi Tenaga Pelatih di BPPP Sukamandi (Dokumen)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Dokumen","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":15,"nama":"Persentase Unit Eselon II KKP yang Mengimplementasikan Model Corporate University (Corpu) (%)","target":20.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","children":[],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":16,"nama":"Persentase layanan dukungan manajemen internal Pusat Pelatihan KP (%)","target":100.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","children":[{"kode":"a","nama":"Persentase layanan dukungan manajemen internal BPPP Medan (%)","target":100.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Persentase layanan dukungan manajemen internal BPPP Tegal (%)","target":100.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Persentase layanan dukungan manajemen internal BPPP Banyuwangi (%)","target":100.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Persentase layanan dukungan manajemen internal BPPP Bitung (%)","target":100.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Persentase layanan dukungan manajemen internal BPPP Ambon (%)","target":100.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"f","nama":"Persentase layanan dukungan manajemen internal BPPA Sukamandi (%)","target":100.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":17,"nama":"Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja Pusat Pelatihan KP (%)","target":86.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","children":[{"kode":"a","nama":"Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja BPPP MEdan (%)","target":86.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja BPPP Tegal (%)","target":86.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja BPPP Banyuwangi (%)","target":86.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja BPPP Bitung (%)","target":86.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja BPPP Ambon (%)","target":86.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"f","nama":"Persentase rekomendasi hasil pengawasan yang dimanfaatkan untuk perbaikan kinerja BPPA Sukamandi (%)","target":86.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":18,"nama":"Indeks Profesionalitas ASN Pusat Pelatihan KP (indeks)","target":83.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"indeks","children":[{"kode":"a","nama":"Indeks Profesionalitas ASN BPPP Medan (Indeks)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Indeks","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Indeks Profesionalitas ASN BPPPTegal (Indeks)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Indeks","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Indeks Profesionalitas ASN BPPP Banyuwangi (Indeks)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Indeks","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Indeks Profesionalitas ASN BPPP Bitung (Indeks)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Indeks","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Indeks Profesionalitas ASN BPPP Ambon (Indeks)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Indeks","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"f","nama":"Indeks Profesionalitas ASN BPPP Sukamandi (Indeks)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Indeks","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":19,"nama":"Penilaian Mandiri SAKIP Pusat Pelatihan KP (Nilai)","target":81.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","children":[{"kode":"a","nama":"Penilaian Mandiri SAKIP BPPP Medan (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Penilaian Mandiri SAKIP BPPP Tegal (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Penilaian Mandiri SAKIP BPPP Banyuwangi (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Penilaian Mandiri SAKIP BPPP Bitung (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Penilaian Mandiri SAKIP BPPP Ambon (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"f","nama":"Penilaian Mandiri SAKIP BPPP Sukamandi (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":20,"nama":"Persentase rencana umum pengadaan PBJ yang diumumkan pada SIRUP Pusat Pelatihan KP (%)","target":77.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","children":[{"kode":"a","nama":"Persentase Rencana Umum Pengadaan PBJ yang diumumkan pada SIRUP BPPP Medan (%)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Persentase Rencana Umum Pengadaan PBJ yang diumumkan pada SIRUP BPPP Tegal (%)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Persentase Rencana Umum Pengadaan PBJ yang diumumkan pada SIRUP BPPP Banyuwangi (%)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Persentase Rencana Umum Pengadaan PBJ yang diumumkan pada SIRUP BPPP Bitung (%)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Persentase Rencana Umum Pengadaan PBJ yang diumumkan pada SIRUP BPPP Ambon (%)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"f","nama":"Persentase Rencana Umum Pengadaan PBJ yang diumumkan pada SIRUP BPPP Sukamandi (%)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":21,"nama":"Nilai Pengawasan Kearsipan Internal Pusat Pelatihan KP (Nilai)","target":81.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","children":[{"kode":"a","nama":"Nilai Pengawasan Kearsipan Internal BPPP Medan (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Nilai Pengawasan Kearsipan Internal BPPP Tegal (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Nilai Pengawasan Kearsipan Internal BPPP Banyuwangi (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Nilai Pengawasan Kearsipan Internal BPPP Bitung (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Nilai Pengawasan Kearsipan Internal BPPP Ambon (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"f","nama":"Nilai Pengawasan Kearsipan Internal BPPP Sukamandi (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":22,"nama":"Presentase usulan inovasi lingkup Pusat Pelatihan KP (%)","target":50.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"%","children":[{"kode":"a","nama":"Jumlah Usulan Proposal Inovasi Pelayanan Publik (IPP) Satker BPPP Medan (Proposal)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Proposal","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Jumlah Usulan Proposal Inovasi Pelayanan Publik (IPP) Satker BPPP Tegal (Proposal)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Proposal","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Jumlah Usulan Proposal Inovasi Pelayanan Publik (IPP) Satker BPPP Banyuwangi (Proposal)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Proposal","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Jumlah Usulan Proposal Inovasi Pelayanan Publik (IPP) Satker BPPP Bitung (Proposal)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Proposal","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Jumlah Usulan Proposal Inovasi Pelayanan Publik (IPP) Satker BPPP Ambon (Proposal)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Proposal","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"f","nama":"Jumlah Usulan Proposal Inovasi Pelayanan Publik (IPP) Satker BPPP Sukamandi (Proposal)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Proposal","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":23,"nama":"Nilai Keterbukaan Informasi Pelayanan Publik Lingkup Pusat Pelatihan KP (Nilai)","target":78.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","children":[{"kode":"a","nama":"Nilai Keterbukaan Informasi Publik BPPP Medan (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"b","nama":"Nilai Keterbukaan Informasi Publik BPPP Tegal (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"c","nama":"Nilai Keterbukaan Informasi Publik BPPP Banyuwangi (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"d","nama":"Nilai Keterbukaan Informasi Publik BPPP Bitung (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"e","nama":"Nilai Keterbukaan Informasi Publik BPPP Ambon (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"kode":"f","nama":"Nilai Keterbukaan Informasi Publik BPPP Sukamandi (Nilai)","target":null,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Nilai","nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}},{"no":24,"nama":"Unit Kerja lingkup Pusat Pelatihan KP yang dibangun untuk diusulkan menuju Wilayah Bebas dari Korupsi (WBK) (Satker)","target":1.0,"m1_t":null,"m1_r":null,"m2_t":null,"m2_r":null,"m3_t":null,"m3_r":null,"m4_t":null,"m4_r":null,"m5_t":null,"m5_r":null,"m6_t":null,"m6_r":null,"m7_t":null,"m7_r":null,"m8_t":null,"m8_r":null,"m9_t":null,"m9_r":null,"m10_t":null,"m10_r":null,"m11_t":null,"m11_r":null,"m12_t":null,"m12_r":null,"unit":"Satker","children":[],"nkoOverride":{"tahun":null,"tw1":null,"tw2":null,"tw3":null,"tw4":null,"m1":null,"m2":null,"m3":null,"m4":null,"m5":null,"m6":null,"m7":null,"m8":null,"m9":null,"m10":null,"m11":null,"m12":null}}];

const CATEGORIES = [
  { id: "A", label: "Sasaran 1", title: "Terselenggaranya Pelatihan Kelautan dan Perikanan", range: [1, 12] },
  { id: "B", label: "Sasaran 2", title: "Aparatur yang Dididik dan Dilatih", range: [13, 15] },
  { id: "C", label: "Sasaran 3", title: "Tata Kelola Pemerintahan yang Efektif dan Akuntabel Bidang Penyuluhan dan Pengembangan SDM Kelautan dan Perikanan", range: [16, 24] },
];

const NKO_CAP = 120;
const ADMIN_PASSWORD = "111";
// Alamat folder "api" backend PHP di Laragon-mu.
// Contoh kalau proyek ditaruh di www/dashboard-puslatkp lalu diakses
// lewat http://dashboard-puslatkp.test, biarkan seperti ini apa adanya.
// Kalau diakses lewat http://localhost/dashboard-puslatkp, ganti jadi
// "http://localhost/dashboard-puslatkp/api".
const API_BASE = "/api";

/* Definisi 12 bulan, dan pemetaan bulan ke triwulan */
const MONTHS = [
  { key: "m1", n: 1, label: "Januari" }, { key: "m2", n: 2, label: "Februari" },
  { key: "m3", n: 3, label: "Maret" }, { key: "m4", n: 4, label: "April" },
  { key: "m5", n: 5, label: "Mei" }, { key: "m6", n: 6, label: "Juni" },
  { key: "m7", n: 7, label: "Juli" }, { key: "m8", n: 8, label: "Agustus" },
  { key: "m9", n: 9, label: "September" }, { key: "m10", n: 10, label: "Oktober" },
  { key: "m11", n: 11, label: "November" }, { key: "m12", n: 12, label: "Desember" },
];
const MONTH_LABEL = Object.fromEntries(MONTHS.map((m) => [m.key, m.label]));

const QUARTER_DEFS = [
  { key: "tw1", label: "Triwulan I", months: [1, 2, 3] },
  { key: "tw2", label: "Triwulan II", months: [4, 5, 6] },
  { key: "tw3", label: "Triwulan III", months: [7, 8, 9] },
  { key: "tw4", label: "Triwulan IV", months: [10, 11, 12] },
];

/* Ikon per indikator utama (1-24), disesuaikan isi masing-masing */
const ICON_MAP = {
  1: { Icon: GraduationCap, color: "#1B5FA8" }, 2: { Icon: Wrench, color: "#DD8A3D" },
  3: { Icon: Globe2, color: "#3E7CB1" }, 4: { Icon: BookOpen, color: "#7C5CC4" },
  5: { Icon: Building2, color: "#2E8B99" }, 6: { Icon: Laptop2, color: "#1B5FA8" },
  7: { Icon: FileText, color: "#5C6B7A" }, 8: { Icon: Handshake, color: "#C1443F" },
  9: { Icon: Award, color: "#C9A227" }, 10: { Icon: ShieldCheck, color: "#3E7CB1" },
  11: { Icon: TrendingUp, color: "#2F9E6E" }, 12: { Icon: Package, color: "#3E6B96" },
  13: { Icon: UserCheck, color: "#1B5FA8" }, 14: { Icon: Users, color: "#DD8A3D" },
  15: { Icon: Landmark, color: "#2E8B99" }, 16: { Icon: ClipboardList, color: "#1B5FA8" },
  17: { Icon: Search, color: "#5C6B7A" }, 18: { Icon: BadgeCheck, color: "#2F9E6E" },
  19: { Icon: BarChart3, color: "#7C5CC4" }, 20: { Icon: ShoppingCart, color: "#C1443F" },
  21: { Icon: Archive, color: "#3E6B96" }, 22: { Icon: Lightbulb, color: "#C9A227" },
  23: { Icon: Eye, color: "#3E7CB1" }, 24: { Icon: ShieldCheck, color: "#2F9E6E" },
};

/* Susun nomor indikator satu Sasaran jadi 3 kolom (1,2,3,4 di kolom-1; 5,6,7,8 di kolom-2, dst) */
function reorderIntoColumns(items) {
  const n = items.length;
  const colSize = Math.ceil(n / 3);
  const col1 = items.slice(0, colSize);
  const col2 = items.slice(colSize, colSize * 2);
  const col3 = items.slice(colSize * 2);
  const rows = [];
  for (let i = 0; i < colSize; i++) rows.push([col1[i], col2[i], col3[i]].filter(Boolean));
  return rows;
}

/* ------------------------------------------------------------
   Util
------------------------------------------------------------ */

function fmtNum(n) {
  if (n === null || n === undefined || Number.isNaN(n)) return "\u2014";
  const rounded = Math.round(n * 100) / 100;
  return rounded.toLocaleString("id-ID");
}

function formatValue(v, unit) {
  if (v === null || v === undefined) return "\u2014";
  const num = fmtNum(v);
  if (!unit || unit === "%") return num + "%";
  const u = String(unit).toLowerCase();
  if (u === "orang") return num + " org";
  return num + " " + unit;
}

function extractUnit(nama) {
  const matches = [...String(nama).matchAll(/\(([^()]*)\)/g)].map((m) => m[1].trim());
  if (matches.length === 0) return "%";
  const last = matches[matches.length - 1];
  return last === "%" ? "%" : last;
}

function emptyOverride() {
  const o = { tahun: null };
  QUARTER_DEFS.forEach((q) => (o[q.key] = null));
  MONTHS.forEach((m) => (o[m.key] = null));
  return o;
}

/* ------------------------------------------------------------
   Perhitungan Target/Realisasi/NKO — kini berbasis 12 bulan (m1..m12),
   dengan agregasi ke Triwulan (ambil bulan terakhir triwulan yang
   sudah terisi) dan ke Tahun (ambil bulan terisi paling akhir).
   periodKey: "tahun" | "tw1".."tw4" | "m1".."m12"
------------------------------------------------------------ */

function periodLabel(periodKey) {
  if (periodKey === "tahun") return "Tahun 2026";
  const q = QUARTER_DEFS.find((q) => q.key === periodKey);
  if (q) return q.label;
  return MONTH_LABEL[periodKey] || periodKey;
}

function periodValues(node, periodKey) {
  if (periodKey === "tahun") {
    const target = node.target;
    let realisasi = null;
    for (let n = 12; n >= 1; n--) {
      const v = node[`m${n}_r`];
      if (v !== null && v !== undefined) { realisasi = v; break; }
    }
    return { target, realisasi };
  }
  const q = QUARTER_DEFS.find((q) => q.key === periodKey);
  if (q) {
    let target = null, realisasi = null;
    for (let i = q.months.length - 1; i >= 0; i--) {
      const v = node[`m${q.months[i]}_t`];
      if (v !== null && v !== undefined) { target = v; break; }
    }
    for (let i = q.months.length - 1; i >= 0; i--) {
      const v = node[`m${q.months[i]}_r`];
      if (v !== null && v !== undefined) { realisasi = v; break; }
    }
    return { target, realisasi };
  }
  // periodKey adalah "m1".."m12"
  return { target: node[`${periodKey}_t`], realisasi: node[`${periodKey}_r`] };
}

function computeNKOForPeriod(node, periodKey) {
  const { target, realisasi } = periodValues(node, periodKey);
  const override = node.nkoOverride ? node.nkoOverride[periodKey] : null;
  if (override !== null && override !== undefined && override !== "") {
    return { target, realisasi, nko: Number(override), isOverride: true };
  }
  if (realisasi === null || realisasi === undefined || !target) {
    return { target, realisasi, nko: null, isOverride: false };
  }
  const raw = (realisasi / target) * 100;
  const nko = raw > NKO_CAP ? NKO_CAP : raw;
  return { target, realisasi, nko, isOverride: false };
}

function computeNKO(node, periodKey) {
  if (periodKey === "tahun") {
    // Untuk mode "Tahun 2026": pakai NKO bulan yang sudah terisi/di-override
    // paling awal (Januari dulu, lalu berikutnya) sebagai skor tahun berjalan.
    const { target, realisasi } = periodValues(node, periodKey);
    for (const m of MONTHS) {
      const r = computeNKOForPeriod(node, m.key);
      if (r.nko !== null && r.nko !== undefined) {
        return { target, realisasi, nko: r.nko, isOverride: r.isOverride };
      }
    }
    return { target, realisasi, nko: null, isOverride: false };
  }
  return computeNKOForPeriod(node, periodKey);
}

function nkoColor(nko) {
  if (nko === null || nko === undefined) return "#7C8A9A";
  if (nko >= 100) return "#2F9E6E";
  if (nko >= 60) return "#B8790A";
  return "#C13F3F";
}

/* ------------------------------------------------------------
   Modal — popup keterangan di tengah layar (menggantikan dropdown
   ke bawah). Klik di luar kotak atau tombol X untuk menutup.
------------------------------------------------------------ */

function Modal({ onClose, title, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(11,53,86,0.45)", zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 18,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="modal-box"
        style={{
          background: "#fff", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "82vh",
          overflowY: "auto", boxShadow: "0 16px 48px rgba(11,53,86,0.28)",
        }}
      >
        <div style={{ position: "sticky", top: 0, background: "#fff", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "18px 20px 12px", borderBottom: "1px solid #E3EBF3" }}>
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16.5, color: "#0B3556", lineHeight: 1.35 }}>{title}</div>
          <button onClick={onClose} style={{ flexShrink: 0, background: "#EEF4FA", border: "none", borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#0B3556" }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ padding: "14px 20px 20px" }}>{children}</div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Kotak Indikator — diklik untuk membuka Keterangan (rincian anak
   a,b,c,...) dalam popup di tengah layar
------------------------------------------------------------ */

function IndicatorBox({ ind, periode }) {
  const [open, setOpen] = useState(false);
  const { target, realisasi, nko } = computeNKO(ind, periode);
  const color = nkoColor(nko);
  const iconDef = ICON_MAP[ind.no] || { Icon: FileText, color: "#1B5FA8" };
  const { Icon } = iconDef;
  const hasChildren = ind.children && ind.children.length > 0;

  return (
    <div style={{ background: "#DCE9F7", borderRadius: 10, borderLeft: `5px solid ${color}`, overflow: "hidden" }}>
      <div
        className="indicator-box"
        onClick={() => hasChildren && setOpen(true)}
        style={{ display: "flex", alignItems: "center", cursor: hasChildren ? "pointer" : "default" }}
      >
        <div className="indicator-num" style={{ flexShrink: 0, borderRadius: 8, background: "#0B3556", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontWeight: 700 }}>
          {ind.no}
        </div>

        <div className="indicator-icon" style={{ flexShrink: 0, borderRadius: 9, background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 1px 2px rgba(11,53,86,0.08)" }}>
          <Icon size={22} color={iconDef.color} strokeWidth={2} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="indicator-text" style={{ fontFamily: "'Inter', sans-serif", lineHeight: 1.3, color: "#1B2733", fontWeight: 500, marginBottom: 4 }}>
            {ind.nama}
          </div>
          <div className="indicator-meta" style={{ display: "flex", flexWrap: "wrap", alignItems: "center", fontFamily: "'Inter', sans-serif" }}>
            <span style={{ color: "#1B2733" }}>Target : <b>{formatValue(target, ind.unit)}</b></span>
            <span style={{ color: "#1B2733" }}>Realisasi : <b>{formatValue(realisasi, ind.unit)}</b></span>
            <span style={{ fontWeight: 700, color, background: "#fff", padding: "2px 9px", borderRadius: 999, fontSize: 11.5 }}>
              NKO {nko !== null ? fmtNum(nko) + "%" : "\u2014"}
            </span>
          </div>
        </div>

        {hasChildren && (
          <div style={{ flexShrink: 0, color: "#3E6B96", paddingLeft: 6, fontFamily: "'Inter', sans-serif", fontSize: 11, fontWeight: 700, display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Eye size={16} />
            <span style={{ fontSize: 9.5 }}>Detail</span>
          </div>
        )}
      </div>

      {hasChildren && open && (
        <Modal title={ind.nama} onClose={() => setOpen(false)}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#7C8A9A", marginBottom: 10 }}>
            Keterangan \u2014 {periodLabel(periode)}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ind.children.map((child) => {
              const cv = computeNKO(child, periode);
              const cColor = nkoColor(cv.nko);
              return (
                <div key={child.kode} style={{ display: "flex", alignItems: "flex-start", gap: 9, background: "#EEF4FA", borderRadius: 8, padding: "8px 10px" }}>
                  <div style={{ flexShrink: 0, width: 22, height: 22, borderRadius: 6, background: "#3E6B96", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 700, marginTop: 1 }}>
                    {child.kode}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#3A4856", lineHeight: 1.35 }}>{child.nama}</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 10, fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#1B2733", marginTop: 3 }}>
                      <span>Target : <b>{formatValue(cv.target, child.unit)}</b></span>
                      <span>Realisasi : <b>{formatValue(cv.realisasi, child.unit)}</b></span>
                      <span style={{ fontWeight: 700, color: cColor }}>NKO {cv.nko !== null ? fmtNum(cv.nko) + "%" : "\u2014"}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </div>
  );
}

/* ------------------------------------------------------------
   Wave divider (signature visual)
------------------------------------------------------------ */

function WaveDivider() {
  return (
    <svg viewBox="0 0 1440 60" style={{ display: "block", width: "100%", height: 44 }} preserveAspectRatio="none">
      <path d="M0 30 Q 120 0 240 30 T 480 30 T 720 30 T 960 30 T 1200 30 T 1440 30 V60 H0 Z" fill="#0B3556" opacity="0.06" />
      <path d="M0 40 Q 120 15 240 40 T 480 40 T 720 40 T 960 40 T 1200 40 T 1440 40 V60 H0 Z" fill="#1B5FA8" opacity="0.08" />
    </svg>
  );
}

/* ------------------------------------------------------------
   Ekspor Excel — bisa diunduh per Bulanan, Triwulanan, atau Tahunan.
   Setiap indikator utama + rincian anak (a,b,c,...) ditulis sebagai
   baris, dengan kolom Target/Realisasi/NKO mengikuti periode yang
   dipilih.
------------------------------------------------------------ */

function exportPeriodDefs(kind) {
  if (kind === "bulan") return MONTHS.map((m) => ({ key: m.key, label: m.label }));
  if (kind === "triwulan") return QUARTER_DEFS.map((q) => ({ key: q.key, label: q.label }));
  return [{ key: "tahun", label: "Tahun 2026" }];
}

function buildExportAOA(data, kind) {
  const periodDefs = exportPeriodDefs(kind);
  const header1 = ["No/Kode", "Nama Indikator", "Satuan", "Target Tahun"];
  const header2 = ["", "", "", ""];
  periodDefs.forEach((p) => { header1.push(p.label, "", ""); header2.push("Target", "Realisasi", "NKO (%)"); });
  const aoa = [header1, header2];

  const pushRow = (node, idLabel) => {
    const line = [idLabel, node.nama, node.unit || "", node.target ?? ""];
    periodDefs.forEach((p) => {
      const { target, realisasi, nko } = computeNKO(node, p.key);
      line.push(target ?? "", realisasi ?? "", nko !== null && nko !== undefined ? Math.round(nko * 100) / 100 : "");
    });
    aoa.push(line);
  };

  data.forEach((row) => {
    pushRow(row, row.no);
    (row.children || []).forEach((child) => pushRow(child, "  " + child.kode));
  });
  return aoa;
}

function exportExcel(data, kind) {
  const aoa = buildExportAOA(data, kind);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 10 }, { wch: 55 }, { wch: 12 }, { wch: 12 }];
  const wb = XLSX.utils.book_new();
  const sheetName = kind === "bulan" ? "Bulanan" : kind === "triwulan" ? "Triwulanan" : "Tahunan";
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const tanggal = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `IKU_Puslat_KP_${sheetName}_${tanggal}.xlsx`);
}

function ExportButtons({ data }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      <button onClick={() => exportExcel(data, "bulan")} style={exportBtnStyle}>
        <Download size={14} /> Unduh Excel Bulanan
      </button>
      <button onClick={() => exportExcel(data, "triwulan")} style={exportBtnStyle}>
        <Download size={14} /> Unduh Excel Triwulanan
      </button>
      <button onClick={() => exportExcel(data, "tahun")} style={exportBtnStyle}>
        <Download size={14} /> Unduh Excel Tahunan
      </button>
    </div>
  );
}

const exportBtnStyle = {
  display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 9,
  border: "1px solid #D7E1EC", background: "#fff", color: "#0B3556",
  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
};

/* ------------------------------------------------------------
   Panel Admin — lengkap seperti Excel: indikator utama + rincian
   anak (a,b,c,...), Target/Realisasi tiap BULAN (Jan-Des), dan NKO
   (bisa ditimpa manual per indikator per bulan/triwulan/tahun).
------------------------------------------------------------ */

function NumInput({ value, onChange, width }) {
  return (
    <input
      type="number"
      value={value === null || value === undefined ? "" : value}
      onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
      style={{ width: width || 62, border: "1px solid #D7E1EC", borderRadius: 6, padding: "4px 6px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#1B2733" }}
    />
  );
}

function AdminRow({ node, isChild, onField, onOverride, computed }) {
  return (
    <tr style={{ borderTop: "1px solid #E3EBF3", background: isChild ? "#F7FAFD" : "#fff" }}>
      <td style={{ ...tdStyle, position: "sticky", left: 0, background: isChild ? "#F7FAFD" : "#fff", paddingLeft: isChild ? 26 : 8, fontFamily: "'JetBrains Mono', monospace", fontWeight: isChild ? 400 : 700, color: isChild ? "#5C6B7A" : "#0B3556" }}>
        {isChild ? node.kode : node.no}
      </td>
      <td style={{ ...tdStyle, position: "sticky", left: 34, background: isChild ? "#F7FAFD" : "#fff" }}>
        <input value={node.nama} onChange={(e) => onField("nama", e.target.value)} style={inputStyle(isChild ? 220 : 240)} />
      </td>
      <td style={tdStyle}>
        <input value={node.unit || ""} onChange={(e) => onField("unit", e.target.value)} style={inputStyle(64)} placeholder="%" />
      </td>
      <td style={tdStyle}><NumInput value={node.target} onChange={(v) => onField("target", v)} /></td>
      <td style={{ ...tdStyle, borderLeft: "2px solid #D7E1EC" }}>
        <input
          type="number"
          value={node.nkoOverride && node.nkoOverride.tahun !== null && node.nkoOverride.tahun !== undefined ? node.nkoOverride.tahun : ""}
          onChange={(e) => onOverride("tahun", e.target.value === "" ? null : Number(e.target.value))}
          placeholder={computed.tahun !== null && computed.tahun !== undefined ? fmtNum(computed.tahun) : "\u2014"}
          style={{ width: 58, border: "1px solid #D7E1EC", borderRadius: 6, padding: "4px 6px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#1B5FA8" }}
        />
      </td>
      {QUARTER_DEFS.map((q) => (
        <td key={q.key} style={{ ...tdStyle, borderLeft: "2px solid #D7E1EC" }}>
          <input
            type="number"
            value={node.nkoOverride && node.nkoOverride[q.key] !== null && node.nkoOverride[q.key] !== undefined ? node.nkoOverride[q.key] : ""}
            onChange={(e) => onOverride(q.key, e.target.value === "" ? null : Number(e.target.value))}
            placeholder={computed[q.key] !== null && computed[q.key] !== undefined ? fmtNum(computed[q.key]) : "\u2014"}
            style={{ width: 58, border: "1px solid #D7E1EC", borderRadius: 6, padding: "4px 6px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#1B5FA8" }}
          />
        </td>
      ))}
      {MONTHS.map((m) => (
        <React.Fragment key={m.key}>
          <td style={{ ...tdStyle, borderLeft: "2px solid #D7E1EC" }}><NumInput value={node[`${m.key}_t`]} onChange={(v) => onField(`${m.key}_t`, v)} /></td>
          <td style={tdStyle}><NumInput value={node[`${m.key}_r`]} onChange={(v) => onField(`${m.key}_r`, v)} /></td>
          <td style={tdStyle}>
            <input
              type="number"
              value={node.nkoOverride && node.nkoOverride[m.key] !== null && node.nkoOverride[m.key] !== undefined ? node.nkoOverride[m.key] : ""}
              onChange={(e) => onOverride(m.key, e.target.value === "" ? null : Number(e.target.value))}
              placeholder={computed[m.key] !== null && computed[m.key] !== undefined ? fmtNum(computed[m.key]) : "\u2014"}
              style={{ width: 54, border: "1px solid #D7E1EC", borderRadius: 6, padding: "4px 6px", fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#1B5FA8" }}
            />
          </td>
        </React.Fragment>
      ))}
    </tr>
  );
}

function AdminPanel({ data, onSave, lastUpdated }) {
  const [draft, setDraft] = useState(data);
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => setDraft(data), [data]);

  const updateParentField = (no, field, value) => {
    setDraft((prev) => prev.map((row) => (row.no === no ? { ...row, [field]: value } : row)));
  };
  const updateChildField = (no, kode, field, value) => {
    setDraft((prev) => prev.map((row) => row.no !== no ? row : {
      ...row, children: row.children.map((c) => (c.kode === kode ? { ...c, [field]: value } : c)),
    }));
  };
  const updateParentOverride = (no, key, value) => {
    setDraft((prev) => prev.map((row) => (row.no === no ? { ...row, nkoOverride: { ...row.nkoOverride, [key]: value } } : row)));
  };
  const updateChildOverride = (no, kode, key, value) => {
    setDraft((prev) => prev.map((row) => row.no !== no ? row : {
      ...row, children: row.children.map((c) => (c.kode === kode ? { ...c, nkoOverride: { ...c.nkoOverride, [key]: value } } : c)),
    }));
  };

  const computePeriodMap = (node) => {
    const map = { tahun: computeNKO(node, "tahun").nko };
    QUARTER_DEFS.forEach((q) => (map[q.key] = computeNKO(node, q.key).nko));
    MONTHS.forEach((m) => (map[m.key] = computeNKO(node, m.key).nko));
    return map;
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadMsg({ type: "loading", text: "Membaca file..." });
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheetName = wb.SheetNames.find((n) => /detil/i.test(n)) || wb.SheetNames[1] || wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null });

      // Sheet sumber ("Detil Capaian") masih berformat Triwulan (TW1-TW4).
      // Nilai Target/Realisasi tiap triwulan dipetakan ke BULAN TERAKHIR
      // triwulan tersebut (TW1 -> Maret, TW2 -> Juni, TW3 -> September,
      // TW4 -> Desember); bulan lain tetap kosong untuk diisi manual.
      const foundParents = [];
      let currentParent = null;
      rows.forEach((row) => {
        const no = row[2];
        if (typeof no === "number") {
          if (currentParent) foundParents.push(currentParent);
          currentParent = {
            no, nama: String(row[3] || "").trim(), unit: extractUnit(row[3] || ""),
            target: row[5], m3_t: row[6], m3_r: row[7], m6_t: row[9], m6_r: row[10],
            m9_t: row[11], m9_r: row[12], m12_t: row[13], m12_r: row[14], children: [],
            sheetNkoTw1: row[8] === null || row[8] === undefined ? null : Number(row[8]),
          };
        } else if (row[3] && row[4] && currentParent) {
          currentParent.children.push({
            kode: String(row[3]).trim().replace(/\.$/, ""), nama: String(row[4]).trim(), unit: extractUnit(row[4]),
            target: row[5], m3_t: row[6], m3_r: row[7], m6_t: row[9], m6_r: row[10],
            m9_t: row[11], m9_r: row[12], m12_t: row[13], m12_r: row[14],
            nkoOverride: emptyOverride(),
          });
        }
      });
      if (currentParent) foundParents.push(currentParent);

      const foundMap = {};
      foundParents.forEach((p) => (foundMap[p.no] = p));

      const merged = draft.map((row) => {
        const f = foundMap[row.no];
        if (!f) return row;
        const oldChildByKode = {};
        (row.children || []).forEach((c) => (oldChildByKode[c.kode] = c));
        const newChildren = f.children.map((c) => ({
          ...c,
          nkoOverride: oldChildByKode[c.kode] ? oldChildByKode[c.kode].nkoOverride : c.nkoOverride,
        }));
        return {
          ...row, nama: f.nama, unit: f.unit, target: f.target,
          m3_t: f.m3_t, m3_r: f.m3_r, m6_t: f.m6_t, m6_r: f.m6_r,
          m9_t: f.m9_t, m9_r: f.m9_r, m12_t: f.m12_t, m12_r: f.m12_r,
          children: newChildren,
          // Kolom NKO Triwulan I di sheet Detil Capaian jadi acuan langsung untuk Maret (m3);
          // NKO lainnya tetap ikut override manual yang sudah ada di admin.
          nkoOverride: { ...row.nkoOverride, m3: f.sheetNkoTw1 },
        };
      });
      setDraft(merged);
      setUploadMsg({ type: "success", text: `Berhasil membaca ${foundParents.length} indikator (dan rincian anaknya) dari sheet "${sheetName}". Nilai Triwulan dipetakan ke bulan terakhir triwulan (Mar/Jun/Sep/Des) \u2014 lengkapi bulan lainnya secara manual, lalu klik "Simpan Perubahan".` });
    } catch (err) {
      setUploadMsg({ type: "error", text: "Gagal membaca file. Pastikan formatnya sama seperti template Excel asli." });
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const hasChanges = JSON.stringify(draft) !== JSON.stringify(data);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div className="admin-upload-row" style={{ background: "#0B3556", borderRadius: 14, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#fff", fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600 }}>Unggah Data Baru</div>
          <div style={{ color: "#B7CBE0", fontFamily: "'Inter', sans-serif", fontSize: 12.5, marginTop: 2 }}>
            Format kolom mengikuti sheet "Detil Capaian" pada file asli (Triwulan); nilainya otomatis dipetakan ke bulan terakhir tiap triwulan.
          </div>
        </div>
        <label style={{ background: "#fff", color: "#0B3556", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 10, cursor: "pointer", whiteSpace: "nowrap" }}>
          Pilih File Excel
          <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} style={{ display: "none" }} />
        </label>
      </div>

      {uploadMsg && (
        <div style={{ padding: "10px 16px", borderRadius: 10, fontFamily: "'Inter', sans-serif", fontSize: 13, background: uploadMsg.type === "error" ? "#FBEAEA" : uploadMsg.type === "success" ? "#E7F6EF" : "#EEF1F4", color: uploadMsg.type === "error" ? "#C13F3F" : uploadMsg.type === "success" ? "#2F9E6E" : "#48566A" }}>
          {uploadMsg.text}
        </div>
      )}

      <div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15.5, fontWeight: 600, color: "#0B3556", marginBottom: 10 }}>Unduh Data (Excel)</div>
        <ExportButtons data={draft} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600, color: "#0B3556" }}>Edit Manual Lengkap (Indikator + Rincian Anak, per Bulan)</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button disabled={!hasChanges} onClick={() => setDraft(data)} style={btnStyle(false, !hasChanges)}>Batalkan</button>
          <button disabled={!hasChanges} onClick={() => onSave(draft)} style={btnStyle(true, !hasChanges)}>Simpan Perubahan</button>
        </div>
      </div>
      <div className="mobile-hint" style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#7C8A9A", marginTop: -14 }}>Geser tabel ke kanan untuk lihat kolom bulan lainnya \u2192</div>
      {lastUpdated && (
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#7C8A9A", marginTop: -14 }}>Terakhir disimpan: {lastUpdated}</div>
      )}

      {CATEGORIES.map((cat) => (
        <div key={cat.id} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, color: "#1B5FA8", textTransform: "uppercase", letterSpacing: 0.4 }}>
            {cat.label} \u2014 {cat.title}
          </div>
          <div className="admin-table-wrap" style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter', sans-serif", fontSize: 12.5 }}>
              <thead>
                <tr style={{ textAlign: "left", color: "#7C8A9A", fontSize: 10.5, textTransform: "uppercase" }}>
                  <th style={{ ...thStyle, position: "sticky", left: 0, background: "#F5F8FB" }}>No</th>
                  <th style={{ ...thStyle, minWidth: 220, position: "sticky", left: 34, background: "#F5F8FB" }}>Nama</th>
                  <th style={thStyle}>Satuan</th>
                  <th style={thStyle}>Target Thn</th>
                  <th style={{ ...thStyle, textAlign: "center", borderLeft: "2px solid #D7E1EC" }}>NKO Tahun</th>
                  {QUARTER_DEFS.map((q) => (
                    <th style={{ ...thStyle, textAlign: "center", borderLeft: "2px solid #D7E1EC" }} key={q.key}>NKO {q.label}</th>
                  ))}
                  {MONTHS.map((m) => (
                    <th style={{ ...thStyle, textAlign: "center", borderLeft: "2px solid #D7E1EC" }} colSpan={3} key={m.key}>{m.label}</th>
                  ))}
                </tr>
                <tr style={{ textAlign: "left", color: "#B0BAC6", fontSize: 10 }}>
                  <th></th><th></th><th></th><th></th><th></th>
                  {QUARTER_DEFS.map((q) => <th key={q.key}></th>)}
                  {MONTHS.map((m) => (
                    <React.Fragment key={m.key}>
                      <th style={thStyle}>Target</th><th style={thStyle}>Realisasi</th><th style={thStyle}>NKO</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>
                {draft.filter((r) => r.no >= cat.range[0] && r.no <= cat.range[1]).map((row) => (
                  <React.Fragment key={row.no}>
                    <AdminRow
                      node={row} isChild={false}
                      onField={(field, value) => updateParentField(row.no, field, value)}
                      onOverride={(key, value) => updateParentOverride(row.no, key, value)}
                      computed={computePeriodMap(row)}
                    />
                    {(row.children || []).map((child) => (
                      <AdminRow
                        key={child.kode} node={child} isChild={true}
                        onField={(field, value) => updateChildField(row.no, child.kode, field, value)}
                        onOverride={(key, value) => updateChildOverride(row.no, child.kode, key, value)}
                        computed={computePeriodMap(child)}
                      />
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

const thStyle = { padding: "6px 8px", fontWeight: 600 };
const tdStyle = { padding: "5px 8px" };
function inputStyle(width) {
  return { width, border: "1px solid #D7E1EC", borderRadius: 6, padding: "5px 7px", fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#1B2733" };
}
function btnStyle(primary, disabled) {
  return {
    padding: "9px 16px", borderRadius: 9, border: primary ? "none" : "1px solid #D7E1EC",
    background: disabled ? "#EEF1F4" : primary ? "#0B3556" : "#fff",
    color: disabled ? "#B0BAC6" : primary ? "#fff" : "#48566A",
    fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

/* ------------------------------------------------------------
   Gerbang Password Admin
------------------------------------------------------------ */

function AdminGate({ onUnlock, onCancel }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const submit = () => { if (pw === ADMIN_PASSWORD) onUnlock(); else setError(true); };
  return (
    <div style={{ maxWidth: 360, margin: "40px auto", background: "#fff", border: "1px solid #E3EBF3", borderRadius: 14, padding: 28, textAlign: "center", boxShadow: "0 4px 16px rgba(11,53,86,0.08)" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: "#0B3556", marginBottom: 6 }}>Masuk sebagai Admin</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#7C8A9A", marginBottom: 18 }}>Masukkan password untuk mengubah atau mengunggah data.</div>
      <input
        type="password" value={pw}
        onChange={(e) => { setPw(e.target.value); setError(false); }}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="Password"
        style={{ width: "100%", boxSizing: "border-box", padding: "10px 12px", borderRadius: 8, border: error ? "1px solid #C13F3F" : "1px solid #D7E1EC", fontFamily: "'JetBrains Mono', monospace", fontSize: 14, marginBottom: error ? 6 : 16, textAlign: "center" }}
      />
      {error && <div style={{ color: "#C13F3F", fontFamily: "'Inter', sans-serif", fontSize: 12, marginBottom: 12 }}>Password salah, coba lagi.</div>}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button onClick={onCancel} style={btnStyle(false, false)}>Batal</button>
        <button onClick={submit} style={btnStyle(true, false)}>Masuk</button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   App
------------------------------------------------------------ */

export default function App() {
  const [data, setData] = useState(DEFAULT_DATA);
  const [periodType, setPeriodType] = useState("tahun"); // "tahun" | "triwulan" | "bulan"
  const [periodSub, setPeriodSub] = useState("tw1"); // dipakai saat periodType !== "tahun"
  const [mode, setMode] = useState("publik");
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [toast, setToast] = useState(null);

  const periode = periodType === "tahun" ? "tahun" : periodSub;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/iku_get.php`);
      const parsed = await res.json();
      if (!res.ok) throw new Error(parsed.error || "Gagal memuat data");
      if (parsed.data) setData(parsed.data);
      if (parsed.updatedAt) setLastUpdated(parsed.updatedAt);
    } catch (err) {
      setToast({ type: "error", text: "Gagal memuat data dari server. Cek koneksi ke backend PHP/MySQL." });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const saveData = async (newData) => {
    try {
      const res = await fetch(`${API_BASE}/iku_save.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_PASSWORD },
        body: JSON.stringify({ data: newData }),
      });
      const result = await res.json();
      if (res.ok && result.success) {
        setData(newData);
        setLastUpdated(result.updatedAt);
        setToast({ type: "success", text: "Perubahan tersimpan ke database dan langsung terlihat oleh semua pengunjung." });
      } else {
        setToast({ type: "error", text: result.error || "Gagal menyimpan. Coba lagi." });
      }
    } catch (err) {
      setToast({ type: "error", text: "Gagal menyimpan. Cek koneksi ke backend PHP/MySQL." });
    }
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div style={{ background: "#F5F8FB", minHeight: "100%", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');

        .hero-wrap { padding: 28px 24px 22px; }
        .hero-title { font-size: 30px; }
        .period-wrap { padding: 0 24px 10px; }
        .period-sub-wrap { padding: 0 24px 26px; }
        .main-wrap { padding: 8px 24px 60px; }
        .cat-title-bar { font-size: 16px; padding: 12px 20px; }
        .iku-grid { grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px; }
        .indicator-box { padding: 12px 16px; gap: 12px; }
        .indicator-num { width: 34px; height: 34px; font-size: 15px; }
        .indicator-icon { width: 42px; height: 42px; }
        .indicator-text { font-size: 12.5px; }
        .indicator-meta { font-size: 12.5px; gap: 12px; }
        .admin-upload-row { padding: 18px 22px; }
        .mobile-hint { display: none; }
        .modal-box { padding-bottom: 4px; }

        @media (max-width: 640px) {
          .hero-wrap { padding: 18px 16px 14px; }
          .hero-title { font-size: 20px; }
          .period-wrap { padding: 0 16px 8px; }
          .period-sub-wrap { padding: 0 16px 18px; }
          .main-wrap { padding: 8px 12px 40px; }
          .cat-title-bar { font-size: 13px; padding: 10px 14px; }
          .iku-grid { grid-template-columns: 1fr; gap: 8px; }
          .indicator-box { padding: 10px 12px; gap: 9px; }
          .indicator-num { width: 28px; height: 28px; font-size: 13px; }
          .indicator-icon { width: 36px; height: 36px; }
          .indicator-icon svg { width: 18px; height: 18px; }
          .indicator-text { font-size: 12px; }
          .indicator-meta { font-size: 11px; gap: 8px; }
          .admin-upload-row { padding: 14px 16px; }
          .mobile-hint { display: block; }
        }
      `}</style>

      {/* Hero */}
      <div style={{ background: "linear-gradient(160deg, #0B3556 0%, #113E63 60%, #16497A 100%)", paddingBottom: 4 }}>
        <div className="hero-wrap" style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ color: "#8FB4DA", fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase" }}>
              Pusat Pelatihan Kelautan dan Perikanan \u00b7 KKP
            </div>
            <div className="hero-title" style={{ color: "#fff", fontFamily: "'Fraunces', serif", fontWeight: 600, marginTop: 4 }}>
              Dashboard Realisasi IKU {periodType !== "tahun" ? `\u2014 ${periodLabel(periode)}` : "Tahun 2026"}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            {mode === "admin" ? (
              <button onClick={() => setMode("publik")} style={{ ...btnStyle(false, false), background: "#ffffff22", color: "#fff", border: "1px solid #ffffff44" }}>Kembali ke Mode Publik</button>
            ) : (
              <button onClick={() => setMode("gate")} style={{ ...btnStyle(false, false), background: "#ffffff22", color: "#fff", border: "1px solid #ffffff44" }}>Masuk Admin</button>
            )}
          </div>
        </div>

        {mode !== "admin" && (
          <>
            <div className="period-wrap" style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[{ key: "tahun", label: "Tahun 2026" }, { key: "triwulan", label: "Triwulan" }, { key: "bulan", label: "Bulan" }].map((pt) => (
                <button
                  key={pt.key}
                  onClick={() => { setPeriodType(pt.key); if (pt.key === "triwulan") setPeriodSub("tw1"); if (pt.key === "bulan") setPeriodSub("m1"); }}
                  style={{
                    padding: "8px 16px", borderRadius: 999, border: "1px solid " + (pt.key === periodType ? "#fff" : "#ffffff33"),
                    background: pt.key === periodType ? "#fff" : "transparent", color: pt.key === periodType ? "#0B3556" : "#DCE8F4",
                    fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer",
                  }}
                >
                  {pt.label}
                </button>
              ))}
            </div>

            {periodType === "triwulan" && (
              <div className="period-sub-wrap" style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {QUARTER_DEFS.map((q) => (
                  <button
                    key={q.key} onClick={() => setPeriodSub(q.key)}
                    style={{
                      padding: "7px 14px", borderRadius: 999, border: "1px solid " + (q.key === periodSub ? "#fff" : "#ffffff2A"),
                      background: q.key === periodSub ? "#ffffff22" : "transparent", color: "#DCE8F4",
                      fontFamily: "'Inter', sans-serif", fontWeight: q.key === periodSub ? 700 : 500, fontSize: 12.5, cursor: "pointer",
                    }}
                  >
                    {q.label}
                  </button>
                ))}
              </div>
            )}

            {periodType === "bulan" && (
              <div className="period-sub-wrap" style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {MONTHS.map((m) => (
                  <button
                    key={m.key} onClick={() => setPeriodSub(m.key)}
                    style={{
                      padding: "7px 14px", borderRadius: 999, border: "1px solid " + (m.key === periodSub ? "#fff" : "#ffffff2A"),
                      background: m.key === periodSub ? "#ffffff22" : "transparent", color: "#DCE8F4",
                      fontFamily: "'Inter', sans-serif", fontWeight: m.key === periodSub ? 700 : 500, fontSize: 12.5, cursor: "pointer",
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
      <WaveDivider />

      <div className="main-wrap" style={{ maxWidth: 1180, margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#7C8A9A", fontFamily: "'Inter', sans-serif" }}>Memuat data dashboard...</div>
        ) : mode === "gate" ? (
          <AdminGate onUnlock={() => setMode("admin")} onCancel={() => setMode("publik")} />
        ) : mode === "admin" ? (
          <AdminPanel data={data} onSave={saveData} lastUpdated={lastUpdated} />
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <ExportButtons data={data} />
            </div>
            {CATEGORIES.map((cat) => {
              const items = data.filter((r) => r.no >= cat.range[0] && r.no <= cat.range[1]);
              const rows = reorderIntoColumns(items);
              return (
                <div key={cat.id} style={{ marginBottom: 30 }}>
                  <div className="cat-title-bar" style={{ background: "#0B3556", borderRadius: "10px 10px 0 0", fontFamily: "'Fraunces', serif", fontWeight: 600, color: "#fff", textAlign: "center" }}>
                    {cat.title}
                  </div>
                  <div style={{ background: "#EEF4FA", border: "1px solid #DCE9F7", borderTop: "none", borderRadius: "0 0 10px 10px", padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                    {rows.map((row, i) => (
                      <div key={i} className="iku-grid" style={{ display: "grid" }}>
                        {row.map((ind) => <IndicatorBox key={ind.no} ind={ind} periode={periode} />)}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", background: toast.type === "error" ? "#C13F3F" : "#0B3556", color: "#fff", padding: "12px 22px", borderRadius: 10, fontFamily: "'Inter', sans-serif", fontSize: 13.5, boxShadow: "0 6px 20px rgba(0,0,0,0.18)", zIndex: 50 }}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
