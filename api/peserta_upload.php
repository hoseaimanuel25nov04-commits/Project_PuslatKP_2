<?php
require_once __DIR__ . "/config.php";
requireAdmin();

$body = readJsonBody();
$records = $body["records"] ?? null;
if (!is_array($records)) {
    http_response_code(400);
    echo json_encode(["error" => "Field 'records' (array peserta) wajib diisi."]);
    exit;
}

function toDate($ymd) {
    if (!$ymd || !isset($ymd["y"], $ymd["m"], $ymd["d"])) return null;
    return sprintf("%04d-%02d-%02d", $ymd["y"], $ymd["m"], $ymd["d"]);
}
function toInt($str, $prefix) {
    if (!$str) return null;
    return (int)str_replace($prefix, "", $str);
}

$stmt = $pdo->prepare(
    "INSERT INTO peserta (
        no_asal, nama, nik, no_telp, tempat_lahir, tanggal_lahir_raw, kota_kabupaten, provinsi,
        jenis_kelamin, alamat, pendidikan_terakhir, nama_pelatihan, sektor_pelatihan, bidang_klaster,
        program_pelatihan, dukungan_prioritas, tanggal_pelatihan_raw, tanggal_mulai, tanggal_selesai,
        tahun, bulan, triwulan, minggu_bulan, no_sertifikat, dedup_key
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        no_asal = VALUES(no_asal), no_telp = VALUES(no_telp), tempat_lahir = VALUES(tempat_lahir),
        tanggal_lahir_raw = VALUES(tanggal_lahir_raw), kota_kabupaten = VALUES(kota_kabupaten),
        provinsi = VALUES(provinsi), jenis_kelamin = VALUES(jenis_kelamin), alamat = VALUES(alamat),
        pendidikan_terakhir = VALUES(pendidikan_terakhir), sektor_pelatihan = VALUES(sektor_pelatihan),
        bidang_klaster = VALUES(bidang_klaster), program_pelatihan = VALUES(program_pelatihan),
        dukungan_prioritas = VALUES(dukungan_prioritas), tanggal_mulai = VALUES(tanggal_mulai),
        tanggal_selesai = VALUES(tanggal_selesai), tahun = VALUES(tahun), bulan = VALUES(bulan),
        triwulan = VALUES(triwulan), minggu_bulan = VALUES(minggu_bulan), no_sertifikat = VALUES(no_sertifikat)"
);

$added = 0;
$updated = 0;

$pdo->beginTransaction();
try {
    foreach ($records as $r) {
        $dedupKey = ($r["nik"] ?? "") . "|" . ($r["namaPelatihan"] ?? "") . "|" . ($r["tglPelatihanRaw"] ?? "");
        $stmt->execute([
            $r["no"] ?? null, $r["nama"] ?? "", $r["nik"] ?? "", $r["telp"] ?? null, $r["tempatLahir"] ?? null,
            $r["tanggalLahir"] ?? null, $r["kabKota"] ?? null, $r["provinsi"] ?? null, $r["jk"] ?? null,
            $r["alamat"] ?? null, $r["pendidikan"] ?? null, $r["namaPelatihan"] ?? null, $r["sektor"] ?? null,
            $r["bidang"] ?? null, $r["program"] ?? null, $r["dukungan"] ?? null, $r["tglPelatihanRaw"] ?? null,
            toDate($r["mulaiYMD"] ?? null), toDate($r["selesaiYMD"] ?? null), $r["thn"] ?? null, $r["bln"] ?? null,
            toInt($r["tw"] ?? null, "tw"), toInt($r["mg"] ?? null, "w"), $r["noSert"] ?? null, $dedupKey,
        ]);
        $rc = $stmt->rowCount();
        if ($rc === 1) $added++;
        elseif ($rc >= 2) $updated++;
    }
    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Gagal menyimpan: " . $e->getMessage()]);
    exit;
}

$total = $pdo->query("SELECT COUNT(*) AS c FROM peserta")->fetch()["c"];

echo json_encode([
    "success" => true,
    "added" => $added,
    "updated" => $updated,
    "total" => (int)$total,
]);
