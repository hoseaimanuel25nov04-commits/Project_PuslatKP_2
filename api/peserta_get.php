<?php
require_once __DIR__ . "/config.php";

$isAdmin = checkAdmin();

$rows = $pdo->query("SELECT * FROM peserta ORDER BY tanggal_mulai, nama")->fetchAll();

$records = array_map(function ($r) use ($isAdmin) {
    // Masking data sensitif (UU Perlindungan Data Pribadi) jika diakses tanpa autentikasi admin
    $nik = $r["nik"];
    if (!$isAdmin && $nik) {
        $nik = strlen($nik) >= 8 ? substr($nik, 0, 4) . "********" . substr($nik, -4) : "********";
    }

    $telp = $r["no_telp"];
    if (!$isAdmin && $telp) {
        $telp = strlen($telp) >= 6 ? substr($telp, 0, 4) . "****" . substr($telp, -2) : "08**********";
    }

    $alamat = $isAdmin ? $r["alamat"] : "[Data Alamat Dilindungi]";
    $tanggalLahir = $isAdmin ? $r["tanggal_lahir_raw"] : null;
    $tempatLahir = $isAdmin ? $r["tempat_lahir"] : null;

    return [
        "no" => $r["no_asal"],
        "nama" => $r["nama"],
        "nik" => $nik,
        "telp" => $telp,
        "tempatLahir" => $tempatLahir,
        "tanggalLahir" => $tanggalLahir,
        "kabKota" => $r["kota_kabupaten"],
        "provinsi" => $r["provinsi"],
        "jk" => $r["jenis_kelamin"],
        "alamat" => $alamat,
        "pendidikan" => $r["pendidikan_terakhir"],
        "namaPelatihan" => $r["nama_pelatihan"],
        "sektor" => $r["sektor_pelatihan"],
        "bidang" => $r["bidang_klaster"],
        "program" => $r["program_pelatihan"],
        "dukungan" => $r["dukungan_prioritas"],
        "tglPelatihanRaw" => $r["tanggal_pelatihan_raw"],
        "noSert" => $r["no_sertifikat"],
        "thn" => $r["tahun"] !== null ? (int)$r["tahun"] : null,
        "bln" => $r["bulan"] !== null ? (int)$r["bulan"] : null,
        "tw" => $r["triwulan"] !== null ? "tw" . (int)$r["triwulan"] : null,
        "mg" => $r["minggu_bulan"] !== null ? "w" . (int)$r["minggu_bulan"] : null,
    ];
}, $rows);

$updatedAtRow = $pdo->query("SELECT MAX(updated_at) AS updated_at FROM peserta")->fetch();

echo json_encode([
    "records" => $records,
    "updatedAt" => $updatedAtRow["updated_at"],
    "is_admin" => $isAdmin,
]);
