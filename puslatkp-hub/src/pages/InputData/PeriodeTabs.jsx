/**
 * pages/InputData/PeriodeTabs.jsx
 * Menangani form dinamis berdasarkan level_utama Jenis Data:
 * - level_utama === 'bulan': Hanya tab Bulan (rincian per-orang) + Banner 4 Minggu Pasangan + Validasi non-blocking
 * - level_utama === 'minggu': Tab Minggu (input form) + Tab Triwulan & Tahun (Auto-agregasi SUM otomatis)
 */
import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../AuthContext'
import PeriodSelector from '../../components/PeriodSelector'
import DynamicForm from '../../components/DynamicForm'
import Modal from '../../components/Modal'
import ColumnMappingScreen from '../../components/ColumnMappingScreen'
import { isPeriodLocked } from '../../lib/deadline'
import { matchColumns, convertRows } from '../../lib/columnMatcher'
import { readExcelFile, exportDataEntries, exportRekapNilai } from '../../lib/excelExport'
import {
  Upload, Plus, Download, CheckCircle2, AlertTriangle, AlertCircle,
  Trash2, Eye, Edit, Search, X, FileSpreadsheet, Loader2,
  TrendingUp, Calendar, Calculator, Check, ArrowRight, Layers
} from 'lucide-react'

export default function PeriodeTabs({ jenisData, allJenisData = [] }) {
  const { isAdmin, uptKey } = useAuth()
  const isMonthOnly = jenisData.level_utama === 'bulan'
  const allowedLevels = isMonthOnly ? ['bulan'] : ['minggu', 'triwulan', 'tahun']

  const [activeLevel, setActiveLevel] = useState(isMonthOnly ? 'bulan' : 'minggu')
  const [periods, setPeriods] = useState([])
  const [activePeriod, setActivePeriod] = useState(null)
  const [fieldDefs, setFieldDefs] = useState([])
  const [partnerFieldDefs, setPartnerFieldDefs] = useState([])

  // Data states
  const [rekapValues, setRekapValues] = useState({})
  const [entries, setEntries] = useState([])
  const [validation, setValidation] = useState(null)
  const [aggregatedData, setAggregatedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  // Modal states
  const [addEntryModal, setAddEntryModal] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [viewEntry, setViewEntry] = useState(null)
  const [uploadModal, setUploadModal] = useState(false)
  const [mappingData, setMappingData] = useState(null)
  const [formValues, setFormValues] = useState({})
  const [searchEntries, setSearchEntries] = useState('')
  const fileRef = useRef()

  const currentUptKey = uptKey || ''
  const locked = activePeriod ? (isAdmin ? false : isPeriodLocked(activePeriod.deadline)) : false

  // Cari pasangan Jenis Data jika ada
  const partnerJd = isMonthOnly && jenisData.pasangan_mingguan_id
    ? allJenisData.find(j => j.id === jenisData.pasangan_mingguan_id)
    : null

  useEffect(() => {
    loadPeriods()
  }, [jenisData.id])

  useEffect(() => {
    loadFieldDefs()
  }, [jenisData.id, activeLevel])

  useEffect(() => {
    if (activePeriod && jenisData) {
      loadData()
    }
  }, [activePeriod?.id, jenisData.id, activeLevel, currentUptKey])

  async function loadPeriods() {
    const { data } = await supabase
      .from('periods')
      .select('*')
      .order('tahun')
      .order('bulan')
      .order('minggu_ke')
      .order('triwulan_ke')

    const allP = data || []
    setPeriods(allP)

    const levelToSet = isMonthOnly ? 'bulan' : 'minggu'
    setActiveLevel(levelToSet)

    const filtered = allP.filter(p => p.level === levelToSet)
    const now = new Date()
    const closest = filtered.find(p => {
      const start = new Date(p.tanggal_mulai)
      const end = new Date(p.tanggal_selesai)
      return now >= start && now <= end
    }) || filtered[filtered.length - 1]

    setActivePeriod(closest || null)
  }

  async function loadFieldDefs() {
    // Muat field definitions untuk jenis data saat ini
    const queryLevel = isMonthOnly ? 'bulan' : 'minggu'
    const { data } = await supabase
      .from('field_definitions')
      .select('*')
      .eq('jenis_data_id', jenisData.id)
      .eq('level', queryLevel)
      .eq('aktif', true)
      .order('urutan')
    setFieldDefs(data || [])

    // Jika memiliki pasangan mingguan, muat juga field pasangan untuk kalkulasi
    if (isMonthOnly && jenisData.pasangan_mingguan_id) {
      const { data: pDefs } = await supabase
        .from('field_definitions')
        .select('*')
        .eq('jenis_data_id', jenisData.pasangan_mingguan_id)
        .eq('level', 'minggu')
        .eq('aktif', true)
        .order('urutan')
      setPartnerFieldDefs(pDefs || [])
    }
  }

  async function loadData() {
    if (!activePeriod) return
    setLoading(true)

    if (activeLevel === 'bulan') {
      // 1. Ambil data baris rincian (data_entries)
      let q = supabase.from('data_entries')
        .select('*')
        .eq('jenis_data_id', jenisData.id)
        .eq('period_id', activePeriod.id)
        .order('created_at')
      if (!isAdmin) q = q.eq('upt_key', currentUptKey)
      const { data: entData } = await q
      const currentEntries = entData || []
      setEntries(currentEntries)

      // 2. Evaluasi validasi & kelengkapan 4 minggu pasangan
      await checkPartnerWeeklyProgress(currentEntries)
    } else if (activeLevel === 'minggu') {
      // Ambil nilai rekap mingguan
      let q = supabase.from('rekap_nilai')
        .select('*')
        .eq('jenis_data_id', jenisData.id)
        .eq('period_id', activePeriod.id)
      if (!isAdmin) q = q.eq('upt_key', currentUptKey)
      const { data } = await q
      const vals = {}
      ;(data || []).forEach(r => {
        vals[r.field_key] = r.value !== null && r.value !== undefined ? r.value : r.value_text
      })
      setRekapValues(vals)
    } else if (activeLevel === 'triwulan' || activeLevel === 'tahun') {
      // Hitung agregasi otomatis (SUM) dari minggu-minggu terkait
      await calculateAggregation()
    }

    setLoading(false)
  }

  // Hitung status 4 minggu pasangan mingguan & bandingkan dengan rincian bulan
  async function checkPartnerWeeklyProgress(currentEntries) {
    if (!jenisData.pasangan_mingguan_id) {
      setValidation(null)
      return
    }

    const partnerId = jenisData.pasangan_mingguan_id
    // Ambil 4 periode minggu dalam bulan aktif
    const weekPeriods = periods.filter(p =>
      p.level === 'minggu' &&
      p.tahun === activePeriod.tahun &&
      p.bulan === activePeriod.bulan
    )

    if (!weekPeriods.length) {
      setValidation(null)
      return
    }

    const weekIds = weekPeriods.map(p => p.id)
    const { data: partnerRekap } = await supabase
      .from('rekap_nilai')
      .select('*')
      .eq('jenis_data_id', partnerId)
      .eq('upt_key', currentUptKey)
      .in('period_id', weekIds)

    const rekapList = partnerRekap || []

    // Field angka utama di pasangan (mis. jumlah_peserta, jumlah_instruktur_wi)
    const targetField = partnerFieldDefs.find(f => f.tipe === 'angka') || {
      field_key: 'jumlah_peserta',
      label: 'Jumlah Peserta'
    }

    // Hitung minggu mana saja yang sudah ada entri
    const filledWeekIds = new Set()
    let totalMingguan = 0

    weekPeriods.forEach(wp => {
      const match = rekapList.find(r => r.period_id === wp.id && r.field_key === targetField.field_key)
      if (match && match.value !== null && match.value !== undefined) {
        filledWeekIds.add(wp.id)
        totalMingguan += Number(match.value) || 0
      }
    })

    const filledWeeksCount = filledWeekIds.size
    const entriCount = currentEntries.length

    setValidation({
      partnerJudul: partnerJd?.judul || 'Pasangan Mingguan',
      targetFieldLabel: targetField.label,
      filledWeeksCount,
      totalWeeks: weekPeriods.length,
      totalMingguan,
      entriCount,
      selisih: entriCount - totalMingguan,
      isMatch: entriCount === totalMingguan && filledWeeksCount >= weekPeriods.length,
    })
  }

  // Auto-agregasi dari level minggu ke triwulan / tahun
  async function calculateAggregation() {
    let weekPeriods = []
    if (activeLevel === 'triwulan') {
      const q = activePeriod.triwulan_ke
      const startM = (q - 1) * 3 + 1
      const endM = q * 3
      weekPeriods = periods.filter(p =>
        p.level === 'minggu' &&
        p.tahun === activePeriod.tahun &&
        p.bulan >= startM && p.bulan <= endM
      )
    } else if (activeLevel === 'tahun') {
      weekPeriods = periods.filter(p =>
        p.level === 'minggu' &&
        p.tahun === activePeriod.tahun
      )
    }

    if (!weekPeriods.length) {
      setAggregatedData({ totals: {}, weekRows: [] })
      return
    }

    const weekIds = weekPeriods.map(p => p.id)
    const { data } = await supabase
      .from('rekap_nilai')
      .select('*')
      .eq('jenis_data_id', jenisData.id)
      .eq('upt_key', currentUptKey)
      .in('period_id', weekIds)

    const rekapRows = data || []
    const totals = {}

    // Hitung SUM untuk setiap field definisi bertipe angka
    fieldDefs.filter(f => f.tipe === 'angka').forEach(f => {
      const sum = rekapRows
        .filter(r => r.field_key === f.field_key)
        .reduce((acc, r) => acc + (Number(r.value) || 0), 0)
      totals[f.field_key] = sum
    })

    // Susun breakdown per minggu
    const weekRows = weekPeriods.map(wp => {
      const rowVals = {}
      rekapRows.filter(r => r.period_id === wp.id).forEach(r => {
        rowVals[r.field_key] = r.value !== null ? r.value : r.value_text
      })
      return {
        period: wp,
        values: rowVals,
        hasData: Object.keys(rowVals).length > 0,
      }
    })

    setAggregatedData({ totals, weekRows, totalWeeks: weekPeriods.length })
  }

  async function saveRekap(values) {
    setSaving(true)
    const upt = currentUptKey

    for (const [fieldKey, val] of Object.entries(values)) {
      if (val === '' || val === null || val === undefined) continue

      const fieldDef = fieldDefs.find(f => f.field_key === fieldKey)
      const isNum = fieldDef?.tipe === 'angka'
      const numValue = isNum ? Number(val) : null
      const textValue = String(val)

      await supabase.from('rekap_nilai').upsert({
        jenis_data_id: jenisData.id,
        upt_key: upt,
        period_id: activePeriod.id,
        field_key: fieldKey,
        value: numValue,
        value_text: textValue,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'jenis_data_id,upt_key,period_id,field_key' })
    }

    setSaving(false)
    loadData()
  }

  async function saveEntry(values) {
    setSaving(true)
    const payload = {
      jenis_data_id: jenisData.id,
      upt_key: currentUptKey,
      period_id: activePeriod.id,
      nama: values.nama || values.nama_pelatihan || null,
      nik: values.nik ? String(values.nik) : null,
      data_json: values,
    }

    if (editEntry) {
      await supabase.from('data_entries').update(payload).eq('id', editEntry.id)
    } else {
      await supabase.from('data_entries').insert(payload)
    }

    setSaving(false)
    setAddEntryModal(false)
    setEditEntry(null)
    setFormValues({})
    loadData()
  }

  async function deleteEntry(id) {
    if (!confirm('Hapus baris data ini?')) return
    await supabase.from('data_entries').delete().eq('id', id)
    loadData()
  }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const { headers, rows } = await readExcelFile(file)
      const initialMapping = matchColumns(headers, fieldDefs)
      setMappingData({ headers, rows, initialMapping })
      setUploadModal(true)
    } catch (err) {
      alert('Gagal membaca file: ' + err.message)
    }
    e.target.value = ''
  }

  async function handleImportConfirm(mapping) {
    if (!mappingData) return
    setSaving(true)
    const { entries: converted, extraKeys } = convertRows(mappingData.rows, mapping, fieldDefs)

    for (const entry of converted) {
      const payload = {
        jenis_data_id: jenisData.id,
        upt_key: currentUptKey,
        period_id: activePeriod.id,
        nama: entry.nama,
        nik: entry.nik || null,
        data_json: entry.data_json,
        data_ekstra: entry.data_ekstra,
      }
      await supabase.from('data_entries').upsert(payload, {
        onConflict: 'jenis_data_id,upt_key,period_id,nik',
        ignoreDuplicates: false
      })
    }

    if (extraKeys.length > 0) {
      await supabase.from('audit_log').insert({
        actor_upt_key: currentUptKey,
        action: 'import_kolom_tidak_dikenal',
        detail: { jenis_data_id: jenisData.id, kolom: extraKeys }
      })
    }

    setSaving(false)
    setUploadModal(false)
    setMappingData(null)
    loadData()
  }

  function handleLevelChange(level) {
    setActiveLevel(level)
    const levelPeriods = periods.filter(p => p.level === level)
    const now = new Date()
    const closest = levelPeriods.find(p => {
      const start = new Date(p.tanggal_mulai)
      const end = new Date(p.tanggal_selesai)
      return now >= start && now <= end
    }) || levelPeriods[levelPeriods.length - 1]
    setActivePeriod(closest || null)
  }

  const filteredEntries = entries.filter(e => {
    if (!searchEntries) return true
    const q = searchEntries.toLowerCase()
    return (
      e.nama?.toLowerCase().includes(q) ||
      e.nik?.includes(q) ||
      JSON.stringify(e.data_json).toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-4">
      {/* Period Selector */}
      <div className="card p-4 shadow-sm border border-gray-100 dark:border-gray-800">
        <PeriodSelector
          level={activeLevel}
          onLevelChange={handleLevelChange}
          period={activePeriod}
          onPeriodChange={setActivePeriod}
          availablePeriods={periods}
          allowedLevels={allowedLevels}
        />
      </div>

      {/* Locked Banner */}
      {locked && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Periode Terkunci — Lewat Deadline</p>
            <p className="text-xs text-amber-600 dark:text-amber-400">Form ini hanya bisa dilihat. Hubungi Admin untuk perpanjangan tenggat.</p>
          </div>
        </div>
      )}

      {/* BANNER 4 MINGGU & VALIDASI PASANGAN (Sesuai Koreksi Bagian C) */}
      {isMonthOnly && validation && (
        <div className="space-y-2">
          {/* Banner Kelengkapan 4 Minggu */}
          {validation.filledWeeksCount >= validation.totalWeeks ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 rounded-xl p-3.5 flex items-center gap-3 text-emerald-800 dark:text-emerald-200">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                <CheckCircle2 size={20} />
              </span>
              <div className="flex-1 text-sm">
                <p className="font-semibold">
                  4 minggu sudah lengkap, total {validation.totalMingguan} {validation.targetFieldLabel.toLowerCase()}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  Lengkapi rincian nama ({validation.entriCount} terisi saat ini) untuk mencocokkan dengan data mingguan <strong>{validation.partnerJudul}</strong>.
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-xl p-3.5 flex items-center gap-3 text-amber-800 dark:text-amber-200">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 flex-shrink-0">
                <AlertTriangle size={20} />
              </span>
              <div className="flex-1 text-sm">
                <p className="font-semibold">
                  Baru {validation.filledWeeksCount} dari {validation.totalWeeks} minggu terisi, total sementara {validation.totalMingguan} {validation.targetFieldLabel.toLowerCase()}
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  Data mingguan pasangan <strong>{validation.partnerJudul}</strong> belum lengkap di bulan ini. Anda tetap dapat mencicil input rincian nama kapan saja.
                </p>
              </div>
            </div>
          )}

          {/* Badge Validasi Kesesuaian (Non-Blocking) */}
          <div className={`flex items-center justify-between px-4 py-2.5 rounded-lg text-xs font-medium border ${
            validation.entriCount === validation.totalMingguan
              ? 'bg-emerald-100/60 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              {validation.entriCount === validation.totalMingguan ? (
                <>
                  <CheckCircle2 size={15} className="text-emerald-600 dark:text-emerald-400" />
                  <span>
                    <strong>Cocok:</strong> Total rincian bulan ({validation.entriCount} baris) sama persis dengan total mingguan ({validation.totalMingguan}).
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle size={15} className="text-rose-600 dark:text-rose-400" />
                  <span>
                    <strong>Ada Selisih ({Math.abs(validation.selisih)} baris):</strong> Rincian Bulan = {validation.entriCount} baris, Total Mingguan = {validation.totalMingguan}.
                    <span className="text-gray-500 dark:text-gray-400 ml-1">(Peringatan validasi, tidak menghalangi simpan)</span>
                  </span>
                </>
              )}
            </div>
            <span className="font-bold text-xs uppercase px-2 py-0.5 rounded bg-white/70 dark:bg-gray-800/70">
              {validation.entriCount === validation.totalMingguan ? 'Valid' : 'Perlu Dicocokkan'}
            </span>
          </div>
        </div>
      )}

      {/* KONTEN BERDASARKAN LEVEL */}
      {activePeriod ? (
        activeLevel === 'bulan' ? (
          /* ======================================================== */
          /* ===== LEVEL BULAN — DATA DETAIL PER BARIS RINCIAN ====== */
          /* ======================================================== */
          <div className="card shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-wrap gap-3">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{jenisData.judul}</span>
                  <span className="badge-neutral text-[10px] uppercase">Rincian Per-Orang</span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {entries.length} baris data terdaftar pada {activePeriod.label}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {!locked && (
                  <>
                    <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} />
                    <button onClick={() => fileRef.current?.click()} className="btn-secondary text-xs">
                      <Upload size={14} />
                      Upload Excel
                    </button>
                    <button
                      onClick={() => { setEditEntry(null); setFormValues({}); setAddEntryModal(true) }}
                      className="btn-primary text-xs"
                    >
                      <Plus size={14} />
                      Tambah Baris
                    </button>
                  </>
                )}
                <button
                  onClick={() => exportDataEntries({
                    entries,
                    fieldDefs,
                    jenisDataJudul: jenisData.judul,
                    periodLabel: activePeriod.label,
                    uptKey: currentUptKey
                  })}
                  className="btn-secondary text-xs"
                >
                  <Download size={14} />
                  Download Excel
                </button>
              </div>
            </div>

            {/* Search */}
            {entries.length > 0 && (
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/30">
                <div className="relative max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama, NIK, pelatihan..."
                    value={searchEntries}
                    onChange={e => setSearchEntries(e.target.value)}
                    className="form-input pl-8 text-xs py-1.5"
                  />
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 size={24} className="animate-spin text-gray-400" />
              </div>
            ) : filteredEntries.length === 0 ? (
              <div className="text-center py-14 text-gray-400 dark:text-gray-500">
                <FileSpreadsheet size={40} className="mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {locked ? 'Tidak ada data pada periode ini.' : 'Belum ada rincian data per-orang.'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {!locked && 'Klik tombol "Tambah Baris" atau "Upload Excel" untuk melengkapi data.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-x-auto">
                {filteredEntries.map((entry, idx) => (
                  <div key={entry.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <span className="text-xs text-gray-400 w-7 flex-shrink-0 font-mono text-right">{idx + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                        {entry.nama || entry.data_json?.nama || `Baris #${idx + 1}`}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5 flex-wrap">
                        {entry.nik && <span>NIK: <span className="font-mono">{entry.nik}</span></span>}
                        {entry.data_json?.jenis_kelamin && <span>JK: {entry.data_json.jenis_kelamin}</span>}
                        {entry.data_json?.nama_pelatihan && <span className="text-blue-600 dark:text-blue-400 truncate">Pelatihan: {entry.data_json.nama_pelatihan}</span>}
                        {entry.data_json?.asal_instansi && <span>Instansi: {entry.data_json.asal_instansi}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewEntry(entry)}
                        className="p-1.5 rounded text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                        title="Lihat Rincian"
                      >
                        <Eye size={15} />
                      </button>
                      {!locked && (
                        <>
                          <button
                            onClick={() => { setEditEntry(entry); setFormValues(entry.data_json || {}); setAddEntryModal(true) }}
                            className="p-1.5 rounded text-gray-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/30 transition-colors"
                            title="Edit Baris"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => deleteEntry(entry.id)}
                            className="p-1.5 rounded text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                            title="Hapus Baris"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : activeLevel === 'minggu' ? (
          /* ======================================================== */
          /* ===== LEVEL MINGGU — FORM INPUT MINGGUAN ================ */
          /* ======================================================== */
          <div className="card p-6 shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                  <span>{jenisData.judul}</span>
                  <span className="badge-neutral text-xs">Form Mingguan</span>
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{activePeriod.label}</p>
              </div>
              <button
                onClick={() => exportRekapNilai({
                  rekapData: [{ upt_key: currentUptKey, values: rekapValues }],
                  fieldDefs,
                  jenisDataJudul: jenisData.judul,
                  periodLabel: activePeriod.label
                })}
                className="btn-secondary text-xs"
              >
                <Download size={14} />
                Download Excel Mingguan
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
            ) : fieldDefs.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">Belum ada kolom konfigurasi untuk jenis data mingguan ini.</p>
            ) : (
              <DynamicForm
                level="minggu"
                fields={fieldDefs}
                values={rekapValues}
                onChange={(key, val) => setRekapValues(v => ({ ...v, [key]: val }))}
                disabled={locked}
                onSubmit={(e) => { e.preventDefault(); saveRekap(rekapValues) }}
                loading={saving}
              />
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* ===== LEVEL TRIWULAN & TAHUN — AUTO AGREGASI (SUM) ===== */
          /* ======================================================== */
          <div className="card p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
                    <Calculator size={16} />
                  </span>
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                    Auto-Agregasi {activeLevel === 'triwulan' ? 'Triwulan' : 'Tahunan'}
                  </h3>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Otomatis terakumulasi (SUM) dari data mingguan <strong>{jenisData.judul}</strong> untuk {activePeriod.label}.
                </p>
              </div>
              <button
                onClick={() => exportRekapNilai({
                  rekapData: [{ upt_key: currentUptKey, values: aggregatedData?.totals || {} }],
                  fieldDefs: fieldDefs.filter(f => f.tipe === 'angka'),
                  jenisDataJudul: `${jenisData.judul}_${activePeriod.label}`,
                  periodLabel: activePeriod.label
                })}
                className="btn-secondary text-xs"
              >
                <Download size={14} />
                Download Excel Agregasi
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-gray-400" /></div>
            ) : (
              <>
                {/* Summary Cards */}
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Total Akumulasi Periode</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {fieldDefs.filter(f => f.tipe === 'angka').map(field => {
                      const totalVal = aggregatedData?.totals?.[field.field_key] ?? 0
                      const isRupiah = field.field_key.includes('anggaran') || field.field_key.includes('belanja') || field.field_key.includes('rm') || field.field_key.includes('pnbp') || field.field_key.includes('sbsn')
                      return (
                        <div key={field.field_key} className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium truncate">{field.label}</p>
                          <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">
                            {isRupiah
                              ? `Rp ${Number(totalVal).toLocaleString('id-ID')}`
                              : Number(totalVal).toLocaleString('id-ID')
                            }
                          </p>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Weekly breakdown table */}
                {aggregatedData?.weekRows && aggregatedData.weekRows.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                      Rincian Sumber Data Mingguan ({aggregatedData.weekRows.filter(w => w.hasData).length} dari {aggregatedData.weekRows.length} minggu terisi)
                    </h4>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300">
                          <tr>
                            <th className="py-2.5 px-3 font-semibold">Periode Minggu</th>
                            {fieldDefs.filter(f => f.tipe === 'angka').slice(0, 4).map(f => (
                              <th key={f.field_key} className="py-2.5 px-3 font-semibold text-right">{f.label}</th>
                            ))}
                            <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {aggregatedData.weekRows.map(w => (
                            <tr key={w.period.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30">
                              <td className="py-2.5 px-3 font-medium text-gray-900 dark:text-gray-100">{w.period.label}</td>
                              {fieldDefs.filter(f => f.tipe === 'angka').slice(0, 4).map(f => {
                                const val = w.values[f.field_key]
                                const isRupiah = f.field_key.includes('anggaran') || f.field_key.includes('belanja')
                                return (
                                  <td key={f.field_key} className="py-2.5 px-3 text-right font-mono">
                                    {val !== undefined && val !== null
                                      ? (isRupiah ? `Rp ${Number(val).toLocaleString('id-ID')}` : Number(val).toLocaleString('id-ID'))
                                      : '-'
                                    }
                                  </td>
                                )
                              })}
                              <td className="py-2.5 px-3 text-center">
                                {w.hasData ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 font-medium">
                                    <Check size={10} /> Terisi
                                  </span>
                                ) : (
                                  <span className="text-[11px] text-gray-400">Kosong</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )
      ) : (
        <div className="card p-8 text-center text-gray-400 dark:text-gray-500">
          <p>Tidak ada periode tersedia untuk level ini.</p>
        </div>
      )}

      {/* Add/Edit Entry Modal */}
      <Modal
        open={addEntryModal}
        onClose={() => { setAddEntryModal(false); setEditEntry(null); setFormValues({}) }}
        title={editEntry ? 'Edit Baris Data' : 'Tambah Baris Rincian Data'}
        maxWidth="max-w-3xl"
      >
        <DynamicForm
          level="bulan"
          fields={fieldDefs}
          values={formValues}
          onChange={(key, val) => setFormValues(v => ({ ...v, [key]: val }))}
          disabled={false}
          onSubmit={(e) => { e.preventDefault(); saveEntry(formValues) }}
          loading={saving}
        />
      </Modal>

      {/* View Entry Modal */}
      <Modal
        open={!!viewEntry}
        onClose={() => setViewEntry(null)}
        title="Detail Rincian Data"
        maxWidth="max-w-2xl"
      >
        {viewEntry && (
          <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {fieldDefs.map(fd => {
                const isFull = fd.field_key === 'alamat' || fd.field_key.includes('link') || fd.field_key === 'nama_pelatihan'
                const val = viewEntry.data_json?.[fd.field_key] ?? '-'
                const isLink = String(val).startsWith('http://') || String(val).startsWith('https://')

                return (
                  <div key={fd.field_key} className={`p-2.5 rounded-lg bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-800 ${isFull ? 'sm:col-span-2' : ''}`}>
                    <p className="text-xs text-gray-400 font-medium">{fd.label}</p>
                    {isLink ? (
                      <a href={val} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline break-all">
                        {val}
                      </a>
                    ) : (
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-200 break-words mt-0.5">
                        {val}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </Modal>

      {/* Upload Column Mapping Modal */}
      <Modal
        open={uploadModal}
        onClose={() => { setUploadModal(false); setMappingData(null) }}
        title="Cocokkan Kolom Excel"
        maxWidth="max-w-2xl"
      >
        {mappingData && (
          <ColumnMappingScreen
            excelHeaders={mappingData.headers}
            fieldDefs={fieldDefs}
            initialMapping={mappingData.initialMapping}
            onConfirm={handleImportConfirm}
            onCancel={() => { setUploadModal(false); setMappingData(null) }}
          />
        )}
      </Modal>
    </div>
  )
}
