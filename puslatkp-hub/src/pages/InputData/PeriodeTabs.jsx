import { useState, useEffect, useRef } from 'react'
import { supabase } from '../../supabaseClient'
import { useAuth } from '../../AuthContext'
import PeriodSelector from '../../components/PeriodSelector'
import DynamicForm from '../../components/DynamicForm'
import SpreadsheetRekap from '../../components/SpreadsheetRekap'
import Modal from '../../components/Modal'
import ColumnMappingScreen from '../../components/ColumnMappingScreen'
import { isPeriodLocked } from '../../lib/deadline'
import { matchColumns, convertRows } from '../../lib/columnMatcher'
import { readExcelFile, exportDataEntries, exportRekapNilai } from '../../lib/excelExport'
import { Upload, Plus, Download, CheckCircle2, AlertTriangle, AlertCircle, Trash2, Eye, Edit, Search, FileSpreadsheet, Loader2, Calculator, Check } from 'lucide-react'

export default function PeriodeTabs({ jenisData, allJenisData = [] }) {
  const { isAdmin, uptKey } = useAuth()
  const isMonthOnly = jenisData.level_utama === 'bulan'
  const allowedLevels = isMonthOnly ? ['bulan'] : ['minggu', 'triwulan', 'tahun']
  const [activeLevel, setActiveLevel] = useState(isMonthOnly ? 'bulan' : 'minggu')
  const [periods, setPeriods] = useState([])
  const [activePeriod, setActivePeriod] = useState(null)
  const [fieldDefs, setFieldDefs] = useState([])
  const [partnerFieldDefs, setPartnerFieldDefs] = useState([])
  const [rekapValues, setRekapValues] = useState({})
  const [entries, setEntries] = useState([])
  const [validation, setValidation] = useState(null)
  const [aggregatedData, setAggregatedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
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
  const partnerJd = isMonthOnly && jenisData.pasangan_mingguan_id ? allJenisData.find(j => j.id === jenisData.pasangan_mingguan_id) : null

  useEffect(() => { loadPeriods() }, [jenisData.id])
  useEffect(() => { loadFieldDefs() }, [jenisData.id, activeLevel])
  useEffect(() => { if (activePeriod && jenisData) loadData() }, [activePeriod?.id, jenisData.id, activeLevel, currentUptKey])

  async function loadPeriods() {
    const { data } = await supabase.from('periods').select('*').order('tahun').order('bulan').order('minggu_ke').order('triwulan_ke')
    const allP = data || []
    setPeriods(allP)
    const level = isMonthOnly ? 'bulan' : 'minggu'
    setActiveLevel(level)
    const filtered = allP.filter(p => p.level === level)
    const now = new Date()
    const closest = filtered.find(p => now >= new Date(p.tanggal_mulai) && now <= new Date(p.tanggal_selesai)) || filtered[filtered.length - 1]
    setActivePeriod(closest || null)
  }

  async function loadFieldDefs() {
    const level = isMonthOnly ? 'bulan' : 'minggu'
    const { data } = await supabase.from('field_definitions').select('*').eq('jenis_data_id', jenisData.id).eq('level', level).eq('aktif', true).order('urutan')
    setFieldDefs(data || [])
    if (isMonthOnly && jenisData.pasangan_mingguan_id) {
      const { data: pDefs } = await supabase.from('field_definitions').select('*').eq('jenis_data_id', jenisData.pasangan_mingguan_id).eq('level', 'minggu').eq('aktif', true).order('urutan')
      setPartnerFieldDefs(pDefs || [])
    }
  }

  async function loadData() {
    if (!activePeriod) return
    setLoading(true)
    if (activeLevel === 'bulan') {
      let q = supabase.from('data_entries').select('*').eq('jenis_data_id', jenisData.id).eq('period_id', activePeriod.id).order('created_at')
      if (!isAdmin) q = q.eq('upt_key', currentUptKey)
      const { data } = await q
      const currentEntries = data || []
      setEntries(currentEntries)
      await checkPartnerWeeklyProgress(currentEntries)
    } else if (activeLevel === 'minggu') {
      let q = supabase.from('rekap_nilai').select('*').eq('jenis_data_id', jenisData.id).eq('period_id', activePeriod.id)
      if (!isAdmin) q = q.eq('upt_key', currentUptKey)
      const { data } = await q
      const vals = {}
      ;(data || []).forEach(r => { vals[r.field_key] = r.value !== null && r.value !== undefined ? r.value : r.value_text })
      setRekapValues(vals)
    } else await calculateAggregation()
    setLoading(false)
  }

  async function checkPartnerWeeklyProgress(currentEntries) {
    if (!jenisData.pasangan_mingguan_id) { setValidation(null); return }
    const weeks = periods.filter(p => p.level === 'minggu' && p.tahun === activePeriod.tahun && p.bulan === activePeriod.bulan)
    if (!weeks.length) { setValidation(null); return }
    const { data } = await supabase.from('rekap_nilai').select('*').eq('jenis_data_id', jenisData.pasangan_mingguan_id).eq('upt_key', currentUptKey).in('period_id', weeks.map(p => p.id))
    const target = partnerFieldDefs.find(f => f.tipe === 'angka') || { field_key: 'jumlah_peserta', label: 'Jumlah Peserta' }
    const filled = new Set(); let total = 0
    weeks.forEach(w => { const r = (data || []).find(x => x.period_id === w.id && x.field_key === target.field_key); if (r && r.value !== null) { filled.add(w.id); total += Number(r.value) || 0 } })
    setValidation({ partnerJudul: partnerJd?.judul || 'Pasangan Mingguan', targetFieldLabel: target.label, filledWeeksCount: filled.size, totalWeeks: weeks.length, totalMingguan: total, entriCount: currentEntries.length, selisih: currentEntries.length - total })
  }

  async function calculateAggregation() {
    let weeks = []
    if (activeLevel === 'triwulan') {
      const q = activePeriod.triwulan_ke
      weeks = periods.filter(p => p.level === 'minggu' && p.tahun === activePeriod.tahun && p.bulan >= (q - 1) * 3 + 1 && p.bulan <= q * 3)
    } else if (activeLevel === 'tahun') weeks = periods.filter(p => p.level === 'minggu' && p.tahun === activePeriod.tahun)
    if (!weeks.length) { setAggregatedData({ totals: {}, weekRows: [] }); return }
    const { data } = await supabase.from('rekap_nilai').select('*').eq('jenis_data_id', jenisData.id).eq('upt_key', currentUptKey).in('period_id', weeks.map(p => p.id))
    const rows = data || []; const totals = {}
    fieldDefs.filter(f => f.tipe === 'angka').forEach(f => { totals[f.field_key] = rows.filter(r => r.field_key === f.field_key).reduce((a, r) => a + (Number(r.value) || 0), 0) })
    const weekRows = weeks.map(p => { const values = {}; rows.filter(r => r.period_id === p.id).forEach(r => { values[r.field_key] = r.value !== null ? r.value : r.value_text }); return { period: p, values, hasData: Object.keys(values).length > 0 } })
    setAggregatedData({ totals, weekRows })
  }

  async function saveEntry(values) {
    setSaving(true)
    const payload = { jenis_data_id: jenisData.id, upt_key: currentUptKey, period_id: activePeriod.id, nama: values.nama || values.nama_pelatihan || null, nik: values.nik ? String(values.nik) : null, data_json: values }
    if (editEntry) await supabase.from('data_entries').update(payload).eq('id', editEntry.id); else await supabase.from('data_entries').insert(payload)
    setSaving(false); setAddEntryModal(false); setEditEntry(null); setFormValues({}); loadData()
  }

  async function deleteEntry(id) { if (!confirm('Hapus baris data ini?')) return; await supabase.from('data_entries').delete().eq('id', id); loadData() }

  async function handleFileUpload(e) {
    const file = e.target.files?.[0]; if (!file) return
    try { const { headers, rows } = await readExcelFile(file); setMappingData({ headers, rows, initialMapping: matchColumns(headers, fieldDefs) }); setUploadModal(true) }
    catch (err) { alert('Gagal membaca file: ' + err.message) }
    e.target.value = ''
  }

  async function handleImportConfirm(mapping) {
    if (!mappingData) return
    setSaving(true)
    const { entries: converted, extraKeys } = convertRows(mappingData.rows, mapping, fieldDefs)
    for (const entry of converted) await supabase.from('data_entries').upsert({ jenis_data_id: jenisData.id, upt_key: currentUptKey, period_id: activePeriod.id, nama: entry.nama, nik: entry.nik || null, data_json: entry.data_json, data_ekstra: entry.data_ekstra }, { onConflict: 'jenis_data_id,upt_key,period_id,nik', ignoreDuplicates: false })
    if (extraKeys.length) await supabase.from('audit_log').insert({ actor_upt_key: currentUptKey, action: 'import_kolom_tidak_dikenal', detail: { jenis_data_id: jenisData.id, kolom: extraKeys } })
    setSaving(false); setUploadModal(false); setMappingData(null); loadData()
  }

  function handleLevelChange(level) {
    setActiveLevel(level)
    const list = periods.filter(p => p.level === level); const now = new Date()
    const closest = list.find(p => now >= new Date(p.tanggal_mulai) && now <= new Date(p.tanggal_selesai)) || list[list.length - 1]
    setActivePeriod(closest || null)
  }

  const filteredEntries = entries.filter(e => !searchEntries || e.nama?.toLowerCase().includes(searchEntries.toLowerCase()) || e.nik?.includes(searchEntries) || JSON.stringify(e.data_json).toLowerCase().includes(searchEntries.toLowerCase()))

  return <div className="space-y-4">
    <div className="card p-4 shadow-sm border border-gray-100 dark:border-gray-800"><PeriodSelector level={activeLevel} onLevelChange={handleLevelChange} period={activePeriod} onPeriodChange={setActivePeriod} availablePeriods={periods} allowedLevels={allowedLevels} /></div>
    {locked && <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-xl p-4 flex items-center gap-3"><span className="text-2xl">🔒</span><div><p className="font-semibold text-amber-800 text-sm">Periode Terkunci — Lewat Deadline</p><p className="text-xs text-amber-600">Form ini hanya bisa dilihat. Hubungi Admin untuk perpanjangan tenggat.</p></div></div>}
    {isMonthOnly && validation && <div className="space-y-2"><div className={`rounded-xl p-3.5 flex items-center gap-3 ${validation.filledWeeksCount >= validation.totalWeeks ? 'bg-emerald-50 text-emerald-800' : 'bg-amber-50 text-amber-800'}`}>{validation.filledWeeksCount >= validation.totalWeeks ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}<div className="text-sm"><p className="font-semibold">{validation.filledWeeksCount >= validation.totalWeeks ? '4 minggu sudah lengkap' : `Baru ${validation.filledWeeksCount} dari ${validation.totalWeeks} minggu terisi`}</p><p className="text-xs">Total mingguan: {validation.totalMingguan} {validation.targetFieldLabel.toLowerCase()}.</p></div></div><div className={`px-4 py-2.5 rounded-lg text-xs border ${validation.entriCount === validation.totalMingguan ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'}`}>{validation.entriCount === validation.totalMingguan ? 'Cocok' : `Ada Selisih: rincian ${validation.entriCount}, mingguan ${validation.totalMingguan}`}</div></div>}

    {activePeriod ? (activeLevel === 'bulan' ? <div className="card shadow-sm border border-gray-100 dark:border-gray-800"><div className="flex items-center justify-between p-4 border-b flex-wrap gap-3"><div><h3 className="font-semibold">{jenisData.judul} <span className="badge-neutral text-[10px] uppercase">Rincian Per-Orang</span></h3><p className="text-xs text-gray-500">{entries.length} baris data terdaftar pada {activePeriod.label}</p></div><div className="flex items-center gap-2 flex-wrap">{!locked && <><input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleFileUpload} /><button onClick={() => fileRef.current?.click()} className="btn-secondary text-xs"><Upload size={14} />Upload Excel</button><button onClick={() => { setEditEntry(null); setFormValues({}); setAddEntryModal(true) }} className="btn-primary text-xs"><Plus size={14} />Tambah Baris</button></>}<button onClick={() => exportDataEntries({ entries, fieldDefs, jenisDataJudul: jenisData.judul, periodLabel: activePeriod.label, uptKey: currentUptKey })} className="btn-secondary text-xs"><Download size={14} />Download Excel</button></div></div>{entries.length > 0 && <div className="px-4 py-3 bg-gray-50/50"><div className="relative max-w-sm"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" placeholder="Cari nama, NIK, pelatihan..." value={searchEntries} onChange={e => setSearchEntries(e.target.value)} className="form-input pl-8 text-xs py-1.5" /></div></div>}{loading ? <div className="flex justify-center py-12"><Loader2 size={24} className="animate-spin text-gray-400" /></div> : filteredEntries.length === 0 ? <div className="text-center py-14 text-gray-400"><FileSpreadsheet size={40} className="mx-auto mb-3 opacity-30" /><p className="text-sm font-medium">{locked ? 'Tidak ada data pada periode ini.' : 'Belum ada rincian data per-orang.'}</p></div> : <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 px-3">Nama</th>{fieldDefs.filter(f => f.field_key !== 'nama').slice(0, 8).map(f => <th key={f.field_key} className="text-left py-2 px-3 whitespace-nowrap">{f.label}</th>)}<th className="py-2 px-3">Aksi</th></tr></thead><tbody>{filteredEntries.map((entry, idx) => <tr key={entry.id} className="border-b"><td className="py-2 px-3 font-medium">{entry.nama || entry.data_json?.nama || `Baris #${idx + 1}`}</td>{fieldDefs.filter(f => f.field_key !== 'nama').slice(0, 8).map(f => <td key={f.field_key} className="py-2 px-3">{entry.data_json?.[f.field_key] ?? '...'}</td>)}<td className="py-2 px-3 whitespace-nowrap"><button onClick={() => setViewEntry(entry)} className="p-1.5 text-gray-400 hover:text-blue-600"><Eye size={15} /></button>{!locked && <><button onClick={() => { setEditEntry(entry); setFormValues(entry.data_json || {}); setAddEntryModal(true) }} className="p-1.5 text-gray-400 hover:text-amber-600"><Edit size={15} /></button><button onClick={() => deleteEntry(entry.id)} className="p-1.5 text-gray-400 hover:text-rose-600"><Trash2 size={15} /></button></>}</td></tr>)}</tbody></table></div>}</div> : activeLevel === 'minggu' ? <div className="card p-6 shadow-sm border border-gray-100 dark:border-gray-800"><div className="flex items-center justify-between mb-6 flex-wrap gap-2 border-b pb-4"><div><h3 className="font-semibold text-lg">{jenisData.judul} <span className="badge-neutral text-xs">Input Mingguan</span></h3><p className="text-sm text-gray-500">{activePeriod.label}</p></div><button onClick={() => exportRekapNilai({ rekapData: [{ upt_key: currentUptKey, values: rekapValues }], fieldDefs, jenisDataJudul: jenisData.judul, periodLabel: activePeriod.label })} className="btn-secondary text-xs"><Download size={14} />Download Excel Mingguan</button></div>{loading ? <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-gray-400" /></div> : fieldDefs.length === 0 ? <p className="text-gray-400 text-sm text-center py-8">Belum ada kolom konfigurasi untuk jenis data mingguan ini.</p> : <SpreadsheetRekap jenisDataId={jenisData.id} periodId={activePeriod.id} fields={fieldDefs} disabled={locked} />}</div> : <div className="card p-6 shadow-sm border border-gray-100 dark:border-gray-800 space-y-6"><div className="flex items-center gap-2 border-b pb-4"><Calculator size={16} /><h3 className="font-semibold text-lg">Auto-Agregasi {activeLevel === 'triwulan' ? 'Triwulan' : 'Tahunan'}</h3></div>{loading ? <div className="flex justify-center py-10"><Loader2 size={24} className="animate-spin text-gray-400" /></div> : <><div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">{fieldDefs.filter(f => f.tipe === 'angka').map(f => <div key={f.field_key} className="bg-gray-50 p-4 rounded-xl border"><p className="text-xs text-gray-500">{f.label}</p><p className="text-xl font-bold mt-1">{Number(aggregatedData?.totals?.[f.field_key] || 0).toLocaleString('id-ID')}</p></div>)}</div>{aggregatedData?.weekRows?.length > 0 && <div className="overflow-x-auto"><table className="w-full text-xs"><thead><tr className="bg-gray-50"><th className="py-2 px-3 text-left">Periode Minggu</th>{fieldDefs.filter(f => f.tipe === 'angka').slice(0, 4).map(f => <th key={f.field_key} className="py-2 px-3 text-right">{f.label}</th>)}<th className="py-2 px-3">Status</th></tr></thead><tbody>{aggregatedData.weekRows.map(w => <tr key={w.period.id} className="border-b"><td className="py-2 px-3">{w.period.label}</td>{fieldDefs.filter(f => f.tipe === 'angka').slice(0, 4).map(f => <td key={f.field_key} className="py-2 px-3 text-right">{w.values[f.field_key] ?? '...'}</td>)}<td className="py-2 px-3 text-center">{w.hasData ? <span className="text-emerald-600"><Check size={11} className="inline" /> Terisi</span> : <span className="text-gray-400">...</span>}</td></tr>)}</tbody></table></div>}</>}</div>)} : <div className="card p-8 text-center text-gray-400">Tidak ada periode tersedia untuk level ini.</div>}

    <Modal open={addEntryModal} onClose={() => { setAddEntryModal(false); setEditEntry(null); setFormValues({}) }} title={editEntry ? 'Edit Baris Data' : 'Tambah Baris Rincian Data'} maxWidth="max-w-3xl"><DynamicForm level="bulan" fields={fieldDefs} values={formValues} onChange={(key, val) => setFormValues(v => ({ ...v, [key]: val }))} disabled={false} onSubmit={e => { e.preventDefault(); saveEntry(formValues) }} loading={saving} /></Modal>
    <Modal open={!!viewEntry} onClose={() => setViewEntry(null)} title="Detail Rincian Data" maxWidth="max-w-2xl">{viewEntry && <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">{fieldDefs.map(fd => <div key={fd.field_key} className="p-2.5 rounded-lg bg-gray-50 border"><p className="text-xs text-gray-400">{fd.label}</p><p className="text-sm font-medium mt-0.5 break-words">{viewEntry.data_json?.[fd.field_key] ?? '-'}</p></div>)}</div>}</Modal>
    <Modal open={uploadModal} onClose={() => { setUploadModal(false); setMappingData(null) }} title="Cocokkan Kolom Excel" maxWidth="max-w-2xl">{mappingData && <ColumnMappingScreen excelHeaders={mappingData.headers} fieldDefs={fieldDefs} initialMapping={mappingData.initialMapping} onConfirm={handleImportConfirm} onCancel={() => { setUploadModal(false); setMappingData(null) }} />}</Modal>
  </div>
}
