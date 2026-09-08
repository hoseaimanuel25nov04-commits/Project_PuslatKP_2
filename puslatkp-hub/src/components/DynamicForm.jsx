import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../AuthContext'
import { supabase } from '../supabaseClient'

export function FieldInput({ field, value, onChange, disabled }) {
  const base = `form-input ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : ''}`

  switch (field.tipe) {
    case 'angka':
      return (
        <input id={`field-${field.field_key}`} type="number" value={value ?? ''}
          onChange={(e) => onChange(field.field_key, e.target.value === '' ? null : Number(e.target.value))}
          className={base} disabled={disabled} required={field.wajib} placeholder="..." />
      )
    case 'tanggal':
      return (
        <input id={`field-${field.field_key}`} type="date" value={value ? String(value).split('T')[0] : ''}
          onChange={(e) => onChange(field.field_key, e.target.value || null)}
          className={base} disabled={disabled} required={field.wajib} />
      )
    case 'pilihan':
      return (
        <select id={`field-${field.field_key}`} value={value ?? ''}
          onChange={(e) => onChange(field.field_key, e.target.value || null)}
          className={`${base} form-select`} disabled={disabled} required={field.wajib}>
          <option value="">...</option>
          {(field.opsi_pilihan || []).map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      )
    case 'teks_panjang':
      return (
        <textarea id={`field-${field.field_key}`} value={value ?? ''}
          onChange={(e) => onChange(field.field_key, e.target.value || null)}
          className={`${base} resize-y`} rows={2} disabled={disabled} required={field.wajib} placeholder="..." />
      )
    default:
      if (['alamat', 'progress_pelaksanaan', 'permasalahan'].includes(field.field_key)) {
        return (
          <textarea id={`field-${field.field_key}`} value={value ?? ''}
            onChange={(e) => onChange(field.field_key, e.target.value || null)}
            className={`${base} resize-y`} rows={2} disabled={disabled} required={field.wajib} placeholder="..." />
        )
      }
      return (
        <input id={`field-${field.field_key}`} type="text" value={value ?? ''}
          onChange={(e) => onChange(field.field_key, e.target.value || null)}
          className={base} disabled={disabled} required={field.wajib} placeholder="..." />
      )
  }
}

function getUptLabel(profile, uptKey) {
  return profile?.nama_balai || profile?.nama_upt || profile?.upt_nama || profile?.nama || uptKey || ''
}

function EmptyCell() {
  return <span className="text-gray-400 dark:text-gray-500 select-none">...</span>
}

/**
 * Tabel input mingguan bergaya spreadsheet.
 * Admin melihat seluruh UPT aktif sebagai baris.
 * Akun UPT hanya melihat baris UPT miliknya.
 */
export function DynamicFormRekap({ fields, values, onChange, disabled, onSubmit, loading }) {
  const { profile, uptKey, isAdmin } = useAuth()
  const [uptList, setUptList] = useState([])
  const [uptLoading, setUptLoading] = useState(true)
  const activeFields = useMemo(() => fields.filter(f => f.aktif).sort((a, b) => a.urutan - b.urutan), [fields])

  useEffect(() => {
    let cancelled = false
    async function loadUPTs() {
      setUptLoading(true)
      const { data } = await supabase.from('upt_list').select('*').eq('aktif', true).order('label')
      if (!cancelled) {
        let rows = (data || []).filter(u => u.aktif !== false)
        // Fallback untuk demo lama apabila tabel upt_list belum berisi data.
        if (!rows.length && uptKey) rows = [{ key: uptKey, label: getUptLabel(profile, uptKey), aktif: true }]
        if (!isAdmin) rows = rows.filter(u => u.key === uptKey)
        setUptList(rows)
        setUptLoading(false)
      }
    }
    loadUPTs()
    return () => { cancelled = true }
  }, [isAdmin, uptKey, profile])

  const fallbackUpt = !uptList.length && !uptLoading && !isAdmin
    ? [{ key: uptKey, label: getUptLabel(profile, uptKey), aktif: true }]
    : uptList

  function getRowValues(key) {
    // Mendukung state lama yang masih berupa satu baris.
    if (values?.__uptRows?.[key]) return values.__uptRows[key]
    if (!isAdmin && key === uptKey) return values || {}
    return {}
  }

  function updateRow(key, fieldKey, val) {
    const currentRows = values.__uptRows || {}
    const nextRows = {
      ...currentRows,
      [key]: { ...(currentRows[key] || getRowValues(key)), [fieldKey]: val },
    }
    onChange('__uptRows', nextRows)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!fallbackUpt.length) {
      alert('Belum ada akun/UPT aktif yang dapat diinput.')
      return
    }
    // Simpan state tabel ke parent. Penyimpanan backend tetap memakai alur existing.
    onSubmit(e)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-auto shadow-sm">
        <table className="w-full min-w-max text-sm border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap sticky left-0 z-20 bg-gray-50 dark:bg-gray-800 min-w-[210px]">
                Nama Balai/UPT <span className="text-rose-500">*</span>
              </th>
              {activeFields.map(field => (
                <th key={field.id || field.field_key} className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap min-w-[190px]">
                  {field.label}{field.wajib && <span className="text-rose-500 ml-1">*</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {uptLoading ? (
              <tr>
                <td colSpan={activeFields.length + 1} className="px-4 py-10 text-center text-gray-400">Memuat daftar UPT aktif...</td>
              </tr>
            ) : fallbackUpt.length === 0 ? (
              <tr>
                <td className="px-4 py-4 font-semibold sticky left-0 bg-white dark:bg-gray-900">...</td>
                {activeFields.map(field => <td key={field.id || field.field_key} className="px-3 py-4"><EmptyCell /></td>)}
              </tr>
            ) : (
              fallbackUpt.map((upt) => {
                const rowValues = getRowValues(upt.key)
                const editable = !disabled && (isAdmin || upt.key === uptKey)
                return (
                  <tr key={upt.key} className="align-top hover:bg-gray-50/70 dark:hover:bg-gray-800/30">
                    <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white whitespace-nowrap sticky left-0 z-10 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
                      {upt.label || upt.key || <EmptyCell />}
                    </td>
                    {activeFields.map(field => (
                      <td key={field.id || field.field_key} className="px-3 py-2 min-w-[190px]">
                        {editable ? (
                          <FieldInput
                            field={field}
                            value={rowValues[field.field_key]}
                            onChange={(key, val) => updateRow(upt.key, key, val)}
                            disabled={false}
                          />
                        ) : (
                          rowValues[field.field_key] !== undefined && rowValues[field.field_key] !== null && rowValues[field.field_key] !== ''
                            ? <span className="text-gray-700 dark:text-gray-200">{String(rowValues[field.field_key])}</span>
                            : <EmptyCell />
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {!disabled && (
        <div className="flex items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
          <p className="text-xs text-gray-500">{fallbackUpt.length} UPT aktif ditampilkan sebagai baris.</p>
          <button type="submit" className="btn-primary" disabled={loading || uptLoading}>
            {loading ? 'Menyimpan...' : 'Simpan Data Mingguan'}
          </button>
        </div>
      )}
    </form>
  )
}

/**
 * Input rincian bulanan tetap berbentuk tabel untuk satu baris data.
 */
export function DynamicFormEntry({ fields, values, onChange, disabled, onSubmit, loading }) {
  const { profile, uptKey, isAdmin } = useAuth()
  const activeFields = fields.filter(f => f.aktif).sort((a, b) => a.urutan - b.urutan)
  const uptLabel = getUptLabel(profile, uptKey)

  function handleSubmit(e) {
    e.preventDefault()
    if (!isAdmin && !uptLabel) {
      alert('Nama Balai/UPT wajib tersedia sebelum data disimpan.')
      return
    }
    onSubmit(e)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-auto">
        <table className="w-full min-w-max text-sm border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap sticky left-0 bg-gray-50 dark:bg-gray-800 z-10 min-w-[190px]">Nama Balai/UPT <span className="text-rose-500">*</span></th>
              {activeFields.map(field => <th key={field.id || field.field_key} className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap min-w-[180px]">{field.label}{field.wajib && <span className="text-rose-500 ml-1">*</span>}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr className="align-top">
              <td className="px-3 py-3 font-semibold text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900 z-10">{uptLabel || <EmptyCell />}</td>
              {activeFields.map(field => (
                <td key={field.id || field.field_key} className="px-3 py-2 min-w-[180px]">
                  <FieldInput field={field} value={values[field.field_key]} onChange={onChange} disabled={disabled} />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
      {!disabled && <div className="pt-2 border-t border-gray-100 dark:border-gray-800"><button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Menyimpan...' : 'Simpan Data Baris'}</button></div>}
    </form>
  )
}

export default function DynamicForm({ level, ...props }) {
  if (level === 'bulan') return <DynamicFormEntry {...props} />
  return <DynamicFormRekap {...props} />
}
