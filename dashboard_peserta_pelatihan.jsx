import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import * as XLSX from "xlsx";
import {
  Users, Search, X, Download, ChevronLeft, ChevronRight, MapPin, GraduationCap,
  Phone, IdCard, Calendar, Award, UserRound, Filter, Upload as UploadIcon,
} from "lucide-react";

/* ============================================================
   DASHBOARD PESERTA PELATIHAN — data individual (per nama peserta),
   diambil dari rekap Excel ("Data Peserta Pelatihan ... rekap.xlsx",
   sheet "Rekap"). Sistem periode sama seperti Dashboard IKU: Tahun,
   Triwulan, Bulan — ditambah MINGGU (per bulan dipecah jadi
   Minggu 1-5 berdasarkan tanggal mulai pelatihan).
   ============================================================ */

const ADMIN_PASSWORD = "111";

// Alamat folder "api" backend PHP di Laragon-mu. Sesuaikan seperti
// catatan di dashboard_iku_bulanan.jsx.
const API_BASE = "/api";

const MONTHS = [
  { key: "m1", n: 1, label: "Januari" }, { key: "m2", n: 2, label: "Februari" },
  { key: "m3", n: 3, label: "Maret" }, { key: "m4", n: 4, label: "April" },
  { key: "m5", n: 5, label: "Mei" }, { key: "m6", n: 6, label: "Juni" },
  { key: "m7", n: 7, label: "Juli" }, { key: "m8", n: 8, label: "Agustus" },
  { key: "m9", n: 9, label: "September" }, { key: "m10", n: 10, label: "Oktober" },
  { key: "m11", n: 11, label: "November" }, { key: "m12", n: 12, label: "Desember" },
];
const MONTH_NAME_TO_N = {
  JANUARI: 1, FEBRUARI: 2, MARET: 3, APRIL: 4, MEI: 5, JUNI: 6,
  JULI: 7, AGUSTUS: 8, SEPTEMBER: 9, OKTOBER: 10, NOVEMBER: 11, DESEMBER: 12,
};
const QUARTER_DEFS = [
  { key: "tw1", label: "Triwulan I", months: [1, 2, 3] },
  { key: "tw2", label: "Triwulan II", months: [4, 5, 6] },
  { key: "tw3", label: "Triwulan III", months: [7, 8, 9] },
  { key: "tw4", label: "Triwulan IV", months: [10, 11, 12] },
];
const WEEK_DEFS = [
  { key: "w1", label: "Minggu 1", range: [1, 7] },
  { key: "w2", label: "Minggu 2", range: [8, 14] },
  { key: "w3", label: "Minggu 3", range: [15, 21] },
  { key: "w4", label: "Minggu 4", range: [22, 28] },
  { key: "w5", label: "Minggu 5", range: [29, 31] },
];

/* ------------------------------------------------------------
   Parsing tanggal berbahasa Indonesia, mis. "17 JULI 2026" dan
   rentang "17 JULI 2026 - 29 JULI 2026"
------------------------------------------------------------ */

function parseIndoDate(str, fallbackYear) {
  if (!str) return null;
  const s = String(str).trim().toUpperCase();
  const m = s.match(/(\d{1,2})\s+([A-Z]+)\s*(\d{4})?/);
  if (!m) return null;
  const day = Number(m[1]);
  const monthN = MONTH_NAME_TO_N[m[2]];
  const year = m[3] ? Number(m[3]) : fallbackYear;
  if (!monthN || !year || !day) return null;
  return { y: year, m: monthN, d: day };
}

function parseTanggalPelatihan(str) {
  if (!str) return null;
  const parts = String(str).split("-").map((p) => p.trim());
  if (parts.length < 2) {
    const single = parseIndoDate(parts[0]);
    return single ? { mulai: single, selesai: single } : null;
  }
  const selesai = parseIndoDate(parts[1]);
  const mulai = parseIndoDate(parts[0], selesai ? selesai.y : undefined);
  if (!mulai && !selesai) return null;
  return { mulai: mulai || selesai, selesai: selesai || mulai };
}

function weekOfMonthFromDay(day) {
  const w = WEEK_DEFS.find((w) => day >= w.range[0] && day <= w.range[1]);
  return w ? w.key : "w1";
}

function quarterFromMonth(monthN) {
  const q = QUARTER_DEFS.find((q) => q.months.includes(monthN));
  return q ? q.key : "tw1";
}

function formatDateID(ymd) {
  if (!ymd) return "\u2014";
  const names = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  return `${ymd.d} ${names[ymd.m]} ${ymd.y}`;
}

function monthLabel(n) {
  const mm = MONTHS.find((m) => m.n === n);
  return mm ? mm.label : String(n);
}

/* ------------------------------------------------------------
   Normalisasi satu baris hasil parsing Excel jadi record peserta,
   sekaligus menghitung field periode (tahun/triwulan/bulan/minggu)
   dari TANGGAL PELATIHAN supaya cepat difilter.
------------------------------------------------------------ */

function normalizeRecord(row) {
  const rentang = parseTanggalPelatihan(row["TANGGAL PELATIHAN"]);
  const mulai = rentang ? rentang.mulai : null;
  const selesai = rentang ? rentang.selesai : null;
  return {
    no: row["NO"] != null ? String(row["NO"]).replace(/\.0$/, "") : "",
    nama: String(row["NAMA"] || "").trim(),
    nik: String(row["NIK"] || "").trim(),
    telp: String(row["NO TELPON"] || "").trim(),
    tempatLahir: String(row["TEMPAT LAHIR"] || "").trim(),
    tanggalLahir: String(row["TANGGAL LAHIR"] || "").trim(),
    kabKota: String(row["KOTA/KABUPATEN"] || "").trim(),
    provinsi: String(row["PROVINSI"] || "").trim(),
    jk: String(row["JENIS KELAMIN"] || "").trim(),
    alamat: String(row["ALAMAT"] || "").trim(),
    pendidikan: String(row["PENDIDIKAN TERKAHIR"] || row["PENDIDIKAN TERAKHIR"] || "").trim(),
    namaPelatihan: String(row["NAMA PELATIHAN"] || "").trim(),
    sektor: String(row["SEKTOR PELATIHAN"] || "").trim(),
    bidang: String(row["BIDANG/KLASTER PELATIHAN"] || "").trim(),
    program: String(row["PROGRAM PELATIHAN"] || "").trim(),
    dukungan: String(row["DUKUNGAN PROGRAM PRIORITAS"] || "").trim(),
    tglPelatihanRaw: String(row["TANGGAL PELATIHAN"] || "").trim(),
    noSert: String(row["NO SERTIFIKAT"] || "").trim(),
    // Field periode hasil parsing (dipakai untuk filter cepat)
    thn: mulai ? mulai.y : null,
    bln: mulai ? mulai.m : null,
    tw: mulai ? quarterFromMonth(mulai.m) : null,
    mg: mulai ? weekOfMonthFromDay(mulai.d) : null,
    mulaiYMD: mulai,
    selesaiYMD: selesai,
  };
}

function recordKey(r) {
  return `${r.nik}|${r.namaPelatihan}|${r.tglPelatihanRaw}`;
}

function buildFacets(records) {
  const years = [...new Set(records.map((r) => r.thn).filter(Boolean))].sort();
  const programs = [...new Set(records.map((r) => r.program).filter(Boolean))].sort();
  const provinces = [...new Set(records.map((r) => r.provinsi).filter(Boolean))].sort();
  return { years, programs, provinces };
}

/* ------------------------------------------------------------
   Penyimpanan — sekarang lewat backend PHP + MySQL (Laragon), jadi
   tidak perlu lagi dipecah jadi "chunk" seperti sebelumnya. Dedup
   (NIK + Nama Pelatihan + Tanggal Pelatihan) ditangani di sisi
   database lewat UNIQUE KEY, bukan di JS.
------------------------------------------------------------ */

async function loadAllRecords() {
  const res = await fetch(`${API_BASE}/peserta_get.php`);
  const parsed = await res.json();
  if (!res.ok) throw new Error(parsed.error || "Gagal memuat data peserta");
  return { records: parsed.records || [], updatedAt: parsed.updatedAt || null };
}

async function uploadRecords(newRecords) {
  const res = await fetch(`${API_BASE}/peserta_upload.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Admin-Key": ADMIN_PASSWORD },
    body: JSON.stringify({ records: newRecords }),
  });
  const result = await res.json();
  if (!res.ok || !result.success) throw new Error(result.error || "Gagal mengunggah data");
  return result; // { added, updated, total }
}

/* ------------------------------------------------------------
   Modal — popup keterangan di tengah layar (konsisten dengan
   Dashboard IKU)
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
      style={{ position: "fixed", inset: 0, background: "rgba(11,53,86,0.45)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 18 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "82vh", overflowY: "auto", boxShadow: "0 16px 48px rgba(11,53,86,0.28)" }}
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

/* Satu baris info di dalam popup detail peserta */
function InfoRow({ Icon, label, value }) {
  return (
    <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0", borderBottom: "1px solid #EEF4FA" }}>
      <div style={{ flexShrink: 0, width: 26, height: 26, borderRadius: 7, background: "#DCE9F7", display: "flex", alignItems: "center", justifyContent: "center", color: "#1B5FA8", marginTop: 1 }}>
        <Icon size={13} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10.5, color: "#7C8A9A", textTransform: "uppercase", letterSpacing: 0.3 }}>{label}</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1B2733", marginTop: 1, wordBreak: "break-word" }}>{value || "\u2014"}</div>
      </div>
    </div>
  );
}

function ParticipantDetailModal({ p, onClose }) {
  return (
    <Modal title={p.nama} onClose={onClose}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <InfoRow Icon={IdCard} label="NIK" value={p.nik} />
        <InfoRow Icon={Phone} label="No. Telepon" value={p.telp} />
        <InfoRow Icon={Calendar} label="Tempat, Tanggal Lahir" value={[p.tempatLahir, p.tanggalLahir].filter(Boolean).join(", ")} />
        <InfoRow Icon={MapPin} label="Alamat" value={[p.alamat, p.kabKota, p.provinsi].filter(Boolean).join(", ")} />
        <InfoRow Icon={GraduationCap} label="Pendidikan Terakhir" value={p.pendidikan} />
        <InfoRow Icon={Users} label="Jenis Kelamin" value={p.jk} />
        <InfoRow Icon={Award} label="Program Pelatihan" value={p.program} />
        <InfoRow Icon={Award} label="Nama Pelatihan" value={p.namaPelatihan} />
        <InfoRow Icon={Calendar} label="Tanggal Pelatihan" value={p.tglPelatihanRaw} />
        <InfoRow Icon={Award} label="No. Sertifikat" value={p.noSert} />
      </div>
    </Modal>
  );
}

/* ------------------------------------------------------------
   Ringkasan statistik (kartu total + breakdown)
------------------------------------------------------------ */

function StatCard({ label, value, Icon }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E3EBF3", borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 14, flex: 1, minWidth: 160 }}>
      <div style={{ flexShrink: 0, width: 42, height: 42, borderRadius: 10, background: "#DCE9F7", display: "flex", alignItems: "center", justifyContent: "center", color: "#1B5FA8" }}>
        <Icon size={20} />
      </div>
      <div>
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 22, color: "#0B3556" }}>{value}</div>
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11.5, color: "#7C8A9A" }}>{label}</div>
      </div>
    </div>
  );
}

function BreakdownList({ title, items, total, color }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #E3EBF3", borderRadius: 12, padding: "16px 18px", flex: 1, minWidth: 240 }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 14, color: "#0B3556", marginBottom: 10 }}>{title}</div>
      {items.length === 0 && <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#B0BAC6" }}>Belum ada data.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map(([label, count]) => {
          const pct = total > 0 ? Math.round((count / total) * 1000) / 10 : 0;
          return (
            <div key={label}>
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#1B2733", marginBottom: 3 }}>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 8 }}>{label}</span>
                <span style={{ flexShrink: 0, fontWeight: 700 }}>{count} <span style={{ color: "#7C8A9A", fontWeight: 500 }}>({pct}%)</span></span>
              </div>
              <div style={{ background: "#EEF4FA", borderRadius: 999, height: 6, overflow: "hidden" }}>
                <div style={{ width: `${pct}%`, height: "100%", background: color || "#1B5FA8", borderRadius: 999 }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------
   Tabel peserta — pencarian nama/NIK, filter program, paginasi
------------------------------------------------------------ */

const PAGE_SIZE = 20;

function ParticipantTable({ records, programs }) {
  const [query, setQuery] = useState("");
  const [programFilter, setProgramFilter] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((r) => {
      if (programFilter && r.program !== programFilter) return false;
      if (q && !(r.nama.toLowerCase().includes(q) || r.nik.includes(q))) return false;
      return true;
    });
  }, [records, query, programFilter]);

  useEffect(() => { setPage(1); }, [query, programFilter, records]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div style={{ background: "#fff", border: "1px solid #E3EBF3", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: 16, borderBottom: "1px solid #E3EBF3" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#B0BAC6" }} />
          <input
            value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari nama atau NIK..."
            style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px 9px 34px", borderRadius: 9, border: "1px solid #D7E1EC", fontFamily: "'Inter', sans-serif", fontSize: 13 }}
          />
        </div>
        <div style={{ position: "relative", minWidth: 220 }}>
          <Filter size={14} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#B0BAC6" }} />
          <select
            value={programFilter} onChange={(e) => setProgramFilter(e.target.value)}
            style={{ width: "100%", boxSizing: "border-box", padding: "9px 12px 9px 34px", borderRadius: 9, border: "1px solid #D7E1EC", fontFamily: "'Inter', sans-serif", fontSize: 12.5, color: "#1B2733", background: "#fff" }}
          >
            <option value="">Semua Program</option>
            {programs.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "'Inter', sans-serif", fontSize: 12.5 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#7C8A9A", fontSize: 10.5, textTransform: "uppercase", background: "#F5F8FB" }}>
              <th style={pthStyle}>No</th>
              <th style={{ ...pthStyle, minWidth: 200 }}>Nama</th>
              <th style={pthStyle}>Provinsi</th>
              <th style={{ ...pthStyle, minWidth: 200 }}>Program</th>
              <th style={pthStyle}>JK</th>
              <th style={pthStyle}>Pendidikan</th>
              <th style={pthStyle}>Tanggal Pelatihan</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((r, i) => (
              <tr key={r.nik + i} onClick={() => setSelected(r)} style={{ borderTop: "1px solid #EEF4FA", cursor: "pointer" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#F5F8FB")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <td style={ptdStyle}>{r.no}</td>
                <td style={ptdStyle}>{r.nama}</td>
                <td style={ptdStyle}>{r.provinsi}</td>
                <td style={ptdStyle}>{r.program}</td>
                <td style={ptdStyle}>{r.jk}</td>
                <td style={ptdStyle}>{r.pendidikan}</td>
                <td style={ptdStyle}>{r.tglPelatihanRaw}</td>
              </tr>
            ))}
            {pageRows.length === 0 && (
              <tr><td colSpan={7} style={{ ...ptdStyle, textAlign: "center", color: "#B0BAC6", padding: "24px 8px" }}>Tidak ada peserta yang cocok.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#7C8A9A" }}>
        <span>{filtered.length} peserta ditemukan</span>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button disabled={page <= 1} onClick={() => setPage((p) => p - 1)} style={pagerBtnStyle(page <= 1)}><ChevronLeft size={14} /></button>
          <span>Hal {page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)} style={pagerBtnStyle(page >= totalPages)}><ChevronRight size={14} /></button>
        </div>
      </div>

      {selected && <ParticipantDetailModal p={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

const pthStyle = { padding: "9px 10px", fontWeight: 600 };
const ptdStyle = { padding: "8px 10px", color: "#1B2733" };
function pagerBtnStyle(disabled) {
  return { width: 26, height: 26, borderRadius: 7, border: "1px solid #D7E1EC", background: disabled ? "#F5F8FB" : "#fff", color: disabled ? "#B0BAC6" : "#0B3556", display: "flex", alignItems: "center", justifyContent: "center", cursor: disabled ? "not-allowed" : "pointer" };
}

/* ------------------------------------------------------------
   Ekspor Excel — baris = 1 peserta, ditambah kolom "Periode" sesuai
   granularitas yang dipilih (Minggu/Bulan/Triwulan/Tahun).
------------------------------------------------------------ */

function periodLabelForRecord(r, kind) {
  if (!r.thn) return "\u2014";
  if (kind === "tahun") return `Tahun ${r.thn}`;
  if (kind === "triwulan") return `${(QUARTER_DEFS.find((q) => q.key === r.tw) || {}).label || ""} ${r.thn}`;
  if (kind === "bulan") return `${monthLabel(r.bln)} ${r.thn}`;
  if (kind === "minggu") return `${(WEEK_DEFS.find((w) => w.key === r.mg) || {}).label || ""} \u2013 ${monthLabel(r.bln)} ${r.thn}`;
  return "\u2014";
}

function buildParticipantAOA(records, kind) {
  const header = ["No", "Periode", "Nama", "NIK", "No Telepon", "Provinsi", "Kota/Kabupaten", "Jenis Kelamin", "Pendidikan", "Program Pelatihan", "Nama Pelatihan", "Tanggal Pelatihan", "No Sertifikat"];
  const aoa = [header];
  records.forEach((r, i) => {
    aoa.push([
      i + 1, periodLabelForRecord(r, kind), r.nama, r.nik, r.telp, r.provinsi, r.kabKota,
      r.jk, r.pendidikan, r.program, r.namaPelatihan, r.tglPelatihanRaw, r.noSert,
    ]);
  });
  return aoa;
}

function exportParticipantExcel(records, kind, filenameHint) {
  const aoa = buildParticipantAOA(records, kind);
  const ws = XLSX.utils.aoa_to_sheet(aoa);
  ws["!cols"] = [{ wch: 6 }, { wch: 22 }, { wch: 32 }, { wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 20 }, { wch: 12 }, { wch: 10 }, { wch: 34 }, { wch: 40 }, { wch: 24 }, { wch: 26 }];
  const wb = XLSX.utils.book_new();
  const sheetName = kind === "minggu" ? "Mingguan" : kind === "bulan" ? "Bulanan" : kind === "triwulan" ? "Triwulanan" : "Tahunan";
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  const tanggal = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `Peserta_Pelatihan_${filenameHint || sheetName}_${tanggal}.xlsx`);
}

function ExportButtons({ records }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      <button onClick={() => exportParticipantExcel(records, "minggu")} style={exportBtnStyle}><Download size={14} /> Unduh Excel Mingguan</button>
      <button onClick={() => exportParticipantExcel(records, "bulan")} style={exportBtnStyle}><Download size={14} /> Unduh Excel Bulanan</button>
      <button onClick={() => exportParticipantExcel(records, "triwulan")} style={exportBtnStyle}><Download size={14} /> Unduh Excel Triwulanan</button>
      <button onClick={() => exportParticipantExcel(records, "tahun")} style={exportBtnStyle}><Download size={14} /> Unduh Excel Tahunan</button>
    </div>
  );
}

const exportBtnStyle = {
  display: "flex", alignItems: "center", gap: 7, padding: "9px 14px", borderRadius: 9,
  border: "1px solid #D7E1EC", background: "#fff", color: "#0B3556",
  fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12.5, cursor: "pointer",
};

/* ------------------------------------------------------------
   Panel Admin — unggah/refresh data dari file Excel rekap.
   Baris baru digabung ke data lama (dedup berdasarkan NIK + Nama
   Pelatihan + Tanggal Pelatihan), jadi upload ulang file yang sama
   tidak akan menduplikasi data.
------------------------------------------------------------ */

function findHeaderRow(rows) {
  for (let i = 0; i < Math.min(rows.length, 15); i++) {
    const row = rows[i] || [];
    if (row.some((c) => String(c || "").trim().toUpperCase() === "NO") && row.some((c) => String(c || "").trim().toUpperCase() === "NAMA")) {
      return i;
    }
  }
  return -1;
}

function AdminUploadPanel({ records, onSave, updatedAt }) {
  const [uploadMsg, setUploadMsg] = useState(null);
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setUploadMsg({ type: "loading", text: "Membaca file..." });
    try {
      const buf = await file.arrayBuffer();
      const wb = XLSX.read(buf, { type: "array" });
      const sheetName = wb.SheetNames.find((n) => /rekap/i.test(n)) || wb.SheetNames[0];
      const sheet = wb.Sheets[sheetName];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: null, raw: false });
      const headerIdx = findHeaderRow(rows);
      if (headerIdx === -1) {
        setUploadMsg({ type: "error", text: "Tidak ditemukan baris header (kolom 'NO' dan 'NAMA'). Pastikan sheet-nya benar." });
        setBusy(false);
        return;
      }
      const headers = rows[headerIdx].map((h) => String(h || "").trim().toUpperCase());
      const dataRows = rows.slice(headerIdx + 1).filter((r) => r && r[headers.indexOf("NO")] !== null && r[headers.indexOf("NO")] !== "");

      const newRecords = dataRows.map((r) => {
        const obj = {};
        headers.forEach((h, idx) => { if (h) obj[h] = r[idx]; });
        return normalizeRecord(obj);
      });

      // Dedup (NIK + Nama Pelatihan + Tanggal Pelatihan) ditangani oleh
      // UNIQUE KEY di database lewat ON DUPLICATE KEY UPDATE — jadi baris
      // hasil parsing dikirim apa adanya, tidak perlu digabung di JS dulu.
      const result = await onSave(newRecords);
      setUploadMsg({ type: "success", text: `Berhasil membaca ${newRecords.length} baris dari sheet "${sheetName}" (${result.added} peserta baru, ${result.updated} diperbarui). Total data sekarang: ${result.total} peserta.` });
    } catch (err) {
      setUploadMsg({ type: "error", text: "Gagal membaca file. Pastikan formatnya sama seperti template Excel rekap peserta." });
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div className="admin-upload-row" style={{ background: "#0B3556", borderRadius: 14, display: "flex", flexWrap: "wrap", gap: 16, alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ color: "#fff", fontFamily: "'Fraunces', serif", fontSize: 18, fontWeight: 600 }}>Unggah / Perbarui Data Peserta</div>
          <div style={{ color: "#B7CBE0", fontFamily: "'Inter', sans-serif", fontSize: 12.5, marginTop: 2 }}>
            Unggah file Excel rekap (sheet "Rekap"). Data baru digabung otomatis \u2014 tidak menimpa/menghapus data lama.
          </div>
        </div>
        <label style={{ background: "#fff", color: "#0B3556", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 13, padding: "10px 18px", borderRadius: 10, cursor: busy ? "not-allowed" : "pointer", whiteSpace: "nowrap", opacity: busy ? 0.6 : 1 }}>
          <UploadIcon size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
          {busy ? "Memproses..." : "Pilih File Excel"}
          <input ref={fileRef} type="file" accept=".xlsx,.xls" onChange={handleFile} style={{ display: "none" }} disabled={busy} />
        </label>
      </div>

      {uploadMsg && (
        <div style={{ padding: "10px 16px", borderRadius: 10, fontFamily: "'Inter', sans-serif", fontSize: 13, background: uploadMsg.type === "error" ? "#FBEAEA" : uploadMsg.type === "success" ? "#E7F6EF" : "#EEF1F4", color: uploadMsg.type === "error" ? "#C13F3F" : uploadMsg.type === "success" ? "#2F9E6E" : "#48566A" }}>
          {uploadMsg.text}
        </div>
      )}

      <div>
        <div style={{ fontFamily: "'Fraunces', serif", fontSize: 15.5, fontWeight: 600, color: "#0B3556", marginBottom: 10 }}>Unduh Seluruh Data (Excel)</div>
        <ExportButtons records={records} />
      </div>

      {updatedAt && (
        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11.5, color: "#7C8A9A" }}>
          Total {records.length} peserta \u2014 terakhir diperbarui: {updatedAt}
        </div>
      )}
    </div>
  );
}

function AdminGate({ onUnlock, onCancel }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const submit = () => { if (pw === ADMIN_PASSWORD) onUnlock(); else setError(true); };
  return (
    <div style={{ maxWidth: 360, margin: "40px auto", background: "#fff", border: "1px solid #E3EBF3", borderRadius: 14, padding: 28, textAlign: "center", boxShadow: "0 4px 16px rgba(11,53,86,0.08)" }}>
      <div style={{ fontFamily: "'Fraunces', serif", fontSize: 20, fontWeight: 600, color: "#0B3556", marginBottom: 6 }}>Masuk sebagai Admin</div>
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#7C8A9A", marginBottom: 18 }}>Masukkan password untuk mengunggah atau memperbarui data.</div>
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
   App
------------------------------------------------------------ */

export default function App() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [mode, setMode] = useState("publik");
  const [toast, setToast] = useState(null);

  const [selectedYear, setSelectedYear] = useState(null);
  const [periodType, setPeriodType] = useState("tahun"); // tahun | triwulan | bulan | minggu
  const [periodSub, setPeriodSub] = useState(null); // tw1..tw4 | m1..m12
  const [weekSubMonth, setWeekSubMonth] = useState(null); // m1..m12 (untuk mode minggu)
  const [weekSub, setWeekSub] = useState(null); // w1..w5

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { records: recs, updatedAt: ua } = await loadAllRecords();
      setRecords(recs);
      setUpdatedAt(ua);
      const facets = buildFacets(recs);
      if (facets.years.length > 0) setSelectedYear(String(facets.years[facets.years.length - 1]));
    } catch (err) {
      // belum ada data
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const facets = useMemo(() => buildFacets(records), [records]);

  const saveRecords = async (newRecords) => {
    try {
      const result = await uploadRecords(newRecords);
      await load(); // ambil ulang data lengkap dari database (termasuk hasil upsert)
      setToast({ type: "success", text: "Data berhasil disimpan dan langsung terlihat oleh semua pengunjung." });
      setTimeout(() => setToast(null), 3500);
      return result;
    } catch (err) {
      setToast({ type: "error", text: "Gagal menyimpan data. Cek koneksi ke backend PHP/MySQL." });
      setTimeout(() => setToast(null), 3500);
      throw err;
    }
  };

  // Data terfilter tahun aktif
  const yearRecords = useMemo(() => {
    if (!selectedYear) return records;
    return records.filter((r) => String(r.thn) === String(selectedYear));
  }, [records, selectedYear]);

  // Data terfilter sesuai periode yang sedang dipilih (Tahun/Triwulan/Bulan/Minggu)
  const periodRecords = useMemo(() => {
    if (periodType === "tahun") return yearRecords;
    if (periodType === "triwulan") return yearRecords.filter((r) => r.tw === periodSub);
    if (periodType === "bulan") return yearRecords.filter((r) => String(r.bln) === String(periodSub ? Number(periodSub.replace("m", "")) : null));
    if (periodType === "minggu") {
      const monthN = weekSubMonth ? Number(weekSubMonth.replace("m", "")) : null;
      return yearRecords.filter((r) => r.bln === monthN && r.mg === weekSub);
    }
    return yearRecords;
  }, [yearRecords, periodType, periodSub, weekSubMonth, weekSub]);

  const periodTitle = useMemo(() => {
    if (periodType === "tahun") return `Tahun ${selectedYear || ""}`;
    if (periodType === "triwulan") return `${(QUARTER_DEFS.find((q) => q.key === periodSub) || {}).label || "Triwulan"} ${selectedYear || ""}`;
    if (periodType === "bulan") return `${periodSub ? monthLabel(Number(periodSub.replace("m", ""))) : "Bulan"} ${selectedYear || ""}`;
    if (periodType === "minggu") {
      const wLabel = (WEEK_DEFS.find((w) => w.key === weekSub) || {}).label || "Minggu";
      const mLabel = weekSubMonth ? monthLabel(Number(weekSubMonth.replace("m", ""))) : "";
      return `${wLabel} \u2013 ${mLabel} ${selectedYear || ""}`;
    }
    return "";
  }, [periodType, periodSub, weekSubMonth, weekSub, selectedYear]);

  const stats = useMemo(() => {
    const total = periodRecords.length;
    const countBy = (getter) => {
      const map = {};
      periodRecords.forEach((r) => { const k = getter(r) || "Tidak diketahui"; map[k] = (map[k] || 0) + 1; });
      return Object.entries(map).sort((a, b) => b[1] - a[1]);
    };
    return {
      total,
      programs: countBy((r) => r.program),
      gender: countBy((r) => r.jk),
      pendidikan: countBy((r) => r.pendidikan),
      provinsi: countBy((r) => r.provinsi).slice(0, 10),
    };
  }, [periodRecords]);

  return (
    <div style={{ background: "#F5F8FB", minHeight: "100%", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        .hero-wrap { padding: 28px 24px 22px; }
        .hero-title { font-size: 28px; }
        .period-wrap { padding: 0 24px 10px; }
        .period-sub-wrap { padding: 0 24px 22px; }
        .main-wrap { padding: 8px 24px 60px; }
        .stat-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 14px; }
        .breakdown-row { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
        .admin-upload-row { padding: 18px 22px; }
        @media (max-width: 640px) {
          .hero-wrap { padding: 18px 16px 14px; }
          .hero-title { font-size: 19px; }
          .period-wrap { padding: 0 16px 8px; }
          .period-sub-wrap { padding: 0 16px 16px; }
          .main-wrap { padding: 8px 12px 40px; }
          .admin-upload-row { padding: 14px 16px; }
        }
      `}</style>

      <div style={{ background: "linear-gradient(160deg, #0B3556 0%, #113E63 60%, #16497A 100%)", paddingBottom: 4 }}>
        <div className="hero-wrap" style={{ maxWidth: 1180, margin: "0 auto", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ color: "#8FB4DA", fontFamily: "'Inter', sans-serif", fontSize: 12.5, fontWeight: 600, letterSpacing: 0.6, textTransform: "uppercase" }}>
              Pusat Pelatihan Kelautan dan Perikanan \u00b7 KKP
            </div>
            <div className="hero-title" style={{ color: "#fff", fontFamily: "'Fraunces', serif", fontWeight: 600, marginTop: 4 }}>
              Dashboard Peserta Pelatihan {periodTitle && `\u2014 ${periodTitle}`}
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
            {facets.years.length > 1 && (
              <div className="period-wrap" style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {facets.years.map((y) => (
                  <button key={y} onClick={() => setSelectedYear(String(y))}
                    style={{ padding: "7px 14px", borderRadius: 999, border: "1px solid " + (String(y) === selectedYear ? "#fff" : "#ffffff33"), background: String(y) === selectedYear ? "#ffffff22" : "transparent", color: "#DCE8F4", fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}
                  >{y}</button>
                ))}
              </div>
            )}

            <div className="period-wrap" style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
              {[{ key: "tahun", label: "Tahun" }, { key: "triwulan", label: "Triwulan" }, { key: "bulan", label: "Bulan" }, { key: "minggu", label: "Minggu" }].map((pt) => (
                <button
                  key={pt.key}
                  onClick={() => {
                    setPeriodType(pt.key);
                    if (pt.key === "triwulan") setPeriodSub("tw1");
                    if (pt.key === "bulan") setPeriodSub("m1");
                    if (pt.key === "minggu") { setWeekSubMonth("m1"); setWeekSub("w1"); }
                  }}
                  style={{ padding: "8px 16px", borderRadius: 999, border: "1px solid " + (pt.key === periodType ? "#fff" : "#ffffff33"), background: pt.key === periodType ? "#fff" : "transparent", color: pt.key === periodType ? "#0B3556" : "#DCE8F4", fontFamily: "'Inter', sans-serif", fontWeight: 600, fontSize: 13, cursor: "pointer" }}
                >{pt.label}</button>
              ))}
            </div>

            {periodType === "triwulan" && (
              <div className="period-sub-wrap" style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {QUARTER_DEFS.map((q) => (
                  <button key={q.key} onClick={() => setPeriodSub(q.key)}
                    style={{ padding: "7px 14px", borderRadius: 999, border: "1px solid " + (q.key === periodSub ? "#fff" : "#ffffff2A"), background: q.key === periodSub ? "#ffffff22" : "transparent", color: "#DCE8F4", fontFamily: "'Inter', sans-serif", fontWeight: q.key === periodSub ? 700 : 500, fontSize: 12.5, cursor: "pointer" }}
                  >{q.label}</button>
                ))}
              </div>
            )}

            {periodType === "bulan" && (
              <div className="period-sub-wrap" style={{ maxWidth: 1180, margin: "0 auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
                {MONTHS.map((m) => (
                  <button key={m.key} onClick={() => setPeriodSub(m.key)}
                    style={{ padding: "7px 14px", borderRadius: 999, border: "1px solid " + (m.key === periodSub ? "#fff" : "#ffffff2A"), background: m.key === periodSub ? "#ffffff22" : "transparent", color: "#DCE8F4", fontFamily: "'Inter', sans-serif", fontWeight: m.key === periodSub ? 700 : 500, fontSize: 12.5, cursor: "pointer" }}
                  >{m.label}</button>
                ))}
              </div>
            )}

            {periodType === "minggu" && (
              <div className="period-sub-wrap" style={{ maxWidth: 1180, margin: "0 auto", display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {MONTHS.map((m) => (
                    <button key={m.key} onClick={() => setWeekSubMonth(m.key)}
                      style={{ padding: "6px 13px", borderRadius: 999, border: "1px solid " + (m.key === weekSubMonth ? "#fff" : "#ffffff2A"), background: m.key === weekSubMonth ? "#ffffff22" : "transparent", color: "#DCE8F4", fontFamily: "'Inter', sans-serif", fontWeight: m.key === weekSubMonth ? 700 : 500, fontSize: 12 }}
                    >{m.label}</button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {WEEK_DEFS.map((w) => (
                    <button key={w.key} onClick={() => setWeekSub(w.key)}
                      style={{ padding: "6px 13px", borderRadius: 999, border: "1px solid " + (w.key === weekSub ? "#fff" : "#ffffff2A"), background: w.key === weekSub ? "#ffffff22" : "transparent", color: "#DCE8F4", fontFamily: "'Inter', sans-serif", fontWeight: w.key === weekSub ? 700 : 500, fontSize: 12 }}
                    >{w.label} <span style={{ opacity: 0.7 }}>({w.range[0]}\u2013{w.range[1]})</span></button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="main-wrap" style={{ maxWidth: 1180, margin: "0 auto" }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 60, color: "#7C8A9A", fontFamily: "'Inter', sans-serif" }}>Memuat data peserta...</div>
        ) : mode === "gate" ? (
          <AdminGate onUnlock={() => setMode("admin")} onCancel={() => setMode("publik")} />
        ) : mode === "admin" ? (
          <AdminUploadPanel records={records} onSave={saveRecords} updatedAt={updatedAt} />
        ) : records.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#7C8A9A", fontFamily: "'Inter', sans-serif" }}>
            Belum ada data peserta. Masuk sebagai Admin untuk mengunggah file Excel rekap.
          </div>
        ) : (
          <>
            <div className="stat-row">
              <StatCard label="Total Peserta" value={stats.total} Icon={Users} />
              <StatCard label="Perempuan" value={(stats.gender.find((g) => g[0].toLowerCase().startsWith("p")) || [null, 0])[1]} Icon={UserRound} />
              <StatCard label="Laki-laki" value={(stats.gender.find((g) => g[0].toLowerCase().startsWith("l")) || [null, 0])[1]} Icon={UserRound} />
              <StatCard label="Program Pelatihan" value={stats.programs.length} Icon={Award} />
            </div>

            <div className="breakdown-row">
              <BreakdownList title="Program Pelatihan" items={stats.programs} total={stats.total} color="#1B5FA8" />
              <BreakdownList title="Pendidikan Terakhir" items={stats.pendidikan} total={stats.total} color="#DD8A3D" />
              <BreakdownList title="Provinsi Asal (Top 10)" items={stats.provinsi} total={stats.total} color="#2F9E6E" />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
              <ExportButtons records={periodRecords} />
            </div>

            <ParticipantTable records={periodRecords} programs={facets.programs} />
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
