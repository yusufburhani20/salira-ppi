#!/bin/bash
# ==========================================
# SALIRA Auto Deployment Script for aaPanel
# ==========================================

LOG_PREFIX="[$(date '+%H:%M:%S')]"
APP_DIR="/www/wwwroot/dev.parkaw.my.id"

echo "$LOG_PREFIX 🚀 Memulai proses deployment SALIRA..."

# 1. Pindah ke direktori utama
cd "$APP_DIR" || { echo "$LOG_PREFIX ❌ Gagal masuk ke direktori $APP_DIR"; exit 1; }

# 2. Menarik kode terbaru dari GitHub
# Mendukung repo privat via GITHUB_USER + GITHUB_TOKEN dari environment variable
echo "$LOG_PREFIX 📥 Menarik kode terbaru dari GitHub..."

if [ -n "$GITHUB_TOKEN" ] && [ -n "$GITHUB_USER" ]; then
    # Ambil URL repo dari remote origin saat ini
    REPO_URL=$(git remote get-url origin)

    # Ganti protokol menjadi https://USER:TOKEN@... agar bisa autentikasi
    # Contoh: https://github.com/user/repo.git → https://USER:TOKEN@github.com/user/repo.git
    AUTHED_URL=$(echo "$REPO_URL" | sed "s|https://|https://${GITHUB_USER}:${GITHUB_TOKEN}@|")
    git pull "$AUTHED_URL" main 2>&1
else
    # Jika tidak ada token, coba pull biasa (untuk repo publik atau SSH)
    git pull origin main 2>&1
fi

if [ $? -ne 0 ]; then
    echo "$LOG_PREFIX ❌ git pull GAGAL! Pastikan GITHUB_TOKEN & GITHUB_USER sudah diisi di .env"
    exit 1
fi

echo "$LOG_PREFIX ✅ git pull berhasil."

# 3. Menginstall dependensi PHP (Composer)
echo "$LOG_PREFIX 📦 Memperbarui paket PHP (composer install)..."
/www/server/php/83/bin/php /usr/bin/composer install --no-dev --optimize-autoloader --no-interaction 2>&1

# 4. Menjalankan Migrasi Database
echo "$LOG_PREFIX 🗄️  Menjalankan migrasi database..."
/www/server/php/83/bin/php artisan migrate --force 2>&1

# 5. Menginstall dan Build Frontend (React/Vite)
echo "$LOG_PREFIX 🎨 Membangun ulang aset frontend (Vite)..."
npm install --legacy-peer-deps 2>&1

# Gunakan path eksplisit agar tsc & vite ditemukan saat dijalankan sebagai background process
./node_modules/.bin/vite build 2>&1

# 6. Membersihkan Cache Laravel
echo "$LOG_PREFIX 🧹 Membersihkan cache sistem..."
/www/server/php/83/bin/php artisan optimize:clear 2>&1

echo "$LOG_PREFIX ✅ DEPLOYMENT SELESAI SUKSES!"
echo "[PROCESS_COMPLETED]"
