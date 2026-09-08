/**
 * pages/DailyActivity.jsx
 * Halaman laporan aktivitas harian — DataTable + form input
 */
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import StatCard from '../components/StatCard'
import DataTable from '../components/DataTable'
import Modal from '../components/Modal'
import Badge from '../components/Badge'
import InfoCard from '../components/InfoCard'
import {
  Plus, Activity, Target, TrendingUp, CheckCircle2,
  AlertTriangle, Building, Globe, Users, Landmark,
  Download, Filter
} from 'lucide-react'

const LINGKUP_OPTIONS = [
  { value: 'internal_puslat', label: 'Internal Puslat', color: 'bg-indigo-600' },
  { value: 'internal_kkp', label: 'Internal KKP', color: 'bg-emerald-500' },
  { value: 'internal_eksternal', label: 'Internal & Eksternal', color: 'bg-cyan-600' },
  { value: 'eksternal', label: 'Eksternal', color: 'bg-orange-500' },
]

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Draft' },
  { value: 'proses', label: 'Proses' },
  { value: 'selesai', label: 'Selesai' },
]

const EMPTY_FORM = {
  tanggal: new Date().toISOString().split('T')[0],
  status: 'draft',
  uraian: '',
  pic: '',
  deskripsi: '',
  lingkup: '',
  output: '',
  hambatan: false,
  hambatan_keterangan: '',
  interaksi: '',
  feedback: '',
}

export default function DailyActivity() {
  const { isAdmin, uptKey } = useAuth()
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [viewModal, setViewModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [filterUPT, setFilterUPT] = useState('')
  const [uptList, setUptList] = useState([])

  useEffect(() => {
    loadActivities()
    if (isAdmin) loadUptList()
  }, [uptKey, isAdmin, filterUPT])

  async function loadUptList() {
    const { data } = await supabase.from('upt_list').select('*').eq('aktif', true).order('label')
    setUptList(data || [])
  }

  async function loadActivities() {
    setLoading(true)
    let query = supabase.from('daily_activity').select('*').order('tanggal', { ascending: false })
    if (!isAdmin && uptKey) query = query.eq('upt_key', uptKey)
    if (isAdmin && filterUPT) query = query.eq('upt_key', filterUPT)
    const { data } = await query
    setActivities(data || [])
    setLoading(false)
  }

  const stats = {
    total: activities.length,
    rencana: activities.filter(a => a.status === 'draft').length,
    berjalan: activities.filter(a => a.status === 'proses').length,
    selesai: activities.filter(a => a.status === 'selesai').length,
    masalah: activities.filter(a => a.hambatan).length,
  }

  const lingkupStats = {
    internal_puslat: activities.filter(a => a.lingkup === 'internal_puslat').length,
    internal_kkp: activities.filter(a => a.lingkup === 'internal_kkp').length,
    internal_eksternal: activities.filter(a => a.lingkup === 'internal_eksternal').length,
    eksternal: activities.filter(a => a.lingkup === 'eksternal').length,
  }

  function openAdd() {
    setEditingId(null)
    setForm({ ...EMPTY_FORM, tanggal: new Date().toISOString().split('T')[0] })
    setModalOpen(true)
  }

  function openEdit(row) {
    setEditingId(row.id)
    setForm({
      ...EMPTY_FORM,
      ...row,
      pic: Array.isArray(row.pic) ? row.pic.join(', ') : row.pic || '',
    })
    setModalOpen(true)
  }

  function openView(row) {
    setSelectedActivity(row)
    setViewModal(true)
  }

  async function handleDelete(row) {
    if (!confirm(`Hapus aktivitas "${row.uraian}"?`)) return
    await supabase.from('daily_activity').delete().eq('id', row.id)
    loadActivities()
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      ...form,
      pic: form.pic ? form.pic.split(',').map(p => p.trim()).filter(Boolean) : [],
      upt_key: uptKey || form.upt_key,
      updated_at: new Date().toISOString(),
    }
    delete payload.id

    if (editingId) {
      await supabase.from('daily_activity').update(payload).eq('id', editingId)
    } else {
      await supabase.from('daily_activity').insert(payload)
    }
    setSaving(false)
    setModalOpen(false)
    loadActivities()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div
        className="rounded-2xl px-6 py-5 text-white"
        style={{ background: 'linear-gradient(135deg, #0B1830 0%, #10233F 100%)' }}
      >
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-300 mb-1">Laporan Aktivitas</p>
            <h1 className="font-bold text-3xl font-display">Daily Activity</h1>
          </div>
          <button onClick={openAdd} className="btn-primary">
            <Plus size={16} />
            Tambah Aktivitas
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Progress & Status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <StatCard icon={Activity} color="bg-[#1E293B]" label="Total Aktivitas" value={stats.total} />
          <StatCard icon={Target} color="bg-blue-600" label="Rencana" value={stats.rencana} />
          <StatCard icon={TrendingUp} color="bg-amber-500" label="Realisasi Berjalan" value={stats.berjalan} />
          <StatCard icon={CheckCircle2} color="bg-emerald-500" label="Selesai" value={stats.selesai} />
          <StatCard icon={AlertTriangle} color="bg-rose-500" label="Permasalahan" value={stats.masalah} />
        </div>
      </div>

      {/* Lingkup Stats */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-3">Ruang Lingkup</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard icon={Building} color="bg-indigo-600" label="Internal Puslat" value={lingkupStats.internal_puslat} />
          <StatCard icon={Landmark} color="bg-emerald-500" label="Internal KKP" value={lingkupStats.internal_kkp} />
          <StatCard icon={Users} color="bg-cyan-600" label="Internal Eksternal" value={lingkupStats.internal_eksternal} />
          <StatCard icon={Globe} color="bg-orange-500" label="Eksternal" value={lingkupStats.eksternal} />
        </div>
      </div>

      {/* Table */}
      <InfoCard
        title="Rincian Aktivitas"
        action={
          isAdmin && (
            <div className="flex items-center gap-2">
              <select
                value={filterUPT}
                onChange={e => setFilterUPT(e.target.value)}
                className="form-select text-xs py-1.5"
              >
                <option value="">Semua UPT</option>
                {uptList.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
              </select>
            </div>
          )
        }
      >
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />)}
          </div>
        ) : (
          <DataTable
            data={activities}
            onView={openView}
            onEdit={openEdit}
            onDelete={handleDelete}
            isAdmin={isAdmin}
          />
        )}
      </InfoCard>

      {/* Add/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? 'Edit Aktivitas' : 'Tambah Aktivitas'}
        maxWidth="max-w-2xl"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Batal</button>
            <button form="activity-form" type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Menyimpan...' : 'Simpan'}
            </button>
          </>
        }
      >
        <form id="activity-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Tanggal <span className="text-rose-500">*</span></label>
              <input type="date" value={form.tanggal} onChange={e => setForm(f => ({...f, tanggal: e.target.value}))}
                className="form-input" required />
            </div>
            <div>
              <label className="form-label">Status <span className="text-rose-500">*</span></label>
              <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} className="form-select" required>
                {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {isAdmin && (
            <div>
              <label className="form-label">UPT</label>
              <select value={form.upt_key || uptKey || ''} onChange={e => setForm(f => ({...f, upt_key: e.target.value}))} className="form-select">
                <option value="">Pilih UPT</option>
                {uptList.map(u => <option key={u.key} value={u.key}>{u.label}</option>)}
              </select>
            </div>
          )}

          <div>
            <label className="form-label">Uraian Kegiatan <span className="text-rose-500">*</span></label>
            <textarea value={form.uraian} onChange={e => setForm(f => ({...f, uraian: e.target.value}))}
              className="form-input resize-none" rows={2} required placeholder="Deskripsi singkat kegiatan" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">PIC (pisahkan koma)</label>
              <input type="text" value={form.pic} onChange={e => setForm(f => ({...f, pic: e.target.value}))}
                className="form-input" placeholder="Nama1, Nama2" />
            </div>
            <div>
              <label className="form-label">Ruang Lingkup</label>
              <select value={form.lingkup} onChange={e => setForm(f => ({...f, lingkup: e.target.value}))} className="form-select">
                <option value="">Pilih lingkup</option>
                {LINGKUP_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Deskripsi Detail</label>
            <textarea value={form.deskripsi} onChange={e => setForm(f => ({...f, deskripsi: e.target.value}))}
              className="form-input resize-none" rows={3} placeholder="Penjelasan lengkap kegiatan" />
          </div>

          <div>
            <label className="form-label">Output / Hasil</label>
            <input type="text" value={form.output} onChange={e => setForm(f => ({...f, output: e.target.value}))}
              className="form-input" placeholder="Hasil yang dicapai" />
          </div>

          <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <input
              id="hambatan-check"
              type="checkbox"
              checked={form.hambatan}
              onChange={e => setForm(f => ({...f, hambatan: e.target.checked}))}
              className="w-4 h-4 rounded text-blue-600"
            />
            <label htmlFor="hambatan-check" className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
              Ada hambatan / permasalahan
            </label>
          </div>

          {form.hambatan && (
            <div className="animate-fade-in">
              <label className="form-label">Keterangan Hambatan</label>
              <textarea value={form.hambatan_keterangan} onChange={e => setForm(f => ({...f, hambatan_keterangan: e.target.value}))}
                className="form-input resize-none" rows={2} placeholder="Jelaskan hambatan yang terjadi" />
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label">Interaksi</label>
              <input type="text" value={form.interaksi} onChange={e => setForm(f => ({...f, interaksi: e.target.value}))}
                className="form-input" placeholder="Pihak yang terlibat" />
            </div>
            <div>
              <label className="form-label">Feedback</label>
              <input type="text" value={form.feedback} onChange={e => setForm(f => ({...f, feedback: e.target.value}))}
                className="form-input" placeholder="Umpan balik diterima" />
            </div>
          </div>
        </form>
      </Modal>

      {/* View Detail Modal */}
      <Modal
        open={viewModal}
        onClose={() => setViewModal(false)}
        title="Detail Aktivitas"
      >
        {selectedActivity && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant={selectedActivity.status === 'selesai' ? 'success' : selectedActivity.status === 'proses' ? 'warning' : 'draft'}>
                {selectedActivity.status}
              </Badge>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(selectedActivity.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>

            {[
              { label: 'Uraian', value: selectedActivity.uraian },
              { label: 'PIC', value: Array.isArray(selectedActivity.pic) ? selectedActivity.pic.join(', ') : selectedActivity.pic },
              { label: 'Ruang Lingkup', value: LINGKUP_OPTIONS.find(o => o.value === selectedActivity.lingkup)?.label || selectedActivity.lingkup },
              { label: 'Deskripsi', value: selectedActivity.deskripsi },
              { label: 'Output', value: selectedActivity.output },
              { label: 'Interaksi', value: selectedActivity.interaksi },
              { label: 'Feedback', value: selectedActivity.feedback },
            ].map(item => item.value ? (
              <div key={item.label}>
                <p className="form-label">{item.label}</p>
                <p className="text-sm text-gray-800 dark:text-gray-200">{item.value}</p>
              </div>
            ) : null)}

            {selectedActivity.hambatan && (
              <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-lg p-3">
                <p className="text-xs font-semibold text-rose-700 dark:text-rose-400 mb-1">⚠ Ada Hambatan</p>
                <p className="text-sm text-rose-800 dark:text-rose-300">{selectedActivity.hambatan_keterangan || '-'}</p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
