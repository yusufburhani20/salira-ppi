<div align="center">

<img src="public/images/Salira.png" alt="SALIRA Logo" width="80" />

# SALIRA

**Sistem Absensi, Logistik, Inventaris & Rekapitulasi Akademik**

Sistem informasi manajemen sekolah terintegrasi — dari presensi hingga laporan akademik, semua dalam satu platform.

[![PHP](https://img.shields.io/badge/PHP-8.3-777BB4?style=flat-square&logo=php&logoColor=white)](https://php.net)
[![Laravel](https://img.shields.io/badge/Laravel-13-FF2D20?style=flat-square&logo=laravel&logoColor=white)](https://laravel.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://typescriptlang.org)
[![Inertia.js](https://img.shields.io/badge/Inertia.js-2-9553E9?style=flat-square)](https://inertiajs.com)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

[📘 Panduan Penggunaan](PANDUAN.md) · [🌐 Demo](#) · [🐛 Laporkan Bug](https://github.com/yusufburhani20/Salira/issues)

</div>

---

## 📋 Daftar Isi

- [Tentang Proyek](#-tentang-proyek)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Persyaratan Sistem](#-persyaratan-sistem)
- [Instalasi](#-instalasi)
- [Konfigurasi Lingkungan](#-konfigurasi-lingkungan)
- [Akun Default](#-akun-default)
- [Peran Pengguna](#-peran-pengguna)
- [Panduan Penggunaan](#-panduan-penggunaan)
- [Lisensi](#-lisensi)

---

## 🏫 Tentang Proyek

**SALIRA** adalah aplikasi web manajemen sekolah berbasis modern yang dirancang untuk menyederhanakan dan mengintegrasikan seluruh proses operasional sekolah. Dibangun dengan Laravel 13 di sisi backend dan React (TypeScript) + Inertia.js di sisi frontend, SALIRA menyediakan pengalaman yang cepat dan responsif tanpa kompleksitas SPA tradisional.

Sistem ini mendukung beberapa peran pengguna dengan akses yang berbeda-beda, mulai dari Super Admin, Kepala Sekolah, Guru, Wali Kelas, Staff/TU, Bendahara, hingga Portal khusus Siswa.

---

## ✨ Fitur Utama

| Modul | Fitur |
|-------|-------|
| 📍 **Presensi** | Check-in/out pegawai berbasis GPS & Geofence, kiosk barcode siswa |
| 📚 **KBM & Akademik** | Jurnal mengajar, asesmen harian, ASAS & ASAT, bimbingan siswa |
| 📊 **Rekapitulasi** | Laporan absensi, penilaian, agenda, bimbingan — export PDF & Excel |
| 📦 **Inventaris** | Manajemen barang, barcode scanner, log transaksi |
| 💰 **Keuangan** | Tagihan SPP + pembayaran Midtrans, pengeluaran, analitik keuangan |
| 💬 **Notifikasi** | Pesan WhatsApp otomatis ke orang tua & guru |
| 🧑‍🎓 **Portal Siswa** | Nilai, absensi, tagihan, izin, kartu identitas digital |
| 👥 **Multi-Role** | 6 peran pengguna dengan akses yang terdefinisi |
| 🌙 **Dark Mode** | Tampilan dark/light mode dengan toggle |

---

## 🛠 Tech Stack

**Backend**
- [PHP 8.3](https://php.net) + [Laravel 13](https://laravel.com)
- [Spatie Laravel Permission](https://spatie.be/docs/laravel-permission) — Role & Permission
- [Laravel Excel (Maatwebsite)](https://laravel-excel.com) — Export/Import Excel
- [Laravel DomPDF](https://github.com/barryvdh/laravel-dompdf) — Generate PDF
- [Inertia.js](https://inertiajs.com) — SPA tanpa API

**Frontend**
- [React 18](https://react.dev) + [TypeScript 5](https://typescriptlang.org)
- [Tailwind CSS 3](https://tailwindcss.com)
- [Vite 8](https://vitejs.dev) — Build tool
- [Recharts](https://recharts.org) — Visualisasi data
- [html5-qrcode](https://github.com/mebjas/html5-qrcode) — Scanner barcode/QR

**Integrasi**
- [Midtrans](https://midtrans.com) — Payment gateway
- WhatsApp Gateway — Notifikasi pesan

---

## 💻 Persyaratan Sistem

| Komponen | Versi Minimum |
|----------|--------------|
| PHP | 8.3 |
| Composer | 2.x |
| Node.js | 20.x |
| NPM | 10.x |
| Database | SQLite (default) / MySQL 8 / PostgreSQL 14 |

---

## 🚀 Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/yusufburhani20/Salira.git
cd Salira
```

### 2. Install Dependensi PHP

```bash
composer install
```

### 3. Konfigurasi Environment

```bash
cp .env.example .env
php artisan key:generate
```

Lalu edit file `.env` sesuai konfigurasi lokal Anda (lihat bagian [Konfigurasi Lingkungan](#-konfigurasi-lingkungan)).

### 4. Siapkan Database

**Menggunakan SQLite (default, paling mudah):**
```bash
# File database sudah otomatis dibuat oleh Laravel
php artisan migrate --seed
```

**Menggunakan MySQL:**
```env
# Di .env, ubah:
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=salira
DB_USERNAME=root
DB_PASSWORD=your_password
```
```bash
php artisan migrate --seed
```

### 5. Install Dependensi Frontend

```bash
npm install
```

### 6. Build Assets

**Untuk development (dengan hot-reload):**
```bash
npm run dev
```

**Untuk production:**
```bash
npm run build
```

### 7. Jalankan Aplikasi

```bash
# Jalankan semua service sekaligus (server + queue + vite)
composer dev
```

Atau secara terpisah:
```bash
php artisan serve        # Web server (port 8000)
php artisan queue:listen # Queue worker (untuk notifikasi WA)
npm run dev              # Vite dev server
```

Akses aplikasi di: **http://localhost:8000**

---

## ⚙️ Konfigurasi Lingkungan

Berikut konfigurasi penting di file `.env`:

```env
# Aplikasi
APP_NAME="SALIRA"
APP_URL=http://localhost:8000

# Database (pilih salah satu)
DB_CONNECTION=sqlite
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=salira
# DB_USERNAME=root
# DB_PASSWORD=

# Midtrans (Payment Gateway)
MIDTRANS_SERVER_KEY=your_server_key
MIDTRANS_CLIENT_KEY=your_client_key
MIDTRANS_IS_PRODUCTION=false

# WhatsApp Gateway
WHATSAPP_GATEWAY_URL=http://localhost:3000
WHATSAPP_GATEWAY_TOKEN=your_token

# Queue (wajib untuk notifikasi)
QUEUE_CONNECTION=database
```

> **💡 Tip:** Jalankan `php artisan queue:listen` agar notifikasi WhatsApp dan email berfungsi.

---

## 👤 Akun Default

Setelah menjalankan `php artisan migrate --seed`, akun berikut tersedia:

| Role | Email | Password |
|------|-------|----------|
| **Super Admin** | `admin@salira.com` | `password` |
| **Kepala Sekolah** | `pimpinan@salira.com` | `password` |
| **Guru** | `guru@salira.com` | `password` |
| **Wali Kelas** | `walikelas@salira.com` | `password` |
| **Bendahara** | `bendahara@salira.com` | `password` |

> ⚠️ **Penting:** Segera ganti semua password default setelah instalasi di lingkungan produksi.

---

## 👥 Peran Pengguna

| Role | Akses |
|------|-------|
| **Super Admin** | Akses penuh — konfigurasi sistem, manajemen pengguna, semua modul |
| **Kepala Sekolah** | Dashboard pimpinan, rekapitulasi, rekap absensi, approval perizinan |
| **Staff/TU** | Data siswa, kelas, mata pelajaran, inventaris barang |
| **Bendahara** | Tagihan SPP, analitik keuangan, catat pengeluaran |
| **Guru** | Jurnal mengajar, asesmen harian & akhir (ASAS/ASAT), bimbingan siswa |
| **Wali Kelas** | Semua fitur Guru + laporan wali kelas & kirim laporan ke orang tua |

**Portal Siswa** tersedia di `/portal/login` — login menggunakan NIS.

---

## 📘 Panduan Penggunaan

Panduan lengkap tersedia dalam dua format:

| Format | Link | Keterangan |
|--------|------|-----------|
| 📄 Markdown | [PANDUAN.md](PANDUAN.md) | Dokumentasi teks, cocok untuk referensi cepat |
| 🌐 HTML | `/docs/panduan.html` | Panduan interaktif dengan dark mode, sidebar, dan pencarian |

Panduan mencakup instruksi detail untuk setiap peran pengguna:
- Cara login & navigasi
- Fitur per role (Super Admin → Siswa)
- Langkah-langkah penggunaan setiap modul
- FAQ & troubleshooting

---

## 📁 Struktur Direktori

```
salira/
├── app/
│   ├── Http/Controllers/     # Controller (Admin, Teacher, Portal, dll.)
│   ├── Models/               # Eloquent Models
│   ├── Services/             # Business logic services
│   └── Notifications/        # Notification classes (WA, Email)
├── database/
│   ├── migrations/           # Database migrations
│   └── seeders/              # Data seeder (roles, default users)
├── resources/
│   └── js/
│       ├── Pages/            # React pages (Admin, Teacher, Portal, User)
│       ├── Layouts/          # Layout components
│       └── Components/       # Shared components
├── routes/
│   └── web.php               # Semua routes aplikasi
├── public/
│   └── docs/panduan.html     # Panduan penggunaan HTML
├── PANDUAN.md                # Panduan penggunaan Markdown
└── .env.example              # Contoh konfigurasi environment
```

---

## 🤝 Kontribusi

Kontribusi sangat disambut! Silakan buka [Issue](https://github.com/yusufburhani20/Salira/issues) untuk melaporkan bug atau mengusulkan fitur baru.

1. Fork repository ini
2. Buat branch fitur: `git checkout -b feat/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur baru'`
4. Push ke branch: `git push origin feat/nama-fitur`
5. Buat Pull Request

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

<div align="center">

Dibuat dengan ❤️ untuk kemajuan pendidikan Indonesia

</div>
