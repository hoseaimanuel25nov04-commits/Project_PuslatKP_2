<?php
/**
 * Konfigurasi koneksi database — sesuaikan kalau setting Laragon-mu
 * beda dari default. Default Laragon: host=localhost, user=root,
 * password kosong.
 */

$DB_HOST = "localhost";
$DB_NAME = "dashboard_puslatkp";
$DB_USER = "root";
$DB_PASS = "";

// Password admin untuk endpoint yang menyimpan/mengubah data
// (harus sama dengan ADMIN_PASSWORD di file .jsx dashboard).
define("ADMIN_KEY", "111");

try {
    $pdo = new PDO(
        "mysql:host={$DB_HOST};dbname={$DB_NAME};charset=utf8mb4",
        $DB_USER,
        $DB_PASS,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    header("Content-Type: application/json");
    echo json_encode(["error" => "Gagal konek ke database: " . $e->getMessage()]);
    exit;
}

// Header umum — izinkan dipanggil dari file .jsx yang dibuka di mana saja
// (mis. Claude.ai artifact) selama diarahkan ke domain lokal Laragon-mu.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, X-Admin-Key");
header("Content-Type: application/json; charset=utf-8");

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(204);
    exit;
}

/** Cek apakah request menyertakan header admin yang valid (boolean) */
function checkAdmin() {
    $headers = getallheaders();
    $key = $headers["X-Admin-Key"] ?? $headers["x-admin-key"] ?? "";
    return hash_equals((string)ADMIN_KEY, (string)$key);
}

/** Cek header X-Admin-Key untuk endpoint yang butuh admin (exit jika gagal) */
function requireAdmin() {
    if (!checkAdmin()) {
        http_response_code(401);
        echo json_encode(["error" => "Password admin salah atau tidak dikirim."]);
        exit;
    }
}

/** Ambil body JSON request sebagai array asosiatif */
function readJsonBody() {
    $raw = file_get_contents("php://input");
    $data = json_decode($raw, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        http_response_code(400);
        echo json_encode(["error" => "Body JSON tidak valid."]);
        exit;
    }
    return $data;
}
