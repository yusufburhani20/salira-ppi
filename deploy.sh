#!/bin/bash
# ==========================================
# SALIRA Auto Deployment Script for aaPanel
# ==========================================

LOG_PREFIX="[$(date '+%H:%M:%S')]"
APP_DIR="$(cd "$(dirname "$0")" && pwd)"

# Fungsi untuk menangani error
die() {
    echo "$LOG_PREFIX ❌ ERROR: $1"
    echo "[PROCESS_FAILED]"
    exit 1
}

echo "$LOG_PREFIX 🚀 Memulai proses deployment SALIRA..."

# 1. Pindah ke direktori utama
cd "$APP_DIR" || die "Gagal masuk ke direktori $APP_DIR"

# 2. Menarik kode terbaru dari GitHub
# Mendukung repo privat via GITHUB_USER + GITHUB_TOKEN dari environment variable
echo "$LOG_PREFIX 📥 Menarik kode terbaru dari GitHub..."

# Buang perubahan lokal agar git pull tidak konflik
git checkout -- . 2>/dev/null || true
git clean -fd 2>/dev/null || true

if [ -n "$GITHUB_TOKEN" ] && [ -n "$GITHUB_USER" ]; then
    # Bersihkan whitespace dari variabel
    GITHUB_USER=$(echo "$GITHUB_USER" | tr -d '[:space:]')
    GITHUB_TOKEN=$(echo "$GITHUB_TOKEN" | tr -d '[:space:]')
    
    # Ambil URL repo dari remote origin saat ini
    REPO_URL=$(git remote get-url origin)

    # Ekstrak domain dan path repo (hapus https:// dan kredensial lama jika ada)
    CLEAN_PATH=$(echo "$REPO_URL" | sed -E 's|https://([^@]+@)?github.com/||' | tr -d '[:space:]')
    
    # Hapus trailing slash jika ada
    CLEAN_PATH=${CLEAN_PATH%/}

    # Bentuk URL baru yang bersih dengan kredensial
    AUTHED_URL="https://${GITHUB_USER}:${GITHUB_TOKEN}@github.com/${CLEAN_PATH}"
    
    # Pull dengan URL yang sudah di-autentikasi
    git pull "$AUTHED_URL" main 2>&1
else
    # Jika tidak ada token, coba pull biasa (untuk repo publik atau SSH)
    git pull origin main 2>&1
fi

if [ $? -ne 0 ]; then
    die "git pull GAGAL! Pastikan Kredensial GitHub sudah diisi dengan benar di Pengaturan."
fi

echo "$LOG_PREFIX ✅ git pull berhasil."

# Fix kepemilikan file agar user www bisa membaca/menulis (cegah EACCES)
chown -R www:www "$APP_DIR" 2>/dev/null || true

# 3. Menginstall dependensi PHP (Composer)
echo "$LOG_PREFIX 📦 Memperbarui paket PHP (composer install)..."
/www/server/php/83/bin/php /usr/bin/composer install --no-dev --optimize-autoloader --no-interaction 2>&1 || die "Gagal memperbarui dependensi PHP (Composer)"

# 4. Menjalankan Migrasi Database
echo "$LOG_PREFIX 🗄️  Menjalankan migrasi database..."
/www/server/php/83/bin/php artisan migrate --force 2>&1 || die "Gagal menjalankan migrasi database"

# 5. Menginstall dan Build Frontend (React/Vite)
echo "$LOG_PREFIX 🎨 Membangun ulang aset frontend (Vite)..."
npm install --legacy-peer-deps 2>&1 || die "Gagal menginstall dependensi frontend (NPM)"

# Fix permission folder build agar Vite bisa menghapus file lama (cegah EACCES)
rm -rf "$APP_DIR/public/build" 2>/dev/null || true
mkdir -p "$APP_DIR/public/build"

# Gunakan path eksplisit agar vite ditemukan saat dijalankan sebagai background process
./node_modules/.bin/vite build 2>&1 || die "Gagal mem-build aset frontend (Vite)"

# 6. Membersihkan Cache Laravel
echo "$LOG_PREFIX 🧹 Membersihkan cache sistem..."
/www/server/php/83/bin/php artisan optimize:clear 2>&1

echo "$LOG_PREFIX ✅ DEPLOYMENT SELESAI SUKSES!"
echo "[PROCESS_COMPLETED]"
