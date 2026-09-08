<?php
require_once __DIR__ . "/config.php";
requireAdmin();

$body = readJsonBody();
$data = $body["data"] ?? null;
if (!is_array($data)) {
    http_response_code(400);
    echo json_encode(["error" => "Field 'data' (array indikator) wajib diisi."]);
    exit;
}

$MONTH_KEYS = range(1, 12);
$OVERRIDE_KEYS = ["tahun", "tw1", "tw2", "tw3", "tw4", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12"];

$stmtFindParent = $pdo->prepare("SELECT id FROM iku_item WHERE parent_id IS NULL AND no_urut = ?");
$stmtInsertParent = $pdo->prepare(
    "INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (NULL, ?, NULL, ?, ?, ?, ?)"
);
$stmtUpdateParent = $pdo->prepare(
    "UPDATE iku_item SET nama = ?, satuan = ?, target_tahun = ?, urutan = ? WHERE id = ?"
);

$stmtFindChild = $pdo->prepare("SELECT id FROM iku_item WHERE parent_id = ? AND kode = ?");
$stmtInsertChild = $pdo->prepare(
    "INSERT INTO iku_item (parent_id, no_urut, kode, nama, satuan, target_tahun, urutan) VALUES (?, NULL, ?, ?, ?, ?, ?)"
);
$stmtUpdateChild = $pdo->prepare(
    "UPDATE iku_item SET nama = ?, satuan = ?, target_tahun = ?, urutan = ? WHERE id = ?"
);

$stmtUpsertBulanan = $pdo->prepare(
    "INSERT INTO iku_bulanan (item_id, bulan, target, realisasi) VALUES (?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE target = VALUES(target), realisasi = VALUES(realisasi)"
);
$stmtUpsertOverride = $pdo->prepare(
    "INSERT INTO iku_nko_override (item_id, periode_key, nilai) VALUES (?, ?, ?)
     ON DUPLICATE KEY UPDATE nilai = VALUES(nilai)"
);

function upsertMonthlyAndOverride($pdo, $itemId, $node, $stmtUpsertBulanan, $stmtUpsertOverride, $MONTH_KEYS, $OVERRIDE_KEYS) {
    foreach ($MONTH_KEYS as $m) {
        $target = $node["m{$m}_t"] ?? null;
        $realisasi = $node["m{$m}_r"] ?? null;
        $stmtUpsertBulanan->execute([$itemId, $m, $target, $realisasi]);
    }
    $override = $node["nkoOverride"] ?? [];
    foreach ($OVERRIDE_KEYS as $k) {
        $val = $override[$k] ?? null;
        $stmtUpsertOverride->execute([$itemId, $k, $val]);
    }
}

$pdo->beginTransaction();
try {
    $urutanParent = 0;
    foreach ($data as $parent) {
        $urutanParent++;
        $stmtFindParent->execute([$parent["no"]]);
        $existing = $stmtFindParent->fetch();

        if ($existing) {
            $parentId = $existing["id"];
            $stmtUpdateParent->execute([$parent["nama"], $parent["unit"] ?? null, $parent["target"] ?? null, $urutanParent, $parentId]);
        } else {
            $stmtInsertParent->execute([$parent["no"], $parent["nama"], $parent["unit"] ?? null, $parent["target"] ?? null, $urutanParent]);
            $parentId = $pdo->lastInsertId();
        }

        upsertMonthlyAndOverride($pdo, $parentId, $parent, $stmtUpsertBulanan, $stmtUpsertOverride, $MONTH_KEYS, $OVERRIDE_KEYS);

        $urutanChild = 0;
        foreach (($parent["children"] ?? []) as $child) {
            $urutanChild++;
            $stmtFindChild->execute([$parentId, $child["kode"]]);
            $existingChild = $stmtFindChild->fetch();

            if ($existingChild) {
                $childId = $existingChild["id"];
                $stmtUpdateChild->execute([$child["nama"], $child["unit"] ?? null, $child["target"] ?? null, $urutanChild, $childId]);
            } else {
                $stmtInsertChild->execute([$parentId, $child["kode"], $child["nama"], $child["unit"] ?? null, $child["target"] ?? null, $urutanChild]);
                $childId = $pdo->lastInsertId();
            }

            upsertMonthlyAndOverride($pdo, $childId, $child, $stmtUpsertBulanan, $stmtUpsertOverride, $MONTH_KEYS, $OVERRIDE_KEYS);
        }
    }

    $pdo->prepare("UPDATE iku_meta SET updated_at = NOW() WHERE id = 1")->execute();
    $pdo->commit();
} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(["error" => "Gagal menyimpan: " . $e->getMessage()]);
    exit;
}

$meta = $pdo->query("SELECT updated_at FROM iku_meta WHERE id = 1")->fetch();
echo json_encode(["success" => true, "updatedAt" => $meta["updated_at"]]);
