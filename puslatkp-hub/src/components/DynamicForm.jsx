/**
 * components/DynamicForm.jsx
 * Merender form dari daftar field_definitions — KOMPONEN INTI SISTEM
 * Tidak ada field yang ditulis manual — semua dari konfigurasi database
 */

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
          placeholder="0"
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
          <option value="">— Pilih —</option>
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
          rows={3}
          disabled={disabled}
          required={field.wajib}
          placeholder={field.label}
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
            placeholder={field.label}
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
          placeholder={field.label}
        />
      )
  }
}

/**
 * DynamicFormRekap — untuk level Minggu (pengisian form mingguan)
 */
export function DynamicFormRekap({ fields, values, onChange, disabled, onSubmit, loading }) {
  const activeFields = fields.filter(f => f.aktif).sort((a, b) => a.urutan - b.urutan)

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {activeFields.map(field => {
          const isFullWidth = field.tipe === 'teks_panjang' || field.field_key.includes('laporan') || field.field_key === 'progress_pelaksanaan' || field.field_key === 'permasalahan' || field.field_key === 'nama_pelatihan'
          return (
            <div key={field.id || field.field_key} className={isFullWidth ? 'sm:col-span-2' : ''}>
              <label className="form-label" htmlFor={`field-${field.field_key}`}>
                {field.label}
                {field.wajib && <span className="text-rose-500 ml-1">*</span>}
              </label>
              <FieldInput
                field={field}
                value={values[field.field_key]}
                onChange={onChange}
                disabled={disabled}
              />
            </div>
          )
        })}
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
 * DynamicFormEntry — untuk level Bulan (satu baris data per-orang)
 */
export function DynamicFormEntry({ fields, values, onChange, disabled, onSubmit, loading }) {
  const activeFields = fields.filter(f => f.aktif).sort((a, b) => a.urutan - b.urutan)

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto pr-1">
        {activeFields.map(field => {
          const isFullWidth = field.field_key === 'alamat' || field.field_key === 'link_sertifikat_pelatihan_by_name' || field.field_key === 'nama_pelatihan'
          return (
            <div key={field.id || field.field_key} className={isFullWidth ? 'sm:col-span-2' : ''}>
              <label className="form-label" htmlFor={`field-${field.field_key}`}>
                {field.label}
                {field.wajib && <span className="text-rose-500 ml-1">*</span>}
                {field.is_identitas && (
                  <span className="ml-1 text-amber-500 text-xs font-normal" title="Kolom Identitas Pribadi">🔒 Identitas</span>
                )}
              </label>
              <FieldInput
                field={field}
                value={values[field.field_key]}
                onChange={onChange}
                disabled={disabled}
              />
            </div>
          )
        })}
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

// Default export — auto-pilih berdasarkan level
export default function DynamicForm({ level, ...props }) {
  if (level === 'bulan') return <DynamicFormEntry {...props} />
  return <DynamicFormRekap {...props} />
}
