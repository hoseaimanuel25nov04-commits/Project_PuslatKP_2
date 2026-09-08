<?php
require_once __DIR__ . "/config.php";

// Ambil semua item (induk + anak)
$items = $pdo->query("SELECT * FROM iku_item ORDER BY parent_id IS NOT NULL, no_urut, urutan")->fetchAll();

// Ambil semua nilai bulanan, dikelompokkan per item_id
$bulananRows = $pdo->query("SELECT * FROM iku_bulanan")->fetchAll();
$bulananByItem = [];
foreach ($bulananRows as $b) {
    $bulananByItem[$b["item_id"]][(int)$b["bulan"]] = [
        "target" => $b["target"] !== null ? (float)$b["target"] : null,
        "realisasi" => $b["realisasi"] !== null ? (float)$b["realisasi"] : null,
    ];
}

// Ambil semua override NKO, dikelompokkan per item_id
$overrideRows = $pdo->query("SELECT * FROM iku_nko_override")->fetchAll();
$overrideByItem = [];
foreach ($overrideRows as $o) {
    $overrideByItem[$o["item_id"]][$o["periode_key"]] = $o["nilai"] !== null ? (float)$o["nilai"] : null;
}

function buildNkoOverride($itemId, $overrideByItem) {
    $keys = ["tahun", "tw1", "tw2", "tw3", "tw4", "m1", "m2", "m3", "m4", "m5", "m6", "m7", "m8", "m9", "m10", "m11", "m12"];
    $result = [];
    foreach ($keys as $k) {
        $result[$k] = $overrideByItem[$itemId][$k] ?? null;
    }
    return $result;
}

function buildMonthFields($itemId, $bulananByItem) {
    $fields = [];
    for ($m = 1; $m <= 12; $m++) {
        $fields["m{$m}_t"] = $bulananByItem[$itemId][$m]["target"] ?? null;
        $fields["m{$m}_r"] = $bulananByItem[$itemId][$m]["realisasi"] ?? null;
    }
    return $fields;
}

// Kelompokkan anak per parent_id
$childrenByParent = [];
foreach ($items as $it) {
    if ($it["parent_id"] !== null) {
        $childrenByParent[$it["parent_id"]][] = $it;
    }
}

$result = [];
foreach ($items as $it) {
    if ($it["parent_id"] !== null) continue; // ini anak, dilewati di loop utama

    $parentNode = array_merge(
        [
            "no" => (int)$it["no_urut"],
            "nama" => $it["nama"],
            "target" => $it["target_tahun"] !== null ? (float)$it["target_tahun"] : null,
        ],
        buildMonthFields($it["id"], $bulananByItem),
        [
            "unit" => $it["satuan"],
            "children" => [],
            "nkoOverride" => buildNkoOverride($it["id"], $overrideByItem),
        ]
    );

    foreach (($childrenByParent[$it["id"]] ?? []) as $child) {
        $childNode = array_merge(
            [
                "kode" => $child["kode"],
                "nama" => $child["nama"],
                "target" => $child["target_tahun"] !== null ? (float)$child["target_tahun"] : null,
            ],
            buildMonthFields($child["id"], $bulananByItem),
            [
                "unit" => $child["satuan"],
                "nkoOverride" => buildNkoOverride($child["id"], $overrideByItem),
            ]
        );
        $parentNode["children"][] = $childNode;
    }

    $result[] = $parentNode;
}

$meta = $pdo->query("SELECT updated_at FROM iku_meta WHERE id = 1")->fetch();

echo json_encode([
    "data" => $result,
    "updatedAt" => $meta["updated_at"],
]);
