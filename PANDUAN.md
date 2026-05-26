# 📘 Panduan Penggunaan SALIRA
### Sistem Absensi, Logistik, Inventaris & Rekapitulasi Akademik

> **Versi Dokumen:** 1.1 | **Terakhir diperbarui:** Mei 2026

---

## 📋 Daftar Isi

> [!TIP]
> Bagi administrator yang ingin memasang aplikasi ini di server VPS menggunakan **aaPanel**, silakan merujuk ke panduan khusus: **[🚀 Panduan Deployment aaPanel](DEPLOY_AAPANEL.md)**.

1. [Tentang SALIRA](#1-tentang-salira)
2. [Peran Pengguna (Role)](#2-peran-pengguna-role)
3. [Login & Akses Aplikasi](#3-login--akses-aplikasi)
4. [Super Admin](#4-super-admin)
5. [Kepala Sekolah](#5-kepala-sekolah)
6. [Staff / Tata Usaha](#6-staff--tata-usaha)
7. [Bendahara](#7-bendahara)
8. [Guru](#8-guru)
9. [Wali Kelas](#9-wali-kelas)
10. [Siswa — Portal Siswa](#10-siswa--portal-siswa)
11. [Fitur Umum](#11-fitur-umum)

---

## 1. Tentang SALIRA

**SALIRA** adalah sistem informasi manajemen sekolah yang terintegrasi, mencakup:

| Singkatan | Kepanjangan |
|-----------|-------------|
| **S** | Sistem Absensi |
| **A** | (integrasi) Akademik |
| **L** | Logistik & Inventaris |
| **I** | Inventaris Barang |
| **R** | Rekapitulasi |
| **A** | Akademik |

**Teknologi:** Laravel · React · Inertia.js · Tailwind CSS

**Fitur utama yang tersedia:**
- ✅ Presensi pegawai via GPS/Geofence
- ✅ Manajemen akademik (kelas, mata pelajaran, tahun ajaran)
- ✅ Penilaian harian (Asesmen Harian) & akhir (ASAS & ASAT)
- ✅ Jurnal mengajar & agenda kelas
- ✅ Bimbingan/konsultasi siswa
- ✅ Manajemen inventaris + barcode scanner
- ✅ Keuangan (tagihan SPP, pengeluaran, laporan)
- ✅ Rekapitulasi & laporan (PDF & Excel)
- ✅ Notifikasi WhatsApp otomatis
- ✅ Portal khusus siswa

---

## 2. Peran Pengguna (Role)

SALIRA memiliki **6 role** untuk staf/guru, ditambah 1 akun khusus siswa:

| Role | Akses Utama |
|------|-------------|
| **Super Admin** | Akses penuh ke seluruh sistem |
| **Kepala Sekolah** | Dashboard pimpinan, rekapitulasi, absensi pegawai, approval perizinan |
| **Staff/TU** | Data siswa, kelas, mata pelajaran, inventaris |
| **Bendahara** | Tagihan SPP, keuangan, laporan keuangan |
| **Guru** | Jurnal mengajar, asesmen harian & akhir, bimbingan siswa |
| **Wali Kelas** | Semua fitur Guru + laporan wali kelas & kirim laporan ke orang tua |
| **Siswa** | Portal siswa (nilai, absensi, tagihan, izin) |

---

## 3. Login & Akses Aplikasi

### Staf & Guru (Sistem Utama)
1. Buka URL aplikasi utama sekolah
2. Masukkan **Email** dan **Password**
3. Klik tombol **Masuk**
4. Anda akan diarahkan ke **Dashboard** sesuai role masing-masing

### Siswa (Portal Siswa)
1. Buka URL portal siswa: `[URL-Aplikasi]/portal/login`
2. Masukkan **NIS** (Nomor Induk Siswa) dan **Password**
3. Klik **Masuk ke Portal**

> [!NOTE]
> Password default untuk akun baru adalah `password`. Segera ganti setelah login pertama melalui menu **Profil**.

---

## 4. Super Admin

Super Admin memiliki akses ke **seluruh** fitur sistem. Ini adalah akun tertinggi, biasanya dipegang oleh administrator IT sekolah.

### 4.1 Manajemen Pengguna
**Menu:** `Sistem & Pengaturan → Data Pengguna`

Kelola semua akun pengguna sistem (staf & guru):
- **Tambah pengguna** — isi nama, NIP, email, role, dan nomor WhatsApp
- **Edit pengguna** — ubah data atau reset password
- **Hapus pengguna** — hapus akun yang sudah tidak aktif
- **Import Excel** — tambah banyak pengguna sekaligus menggunakan template
- **Export** — unduh daftar seluruh pengguna

> [!IMPORTANT]
> Hanya **Super Admin** yang bisa mengelola akun pengguna. Pastikan nomor WhatsApp diisi dengan benar agar notifikasi otomatis berfungsi.

### 4.2 Pengaturan Sistem
**Menu:** `Sistem & Pengaturan → Pengaturan Umum`

- **Informasi Sekolah** — nama sekolah, logo, alamat
- **Update Sistem** — perbarui aplikasi ke versi terbaru
- **Log Update** — lihat riwayat pembaruan sistem

### 4.3 Notifikasi & WhatsApp Gateway
**Menu:** `Sistem & Pengaturan → Notifikasi & Gateway`

- **Status WhatsApp Gateway** — cek apakah gateway aktif/terhubung
- **Restart Gateway** — restart koneksi WhatsApp jika bermasalah
- **Matriks Notifikasi** — atur notifikasi apa saja yang dikirim ke siapa
- **Template Pesan** — ubah template teks pesan WhatsApp
- **Tes Kirim** — kirim pesan uji coba ke nomor tertentu

### 4.4 Lokasi Geofence (Area Presensi)
**Menu:** `Sistem & Pengaturan → Lokasi Geofence`

Atur zona lokasi yang diizinkan untuk presensi:
- **Tambah geofence** — beri nama, koordinat (latitude/longitude), dan radius (meter)
- **Aktifkan/nonaktifkan** geofence sesuai kebutuhan
- **Hapus** geofence yang tidak terpakai

### 4.5 Pengumuman
**Menu:** `Beranda → Pengumuman`

- **Buat pengumuman** — judul, isi, dan tentukan siapa penerimanya
- **Kelola pengumuman** — edit atau hapus pengumuman yang sudah ada

### 4.6 Tahun Ajaran & Semester
**Menu:** `Data Master → Tahun Ajaran`

- **Tambah tahun ajaran** — contoh: `2025/2026`
- **Aktifkan/nonaktifkan** tahun ajaran & semester
- Setiap tahun ajaran memiliki **2 semester** (Semester 1 & 2)

> [!CAUTION]
> Hanya boleh ada **satu tahun ajaran aktif** dan **satu semester aktif** pada satu waktu. Pastikan pengaturan ini benar sebelum memulai tahun ajaran baru.

### 4.7 Semua Fitur Staff/TU dan Bendahara
Super Admin juga memiliki akses ke semua fitur yang dimiliki oleh Staff/TU dan Bendahara (lihat bagian 6 dan 7).

---

## 5. Kepala Sekolah

### 5.1 Dashboard Pimpinan
**Menu:** `Dashboard → Dashboard Pimpinan` *(via Leader Dashboard)*

Tampilan ringkasan data sekolah secara real-time:
- Total siswa, guru, kelas aktif
- Statistik presensi hari ini
- Grafik kehadiran bulanan
- Ringkasan keuangan (tagihan & pengeluaran)

### 5.2 Rekapitulasi & Laporan
**Menu:** `KBM & Akademik → Rekapitulasi`

Kepala Sekolah dapat mengakses seluruh laporan:

| Laporan | Keterangan |
|---------|-----------|
| **Rekap Absensi** | Kehadiran pegawai per periode |
| **Rekap Absensi per Mapel** | Kehadiran siswa per mata pelajaran |
| **Rekap Penilaian** | Nilai harian siswa per kelas/mapel |
| **Rekap Agenda** | Jurnal mengajar guru |
| **Rekap Bimbingan** | Catatan konsultasi siswa |
| **Resume Siswa** | Laporan lengkap perkembangan siswa |

Setiap laporan bisa:
- **Difilter** berdasarkan kelas, mata pelajaran, dan periode
- **Diekspor ke Excel** (`.xlsx`)
- **Diekspor ke PDF**

### 5.3 Rekap Absensi Pegawai
**Menu:** `Kepegawaian → Rekap Absensi Pegawai`

- Lihat rekap presensi seluruh staf & guru
- Filter berdasarkan tanggal atau bulan
- Export ke Excel atau PDF

### 5.4 Approval Perizinan
**Menu:** `Kepegawaian → Approval Perizinan`

Setujui atau tolak pengajuan izin dari staf/guru:
1. Buka menu **Approval Perizinan**
2. Lihat daftar pengajuan yang **Menunggu**
3. Klik **Setujui** atau **Tolak**
4. Tambahkan catatan jika diperlukan

---

## 6. Staff / Tata Usaha

### 6.1 Data Siswa
**Menu:** `Data Master → Data Siswa`

#### Menambah Siswa Satu per Satu
1. Klik tombol **+ Tambah Siswa**
2. Isi data: Nama, NIS, NISN, tanggal lahir, jenis kelamin, kelas, nomor WhatsApp orang tua
3. Klik **Simpan**

#### Import Siswa dari Excel
1. Unduh terlebih dahulu **template Excel** (tombol "Download Template")
2. Isi data siswa sesuai format template
3. Klik **Import** → pilih file Excel yang sudah diisi
4. Sistem akan memproses dan menampilkan hasil import

#### Export Data Siswa
- Klik tombol **Export Excel** untuk mengunduh daftar seluruh siswa

#### Cetak Kartu Siswa
- Pilih kelas → klik **Cetak Kartu** untuk mencetak kartu identitas seluruh siswa di kelas tersebut

### 6.2 Manajemen Kelas
**Menu:** `Data Master → Data Kelas`

- **Tambah kelas** — nama kelas, tingkat, wali kelas
- **Edit kelas** — ubah informasi atau ganti wali kelas
- **Hapus kelas** — hapus kelas yang sudah tidak aktif
- **Import/Export** kelas menggunakan Excel

### 6.3 Mata Pelajaran
**Menu:** `Data Master → Mata Pelajaran`

- **Tambah mata pelajaran** — nama, kode mapel, guru pengampu
- **Edit / Hapus** mata pelajaran
- **Import/Export** via Excel

### 6.4 Inventaris Barang
**Menu:** `Sarpras & Inventaris → Kelola Barang`

#### Melihat Daftar Inventaris
- Tampilkan semua barang beserta status (tersedia, dipinjam, rusak, dll.)
- Filter berdasarkan kategori atau status
- Export ke **Excel** atau **PDF**

#### Menambah Barang
1. Klik **+ Tambah Barang**
2. Isi nama, kategori, jumlah, kondisi, dan keterangan
3. Klik **Simpan**

#### Menambah Barcode
1. Buka detail barang
2. Scroll ke bagian **Barcode**
3. Klik **Tambah Barcode** → sistem akan generate kode unik

#### Scanner Barcode
**Menu:** `Sarpras & Inventaris → Scanner Barcode`
1. Arahkan kamera ke barcode barang
2. Pilih aksi: **Pinjam**, **Kembalikan**, atau **Catat Keluar**
3. Klik **Proses**

#### Log Transaksi Inventaris
**Menu:** `Sarpras & Inventaris → Log Transaksi`

Lihat riwayat seluruh aktivitas peminjaman dan pengembalian barang.

---

## 7. Bendahara

### 7.1 Tagihan Siswa (SPP)
**Menu:** `Keuangan & Administrasi → Manajemen Tagihan (SPP)`

#### Melihat Daftar Tagihan
- Lihat semua tagihan beserta status (Lunas, Belum Bayar, Kadaluarsa)
- Filter berdasarkan kelas atau status pembayaran

#### Membuat Tagihan Baru
1. Klik **+ Buat Tagihan**
2. Pilih **siswa** yang akan ditagih (bisa satu atau semua kelas)
3. Isi **nama tagihan**, **jumlah**, dan **batas waktu pembayaran**
4. Klik **Buat Tagihan**
5. Sistem akan otomatis mengirim notifikasi WhatsApp ke orang tua siswa (jika diaktifkan)

#### Tandai Lunas Manual
Untuk pembayaran tunai (di luar Midtrans):
1. Temukan tagihan yang bersangkutan
2. Klik **Tandai Lunas**
3. Konfirmasi tindakan

#### Sinkronisasi Status Pembayaran
Klik **Sync Status** untuk memperbarui status pembayaran dari gateway Midtrans.

### 7.2 Analitik Keuangan
**Menu:** `Keuangan & Administrasi → Analitik Keuangan`

- Grafik pemasukan vs pengeluaran
- Ringkasan per kategori
- Saldo bersih

### 7.3 Catat Pengeluaran
**Menu:** `Keuangan & Administrasi → Catat Pengeluaran`

1. Klik **+ Tambah Pengeluaran**
2. Isi tanggal, kategori, jumlah, dan keterangan
3. Klik **Simpan**

### 7.4 Kategori Keuangan
**Menu:** `Keuangan & Administrasi → Kategori Keuangan`

- Tambah, edit, atau hapus kategori pengeluaran

---

## 8. Guru

### 8.1 Presensi Mandiri (Check-In / Check-Out)
**Menu:** `Kepegawaian → Presensi Pegawai`

> [!IMPORTANT]
> Presensi menggunakan **GPS**. Pastikan lokasi GPS aktif di perangkat Anda dan Anda berada dalam zona geofence yang telah ditetapkan.

**Cara Check-In:**
1. Buka halaman **Presensi Pegawai**
2. Izinkan akses lokasi di browser
3. Klik **Check In**
4. Sistem akan memverifikasi lokasi Anda
5. Jika berhasil, status presensi akan berubah menjadi **Hadir**

**Cara Check-Out:**
1. Di halaman yang sama, klik **Check Out**
2. Konfirmasi keluaran

### 8.2 Jurnal Mengajar
**Menu:** `KBM & Akademik → Jurnal Mengajar`

#### Membuat Jurnal Baru
1. Klik **+ Buat Agenda**
2. Pilih **kelas** dan **mata pelajaran**
3. Isi **tanggal**, **jam**, **topik/materi yang diajarkan**
4. Isi **kehadiran siswa** — centang siswa yang **Hadir** / tandai yang Tidak Hadir, Izin, atau Sakit
5. Klik **Simpan**

#### Mengedit Jurnal
1. Di daftar jurnal, klik ikon **Edit** pada agenda yang ingin diubah
2. Lakukan perubahan yang diperlukan
3. Klik **Perbarui**

#### Export Jurnal
- **Excel** — klik tombol "Export Excel"
- **PDF** — klik tombol "Export PDF"

### 8.3 Asesmen Harian
**Menu:** `KBM & Akademik → Asesmen Harian`

#### Membuat Asesmen Baru
1. Klik **+ Buat Penilaian**
2. Pilih **kelas**, **mata pelajaran**, dan **tanggal**
3. Tentukan **jenis penilaian** (Tugas, Kuis, Praktik, dll.)
4. Masukkan **nilai** untuk setiap siswa
5. Klik **Simpan**

#### Export Asesmen
- Export ke **Excel** atau **PDF** untuk keperluan pelaporan

### 8.4 Asesmen Akhir (ASAS & ASAT)
**Menu:** `KBM & Akademik → Asesmen Akhir (ASAS/ASAT)`

Digunakan untuk memasukkan nilai **Asesmen Sumatif Akhir Semester (ASAS)** dan **Asesmen Sumatif Akhir Tahun (ASAT)**:

1. Klik **+ Buat Penilaian Akhir**
2. Pilih **kelas** dan **mata pelajaran**
3. Tentukan **jenis** (ASAS / ASAT) dan **semester**
4. Masukkan nilai untuk setiap siswa
5. Klik **Simpan**

### 8.5 Bimbingan Siswa
**Menu:** `KBM & Akademik → Bimbingan Siswa`

#### Mencatat Bimbingan
1. Klik **+ Tambah Catatan Bimbingan**
2. Pilih **kelas** dan **siswa** yang dibimbing
3. Isi **tanggal**, **topik bimbingan**, dan **catatan hasil bimbingan**
4. Klik **Simpan**

#### Export Bimbingan
- Export ke Excel atau PDF

### 8.6 Pengajuan Izin
**Menu:** `Kepegawaian → Pengajuan Izin`

1. Klik **+ Ajukan Izin**
2. Pilih **jenis izin** (Sakit, Izin, Cuti, dll.)
3. Isi **tanggal mulai**, **tanggal selesai**, dan **alasan**
4. Lampirkan **dokumen pendukung** jika ada (surat dokter, dll.)
5. Klik **Ajukan**
6. Tunggu persetujuan dari **Kepala Sekolah**

---

## 9. Wali Kelas

Wali Kelas memiliki **semua akses Guru** ditambah fitur khusus berikut:

### 9.1 Laporan Wali Kelas
**Menu:** `KBM & Akademik → Laporan Wali Kelas`

Lihat daftar lengkap siswa di kelas yang diampu:
- Klik nama siswa untuk melihat **resume/profil lengkap**

### 9.2 Resume Siswa
**Menu:** `KBM & Akademik → Laporan Wali Kelas → [Nama Siswa] → Resume`

Tampilkan rekap perkembangan siswa secara menyeluruh:
- **Absensi** — total hadir, tidak hadir, izin, sakit per periode
- **Nilai Harian** — ringkasan nilai per mata pelajaran
- **Nilai Akhir (ASAS/ASAT)** — nilai asesmen akhir semester/tahun
- **Catatan Bimbingan** — riwayat konsultasi

#### Download Resume PDF
- Di halaman resume siswa, klik **Download PDF**

### 9.3 Kirim Laporan ke Orang Tua
**Menu:** `KBM & Akademik → Laporan Wali Kelas`

#### Kirim Laporan Satu Siswa
1. Klik **Kirim Laporan** di samping nama siswa
2. Sistem akan mengirim laporan via **WhatsApp** ke nomor orang tua
3. Konfirmasi pengiriman

#### Kirim Laporan Massal
1. Klik tombol **Kirim Semua Laporan**
2. Konfirmasi — sistem akan mengirim laporan ke **semua orang tua** siswa di kelas

> [!NOTE]
> Pengiriman laporan membutuhkan nomor WhatsApp orang tua yang sudah diisi di data siswa, dan WhatsApp Gateway dalam kondisi aktif.

---

## 10. Siswa — Portal Siswa

Portal siswa dapat diakses di URL khusus: `[URL-Aplikasi]/portal/login`

### 10.1 Login Portal

1. Masukkan **NIS** (Nomor Induk Siswa)
2. Masukkan **Password**
3. Klik **Masuk**

### 10.2 Dashboard Siswa

Tampilan awal setelah login menampilkan:
- Ringkasan status kehadiran hari ini
- Tagihan yang belum dibayar
- Notifikasi terbaru
- Pengumuman sekolah

### 10.3 Presensi Siswa (Kiosk Mode)

Presensi siswa dilakukan melalui **Scanner Kehadiran** yang tersedia di `/portal/attendance/scanner`:

> [!NOTE]
> Halaman scanner ini adalah **mode kiosk** — dapat diakses tanpa login. Biasanya dipasang di layar komputer/tablet di pintu masuk sekolah.

1. Tampilkan barcode/QR kartu siswa ke kamera
2. Sistem akan langsung mencatat kehadiran
3. Konfirmasi kehadiran tampil di layar

### 10.4 Melihat Data Absensi
**Menu Portal:** `Absensi`

- Lihat rekap kehadiran per bulan
- Status: Hadir, Tidak Hadir, Izin, Sakit
- Grafik kehadiran visual

### 10.5 Melihat Nilai
**Menu Portal:** `Nilai`

- Nilai harian per mata pelajaran
- Nilai akhir semester (ASAS/ASAT)

### 10.6 Tagihan & Pembayaran
**Menu Portal:** `Tagihan`

- Lihat semua tagihan beserta status (Lunas / Belum Bayar)
- Klik **Bayar Sekarang** untuk melakukan pembayaran online via **Midtrans**
- Setelah pembayaran berhasil, invoice dapat diunduh

#### Pembayaran via Link Invoice (WhatsApp)
1. Buka link invoice yang dikirim via WhatsApp
2. Klik **Bayar Sekarang**
3. Pilih metode pembayaran (Transfer Bank, GoPay, OVO, QRIS, dll.)
4. Selesaikan pembayaran sesuai instruksi

### 10.7 Pengajuan Izin
**Menu Portal:** `Izin`

Siswa dapat mengajukan izin tidak hadir:
1. Klik **+ Ajukan Izin**
2. Pilih **jenis izin** (Sakit / Izin)
3. Isi **tanggal** dan **alasan**
4. Klik **Ajukan**

Pengajuan izin akan diproses oleh admin/wali kelas.

### 10.8 Kartu Identitas Digital
**Menu Portal:** `Kartu Siswa`

- Tampilkan kartu identitas digital siswa
- Berisi foto, nama, NIS, kelas, dan barcode

### 10.9 Laporan
**Menu Portal:** `Laporan`

- Unduh laporan perkembangan siswa dalam format PDF (dikirim oleh Wali Kelas)

### 10.10 Notifikasi
**Menu Portal:** `Notifikasi`

- Lihat semua notifikasi yang diterima (tagihan baru, pengumuman, dll.)
- Tandai sebagai **sudah dibaca**

### 10.11 Edit Profil
**Menu Portal:** `Profil`

- Ubah foto profil
- Perbarui data pribadi
- Ganti password

---

## 11. Fitur Umum

Fitur-fitur berikut tersedia untuk **semua pengguna** (staf & guru):

### 11.1 Notifikasi Sistem
**Menu:** Ikon lonceng 🔔 di navbar

- Tampilkan semua notifikasi masuk
- Klik notifikasi untuk diarahkan ke halaman terkait
- **Tandai semua sebagai dibaca** sekaligus

### 11.2 Edit Profil
**Menu:** Klik nama/foto di pojok kanan atas → **Profil**

- Ubah **nama**, **email**, **foto profil**
- Ganti **password**
- Pastikan nomor WhatsApp diperbarui agar notifikasi diterima

### 11.3 Presensi Mandiri (Staf & Guru)
**Menu:** `Kepegawaian → Presensi Pegawai`

Setiap staf & guru melakukan presensi mandiri via GPS:
- **Check In** saat tiba di sekolah
- **Check Out** saat meninggalkan sekolah

> [!WARNING]
> Presensi hanya bisa dilakukan jika berada dalam **zona geofence** yang telah ditentukan oleh Super Admin. Jika gagal, hubungi Admin untuk memverifikasi pengaturan geofence.

---

## ❓ Pertanyaan Umum (FAQ)

**Q: Saya lupa password, apa yang harus dilakukan?**
> Hubungi **Super Admin** untuk mereset password Anda.

**Q: Mengapa presensi saya gagal (error lokasi)?**
> Pastikan GPS aktif di perangkat, izin lokasi diberikan ke browser, dan Anda berada dalam area yang telah terdaftar sebagai geofence.

**Q: Notifikasi WhatsApp tidak masuk?**
> Pastikan nomor WhatsApp terdaftar dengan benar di profil. Jika sudah benar, minta Super Admin memeriksa status di menu **Notifikasi & Gateway**.

**Q: Bagaimana cara membayar tagihan jika tidak ada internet?**
> Pembayaran tunai dapat dilaporkan ke **Bendahara** untuk ditandai lunas secara manual di sistem.

**Q: Apakah laporan bisa dikirim ulang ke orang tua?**
> Ya, Wali Kelas dapat mengirim ulang laporan kapan saja melalui menu **Laporan Wali Kelas**.

**Q: Bagaimana cara mengganti tahun ajaran aktif?**
> Hanya **Super Admin** yang bisa mengganti tahun ajaran aktif melalui menu **Data Master → Tahun Ajaran**. Pastikan hanya ada satu tahun ajaran dan satu semester yang aktif.

---

*Dokumen ini dibuat berdasarkan analisis kode sumber aplikasi SALIRA v1.1.*
*Untuk pertanyaan atau koreksi, hubungi tim pengembang.*
