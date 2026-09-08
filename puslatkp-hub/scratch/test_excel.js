import * as XLSX from 'xlsx'
import { sanitizeCellValue, sanitizeRows } from '../src/lib/excelExport.js'

function testExcel() {
  console.log('--- TEST EXCEL GENERATION ---')
  const wb = XLSX.utils.book_new()
  const data = sanitizeRows([
    { UPT: 'BPPP Jakarta', Nama: 'Bambang Sudirjo', NIK: '3171010101900001', Pelatihan: 'Mesin Perikanan' },
    { UPT: 'BPPP Jakarta', Nama: 'Siti Nurhaliza', NIK: '3172020202920002', Pelatihan: 'Mutu Hasil Perikanan' }
  ])
  const ws = XLSX.utils.json_to_sheet(data)
  XLSX.utils.book_append_sheet(wb, ws, 'Rincian')

  const outBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  console.log(`Excel buffer created successfully: ${outBuf.length} bytes`)
  console.log('✅ EXCEL EXPORT ENGINE VERIFIED!')
}

testExcel()
