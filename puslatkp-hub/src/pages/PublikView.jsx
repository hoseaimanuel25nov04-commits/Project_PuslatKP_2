/**
 * pages/PublikView.jsx
 * Halaman portal publik — read-only agregat tanpa sidebar, tanpa login.
 * Mengakses view `v_publik_rekap` (tidak ada kolom nama/NIK/identitas personal).
 */
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import {
  Waves, LogIn, Globe, BarChart3, Database,
  Building2, Calendar, Loader2, Search, ArrowUpRight
} from 'lucide-react'

export default function PublikView({ onLoginClick }) {
  const [rekapList, setRekapList] = useState([])
  const [jenisDataList, setJenisDataList] = useState([])
  const [selectedJdId, setSelectedJdId] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPublicData()
  }, [])

  async function loadPublicData() {
    setLoading(true)
    try {
      // Ambil jenis data yang publik_boleh_lihat = true
      const { data: jds } = await supabase
        .from('jenis_data')
        .select('id, judul, deskripsi')
        .eq('publik_boleh_lihat', true)
        .eq('aktif', true)
        .order('judul')

      setJenisDataList(jds || [])

      // Ambil view publik agregat
      const { data: rekap } = await supabase
        .from('v_publik_rekap')
        .select('*')
        .order('tahun', { ascending: false })

      setRekapList(rekap || [])
    } catch (err) {
      console.error('Error loading public data:', err)
    }
    setLoading(false)
  }

  const filteredRekap = selectedJdId === 'all'
    ? rekapList
    : rekapList.filter(r => r.jenis_data_id === selectedJdId)

  const totalCapaianNasional = filteredRekap.reduce((acc, r) => acc + (Number(r.total_baris) || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F1A] text-gray-900 dark:text-gray-100 flex flex-col font-sans transition-colors duration-200">
      {/* Simple Top Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#0B1830]/90 backdrop-blur-md border-b border-gray-200 dark:border-white/10 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg shadow-md shadow-blue-500/20">
            <Waves size={20} />
          </div>
          <div>
            <div className="font-bold text-sm text-gray-900 dark:text-white leading-tight">PUSLATKP</div>
            <div className="text-[11px] text-gray-500 dark:text-white/50 leading-tight">Portal Kinerja Publik</div>
          </div>
        </div>

        <button
          onClick={onLoginClick}
          className="btn-primary text-xs"
        >
          <LogIn size={14} />
          <span>Login Petugas</span>
        </button>
      </header>

      {/* Hero Banner */}
      <section
        className="px-6 py-12 text-white relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0B1830 0%, #10233F 60%, #152D50 100%)' }}
      >
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/20 text-xs font-semibold mb-4">
            <Globe size={14} />
            Data Agregat Terbuka
          </div>
          <h1 className="font-bold text-3xl sm:text-4xl font-display mb-3">
            Portal Transparansi Pelatihan & Kinerja Tim
          </h1>
          <p className="text-white/70 text-sm sm:text-base max-w-2xl leading-relaxed">
            Menyajikan capaian dan statistik agregat pelaksanaan pelatihan kelautan dan perikanan di seluruh Unit Pelaksana Teknis (UPT) Indonesia. Seluruh identitas pribadi dilindungi demi privasi.
          </p>

          {/* Quick Stat Pill */}
          <div className="mt-6 inline-flex items-center gap-6 bg-white/10 backdrop-blur-md px-5 py-3 rounded-xl border border-white/15">
            <div>
              <div className="text-[10px] uppercase font-semibold text-white/60">Total Capaian Terdata</div>
              <div className="text-2xl font-bold font-mono text-white tabular-nums">
                {totalCapaianNasional.toLocaleString('id-ID')}
              </div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div>
              <div className="text-[10px] uppercase font-semibold text-white/60">Program Aktif Publik</div>
              <div className="text-2xl font-bold font-mono text-blue-300">
                {jenisDataList.length}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-5xl w-full mx-auto px-6 py-8 flex-1 space-y-6">
        {/* Filters */}
        <div className="card p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Database size={16} className="text-blue-500" />
            <span className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Pilih Kategori Data:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedJdId('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedJdId === 'all'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              Semua Kategori
            </button>
            {jenisDataList.map(jd => (
              <button
                key={jd.id}
                onClick={() => setSelectedJdId(jd.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  selectedJdId === jd.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                }`}
              >
                {jd.judul}
              </button>
            ))}
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={32} className="animate-spin mb-3 text-blue-500" />
            <p className="text-sm">Memuat data rekap publik...</p>
          </div>
        ) : filteredRekap.length === 0 ? (
          <div className="card p-12 text-center text-gray-400 dark:text-gray-500">
            <Globe size={48} className="mx-auto mb-3 opacity-30" />
            <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Belum Ada Data Publik Terpublikasi</h3>
            <p className="text-xs max-w-md mx-auto">
              Saat ini belum ada data terverifikasi yang dibuka untuk akses publik pada kategori yang dipilih.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRekap.map((item, idx) => (
              <div
                key={`${item.jenis_data_id}-${item.period_id}-${idx}`}
                className="card p-5 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                      {item.level || 'Periode'}
                    </span>
                    <span className="text-xs text-gray-400 font-mono">
                      {item.tahun}
                    </span>
                  </div>
                  <h3 className="font-semibold text-base text-gray-900 dark:text-white mb-1">
                    {item.jenis_data_judul}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-1.5">
                    <Calendar size={13} className="text-gray-400" />
                    {item.period_label || `Bulan ke-${item.bulan}`}
                  </p>
                </div>

                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-baseline justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Peserta / Baris</span>
                  <span className="text-2xl font-bold font-mono text-gray-900 dark:text-white tabular-nums">
                    {(Number(item.total_baris) || 0).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-6 text-center text-xs text-gray-400 dark:text-gray-500">
        PUSLATKP — Pusat Pelatihan Kelautan dan Perikanan &copy; {new Date().getFullYear()}
      </footer>
    </div>
  )
}
