-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Waktu pembuatan: 20 Apr 2026 pada 11.19
-- Versi server: 10.11.10-MariaDB-log
-- Versi PHP: 8.3.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Basis data: `salirasmk`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `academic_classes`
--

CREATE TABLE `academic_classes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `academic_year_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `homeroom_teacher_id` bigint(20) UNSIGNED DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `academic_classes`
--

INSERT INTO `academic_classes` (`id`, `academic_year_id`, `name`, `homeroom_teacher_id`, `created_at`, `updated_at`) VALUES
(1, 1, 'XI TJKT', NULL, '2026-04-13 19:01:15', '2026-04-13 19:01:15'),
(2, 1, 'X TJKT 1', NULL, '2026-04-13 19:15:15', '2026-04-13 19:15:15'),
(3, 1, 'X TJKT 2', NULL, '2026-04-13 19:37:09', '2026-04-13 19:37:09');

-- --------------------------------------------------------

--
-- Struktur dari tabel `academic_class_subject`
--

CREATE TABLE `academic_class_subject` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `academic_class_id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `academic_class_subject`
--

INSERT INTO `academic_class_subject` (`id`, `academic_class_id`, `subject_id`, `created_at`, `updated_at`) VALUES
(1, 1, 7, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(2, 2, 8, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(3, 3, 8, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(4, 2, 9, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(5, 3, 9, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(6, 1, 10, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(7, 1, 11, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(8, 1, 12, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(9, 2, 13, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(10, 3, 13, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(11, 1, 14, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(12, 2, 15, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(13, 3, 15, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(14, 1, 16, '2026-04-18 14:33:45', '2026-04-18 14:33:45');

-- --------------------------------------------------------

--
-- Struktur dari tabel `academic_years`
--

CREATE TABLE `academic_years` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `academic_years`
--

INSERT INTO `academic_years` (`id`, `name`, `is_active`, `created_at`, `updated_at`) VALUES
(1, '2025/2026', 1, '2026-04-13 19:01:15', '2026-04-13 19:01:15');

-- --------------------------------------------------------

--
-- Struktur dari tabel `attendances`
--

CREATE TABLE `attendances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `status` enum('hadir','izin','sakit','alpha','terlambat','pulang_awal','lembur') NOT NULL,
  `device_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(255) DEFAULT NULL,
  `latitude` decimal(10,8) DEFAULT NULL,
  `longitude` decimal(11,8) DEFAULT NULL,
  `photo_path` varchar(255) DEFAULT NULL,
  `checkout_photo_path` varchar(255) DEFAULT NULL,
  `verification_status` enum('valid','pending','rejected','system_flagged') NOT NULL DEFAULT 'pending',
  `system_notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('salira-sistem-absensi-logistik-inventaris-rekapitulasi-akademik-cache-anwar.hidayat9@gmail.com|192.168.18.1', 'i:1;', 1776056580),
('salira-sistem-absensi-logistik-inventaris-rekapitulasi-akademik-cache-anwar.hidayat9@gmail.com|192.168.18.1:timer', 'i:1776056580;', 1776056580);

-- --------------------------------------------------------

--
-- Struktur dari tabel `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `class_agendas`
--

CREATE TABLE `class_agendas` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `schedule_id` bigint(20) UNSIGNED DEFAULT NULL,
  `academic_class_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `lesson_period` varchar(255) DEFAULT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `topic` varchar(255) NOT NULL,
  `activities` text NOT NULL,
  `student_tasks` text DEFAULT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'published',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `class_agendas`
--

INSERT INTO `class_agendas` (`id`, `schedule_id`, `academic_class_id`, `subject_id`, `subject`, `lesson_period`, `teacher_id`, `date`, `topic`, `activities`, `student_tasks`, `attachment_path`, `status`, `created_at`, `updated_at`) VALUES
(1, NULL, 2, 9, 'Pemrograman Web', '2-4', 4, '2026-04-18', 'Pengarahan', 'Motivasi dan Pengarahan', NULL, NULL, 'published', '2026-04-18 14:37:31', '2026-04-18 14:37:31'),
(2, NULL, 2, 8, 'Sistem Komputer', '8-9', 4, '2026-04-18', 'Sejarah Komputer', 'Merangkum sejarah komputer', NULL, NULL, 'published', '2026-04-18 14:38:56', '2026-04-18 14:38:56'),
(4, NULL, 1, 10, 'Perencanaan dan Pengalamatan Jaringan', '7-9', 4, '2026-04-19', 'GNS3', 'Perencanaan Jaringan', NULL, NULL, 'published', '2026-04-19 11:33:26', '2026-04-19 11:33:26'),
(5, NULL, 1, 7, 'Keamanan Jaringan', '5-7', 4, '2026-04-18', 'VPN', 'Konsep dan teori VPN', NULL, NULL, 'published', '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(6, NULL, 1, 12, 'Pemrograman Web Lanjutan', '3-6', 6, '2026-04-19', 'Looping & Function Javascript', 'Teori serta Praktik mengerjakan Looping 1-10 dan function membuat cek angka genap', NULL, NULL, 'published', '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(7, NULL, 3, 15, 'Design Grafis', '3-5', 9, '2026-04-20', 'Tata Letak', 'Penyampaian Materi dan Praktik', NULL, NULL, 'published', '2026-04-20 08:51:31', '2026-04-20 08:51:31');

-- --------------------------------------------------------

--
-- Struktur dari tabel `class_members`
--

CREATE TABLE `class_members` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `class_members`
--

INSERT INTO `class_members` (`id`, `class_id`, `student_id`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 1, 1, '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(2, 1, 13, 1, '2026-04-13 19:09:59', '2026-04-13 19:09:59'),
(3, 1, 11, 1, '2026-04-13 19:10:23', '2026-04-13 19:10:23'),
(4, 1, 8, 1, '2026-04-13 19:10:28', '2026-04-13 19:10:28'),
(5, 1, 4, 1, '2026-04-13 19:10:34', '2026-04-13 19:10:34'),
(6, 1, 14, 1, '2026-04-13 19:10:41', '2026-04-13 19:10:41'),
(7, 1, 16, 1, '2026-04-13 19:10:48', '2026-04-13 19:10:48'),
(8, 1, 2, 1, '2026-04-13 19:10:55', '2026-04-13 19:10:55'),
(9, 1, 12, 1, '2026-04-13 19:11:00', '2026-04-13 19:11:00'),
(10, 1, 3, 1, '2026-04-13 19:11:07', '2026-04-13 19:11:07'),
(11, 1, 5, 1, '2026-04-13 19:11:14', '2026-04-13 19:11:14'),
(12, 1, 7, 1, '2026-04-13 19:11:19', '2026-04-13 19:11:19'),
(13, 1, 6, 1, '2026-04-13 19:11:24', '2026-04-13 19:11:24'),
(14, 1, 15, 1, '2026-04-13 19:11:29', '2026-04-13 19:11:29'),
(15, 1, 10, 1, '2026-04-13 19:11:34', '2026-04-13 19:11:34'),
(16, 1, 9, 1, '2026-04-13 19:11:42', '2026-04-13 19:11:42'),
(17, 2, 17, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(18, 2, 18, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(19, 2, 19, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(20, 2, 20, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(21, 2, 21, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(22, 2, 22, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(23, 2, 23, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(24, 2, 24, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(25, 2, 25, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(26, 2, 26, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(27, 2, 27, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(28, 2, 28, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(29, 2, 29, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(30, 2, 30, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(31, 2, 31, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(33, 2, 33, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(34, 2, 34, 1, '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(35, 3, 35, 1, '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(36, 3, 36, 1, '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(37, 3, 37, 1, '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(38, 3, 38, 1, '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(39, 3, 39, 1, '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(40, 3, 40, 1, '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(41, 3, 41, 1, '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(42, 3, 42, 1, '2026-04-13 19:37:24', '2026-04-13 19:37:24');

-- --------------------------------------------------------

--
-- Struktur dari tabel `daily_assessments`
--

CREATE TABLE `daily_assessments` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `academic_class_id` bigint(20) UNSIGNED NOT NULL,
  `subject_id` bigint(20) UNSIGNED DEFAULT NULL,
  `subject` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `learning_objective` text DEFAULT NULL,
  `date` date NOT NULL,
  `max_score` int(11) NOT NULL DEFAULT 100,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `geofences`
--

CREATE TABLE `geofences` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `radius` int(11) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `work_start_time` time DEFAULT NULL,
  `work_end_time` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `inventory_barcodes`
--

CREATE TABLE `inventory_barcodes` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `barcode_value` varchar(255) NOT NULL,
  `serial_number` varchar(255) DEFAULT NULL,
  `condition` enum('baik','rusak_ringan','rusak_berat') NOT NULL DEFAULT 'baik',
  `status` enum('tersedia','dipinjam','perbaikan','dihapus') NOT NULL DEFAULT 'tersedia',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `inventory_categories`
--

CREATE TABLE `inventory_categories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `inventory_items`
--

CREATE TABLE `inventory_items` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `category_id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `total_quantity` int(11) NOT NULL,
  `unit_price` decimal(15,2) DEFAULT NULL,
  `condition` enum('baik','rusak_ringan','rusak_berat') NOT NULL,
  `status` enum('tersedia','dipinjam','perbaikan','dihapus') NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `inventory_logs`
--

CREATE TABLE `inventory_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `item_id` bigint(20) UNSIGNED NOT NULL,
  `barcode_id` bigint(20) UNSIGNED DEFAULT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `action` enum('masuk','keluar','pinjam','kembali','perbaikan','pemusnahan') NOT NULL,
  `quantity` int(11) NOT NULL,
  `notes` text DEFAULT NULL,
  `borrower_email` varchar(255) DEFAULT NULL,
  `expected_return_date` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `migrations`
--

CREATE TABLE `migrations` (
  `id` int(10) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_04_08_131645_create_academic_years_table', 1),
(5, '2026_04_08_131646_create_semesters_table', 1),
(6, '2026_04_08_131647_create_academic_classes_table', 1),
(7, '2026_04_08_131648_create_students_table', 1),
(8, '2026_04_08_131649_create_class_members_table', 1),
(9, '2026_04_08_131650_create_schedules_table', 1),
(10, '2026_04_08_131651_create_geofences_table', 1),
(11, '2026_04_08_131652_create_attendances_table', 1),
(12, '2026_04_08_131653_create_student_attendances_table', 1),
(13, '2026_04_08_131654_create_class_agendas_table', 1),
(14, '2026_04_08_131655_create_student_consultations_table', 1),
(15, '2026_04_08_131656_create_permission_requests_table', 1),
(16, '2026_04_08_131657_create_inventory_categories_table', 1),
(17, '2026_04_08_131658_create_inventory_items_table', 1),
(18, '2026_04_08_131659_create_inventory_barcodes_table', 1),
(19, '2026_04_08_131700_create_inventory_logs_table', 1),
(20, '2026_04_08_132355_create_permission_tables', 1),
(21, '2026_04_11_090000_add_checkout_photo_to_attendances', 1),
(22, '2026_04_11_092100_add_work_hours_to_geofences', 1),
(23, '2026_04_11_100000_update_attendance_status_enum', 1),
(24, '2026_04_11_172524_update_agenda_tables_for_manual_entry', 1),
(25, '2026_04_11_173545_merge_level_and_name_in_academic_classes', 1),
(26, '2026_04_11_181317_add_class_agenda_id_to_student_attendances', 1),
(27, '2026_04_12_051747_add_task_fields_to_permission_requests_table', 1),
(28, '2026_04_12_053156_create_daily_assessments_table', 1),
(29, '2026_04_12_053158_create_student_scores_table', 1),
(30, '2026_04_12_053902_add_learning_objective_to_daily_assessments_table', 1),
(31, '2026_04_12_060256_create_subjects_table', 1),
(32, '2026_04_12_060308_add_subject_id_to_related_tables', 1),
(33, '2026_04_12_073017_create_settings_table', 1),
(34, '2026_04_12_142123_add_borrow_fields_to_inventory_logs_table', 1),
(35, '2026_04_17_213121_create_academic_class_subject_table', 2);

-- --------------------------------------------------------

--
-- Struktur dari tabel `model_has_permissions`
--

CREATE TABLE `model_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `model_has_roles`
--

CREATE TABLE `model_has_roles` (
  `role_id` bigint(20) UNSIGNED NOT NULL,
  `model_type` varchar(255) NOT NULL,
  `model_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `model_has_roles`
--

INSERT INTO `model_has_roles` (`role_id`, `model_type`, `model_id`) VALUES
(1, 'App\\Models\\User', 1),
(2, 'App\\Models\\User', 2),
(3, 'App\\Models\\User', 5),
(4, 'App\\Models\\User', 4),
(4, 'App\\Models\\User', 6),
(4, 'App\\Models\\User', 8),
(4, 'App\\Models\\User', 9),
(4, 'App\\Models\\User', 10),
(4, 'App\\Models\\User', 11);

-- --------------------------------------------------------

--
-- Struktur dari tabel `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) NOT NULL,
  `token` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `permissions`
--

CREATE TABLE `permissions` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `permission_requests`
--

CREATE TABLE `permission_requests` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('sakit','izin','cuti','dispensasi') NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text NOT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `approved_by` bigint(20) UNSIGNED DEFAULT NULL,
  `approved_at` timestamp NULL DEFAULT NULL,
  `rejection_reason` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `task_description` text DEFAULT NULL,
  `task_file_path` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `roles`
--

CREATE TABLE `roles` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `guard_name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `roles`
--

INSERT INTO `roles` (`id`, `name`, `guard_name`, `created_at`, `updated_at`) VALUES
(1, 'Super Admin', 'web', '2026-04-13 09:19:35', '2026-04-13 09:19:35'),
(2, 'Pimpinan', 'web', '2026-04-13 09:19:35', '2026-04-13 09:19:35'),
(3, 'Admin', 'web', '2026-04-13 09:19:35', '2026-04-13 09:19:35'),
(4, 'Guru/Dosen', 'web', '2026-04-13 09:19:35', '2026-04-13 09:19:35'),
(5, 'Staff/TU', 'web', '2026-04-13 09:19:35', '2026-04-13 09:19:35');

-- --------------------------------------------------------

--
-- Struktur dari tabel `role_has_permissions`
--

CREATE TABLE `role_has_permissions` (
  `permission_id` bigint(20) UNSIGNED NOT NULL,
  `role_id` bigint(20) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `schedules`
--

CREATE TABLE `schedules` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `subject` varchar(255) NOT NULL,
  `day` enum('monday','tuesday','wednesday','thursday','friday','saturday','sunday') NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `semesters`
--

CREATE TABLE `semesters` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `academic_year_id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) NOT NULL,
  `user_id` bigint(20) UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `payload` longtext NOT NULL,
  `last_activity` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `sessions`
--

INSERT INTO `sessions` (`id`, `user_id`, `ip_address`, `user_agent`, `payload`, `last_activity`) VALUES
('E2hVqMTJc5pvIyZFzuZ2qzZuR7Uz0kFXuV8cBWj4', NULL, '192.168.18.1', 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Mobile Safari/537.36', 'eyJfdG9rZW4iOiJsZ2RDbmxBWVRIcWNUMFhjb2NZVTF3Y2t1eXNjbGZGeGh2OVRJNDBuIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHBzOlwvXC9zYWxpcmFzbWsuaWRyaXNpeXlhaC5zY2guaWQiLCJyb3V0ZSI6bnVsbH0sIl9mbGFzaCI6eyJvbGQiOltdLCJuZXciOltdfX0=', 1776649280),
('iWqu7uZvDnAirWA05mzaBXEusve8B63ZcLiG9MWk', NULL, '192.168.18.1', 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/120.0', 'eyJfdG9rZW4iOiJoaVRUYmt0eEJ6QVpaZXhEdXlSdFdYeWpQbE40QmRiRk5TTnlpSklTIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHBzOlwvXC9zYWxpcmFzbWsuaWRyaXNpeXlhaC5zY2guaWRcL2xvZ2luIiwicm91dGUiOiJsb2dpbiJ9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1776654402),
('pvl2U7sHNXoBlvqcZuJ3SSLJ1xwI741DbFu2SE3R', NULL, '192.168.18.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJnZ3o5ckttUGlnTm1EZkJCT2Z5QVY3YVJZZjFVZ3pqU0w5N0d5cTJiIiwiX2ZsYXNoIjp7Im9sZCI6W10sIm5ldyI6W119fQ==', 1776654883),
('QK7Pb4ckFEqlpYVUvwugnr0c7LdBjAAinu2ZQnA9', NULL, '192.168.18.1', 'python-requests/2.32.5', 'eyJfdG9rZW4iOiJvR1doNzVGaVNLRU9SNUhjQ2RCaVYzVTJHa3RDSzRvNkxvZzNPM3dlIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHBzOlwvXC9zYWxpcmFzbWsuaWRyaXNpeXlhaC5zY2guaWRcL2xvZ2luIiwicm91dGUiOiJsb2dpbiJ9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1776649187),
('XPJbaV7eWJvGJYNhpaisYYamiJJIKtErMtIRjzMg', 9, '192.168.18.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Safari/537.36', 'eyJfdG9rZW4iOiJIcmZsWnZiNHZkcDZHR3lwV3l4aWxOcVFXcTNDVklKUFRETEsyZldtIiwibG9naW5fd2ViXzU5YmEzNmFkZGMyYjJmOTQwMTU4MGYwMTRjN2Y1OGVhNGUzMDk4OWQiOjksIl9wcmV2aW91cyI6eyJ1cmwiOiJodHRwczpcL1wvc2FsaXJhc21rLmlkcmlzaXl5YWguc2NoLmlkXC9kYXNoYm9hcmQiLCJyb3V0ZSI6ImRhc2hib2FyZCJ9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19', 1776649891);

-- --------------------------------------------------------

--
-- Struktur dari tabel `settings`
--

CREATE TABLE `settings` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `key` varchar(255) NOT NULL,
  `value` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `settings`
--

INSERT INTO `settings` (`id`, `key`, `value`, `created_at`, `updated_at`) VALUES
(1, 'school_name', 'TJKT SMK Fadris', '2026-04-13 11:22:10', '2026-04-13 11:22:10'),
(2, 'school_logo', 'settings/ooewAfSmcWqPtenkjJKr6R336iwFVNddxWZdQZOi.png', '2026-04-13 11:22:10', '2026-04-13 11:22:10'),
(3, 'school_favicon', 'settings/lunQbJavBRuLq3fRGRWNQbdspbed0vuFqrhRgPzV.png', '2026-04-13 11:29:57', '2026-04-13 11:29:57');

-- --------------------------------------------------------

--
-- Struktur dari tabel `students`
--

CREATE TABLE `students` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `nisn` varchar(255) NOT NULL,
  `nis` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `gender` enum('L','P') NOT NULL,
  `birth_place` varchar(255) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `religion` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `parent_name` varchar(255) DEFAULT NULL,
  `parent_phone` varchar(255) DEFAULT NULL,
  `status` enum('active','graduated','transferred','dropped_out') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `students`
--

INSERT INTO `students` (`id`, `nisn`, `nis`, `name`, `gender`, `birth_place`, `birth_date`, `religion`, `address`, `phone`, `parent_name`, `parent_phone`, `status`, `created_at`, `updated_at`) VALUES
(1, '0084004327', '206324005', 'Fathan Dzahabi Ramadani', 'L', 'Tasikmalaya', NULL, NULL, NULL, NULL, 'Sandi Rukmawan (ALM)', '08975824990', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(2, '0083033020', '206324014', 'Sabilulhanif Almuhajir', 'L', 'Tasikmalaya', NULL, NULL, NULL, NULL, 'Jajang Jaohari', '082113996270', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(3, '0097945352', '206324013', 'Rangga Aditya Nurrahman', 'L', 'Bekasi', NULL, NULL, NULL, NULL, 'Dodo Ariono', '089605546748', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(4, '0093733525', '206324006', 'Gravis Alif', 'L', 'Purwakarta', NULL, NULL, NULL, NULL, 'Waluyo', '081297111393', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(5, '0084024154', '206324009', 'Muhammad Aji Prastio', 'L', 'Sidomulyo', NULL, NULL, NULL, NULL, 'Muhammad Priyambodo', '085783445042', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(6, '0086271552', '206324011', 'Nabil Ahmad Sanusi', 'L', 'Tasikmalaya', NULL, NULL, NULL, NULL, 'Dani Abdullah', '082113999002', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(7, '0092928317', '206324010', 'Muhammad Ridwan Al Qodri', 'L', 'Bandung Barat', NULL, NULL, NULL, NULL, 'Daden Kamal Sholihin', '083101090329', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(8, '0081850886', '206324004', 'Fajar Very Erlangga', 'L', 'Cimahi', NULL, NULL, NULL, NULL, 'Bubun burhani', '087753818707', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(9, '0082638753', '206324015', 'Sidi Mahfuzh', 'L', 'Depok', NULL, NULL, NULL, NULL, 'Dedi Sriyono', '087881512225', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(10, '0081186670', '206324012', 'Nurmalik', 'L', 'Bandung', NULL, NULL, NULL, NULL, 'Suherman', '081389524030', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(11, '0082624985', '206324002', 'Abdullah Sawaludin', 'L', 'Palembang', NULL, NULL, NULL, NULL, 'KALIM', '082317407398', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(12, '0081464790', '206324008', 'Mahfuddhin Mohammad Nasep', 'L', 'Tasikmalaya', NULL, NULL, NULL, NULL, 'Muhammad Nasep', '085223643581', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(13, '0094155115', '206324001', 'Abdul Hakim Akbar', 'L', 'Jakarta', NULL, NULL, NULL, NULL, 'Gun Gun Gunadi Hermawan', NULL, 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(14, '0082700847', '206324007', 'Iyas Abdul Fattah', 'L', 'Karawang', NULL, NULL, NULL, NULL, 'Solihudin', '081290279485', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(15, '0081783356', '206324017', 'Nuril Adzhim', 'L', 'Subang', NULL, NULL, NULL, NULL, 'Asep Deni, M.Pd', '081323277107', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(16, '0089621218', '206324016', 'M Arliban Akbar', 'L', 'Bandung', NULL, NULL, NULL, NULL, 'Adang Kadarusman, S.Pd', '085314066256', 'active', '2026-04-13 19:09:16', '2026-04-13 19:09:16'),
(17, '0101473857', '206325008', 'Kaesar Yusva Ramadhan', 'L', 'Karawang', NULL, NULL, NULL, NULL, 'Ade Rusmana', '08561259158', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(18, '0106668546', '206325022', 'Rafka Arsyad', 'L', 'Bandung', NULL, NULL, NULL, NULL, 'Suswanto', '088218480466', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(19, '0096674314', '206325002', 'Arland Fakhri Rezky', 'L', 'Purwakarta', NULL, NULL, NULL, NULL, 'Heri Nurdiansyah', '085284639224', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(20, '0107795874', '206325018', 'Muhammad Kholifatulfatta Naff', 'L', 'Bogor', NULL, NULL, NULL, NULL, 'Muhammad Naufal, S.Pd', '082118874493', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(21, '0102730153', '206325014', 'Muhamad Nasrul Pebriansah', 'L', 'Bogor', NULL, NULL, NULL, NULL, 'Naca sunarya', '08558541715', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(22, '0091624699', '206325005', 'Dzaki Roshan Hilmy Ramadhan', 'L', 'Cimahi', NULL, NULL, NULL, NULL, 'Diding Suardi', '082217373763', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(23, '0091421276', '206325007', 'Hamiduz Zulfa Arifin', 'L', 'Jakarta', NULL, NULL, NULL, NULL, 'Teguh Arifin', '081286197203', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(24, '3109705553', '206325019', 'Muhammad Maulana Wafi Faisyal Ridzwan', 'L', 'Tasikmalaya', NULL, NULL, NULL, NULL, 'Enang Syamsul Aripin', '82120220200', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(25, '0095485784', '206325011', 'Maulana Al Kaafi Ridwan', 'L', 'Tasikmalaya', NULL, NULL, NULL, NULL, 'Ridwan', '08122418474', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(26, '3104913722', '206325015', 'Muhammad Alfatih', 'L', 'Jakarta', NULL, NULL, NULL, NULL, 'Affan Sofwan', '081384364656', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(27, '3092292162', '206325016', 'Muhammad Azqa Faqihufiddin', 'L', 'Bandung', NULL, NULL, NULL, NULL, 'Abdurahman Arief', '081286739404', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(28, '0101944930', '206325017', 'Muhammad Haekal Rukmana', 'L', 'Purwakarta', NULL, NULL, NULL, NULL, 'Adi Rukmana', '081317071336', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(29, '0091090185', '206325004', 'Daffa Fajril Adha', 'L', 'Garut', NULL, NULL, NULL, NULL, 'Zulfahmi', '081323244844', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(30, '0107787324', '206325006', 'Fadilah Azzikra', 'L', 'Tanjung Agung', NULL, NULL, NULL, NULL, 'Muhammad nuh', '082116326188', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(31, '0099608792', '206325026', 'Sayidi Bahri', 'L', 'Tasikmalaya', NULL, NULL, NULL, NULL, 'Maman Surahmad', '082214303879', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(33, '0095708118', '206325013', 'Muhamad Irpani Baetuloh', 'L', 'Bekasi', NULL, NULL, NULL, NULL, 'Duding', '085813578006', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(34, '0097436014', '206325025', 'Salman Fariz Ismail', 'L', 'Tasikmalaya', NULL, NULL, NULL, NULL, 'Soleh Ismail', '082350986198', 'active', '2026-04-13 19:16:50', '2026-04-13 19:16:50'),
(35, '98812131', '206325001', 'Andina Siti Marfuah', 'P', '', NULL, NULL, NULL, NULL, '', NULL, 'active', '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(36, '105742390', '206325003', 'Asheeqa', 'P', '', NULL, NULL, NULL, NULL, '', NULL, 'active', '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(37, '105937352', '206325009', 'Keysha Apriliani Ramdani', 'P', '', NULL, NULL, NULL, NULL, '', NULL, 'active', '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(38, '3108186242', '206325010', 'Khairani Noor Rohmah', 'P', '', NULL, NULL, NULL, NULL, '', NULL, 'active', '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(39, '95051485', '206325012', 'Maulida Salifah El-Mumtazah', 'P', '', NULL, NULL, NULL, NULL, '', NULL, 'active', '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(40, '109407976', '206325021', 'Nurul Qoyyimah Sabila', 'P', '', NULL, NULL, NULL, NULL, '', NULL, 'active', '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(41, '104228328', '206325028', 'Safa Dwi Mulyaningsih', 'P', '', NULL, NULL, NULL, NULL, '', NULL, 'active', '2026-04-13 19:37:24', '2026-04-13 19:37:24'),
(42, '3105051094', '206325024', 'Salma Ummu Salamah', 'P', '', NULL, NULL, NULL, NULL, '', NULL, 'active', '2026-04-13 19:37:24', '2026-04-13 19:37:24');

-- --------------------------------------------------------

--
-- Struktur dari tabel `student_attendances`
--

CREATE TABLE `student_attendances` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `schedule_id` bigint(20) UNSIGNED DEFAULT NULL,
  `academic_class_id` bigint(20) UNSIGNED DEFAULT NULL,
  `class_agenda_id` bigint(20) UNSIGNED DEFAULT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `recorded_by` bigint(20) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `status` enum('hadir','izin','sakit','alpha','terlambat') NOT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `student_attendances`
--

INSERT INTO `student_attendances` (`id`, `schedule_id`, `academic_class_id`, `class_agenda_id`, `student_id`, `recorded_by`, `date`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(1, NULL, 2, 1, 19, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:37:31', '2026-04-18 14:37:31'),
(2, NULL, 2, 1, 29, 4, '2026-04-18', 'izin', NULL, '2026-04-18 14:37:31', '2026-04-18 14:37:31'),
(3, NULL, 2, 1, 22, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:37:31', '2026-04-18 14:37:31'),
(4, NULL, 2, 1, 30, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(5, NULL, 2, 1, 23, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(6, NULL, 2, 1, 17, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(7, NULL, 2, 1, 25, 4, '2026-04-18', 'sakit', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(8, NULL, 2, 1, 33, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(9, NULL, 2, 1, 21, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(10, NULL, 2, 1, 26, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(11, NULL, 2, 1, 27, 4, '2026-04-18', 'alpha', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(12, NULL, 2, 1, 28, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(13, NULL, 2, 1, 20, 4, '2026-04-18', 'alpha', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(14, NULL, 2, 1, 24, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(15, NULL, 2, 1, 18, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(17, NULL, 2, 1, 34, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(18, NULL, 2, 1, 31, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:37:32', '2026-04-18 14:37:32'),
(19, NULL, 2, 2, 19, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:38:56', '2026-04-18 14:38:56'),
(20, NULL, 2, 2, 29, 4, '2026-04-18', 'izin', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(21, NULL, 2, 2, 22, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(22, NULL, 2, 2, 30, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(23, NULL, 2, 2, 23, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(24, NULL, 2, 2, 17, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(25, NULL, 2, 2, 25, 4, '2026-04-18', 'sakit', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(26, NULL, 2, 2, 33, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(27, NULL, 2, 2, 21, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(28, NULL, 2, 2, 26, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(29, NULL, 2, 2, 27, 4, '2026-04-18', 'alpha', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(30, NULL, 2, 2, 28, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(31, NULL, 2, 2, 20, 4, '2026-04-18', 'sakit', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(32, NULL, 2, 2, 24, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(33, NULL, 2, 2, 18, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(35, NULL, 2, 2, 34, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(36, NULL, 2, 2, 31, 4, '2026-04-18', 'hadir', NULL, '2026-04-18 14:38:57', '2026-04-18 14:38:57'),
(53, NULL, 1, 4, 13, 4, '2026-04-19', 'izin', NULL, '2026-04-19 11:33:26', '2026-04-19 11:33:26'),
(54, NULL, 1, 4, 11, 4, '2026-04-19', 'izin', NULL, '2026-04-19 11:33:26', '2026-04-19 13:46:27'),
(55, NULL, 1, 4, 8, 4, '2026-04-19', 'hadir', NULL, '2026-04-19 11:33:26', '2026-04-19 11:33:26'),
(56, NULL, 1, 4, 1, 4, '2026-04-19', 'sakit', NULL, '2026-04-19 11:33:26', '2026-04-19 11:33:26'),
(57, NULL, 1, 4, 4, 4, '2026-04-19', 'izin', NULL, '2026-04-19 11:33:26', '2026-04-19 11:33:26'),
(58, NULL, 1, 4, 14, 4, '2026-04-19', 'alpha', NULL, '2026-04-19 11:33:26', '2026-04-19 13:46:27'),
(59, NULL, 1, 4, 16, 4, '2026-04-19', 'hadir', NULL, '2026-04-19 11:33:26', '2026-04-19 11:33:26'),
(60, NULL, 1, 4, 12, 4, '2026-04-19', 'alpha', NULL, '2026-04-19 11:33:26', '2026-04-19 11:33:26'),
(61, NULL, 1, 4, 5, 4, '2026-04-19', 'izin', NULL, '2026-04-19 11:33:26', '2026-04-19 11:33:26'),
(62, NULL, 1, 4, 7, 4, '2026-04-19', 'hadir', NULL, '2026-04-19 11:33:26', '2026-04-19 11:33:26'),
(63, NULL, 1, 4, 6, 4, '2026-04-19', 'alpha', NULL, '2026-04-19 11:33:26', '2026-04-19 13:46:27'),
(64, NULL, 1, 4, 15, 4, '2026-04-19', 'sakit', NULL, '2026-04-19 11:33:26', '2026-04-19 11:33:26'),
(65, NULL, 1, 4, 10, 4, '2026-04-19', 'hadir', NULL, '2026-04-19 11:33:26', '2026-04-19 11:33:26'),
(66, NULL, 1, 4, 3, 4, '2026-04-19', 'hadir', NULL, '2026-04-19 11:33:26', '2026-04-19 11:33:26'),
(67, NULL, 1, 4, 2, 4, '2026-04-19', 'hadir', NULL, '2026-04-19 11:33:26', '2026-04-19 11:33:26'),
(68, NULL, 1, 4, 9, 4, '2026-04-19', 'hadir', NULL, '2026-04-19 11:33:26', '2026-04-19 13:46:27'),
(69, NULL, 1, 5, 13, 4, '2026-04-18', 'izin', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(70, NULL, 1, 5, 11, 4, '2026-04-18', 'hadir', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(71, NULL, 1, 5, 8, 4, '2026-04-18', 'sakit', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(72, NULL, 1, 5, 1, 4, '2026-04-18', 'sakit', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(73, NULL, 1, 5, 4, 4, '2026-04-18', 'hadir', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(74, NULL, 1, 5, 14, 4, '2026-04-18', 'hadir', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(75, NULL, 1, 5, 16, 4, '2026-04-18', 'sakit', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(76, NULL, 1, 5, 12, 4, '2026-04-18', 'alpha', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(77, NULL, 1, 5, 5, 4, '2026-04-18', 'hadir', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(78, NULL, 1, 5, 7, 4, '2026-04-18', 'alpha', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(79, NULL, 1, 5, 6, 4, '2026-04-18', 'alpha', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(80, NULL, 1, 5, 15, 4, '2026-04-18', 'sakit', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(81, NULL, 1, 5, 10, 4, '2026-04-18', 'hadir', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(82, NULL, 1, 5, 3, 4, '2026-04-18', 'hadir', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(83, NULL, 1, 5, 2, 4, '2026-04-18', 'hadir', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(84, NULL, 1, 5, 9, 4, '2026-04-18', 'alpha', NULL, '2026-04-19 11:36:38', '2026-04-19 11:36:38'),
(85, NULL, 1, 6, 13, 6, '2026-04-19', 'izin', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(86, NULL, 1, 6, 11, 6, '2026-04-19', 'hadir', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(87, NULL, 1, 6, 8, 6, '2026-04-19', 'hadir', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(88, NULL, 1, 6, 1, 6, '2026-04-19', 'sakit', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(89, NULL, 1, 6, 4, 6, '2026-04-19', 'izin', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(90, NULL, 1, 6, 14, 6, '2026-04-19', 'hadir', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(91, NULL, 1, 6, 16, 6, '2026-04-19', 'hadir', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(92, NULL, 1, 6, 12, 6, '2026-04-19', 'alpha', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(93, NULL, 1, 6, 5, 6, '2026-04-19', 'izin', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(94, NULL, 1, 6, 7, 6, '2026-04-19', 'hadir', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(95, NULL, 1, 6, 6, 6, '2026-04-19', 'hadir', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(96, NULL, 1, 6, 15, 6, '2026-04-19', 'sakit', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(97, NULL, 1, 6, 10, 6, '2026-04-19', 'hadir', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(98, NULL, 1, 6, 3, 6, '2026-04-19', 'hadir', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(99, NULL, 1, 6, 2, 6, '2026-04-19', 'hadir', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(100, NULL, 1, 6, 9, 6, '2026-04-19', 'hadir', NULL, '2026-04-19 12:54:40', '2026-04-19 12:54:40'),
(101, NULL, 3, 7, 35, 9, '2026-04-20', 'hadir', NULL, '2026-04-20 08:51:31', '2026-04-20 08:51:31'),
(102, NULL, 3, 7, 36, 9, '2026-04-20', 'hadir', NULL, '2026-04-20 08:51:31', '2026-04-20 08:51:31'),
(103, NULL, 3, 7, 37, 9, '2026-04-20', 'hadir', NULL, '2026-04-20 08:51:31', '2026-04-20 08:51:31'),
(104, NULL, 3, 7, 38, 9, '2026-04-20', 'hadir', NULL, '2026-04-20 08:51:31', '2026-04-20 08:51:31'),
(105, NULL, 3, 7, 39, 9, '2026-04-20', 'izin', NULL, '2026-04-20 08:51:31', '2026-04-20 08:51:31'),
(106, NULL, 3, 7, 40, 9, '2026-04-20', 'hadir', NULL, '2026-04-20 08:51:31', '2026-04-20 08:51:31'),
(107, NULL, 3, 7, 41, 9, '2026-04-20', 'sakit', NULL, '2026-04-20 08:51:31', '2026-04-20 08:51:31'),
(108, NULL, 3, 7, 42, 9, '2026-04-20', 'hadir', NULL, '2026-04-20 08:51:31', '2026-04-20 08:51:31');

-- --------------------------------------------------------

--
-- Struktur dari tabel `student_consultations`
--

CREATE TABLE `student_consultations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `teacher_id` bigint(20) UNSIGNED NOT NULL,
  `class_id` bigint(20) UNSIGNED NOT NULL,
  `consultation_date` date NOT NULL,
  `category` enum('akademik','perilaku','pribadi','karir','lainnya') NOT NULL,
  `subject` varchar(255) NOT NULL,
  `problem_description` text NOT NULL,
  `advice_given` text DEFAULT NULL,
  `action_plan` text DEFAULT NULL,
  `follow_up_notes` text DEFAULT NULL,
  `follow_up_date` date DEFAULT NULL,
  `follow_up_status` enum('pending','in_progress','completed') DEFAULT NULL,
  `parent_contacted` tinyint(1) NOT NULL DEFAULT 0,
  `parent_feedback` text DEFAULT NULL,
  `attachment_path` varchar(255) DEFAULT NULL,
  `privacy_level` enum('normal','confidential') NOT NULL DEFAULT 'normal',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `student_scores`
--

CREATE TABLE `student_scores` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `daily_assessment_id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED NOT NULL,
  `score` decimal(5,2) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `subjects`
--

CREATE TABLE `subjects` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `subjects`
--

INSERT INTO `subjects` (`id`, `code`, `name`, `description`, `created_at`, `updated_at`) VALUES
(7, 'KJ', 'Keamanan Jaringan', NULL, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(8, 'SK', 'Sistem Komputer', NULL, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(9, 'PW', 'Pemrograman Web', NULL, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(10, 'PPJ', 'Perencanaan dan Pengalamatan Jaringan', NULL, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(11, 'ASJ', 'Administrasi Sistem Jaringan', NULL, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(12, 'PWL', 'Pemrograman Web Lanjutan', NULL, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(13, 'JD', 'Jaringan Dasar', NULL, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(14, 'TJKN', 'Teknologi Jaringan Kabel dan Nirkabel', NULL, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(15, 'DG', 'Design Grafis', NULL, '2026-04-18 14:33:45', '2026-04-18 14:33:45'),
(16, 'DM', 'Digital Marketing', NULL, '2026-04-18 14:33:45', '2026-04-18 14:33:45');

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `nip` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `remember_token` varchar(100) DEFAULT NULL,
  `last_login_at` timestamp NULL DEFAULT NULL,
  `last_login_ip` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `nip`, `phone`, `address`, `avatar`, `status`, `email_verified_at`, `password`, `remember_token`, `last_login_at`, `last_login_ip`, `created_at`, `updated_at`) VALUES
(1, 'System Administrator', 'admin@salira.com', '000000', NULL, NULL, 'avatars/N3BGvOfbBw2ZdzxUZ4bTfceLxvGFqjkH9BC21GSL.png', 'active', '2026-04-13 09:19:36', '$2y$12$aWjkGX2QOUz9iVMbDmXLsODjjBm80wclK/rQP73faCJ0EIHsX13fK', NULL, '2026-04-20 10:13:45', '192.168.18.1', '2026-04-13 09:19:36', '2026-04-20 10:13:45'),
(2, 'Bapak Pimpinan', 'pimpinan@salira.com', '111111', NULL, NULL, NULL, 'active', '2026-04-13 09:19:36', '$2y$12$bj8z6rPqm7fxxnxfWCK3jusCRKc548/650FJI1jTPB4HKV.KwGm6S', NULL, '2026-04-18 13:05:24', '192.168.18.1', '2026-04-13 09:19:36', '2026-04-18 13:05:24'),
(4, 'Yusuf Burhani', 'yusufburhani20@gmail.com', '019809809', NULL, NULL, NULL, 'active', NULL, '$2y$12$v0y3EcaaUXOpNwj5ahWlLeIkqY3GtSp/e1kGAbia1BeT0OOt0GWqu', '09UTfwvZDI4F3i9UnHQ5TeLrcauiPFP9I1rcHAa0N8mgDkKM91yXDpaC2Wgm', '2026-04-20 10:13:28', '192.168.18.1', '2026-04-13 11:55:41', '2026-04-20 10:13:28'),
(5, 'adminuser', 'adminuser@salira.com', NULL, NULL, NULL, NULL, 'active', NULL, '$2y$12$RvY1jgePGhQ6O1lldV9liebLUzrq32XVr9uFN4lYnwPxvPyVtn0/W', NULL, '2026-04-19 12:53:32', '192.168.18.1', '2026-04-13 12:23:54', '2026-04-19 12:53:32'),
(6, 'Alipia Maulana Ibrahim', 'piamaulanaibrahim@gmail.com', '0', NULL, NULL, NULL, 'active', NULL, '$2y$12$O6BtiHQWI.LXjUGyh8weH.Z7xcxqCbt6FMJ9jOW8ccW3gHb51VYGy', NULL, '2026-04-19 12:49:08', '192.168.18.1', '2026-04-19 12:48:55', '2026-04-19 12:49:08'),
(8, 'Muhammad Rafi Arrohman', 'rafiarrohman08@gmail.com', '112233', NULL, NULL, NULL, 'active', NULL, '$2y$12$8DZcEBMVmN4k0ePO6F4JmO9icPLab7wFUh30sOU010fSFt.9uLAke', NULL, '2026-04-20 07:34:09', '192.168.18.1', '2026-04-19 12:49:48', '2026-04-20 07:34:09'),
(9, 'Vita Fatimah', 'vieta.sanhajj@gmail.com', '3207275303920002', NULL, NULL, NULL, 'active', NULL, '$2y$12$P0zz1TGKoYgc17acQVKU5.coB3T5Iu60sztK/9hdWMokvPCIRpR4u', 'wmmu0X8JptRLMlQ0A5nZlgE80DZeuXfGFvDKbncW1qgkzQl4bSVzZfpGRDpc', '2026-04-19 13:01:50', '192.168.18.1', '2026-04-19 13:01:42', '2026-04-19 13:01:50'),
(10, 'Yusfiah Latifah', 'yusfiahlatifah2@gmail.com', '06', NULL, NULL, NULL, 'active', NULL, '$2y$12$h1wpmImdJnjuc/fdm9OKNOJVH9NDR9QyNwzox0d1JakNQQUCsWiZG', NULL, '2026-04-19 13:20:45', '192.168.18.1', '2026-04-19 13:20:33', '2026-04-19 13:20:45'),
(11, 'Fahmi Mubarok', 'fahmimasiver97@gmail.com', '001122', NULL, NULL, NULL, 'active', NULL, '$2y$12$P0nPpH2xZIB32IpdKFSw3.TZF1XXZbia/nNnap8z4G9oDZe2Mmyze', NULL, '2026-04-19 15:50:42', '192.168.18.1', '2026-04-19 15:50:30', '2026-04-19 15:50:42');

--
-- Indeks untuk tabel yang dibuang
--

--
-- Indeks untuk tabel `academic_classes`
--
ALTER TABLE `academic_classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `academic_classes_academic_year_id_foreign` (`academic_year_id`),
  ADD KEY `academic_classes_homeroom_teacher_id_foreign` (`homeroom_teacher_id`);

--
-- Indeks untuk tabel `academic_class_subject`
--
ALTER TABLE `academic_class_subject`
  ADD PRIMARY KEY (`id`),
  ADD KEY `academic_class_subject_academic_class_id_foreign` (`academic_class_id`),
  ADD KEY `academic_class_subject_subject_id_foreign` (`subject_id`);

--
-- Indeks untuk tabel `academic_years`
--
ALTER TABLE `academic_years`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `attendances`
--
ALTER TABLE `attendances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `attendances_user_id_foreign` (`user_id`);

--
-- Indeks untuk tabel `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indeks untuk tabel `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indeks untuk tabel `class_agendas`
--
ALTER TABLE `class_agendas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_agendas_schedule_id_foreign` (`schedule_id`),
  ADD KEY `class_agendas_teacher_id_foreign` (`teacher_id`),
  ADD KEY `class_agendas_academic_class_id_foreign` (`academic_class_id`),
  ADD KEY `class_agendas_subject_id_foreign` (`subject_id`);

--
-- Indeks untuk tabel `class_members`
--
ALTER TABLE `class_members`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_members_class_id_foreign` (`class_id`),
  ADD KEY `class_members_student_id_foreign` (`student_id`);

--
-- Indeks untuk tabel `daily_assessments`
--
ALTER TABLE `daily_assessments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `daily_assessments_teacher_id_foreign` (`teacher_id`),
  ADD KEY `daily_assessments_academic_class_id_foreign` (`academic_class_id`),
  ADD KEY `daily_assessments_subject_id_foreign` (`subject_id`);

--
-- Indeks untuk tabel `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indeks untuk tabel `geofences`
--
ALTER TABLE `geofences`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `inventory_barcodes`
--
ALTER TABLE `inventory_barcodes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventory_barcodes_barcode_value_unique` (`barcode_value`),
  ADD KEY `inventory_barcodes_item_id_foreign` (`item_id`);

--
-- Indeks untuk tabel `inventory_categories`
--
ALTER TABLE `inventory_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventory_categories_code_unique` (`code`);

--
-- Indeks untuk tabel `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventory_items_code_unique` (`code`),
  ADD KEY `inventory_items_category_id_foreign` (`category_id`);

--
-- Indeks untuk tabel `inventory_logs`
--
ALTER TABLE `inventory_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `inventory_logs_item_id_foreign` (`item_id`),
  ADD KEY `inventory_logs_barcode_id_foreign` (`barcode_id`),
  ADD KEY `inventory_logs_user_id_foreign` (`user_id`);

--
-- Indeks untuk tabel `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indeks untuk tabel `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`model_id`,`model_type`),
  ADD KEY `model_has_permissions_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indeks untuk tabel `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD PRIMARY KEY (`role_id`,`model_id`,`model_type`),
  ADD KEY `model_has_roles_model_id_model_type_index` (`model_id`,`model_type`);

--
-- Indeks untuk tabel `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indeks untuk tabel `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `permissions_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indeks untuk tabel `permission_requests`
--
ALTER TABLE `permission_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `permission_requests_user_id_foreign` (`user_id`),
  ADD KEY `permission_requests_approved_by_foreign` (`approved_by`);

--
-- Indeks untuk tabel `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `roles_name_guard_name_unique` (`name`,`guard_name`);

--
-- Indeks untuk tabel `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `role_has_permissions_role_id_foreign` (`role_id`);

--
-- Indeks untuk tabel `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `schedules_class_id_foreign` (`class_id`),
  ADD KEY `schedules_teacher_id_foreign` (`teacher_id`);

--
-- Indeks untuk tabel `semesters`
--
ALTER TABLE `semesters`
  ADD PRIMARY KEY (`id`),
  ADD KEY `semesters_academic_year_id_foreign` (`academic_year_id`);

--
-- Indeks untuk tabel `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indeks untuk tabel `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `settings_key_unique` (`key`);

--
-- Indeks untuk tabel `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `students_nisn_unique` (`nisn`),
  ADD UNIQUE KEY `students_nis_unique` (`nis`);

--
-- Indeks untuk tabel `student_attendances`
--
ALTER TABLE `student_attendances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_attendances_schedule_id_foreign` (`schedule_id`),
  ADD KEY `student_attendances_student_id_foreign` (`student_id`),
  ADD KEY `student_attendances_recorded_by_foreign` (`recorded_by`),
  ADD KEY `student_attendances_academic_class_id_foreign` (`academic_class_id`),
  ADD KEY `student_attendances_class_agenda_id_foreign` (`class_agenda_id`);

--
-- Indeks untuk tabel `student_consultations`
--
ALTER TABLE `student_consultations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_consultations_student_id_foreign` (`student_id`),
  ADD KEY `student_consultations_teacher_id_foreign` (`teacher_id`),
  ADD KEY `student_consultations_class_id_foreign` (`class_id`);

--
-- Indeks untuk tabel `student_scores`
--
ALTER TABLE `student_scores`
  ADD PRIMARY KEY (`id`),
  ADD KEY `student_scores_daily_assessment_id_foreign` (`daily_assessment_id`),
  ADD KEY `student_scores_student_id_foreign` (`student_id`);

--
-- Indeks untuk tabel `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `subjects_code_unique` (`code`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`),
  ADD UNIQUE KEY `users_nip_unique` (`nip`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `academic_classes`
--
ALTER TABLE `academic_classes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `academic_class_subject`
--
ALTER TABLE `academic_class_subject`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT untuk tabel `academic_years`
--
ALTER TABLE `academic_years`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `attendances`
--
ALTER TABLE `attendances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `class_agendas`
--
ALTER TABLE `class_agendas`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT untuk tabel `class_members`
--
ALTER TABLE `class_members`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT untuk tabel `daily_assessments`
--
ALTER TABLE `daily_assessments`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `geofences`
--
ALTER TABLE `geofences`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `inventory_barcodes`
--
ALTER TABLE `inventory_barcodes`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `inventory_categories`
--
ALTER TABLE `inventory_categories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `inventory_items`
--
ALTER TABLE `inventory_items`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `inventory_logs`
--
ALTER TABLE `inventory_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT untuk tabel `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `permission_requests`
--
ALTER TABLE `permission_requests`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `roles`
--
ALTER TABLE `roles`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT untuk tabel `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `semesters`
--
ALTER TABLE `semesters`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `settings`
--
ALTER TABLE `settings`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT untuk tabel `students`
--
ALTER TABLE `students`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

--
-- AUTO_INCREMENT untuk tabel `student_attendances`
--
ALTER TABLE `student_attendances`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=125;

--
-- AUTO_INCREMENT untuk tabel `student_consultations`
--
ALTER TABLE `student_consultations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `student_scores`
--
ALTER TABLE `student_scores`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `academic_classes`
--
ALTER TABLE `academic_classes`
  ADD CONSTRAINT `academic_classes_academic_year_id_foreign` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `academic_classes_homeroom_teacher_id_foreign` FOREIGN KEY (`homeroom_teacher_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `academic_class_subject`
--
ALTER TABLE `academic_class_subject`
  ADD CONSTRAINT `academic_class_subject_academic_class_id_foreign` FOREIGN KEY (`academic_class_id`) REFERENCES `academic_classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `academic_class_subject_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `attendances`
--
ALTER TABLE `attendances`
  ADD CONSTRAINT `attendances_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `class_agendas`
--
ALTER TABLE `class_agendas`
  ADD CONSTRAINT `class_agendas_academic_class_id_foreign` FOREIGN KEY (`academic_class_id`) REFERENCES `academic_classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_agendas_schedule_id_foreign` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_agendas_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `class_agendas_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `class_members`
--
ALTER TABLE `class_members`
  ADD CONSTRAINT `class_members_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `academic_classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `class_members_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `daily_assessments`
--
ALTER TABLE `daily_assessments`
  ADD CONSTRAINT `daily_assessments_academic_class_id_foreign` FOREIGN KEY (`academic_class_id`) REFERENCES `academic_classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `daily_assessments_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `daily_assessments_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `inventory_barcodes`
--
ALTER TABLE `inventory_barcodes`
  ADD CONSTRAINT `inventory_barcodes_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `inventory_items`
--
ALTER TABLE `inventory_items`
  ADD CONSTRAINT `inventory_items_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `inventory_categories` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `inventory_logs`
--
ALTER TABLE `inventory_logs`
  ADD CONSTRAINT `inventory_logs_barcode_id_foreign` FOREIGN KEY (`barcode_id`) REFERENCES `inventory_barcodes` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `inventory_logs_item_id_foreign` FOREIGN KEY (`item_id`) REFERENCES `inventory_items` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `model_has_permissions`
--
ALTER TABLE `model_has_permissions`
  ADD CONSTRAINT `model_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `model_has_roles`
--
ALTER TABLE `model_has_roles`
  ADD CONSTRAINT `model_has_roles_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `permission_requests`
--
ALTER TABLE `permission_requests`
  ADD CONSTRAINT `permission_requests_approved_by_foreign` FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `permission_requests_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `role_has_permissions`
--
ALTER TABLE `role_has_permissions`
  ADD CONSTRAINT `role_has_permissions_permission_id_foreign` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_has_permissions_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `schedules_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `academic_classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `schedules_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `semesters`
--
ALTER TABLE `semesters`
  ADD CONSTRAINT `semesters_academic_year_id_foreign` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `student_attendances`
--
ALTER TABLE `student_attendances`
  ADD CONSTRAINT `student_attendances_academic_class_id_foreign` FOREIGN KEY (`academic_class_id`) REFERENCES `academic_classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_attendances_class_agenda_id_foreign` FOREIGN KEY (`class_agenda_id`) REFERENCES `class_agendas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_attendances_recorded_by_foreign` FOREIGN KEY (`recorded_by`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_attendances_schedule_id_foreign` FOREIGN KEY (`schedule_id`) REFERENCES `schedules` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_attendances_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `student_consultations`
--
ALTER TABLE `student_consultations`
  ADD CONSTRAINT `student_consultations_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `academic_classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_consultations_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_consultations_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `student_scores`
--
ALTER TABLE `student_scores`
  ADD CONSTRAINT `student_scores_daily_assessment_id_foreign` FOREIGN KEY (`daily_assessment_id`) REFERENCES `daily_assessments` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `student_scores_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
