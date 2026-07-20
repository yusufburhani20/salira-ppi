#!/bin/bash
# ==========================================
# SALIRA Emergency Fix Script
# Paksa update public/build dari GitHub
# ==========================================

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR" || exit 1

echo "=== DIAGNOSTIK SERVER SALIRA ==="
echo ""
echo "1. Git status:"
git log --oneline -5
echo ""

echo "2. Current HEAD commit:"
git rev-parse HEAD
echo ""

echo "3. Remote origin latest commit:"
git ls-remote origin main 2>/dev/null
echo ""

echo "4. Isi public/build/:"
ls -la public/build/ 2>/dev/null || echo "public/build TIDAK ADA!"
echo ""

echo "5. Isi public/build/assets/ (20 file terbaru):"
ls -t public/build/assets/ 2>/dev/null | head -20 || echo "public/build/assets TIDAK ADA!"
echo ""

echo "6. Manifest.json (cek Events):"
cat public/build/manifest.json 2>/dev/null | grep -i "Index\|events" || echo "manifest.json TIDAK ADA!"
echo ""

echo "=== MULAI PAKSA UPDATE ==="

echo "Step 1: Fetch terbaru dari GitHub..."
git fetch origin main 2>&1

echo ""
echo "Step 2: Cek FETCH_HEAD commit:"
git rev-parse FETCH_HEAD 2>/dev/null

echo ""
echo "Step 3: Paksa reset ke commit GitHub terbaru..."
git reset --hard FETCH_HEAD 2>&1

echo ""
echo "Step 4: Verifikasi commit setelah reset:"
git log --oneline -3

echo ""
echo "Step 5: Cek apakah public/build sekarang ada:"
ls -la public/build/ 2>/dev/null || echo "public/build MASIH TIDAK ADA setelah reset!"

echo ""
echo "Step 6: Jumlah file di public/build/assets:"
ls public/build/assets/ 2>/dev/null | wc -l

echo ""
echo "Step 7: Clear all Laravel caches..."
/www/server/php/83/bin/php artisan optimize:clear 2>&1
/www/server/php/83/bin/php artisan view:clear 2>&1
/www/server/php/83/bin/php artisan route:clear 2>&1
/www/server/php/83/bin/php artisan config:clear 2>&1
/www/server/php/83/bin/php artisan cache:clear 2>&1

echo ""
echo "=== SELESAI ==="
echo "Salin output di atas dan kirim ke developer untuk analisis lebih lanjut."
