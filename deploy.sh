#!/bin/bash
# ==========================================
# SALIRA Auto Deployment Script for aaPanel
# ==========================================

echo "🚀 Memulai proses deployment SALIRA..."

# 1. Pindah ke direktori utama
cd /www/wwwroot/dev.parkaw.my.id || exit

# 2. Menarik kode terbaru dari GitHub
echo "📥 Menarik kode terbaru (git pull)..."
git pull origin main

# 3. Menginstall dependensi PHP (Composer)
echo "📦 Memperbarui paket PHP..."
/www/server/php/83/bin/php /usr/bin/composer install --no-dev --optimize-autoloader

# 4. Menjalankan Migrasi Database
echo "🗄️ Menjalankan migrasi database..."
/www/server/php/83/bin/php artisan migrate --force

# 5. Menginstall dan Build Frontend (React/Vite)
echo "🎨 Membangun ulang aset frontend (Vite)..."
npm install --legacy-peer-deps
npm run build

# 6. Membersihkan Cache Laravel
echo "🧹 Membersihkan cache sistem..."
/www/server/php/83/bin/php artisan optimize:clear

# 7. Memperbarui dependensi WhatsApp Gateway
echo "📱 Memperbarui WhatsApp Gateway..."
cd whatsapp-gateway || exit
npm install
cd ..

# 8. Memperbaiki Hak Akses Folder (Penting untuk aaPanel)
echo "🔐 Menyesuaikan hak akses file..."
chown -R www:www /www/wwwroot/dev.parkaw.my.id/

echo "✅ DEPLOYMENT SELESAI SUKSES!"
echo "(Catatan: Jika ada pembaruan fitur pada WhatsApp Gateway, pastikan me-restart Node project di aaPanel)"
