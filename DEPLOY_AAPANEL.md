# 🚀 Panduan Deployment SALIRA di aaPanel

Dokumen ini menjelaskan langkah-langkah lengkap untuk melakukan instalasi dan konfigurasi **SALIRA** (Sistem Absensi, Logistik, Inventaris & Rekapitulasi Akademik) di VPS menggunakan **aaPanel**.

SALIRA menggunakan **Laravel 13** di backend dan **React + TypeScript + Vite** di frontend (via Inertia.js). Oleh karena itu, server membutuhkan konfigurasi khusus untuk PHP, Node.js, dan Nginx agar aplikasi dapat berjalan optimal.

---

## 📋 Daftar Isi
1. [Persiapan Server & Environment](#1-persiapan-server--environment)
2. [Menambahkan Website Baru](#2-menambahkan-website-baru)
3. [Clone Repository & Konfigurasi Git](#3-clone-repository--konfigurasi-git)
4. [Konfigurasi .env & Database](#4-konfigurasi-env--database)
5. [Konfigurasi URL Rewrite (Nginx)](#5-konfigurasi-url-rewrite-nginx)
6. [Eksekusi Instalasi & Build Assets](#6-eksekusi-instalasi--build-assets)
7. [Membuat Storage Symlink](#7-membuat-storage-symlink)
8. [Konfigurasi Cron Job & Queue (Supervisor)](#8-konfigurasi-cron-job--queue-supervisor)
9. [Otomatisasi Deployment Mendatang](#9-otomatisasi-deployment-mendatang)

---

## 1. Persiapan Server & Environment

Pastikan aaPanel Anda sudah terpasang stack **LNMP** (Nginx + MySQL + PHP). Berikut adalah paket yang harus diinstal melalui App Store aaPanel:

### A. Versi Software yang Direkomendasikan
*   **Nginx**: v1.22 atau v1.24 (Direkomendasikan dibanding Apache)
*   **MySQL**: v5.7 atau v8.0
*   **PHP**: **v8.3** (Sangat direkomendasikan untuk performa maksimal Laravel 13)
*   **Node.js Version Manager**: Install dari App Store aaPanel, lalu pasang **Node.js v20.x** (LTS) dan **NPM**.

### B. Konfigurasi PHP 8.3 di aaPanel
Laravel 13 membutuhkan beberapa konfigurasi PHP khusus di aaPanel:

1.  **Instal Ekstensi PHP**:
    *   Buka **App Store** -> Klik setting pada **PHP-8.3**.
    *   Masuk ke tab **Install extensions**.
    *   Pastikan ekstensi berikut terpasang:
        *   `fileinfo` (Wajib untuk upload berkas/media)
        *   `opcache` (Direkomendasikan untuk mempercepat eksekusi PHP)
        *   `redis` (Opsional, jika Anda menggunakan Redis untuk caching/queue)

2.  **Hapus Fungsi PHP yang Dinonaktifkan (Disable Functions)**:
    Secara default, aaPanel menonaktifkan beberapa fungsi PHP demi keamanan. Namun, Composer dan Laravel membutuhkan fungsi tersebut untuk berjalan.
    *   Buka setting **PHP-8.3** -> masuk ke tab **Disabled functions**.
    *   Cari dan **Hapus (Delete)** fungsi berikut dari daftar:
        *   `putenv`
        *   `proc_open`
        *   `proc_get_status`
        *   `shell_exec`
        *   `exec`
        *   `symlink`

3.  **Sesuaikan Limit Memori & Upload**:
    *   Masuk ke tab **Configuration**.
    *   Ubah `memory_limit` menjadi minimal `512M` (dibutuhkan saat proses build/composer).
    *   Ubah `upload_max_filesize` dan `post_max_size` menjadi `50M` (agar guru/admin bebas mengunggah dokumen/rekap yang besar).
    *   Klik **Save** lalu **Restart** PHP-8.3.

---

## 2. Menambahkan Website Baru

1.  Masuk ke menu **Website** di sidebar aaPanel -> klik **Add site**.
2.  Isi konfigurasi sebagai berikut:
    *   **Domain**: Tulis domain Anda (contoh: `salira.sekolah.sch.id`).
    *   **Description**: `SALIRA Laravel + React App`
    *   **Directory**: `/www/wwwroot/Salira`
    *   **Database**: Pilih **MySQL** (isi nama database, username, dan password baru. Catat informasi ini untuk langkah `.env`).
    *   **PHP Version**: Pilih **PHP-83**.
    *   Klik **Submit**.

3.  **SANGAT PENTING: Pengaturan Site Directory & Keamanan**
    Setelah website dibuat, klik nama domain Anda untuk membuka **Website Settings**:
    *   Masuk ke tab **Site directory**.
    *   **Running directory**: Ubah dari `/` menjadi `/public` (klik **Save**). *Ini wajib karena Laravel hanya memperbolehkan akses publik melalui folder public.*
    *   **Anti-XSS attack (open_basedir)**: **HILANGKAN CENTANG** pada pilihan ini (klik **Save**). *Jika tetap dicentang, Laravel akan error 500 karena tidak bisa mengakses file di luar folder public.*

---

## 3. Clone Repository & Konfigurasi Git

1.  Masuk ke menu **Files** di aaPanel.
2.  Buka direktori `/www/wwwroot/`.
3.  Hapus semua file default bawaan aaPanel di dalam folder `/www/wwwroot/Salira` (seperti `index.html`, `.htaccess`, `404.html`) agar folder tersebut kosong.
4.  Buka **Terminal** di aaPanel (atau via SSH) lalu jalankan perintah berikut:
    ```bash
    # Masuk ke direktori webroot
    cd /www/wwwroot
    
    # Hapus folder Salira yang kosong tadi (opsional agar tidak konflik saat clone)
    rm -rf Salira
    
    # Clone repositori Anda (ganti dengan URL repo yang benar)
    git clone https://github.com/yusufburhani20/Salira.git Salira
    
    # Masuk ke folder project
    cd Salira
    ```
5.  Atur kepemilikan file agar Nginx (`www`) dapat membaca dan menulis:
    ```bash
    chown -R www:www /www/wwwroot/Salira
    chmod -R 775 /www/wwwroot/Salira/storage
    chmod -R 775 /www/wwwroot/Salira/bootstrap/cache
    ```

---

## 4. Konfigurasi .env & Database

1.  Di terminal, salin file konfigurasi lingkungan:
    ```bash
    cp .env.example .env
    ```
2.  Kembali ke menu **Files** di aaPanel, buka folder `/www/wwwroot/Salira`, lalu klik kanan pada file `.env` -> klik **Edit**.
3.  Sesuaikan pengaturan berikut:
    ```env
    APP_NAME="SALIRA"
    APP_ENV=production
    APP_DEBUG=false
    APP_URL=https://salira.sekolah.sch.id # Ganti dengan domain Anda

    DB_CONNECTION=mysql
    DB_HOST=127.0.0.1
    DB_PORT=3306
    DB_DATABASE=nama_database_anda # Sesuai dengan database yang dibuat di aaPanel
    DB_USERNAME=username_database  # Sesuai dengan database yang dibuat di aaPanel
    DB_PASSWORD=password_database  # Sesuai dengan database yang dibuat di aaPanel
    ```
4.  Jika Anda menggunakan fitur integrasi, isi juga kredensial untuk **Midtrans** dan **WhatsApp Gateway** di bagian bawah berkas `.env`.
5.  Klik **Save**.

---

## 5. Konfigurasi URL Rewrite (Nginx)

Agar Nginx mengalihkan seluruh permintaan (*request*) ke router Laravel (`index.php`), kita wajib mengatur URL rewrite:

1.  Masuk ke menu **Website** -> klik domain Anda -> pilih tab **URL rewrite**.
2.  Pilih template **laravel5** dari pilihan *dropdown*.
3.  Atau, jika Anda ingin menyalin manual, gunakan kode berikut:
    ```nginx
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }
    ```
4.  Klik **Save**.

---

## 6. Eksekusi Instalasi & Build Assets

Aplikasi SALIRA telah dilengkapi dengan skrip otomatisasi deployment bernama `deploy.sh` yang dirancang khusus untuk lingkungan aaPanel PHP 8.3.

1.  Buka **Terminal** di aaPanel / SSH.
2.  Masuk ke direktori aplikasi:
    ```bash
    cd /www/wwwroot/Salira
    ```
3.  Pastikan skrip memiliki izin eksekusi:
    ```bash
    chmod +x deploy.sh
    ```
4.  Jalankan skrip deployment:
    ```bash
    bash deploy.sh
    ```

### 🔍 Apa saja yang dilakukan skrip `deploy.sh` ini?
*   Melakukan `git pull` dari GitHub untuk memperbarui kode ke versi terbaru.
*   Mengatur kepemilikan file secara otomatis ke user `www:www` (menghindari error permission).
*   Menjalankan `composer install` menggunakan path biner PHP 8.3 resmi aaPanel (`/www/server/php/83/bin/php`).
*   Menjalankan migrasi database (`php artisan migrate --force`).
*   Menginstal dependensi NPM dan mem-build aset frontend (React/Vite) menggunakan konfigurasi produksi.
*   Membersihkan cache Laravel untuk memuat konfigurasi terbaru.

---

## 7. Membuat Storage Symlink

Laravel menyimpan berkas yang diunggah (seperti avatar guru, dokumen izin, atau template rekap) di folder `storage/app/public`. Agar folder ini dapat diakses secara publik oleh browser melalui internet, buatlah tautan simbolis (*symlink*):

1.  Di terminal Anda, jalankan perintah:
    ```bash
    /www/server/php/83/bin/php artisan storage:link
    ```
2.  Ini akan membuat folder shortcut bernama `storage` di dalam direktori `public/`.

---

## 8. Konfigurasi Cron Job & Queue (Supervisor)

Agar fitur notifikasi WhatsApp, pengiriman tagihan, dan penjadwalan otomatis di SALIRA dapat bekerja secara real-time di background, Anda wajib mengatur Cron Job dan Supervisor di aaPanel.

### A. Konfigurasi Cron Job (Task Scheduler)
Digunakan untuk mengeksekusi tugas-tugas terjadwal (misalnya pengiriman tagihan berkala):

1.  Masuk ke menu **Cron** di sidebar aaPanel.
2.  Isi formulir pembuatan tugas baru:
    *   **Type of Task**: `Shell Script`
    *   **Name of Task**: `SALIRA Schedule Run`
    *   **Execution cycle**: `N Minutes` (isi `1` menit sekali)
    *   **Script content**:
        ```bash
        cd /www/wwwroot/Salira && /www/server/php/83/bin/php artisan schedule:run >> /dev/null 2>&1
        ```
3.  Klik **Add Task**.

### B. Konfigurasi Queue Worker (Supervisor)
Digunakan agar pengiriman pesan WhatsApp tidak membuat halaman web lambat saat tombol diklik. Antrean pesan akan diproses di background.

1.  Buka **App Store** di aaPanel -> Cari **Supervisor Manager** -> Klik **Install**.
2.  Buka **Supervisor Manager** dari daftar aplikasi terpasang -> Klik **Add Daemon**.
3.  Isi formulir konfigurasi daemon baru:
    *   **Name**: `salira-worker`
    *   **Run User**: `www` (Sangat direkomendasikan agar hak akses file konsisten)
    *   **Run Dir**: `/www/wwwroot/Salira`
    *   **Start Command**: `/www/server/php/83/bin/php artisan queue:work --tries=3 --timeout=90`
    *   **Processes**: `1` (atau sesuaikan dengan kapasitas RAM VPS Anda)
4.  Klik **Confirm**.
5.  Pastikan status daemon menunjukkan lampu hijau dan bertuliskan **Running**.

---

## 9. Otomatisasi Deployment Mendatang

Setiap kali Anda selesai melakukan perubahan kode atau perbaikan di komputer lokal dan telah melakukan `git push` ke GitHub, Anda **tidak perlu mengulang seluruh langkah di atas**.

Anda hanya perlu masuk ke terminal VPS dan menjalankan satu baris perintah:

```bash
cd /www/wwwroot/Salira && bash deploy.sh
```

Seluruh proses penarikan kode terbaru, instalasi paket baru, migrasi database, dan kompilasi React/Vite akan berjalan otomatis dan aman tanpa downtime.

---

> [!NOTE]
> **Kredensial Default Login**:
> Setelah database dimigrasi dan di-seed (`php artisan migrate --force` atau `--seed`), Anda bisa masuk menggunakan akun bawaan yang tercantum di file [README.md](file:///d:/web/SALIRA/README.md#%F0%9F%94%91-akun-default) sesuai dengan peran yang diinginkan (Super Admin, Guru, Siswa, dll).
