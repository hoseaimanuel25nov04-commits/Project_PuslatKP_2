/**
 * pages/InputData/PilihJenisData.jsx
 * Dropdown pemilih 9 Jenis Data dengan penanda visual pasangan
 */
import { useState, useEffect } from 'react'
import { supabase } from '../../supabaseClient'
import PeriodeTabs from './PeriodeTabs'
import { Database, ChevronDown, Loader2, Link2, ExternalLink, Calendar, Users } from 'lucide-react'

export default function PilihJenisData() {
  const [jenisDataList, setJenisDataList] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadJenisData()
  }, [])

  async function loadJenisData() {
    setLoading(true)
    const { data } = await supabase
      .from('jenis_data')
      .select('*')
      .eq('aktif', true)
      .order('created_at')
    setJenisDataList(data || [])
    if (data && data.length > 0 && !selected) {
      setSelected(data[0])
    }
    setLoading(false)
  }

  // Cari jenis data pasangan
  function getPartner(jd) {
    if (!jd) return null
    if (jd.level_utama === 'bulan' && jd.pasangan_mingguan_id) {
      return jenisDataList.find(j => j.id === jd.pasangan_mingguan_id) || null
    }
    if (jd.level_utama === 'minggu') {
      return jenisDataList.find(j => j.pasangan_mingguan_id === jd.id) || null
    }
    return null
  }

  const partnerJd = getPartner(selected)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        <Loader2 size={24} className="animate-spin mr-2" />
        Memuat jenis data...
      </div>
    )
  }

  if (jenisDataList.length === 0) {
    return (
      <div className="text-center py-16">
        <Database size={48} className="mx-auto mb-4 text-gray-300 dark:text-gray-600" />
        <h3 className="font-semibold text-gray-600 dark:text-gray-400 mb-1">Belum ada Jenis Data</h3>
        <p className="text-sm text-gray-400 dark:text-gray-500">
          Admin belum membuat Jenis Data. Hubungi administrator.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Jenis Data Selector */}
      <div
        className="rounded-2xl px-6 py-5 text-white shadow-xl"
        style={{ background: 'linear-gradient(135deg, #0B1830 0%, #10233F 100%)' }}
      >
        <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-300">Data & Pelaporan UPT</p>
          {selected && (
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                selected.level_utama === 'bulan'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
              }`}>
                Level Utama: {selected.level_utama === 'bulan' ? 'BULAN (Rincian)' : 'MINGGU (Rekap)'}
              </span>
            </div>
          )}
        </div>

        <h1 className="font-bold text-2xl font-display mb-4">Input Data</h1>

        <div className="flex items-center gap-3 flex-wrap">
          <label className="text-white/70 text-sm font-medium whitespace-nowrap">Pilih Jenis Data (9 Data):</label>
          <div className="relative flex-1 min-w-[280px] max-w-md">
            <select
              value={selected?.id || ''}
              onChange={e => {
                const jd = jenisDataList.find(j => j.id === e.target.value)
                setSelected(jd || null)
              }}
              className="w-full bg-white/10 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white font-medium appearance-none focus:outline-none focus:ring-2 focus:ring-blue-400 pr-9 backdrop-blur-sm"
            >
              {jenisDataList.map((jd, idx) => (
                <option key={jd.id} value={jd.id} className="text-gray-900 bg-white">
                  {idx + 1}. {jd.judul} ({jd.level_utama === 'bulan' ? 'Bulan - Rincian' : 'Minggu'})
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 pointer-events-none" />
          </div>
        </div>

        {/* Visual Partner Indicator */}
        {partnerJd && (
          <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 text-xs text-blue-200">
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500/30 text-blue-300">
                <Link2 size={12} />
              </span>
              <span>
                Terkait dengan pasangan: <strong className="text-white underline decoration-blue-400 underline-offset-2">{partnerJd.judul}</strong> ({partnerJd.level_utama === 'bulan' ? 'Rincian Bulan' : 'Mingguan'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelected(partnerJd)}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium border border-white/15 transition-colors"
            >
              <span>Buka {partnerJd.judul}</span>
              <ExternalLink size={12} />
            </button>
          </div>
        )}

        {selected?.deskripsi && (
          <p className="text-white/60 text-xs mt-3 max-w-2xl leading-relaxed">{selected.deskripsi}</p>
        )}
      </div>

      {/* Period Tabs for selected Jenis Data */}
      {selected && (
        <PeriodeTabs key={selected.id} jenisData={selected} allJenisData={jenisDataList} />
      )}
    </div>
  )
}
