/**
 * lib/excelExport.js
 * Export data ke Excel menggunakan SheetJS (xlsx)
 * Dilengkapi proteksi terhadap Formula Injection (CWE-1236 / DDE Attack).
 */
import * as XLSX from 'xlsx'

/**
 * Sanitasi nilai sel dari potensi eksekusi formula jahat.
 * Mencegah karakter =, +, -, @, \t, \r dieksekusi sebagai formula saat dibuka di Excel.
 */
export function sanitizeCellValue(val) {
  if (val === null || val === undefined) return ''
  if (typeof val === 'number' || typeof val === 'boolean') return val
  const str = String(val)
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`
  }
  return str
}

/**
 * Sanitasi array of objects sebelum dimasukkan ke json_to_sheet
 */
export function sanitizeRows(rows) {
  return (rows || []).map(row => {
    const clean = {}
    for (const [k, v] of Object.entries(row)) {
      clean[k] = sanitizeCellValue(v)
    }
    return clean
  })
}

/**
 * Export data entries (level bulan) ke Excel
 * @param {Object} options
 */
export function exportDataEntries({ entries, fieldDefs, jenisDataJudul, periodLabel, uptKey }) {
  // Buat header sesuai urutan field_definitions
  const headers = fieldDefs
    .filter(fd => fd.aktif)
    .sort((a, b) => a.urutan - b.urutan)
    .map(fd => fd.label)

  const fieldKeys = fieldDefs
    .filter(fd => fd.aktif)
    .sort((a, b) => a.urutan - b.urutan)
    .map(fd => fd.field_key)

  // Baris data dengan sanitasi Formula Injection
  const rows = entries.map(entry => {
    const row = {}
    fieldKeys.forEach((key, i) => {
      const rawVal = entry.data_json?.[key] ?? entry[key] ?? ''
      row[headers[i]] = sanitizeCellValue(rawVal)
    })
    return row
  })

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Data Detail')

  // Sheet ringkasan
  const summaryData = [
    ['Jenis Data', sanitizeCellValue(jenisDataJudul)],
    ['Periode', sanitizeCellValue(periodLabel)],
    ['UPT', sanitizeCellValue(uptKey || 'Semua')],
    ['Total Data', entries.length],
    ['Diekspor pada', new Date().toLocaleString('id-ID')],
  ]
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Ringkasan')

  const filename = `${jenisDataJudul}_${periodLabel}_${uptKey || 'semua'}.xlsx`
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_.-]/g, '')

  XLSX.writeFile(wb, filename)
}

/**
 * Export rekap nilai (level tahun/triwulan/minggu)
 */
export function exportRekapNilai({ rekapData, fieldDefs, jenisDataJudul, periodLabel }) {
  const headers = ['UPT', ...fieldDefs.map(fd => fd.label)]
  const rows = rekapData.map(item => {
    const row = { UPT: sanitizeCellValue(item.upt_key) }
    fieldDefs.forEach(fd => {
      row[fd.label] = sanitizeCellValue(item.values?.[fd.field_key] ?? '')
    })
    return row
  })

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers })
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Rekap')

  const filename = `Rekap_${jenisDataJudul}_${periodLabel}.xlsx`
    .replace(/\s+/g, '_')

  XLSX.writeFile(wb, filename)
}

/**
 * Export gabungan semua UPT (Admin) — multi-sheet
 */
export function exportGabunganSemuaUPT({ data, jenisDataJudul, tahun }) {
  const wb = XLSX.utils.book_new()

  // Sheet per level
  const levels = ['tahun', 'triwulan', 'bulan', 'minggu']
  for (const level of levels) {
    const levelData = sanitizeRows(data[level] || [])
    if (levelData.length === 0) continue

    const ws = XLSX.utils.json_to_sheet(levelData)
    XLSX.utils.book_append_sheet(wb, ws, level.charAt(0).toUpperCase() + level.slice(1))
  }

  // Sheet validasi
  if (data.validasi && data.validasi.length > 0) {
    const wsV = XLSX.utils.json_to_sheet(sanitizeRows(data.validasi))
    XLSX.utils.book_append_sheet(wb, wsV, 'Validasi')
  }

  // Sheet kolom belum dikenal
  if (data.kolomTidakDikenal && data.kolomTidakDikenal.length > 0) {
    const wsE = XLSX.utils.json_to_sheet(sanitizeRows(data.kolomTidakDikenal))
    XLSX.utils.book_append_sheet(wb, wsE, 'Kolom Tidak Dikenal')
  }

  const filename = `Gabungan_${jenisDataJudul}_${tahun}.xlsx`.replace(/\s+/g, '_')
  XLSX.writeFile(wb, filename)
}

/**
 * Baca file Excel dan kembalikan { headers, rows }
 */
export async function readExcelFile(file) {
  return new Promise((resolve, reject) => {
    // Validasi ukuran file (maksimal 25MB untuk mencegah DoS memory exhaustion)
    const MAX_SIZE = 25 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      return reject(new Error('Ukuran file melebihi batas maksimum 25 MB'))
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = e.target.result
        const wb = XLSX.read(data, { type: 'array', cellDates: true })
        const sheetName = wb.SheetNames[0]
        const ws = wb.Sheets[sheetName]
        const rows = XLSX.utils.sheet_to_json(ws, { defval: null })
        const headers = rows.length > 0 ? Object.keys(rows[0]) : []
        resolve({ headers, rows, sheetName })
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsArrayBuffer(file)
  })
}
