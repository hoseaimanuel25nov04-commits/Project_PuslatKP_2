import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../AuthContext'
import { FieldInput } from './DynamicForm'

function emptyValueMap() { return {} }

export default function SpreadsheetRekap({ jenisDataId, periodId, fields, disabled = false }) {
  const { isAdmin, uptKey } = useAuth()
  const [uptList, setUptList] = useState([])
  const [rows, setRows] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const activeFields = useMemo(
    () => (fields || []).filter(f => f.aktif !== false).sort((a, b) => (a.urutan || 0) - (b.urutan || 0)),
    [fields]
  )

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!periodId || !jenisDataId) return
      setLoading(true)
      setMessage('')

      const { data: upts } = await supabase
        .from('upt_list')
        .select('*')
        .eq('aktif', true)
        .order('label')

      let visible = (upts || []).filter(u => u.aktif !== false)
      if (!isAdmin) visible = visible.filter(u => u.key === uptKey)
      if (!visible.length && !isAdmin && uptKey) {
        visible = [{ key: uptKey, label: uptKey, aktif: true }]
      }

      let query = supabase.from('rekap_nilai')
        .select('*')
        .eq('jenis_data_id', jenisDataId)
        .eq('period_id', periodId)
      if (!isAdmin) query = query.eq('upt_key', uptKey)
      const { data: saved } = await query

      const next = {}
      visible.forEach(u => { next[u.key] = emptyValueMap() })
      ;(saved || []).forEach(item => {
        if (!next[item.upt_key]) next[item.upt_key] = emptyValueMap()
        next[item.upt_key][item.field_key] = item.value !== null && item.value !== undefined
          ? item.value
          : (item.value_text ?? '')
      })

      if (!cancelled) {
        setUptList(visible)
        setRows(next)
        setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [jenisDataId, periodId, isAdmin, uptKey])

  function changeCell(rowKey, fieldKey, value) {
    setRows(current => ({
      ...current,
      [rowKey]: { ...(current[rowKey] || {}), [fieldKey]: value },
    }))
  }

  async function save() {
    if (!isAdmin && !uptKey) {
      setMessage('Nama Balai/UPT wajib tersedia pada akun.')
      return
    }
    setSaving(true)
    setMessage('')

    try {
      for (const upt of uptList) {
        const row = rows[upt.key] || {}
        for (const field of activeFields) {
          const raw = row[field.field_key]
          const blank = raw === '' || raw === null || raw === undefined
          const numeric = field.tipe === 'angka'
          const payload = {
            jenis_data_id: jenisDataId,
            upt_key: upt.key,
            period_id: periodId,
            field_key: field.field_key,
            value: numeric && !blank ? Number(raw) : null,
            value_text: numeric ? null : (blank ? null : String(raw)),
            updated_at: new Date().toISOString(),
          }
          const { error } = await supabase.from('rekap_nilai').upsert(payload, {
            onConflict: 'jenis_data_id,upt_key,period_id,field_key'
          })
          if (error) throw error
        }
      }
      setMessage('Data berhasil disimpan untuk seluruh UPT yang ditampilkan.')
    } catch (error) {
      setMessage(`Gagal menyimpan data: ${error.message || error}`)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="py-10 text-center text-sm text-gray-400">Memuat data UPT aktif...</div>

  return (
    <div className="space-y-3">
      <div className="overflow-auto border border-gray-200 dark:border-gray-700 rounded-xl">
        <table className="w-full min-w-max border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <th className="sticky left-0 z-20 min-w-[240px] px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 whitespace-nowrap">
                Nama Balai/UPT <span className="text-rose-500">*</span>
              </th>
              {activeFields.map(field => (
                <th key={field.field_key} className="min-w-[210px] px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                  {field.label}{field.wajib && <span className="text-rose-500 ml-1">*</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {uptList.length === 0 ? (
              <tr>
                <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-4 py-3 font-semibold">...</td>
                {activeFields.map(field => <td key={field.field_key} className="px-3 py-3 text-gray-400">...</td>)}
              </tr>
            ) : uptList.map(upt => {
              const row = rows[upt.key] || {}
              const editable = !disabled && (isAdmin || upt.key === uptKey)
              return (
                <tr key={upt.key} className="align-top hover:bg-gray-50/60 dark:hover:bg-gray-800/30">
                  <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 px-4 py-2.5 font-semibold text-gray-900 dark:text-white border-r border-gray-100 dark:border-gray-800 whitespace-nowrap">
                    {upt.label || upt.key || '...'}
                  </td>
                  {activeFields.map(field => (
                    <td key={field.field_key} className="px-2 py-2 min-w-[210px]">
                      {editable ? (
                        <FieldInput field={field} value={row[field.field_key]} onChange={(key, value) => changeCell(upt.key, key, value)} disabled={false} />
                      ) : (
                        <span className={row[field.field_key] === undefined || row[field.field_key] === null || row[field.field_key] === '' ? 'text-gray-400' : 'text-gray-700 dark:text-gray-200'}>
                          {row[field.field_key] === undefined || row[field.field_key] === null || row[field.field_key] === '' ? '...' : String(row[field.field_key])}
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-xs text-gray-500">{uptList.length} UPT aktif ditampilkan. Nama Balai/UPT diambil otomatis dari daftar UPT aktif.</p>
        {!disabled && <button type="button" onClick={save} disabled={saving || loading} className="btn-primary">{saving ? 'Menyimpan...' : 'Simpan Semua Data'}</button>}
      </div>
      {message && <div className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-gray-600 dark:text-gray-300">{message}</div>}
    </div>
  )
}
