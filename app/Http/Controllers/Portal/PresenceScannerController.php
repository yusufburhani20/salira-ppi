<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Student;
use App\Models\StudentAttendance;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class PresenceScannerController extends Controller
{
    public function index()
    {
        return Inertia::render('Portal/Attendance/Scanner');
    }

    public function scan(Request $request)
    {
        $token = $request->qr_token;
        if (!$token) {
            return response()->json(['success' => false, 'message' => 'Token QR tidak ditemukan.'], 400);
        }

        try {
            $decoded = base64_decode($token);
            $parts = explode(':', $decoded);

            if (count($parts) !== 3) {
                return response()->json(['success' => false, 'message' => 'Format QR tidak valid.'], 400);
            }

            list($nis, $timestamp, $signature) = $parts;

            // Validasi Signature
            $expectedSignature = hash_hmac('sha256', "{$nis}:{$timestamp}", config('app.key'));
            if ($signature !== $expectedSignature) {
                return response()->json(['success' => false, 'message' => 'Token keamanan tidak valid.'], 403);
            }

            // Cari Siswa
            $student = Student::where('nis', $nis)->first();
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Siswa tidak terdaftar.'], 404);
            }

            // Pastikan siswa sudah terdaftar di kelas
            if (!$student->academic_class_id) {
                return response()->json(['success' => false, 'message' => 'Siswa belum terdaftar di kelas manapun.'], 400);
            }

            $now = Carbon::now();

            // Simpan/perbarui record master harian (tanpa schedule_id & class_agenda_id).
            // Record ini berfungsi sebagai penanda bahwa siswa sudah tiba di sekolah hari ini.
            // Modul Jurnal Mengajar guru akan membaca record ini sebagai data awal kehadiran.
            StudentAttendance::updateOrCreate(
                [
                    'student_id'      => $student->id,
                    'date'            => $now->toDateString(),
                    'schedule_id'     => null,
                    'class_agenda_id' => null,
                ],
                [
                    'academic_class_id' => $student->academic_class_id,
                    'recorded_by'       => 1, // ID 1 = Super Admin / Sistem sebagai pencatat otomatis
                    'status'            => 'hadir',
                    'notes'             => 'Presensi Mandiri via QR – ' . $now->format('H:i') . ' WIB',
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Presensi berhasil dicatat!',
                'data'    => [
                    'student_name' => $student->name,
                    'class_name'   => $student->academicClasses()
                        ->wherePivot('is_active', true)
                        ->latest('class_members.created_at')
                        ->first()?->name ?? '-',
                    'subject'      => 'Semua Mapel Hari Ini',
                    'time'         => $now->format('H:i'),
                    'timezone'     => config('app.timezone', 'Asia/Jakarta'),
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal memproses QR: ' . $e->getMessage()], 500);
        }
    }
}
