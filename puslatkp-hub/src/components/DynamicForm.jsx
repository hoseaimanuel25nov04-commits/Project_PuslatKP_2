/**
 * components/DynamicForm.jsx
 * Form dinamis berbasis tabel dari field_definitions.
 * Semua field tetap berasal dari konfigurasi database.
 */
import { useAuth } from '../AuthContext'

export function FieldInput({ field, value, onChange, disabled }) {
  const base = `form-input ${disabled ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-800' : ''}`

  switch (field.tipe) {
    case 'angka':
      return (
        <input
          id={`field-${field.field_key}`}
          type="number"
          value={value ?? ''}
          onChange={(e) => onChange(field.field_key, e.target.value === '' ? null : Number(e.target.value))}
          className={base}
          disabled={disabled}
          required={field.wajib}
          placeholder="..."
        />
      )

    case 'tanggal':
      return (
        <input
          id={`field-${field.field_key}`}
          type="date"
          value={value ? String(value).split('T')[0] : ''}
          onChange={(e) => onChange(field.field_key, e.target.value || null)}
          className={base}
          disabled={disabled}
          required={field.wajib}
        />
      )

    case 'pilihan':
      return (
        <select
          id={`field-${field.field_key}`}
          value={value ?? ''}
          onChange={(e) => onChange(field.field_key, e.target.value || null)}
          className={`${base} form-select`}
          disabled={disabled}
          required={field.wajib}
        >
          <option value="">...</option>
          {(field.opsi_pilihan || []).map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      )

    case 'teks_panjang':
      return (
        <textarea
          id={`field-${field.field_key}`}
          value={value ?? ''}
          onChange={(e) => onChange(field.field_key, e.target.value || null)}
          className={`${base} resize-y`}
          rows={2}
          disabled={disabled}
          required={field.wajib}
          placeholder="..."
        />
      )

    case 'teks':
    default:
      if (field.field_key === 'alamat' || field.field_key === 'progress_pelaksanaan' || field.field_key === 'permasalahan') {
        return (
          <textarea
            id={`field-${field.field_key}`}
            value={value ?? ''}
            onChange={(e) => onChange(field.field_key, e.target.value || null)}
            className={`${base} resize-y`}
            rows={2}
            disabled={disabled}
            required={field.wajib}
            placeholder="..."
          />
        )
      }
      return (
        <input
          id={`field-${field.field_key}`}
          type="text"
          value={value ?? ''}
          onChange={(e) => onChange(field.field_key, e.target.value || null)}
          className={base}
          disabled={disabled}
          required={field.wajib}
          placeholder="..."
        />
      )
  }
}

function getUptLabel(profile, uptKey) {
  return profile?.nama_balai || profile?.nama_upt || profile?.upt_nama || profile?.nama || uptKey || ''
}

/**
 * Input mingguan: seluruh data ditampilkan sebagai tabel.
 * Nama Balai/UPT selalu menjadi kolom pertama dan tidak boleh kosong untuk akun UPT.
 */
export function DynamicFormRekap({ fields, values, onChange, disabled, onSubmit, loading }) {
  const { profile, uptKey, isAdmin } = useAuth()
  const activeFields = fields.filter(f => f.aktif).sort((a, b) => a.urutan - b.urutan)
  const uptLabel = getUptLabel(profile, uptKey)

  function handleSubmit(e) {
    if (!isAdmin && !uptLabel) {
      e.preventDefault()
      alert('Nama Balai/UPT wajib tersedia sebelum data disimpan.')
      return
    }
    onSubmit(e)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap sticky left-0 bg-gray-50 dark:bg-gray-800 z-10">
                Nama Balai/UPT <span className="text-rose-500">*</span>
              </th>
              {activeFields.map(field => (
                <th key={field.id || field.field_key} className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                  {field.label}{field.wajib && <span className="text-rose-500 ml-1">*</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-800 align-top">
              <td className="px-3 py-3 min-w-[190px] font-semibold text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900 z-10">
                {uptLabel || <span className="text-gray-400 font-normal">...</span>}
              </td>
              {activeFields.map(field => (
                <td key={field.id || field.field_key} className="px-3 py-2 min-w-[180px]">
                  <FieldInput
                    field={field}
                    value={values[field.field_key]}
                    onChange={onChange}
                    disabled={disabled}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {!disabled && (
        <div className="pt-3 border-t border-gray-100 dark:border-gray-800">
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Data Mingguan'}
          </button>
        </div>
      )}
    </form>
  )
}

/**
 * Input rincian bulanan: form juga menggunakan tabel agar konsisten.
 */
export function DynamicFormEntry({ fields, values, onChange, disabled, onSubmit, loading }) {
  const { profile, uptKey, isAdmin } = useAuth()
  const activeFields = fields.filter(f => f.aktif).sort((a, b) => a.urutan - b.urutan)
  const uptLabel = getUptLabel(profile, uptKey)

  function handleSubmit(e) {
    if (!isAdmin && !uptLabel) {
      e.preventDefault()
      alert('Nama Balai/UPT wajib tersedia sebelum data disimpan.')
      return
    }
    onSubmit(e)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-x-auto">
        <table className="w-full min-w-max text-sm border-collapse">
          <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap sticky left-0 bg-gray-50 dark:bg-gray-800 z-10">
                Nama Balai/UPT <span className="text-rose-500">*</span>
              </th>
              {activeFields.map(field => (
                <th key={field.id || field.field_key} className="px-3 py-3 text-left font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                  {field.label}{field.wajib && <span className="text-rose-500 ml-1">*</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-800 align-top">
              <td className="px-3 py-3 min-w-[190px] font-semibold text-gray-900 dark:text-white sticky left-0 bg-white dark:bg-gray-900 z-10">
                {uptLabel || <span className="text-gray-400 font-normal">...</span>}
              </td>
              {activeFields.map(field => (
                <td key={field.id || field.field_key} className="px-3 py-2 min-w-[180px]">
                  <FieldInput
                    field={field}
                    value={values[field.field_key]}
                    onChange={onChange}
                    disabled={disabled}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      {!disabled && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <button type="submit" className="btn-primary w-full" disabled={loading}>
            {loading ? 'Menyimpan...' : 'Simpan Data Baris'}
          </button>
        </div>
      )}
    </form>
  )
}

export default function DynamicForm({ level, ...props }) {
  if (level === 'bulan') return <DynamicFormEntry {...props} />
  return <DynamicFormRekap {...props} />
}
