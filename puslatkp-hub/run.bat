@echo off
title PUSLATKP Management Hub
cd /d "%~dp0"

echo ===================================================
echo   PUSLATKP Management Hub - Performance Portal
echo ===================================================
echo.

:: 1. Cari Node.js di Laragon jika belum ada di PATH
where node.exe >nul 2>&1
if %errorlevel% neq 0 (
    if exist "C:\laragon\bin\nodejs\node-v22.21.1-win-x64\node.exe" (
        set "PATH=C:\laragon\bin\nodejs\node-v22.21.1-win-x64;%PATH%"
        echo [INFO] Menggunakan Node.js dari Laragon (v22.21.1).
    ) else if exist "C:\laragon\bin\nodejs\node-v18\node.exe" (
        set "PATH=C:\laragon\bin\nodejs\node-v18;%PATH%"
        echo [INFO] Menggunakan Node.js dari Laragon (v18).
    ) else (
        echo [ERROR] Node.js tidak ditemukan di PATH maupun di C:\laragon\bin\nodejs.
        pause
        exit /b 1
    )
)

:: 2. Cek apakah node_modules sudah ada
if not exist "node_modules\" (
    echo [INFO] Menginstal dependensi pertama kali...
    call npm install --legacy-peer-deps
)

:: 3. Jalankan server Vite
echo [INFO] Memulai server Vite di http://localhost:5173/ ...
echo Tekan Ctrl+C untuk menghentikan server.
echo.
call npm run dev -- --open

pause
