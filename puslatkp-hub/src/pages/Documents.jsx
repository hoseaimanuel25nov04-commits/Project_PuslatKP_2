/**
 * pages/Documents.jsx
 * Repositori pedoman, template Excel, SOP pelaporan, dan arsip dokumen
 */
import { useState } from 'react'
import InfoCard from '../components/InfoCard'
import {
  FileText, Download, FileSpreadsheet,
  BookOpen, ShieldCheck, ExternalLink, Search
} from 'lucide-react'

const REPO_DOCS = [
  {
    title: 'Template Standar Impor Excel Peserta Pelatihan',
    desc: 'Format resmi berkas excel untuk diunggah pada tab level Bulan di modul Input Data.',
    category: 'Template',
    format: 'XLSX',
    size: '24 KB',
  },
  {
    title: 'Petunjuk Teknis Pelaporan Kinerja & Aktivitas Harian UPT',
    desc: 'Buku panduan pengisian daily activity, batas waktu pelaporan, dan rekonsiliasi data mingguan.',
    category: 'Pedoman',
    format: 'PDF',
    size: '1.2 MB',
  },
  {
    title: 'Kepmen KKP tentang Standar Pelatihan Kelautan dan Perikanan',
    desc: 'Dasar regulasi dan acuan standar kompetensi pelatihan aparatur dan masyarakat kelautan perikanan.',
    category: 'Regulasi',
    format: 'PDF',
    size: '3.4 MB',
  },
  {
    title: 'Standar Operasional Prosedur (SOP) Validasi Selisih Data',
    desc: 'Protokol penyesuaian saat terdeteksi selisih angka antara level Bulanan dan Mingguan.',
    category: 'SOP',
    format: 'PDF',
    size: '640 KB',
  },
]

export default function Documents() {
  const [search, setSearch] = useState('')

  const filtered = REPO_DOCS.filter(d =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    d.desc.toLowerCase().includes(search.toLowerCase()) ||
    d.category.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div
        className="rounded-2xl px-6 py-5 text-white"
        style={{ background: 'linear-gradient(135deg, #0B1830 0%, #10233F 100%)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-1">Repositories</p>
        <h1 className="font-bold text-3xl font-display">Documents & Guidelines</h1>
        <p className="text-white/60 text-xs mt-1">
          Pusat unduhan berkas panduan teknis, pedoman pelaporan, SOP, dan template Excel untuk seluruh UPT.
        </p>
      </div>

      {/* Document Grid */}
      <InfoCard
        title="Daftar Dokumen Resmi"
        action={
          <div className="relative w-64">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama dokumen / SOP..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="form-input pl-8 text-xs py-1.5"
            />
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {filtered.map((doc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-gray-200 dark:border-gray-700/80 bg-white dark:bg-gray-900/40 hover:border-blue-300 dark:hover:border-blue-600 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                    {doc.category}
                  </span>
                  <span className="text-xs font-mono text-gray-400 font-semibold">
                    {doc.format} • {doc.size}
                  </span>
                </div>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1.5">
                  {doc.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">
                  {doc.desc}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex justify-end">
                <button
                  onClick={() => alert(`Mengunduh dokumen: ${doc.title}`)}
                  className="btn-secondary text-xs py-1.5 px-3"
                >
                  <Download size={13} />
                  Unduh Berkas
                </button>
              </div>
            </div>
          ))}
        </div>
      </InfoCard>
    </div>
  )
}
