// Test script to verify 9 Jenis Data and helper functions
import { mockSupabase } from '../src/mockClient.js'

async function runTests() {
  console.log('--- TEST 1: Memeriksa 9 Jenis Data ---')
  const { data: jds } = await mockSupabase.from('jenis_data').select('*')
  console.log(`Jumlah Jenis Data: ${jds.length}`)
  if (jds.length !== 9) {
    throw new Error(`Expected 9 Jenis Data, got ${jds.length}`)
  }

  jds.forEach((jd, idx) => {
    console.log(`${idx + 1}. [${jd.level_utama.toUpperCase()}] ${jd.judul} (pasangan: ${jd.pasangan_mingguan_id || 'none'})`)
  })

  console.log('\n--- TEST 2: Memeriksa Field Definitions ---')
  const { data: fields } = await mockSupabase.from('field_definitions').select('*')
  console.log(`Total Field Definitions: ${fields.length}`)
  
  // Periksa field untuk Masyarakat
  const fMasyarakat = fields.filter(f => f.jenis_data_id === '11111111-0001-0000-0000-000000000001')
  console.log(`Jumlah field Masyarakat (Minggu): ${fMasyarakat.length}`)
  
  // Periksa field untuk Data Masyarakat
  const fDataMasyarakat = fields.filter(f => f.jenis_data_id === '11111111-0002-0000-0000-000000000002')
  console.log(`Jumlah field Data Masyarakat (Bulan): ${fDataMasyarakat.length}`)

  console.log('\n--- TEST 3: Menguji RPC total_pasangan_mingguan ---')
  const rpcResult = await mockSupabase.rpc('total_pasangan_mingguan', {
    p_jenis_data_bulan_id: '11111111-0002-0000-0000-000000000002',
    p_upt_key: 'upt_jakarta',
    p_field_key: 'jumlah_peserta',
    p_tahun: 2026,
    p_bulan: 9
  })
  console.log(`Hasil total_pasangan_mingguan (Bulan 9 UPT Jakarta): ${rpcResult.data}`)

  console.log('\n✅ SEMUA PENGUJIAN LOGIKA & DATA 9 JENIS DATA BERHASIL!')
}

runTests().catch(err => {
  console.error('❌ Test failed:', err)
  process.exit(1)
})
