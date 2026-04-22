<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Student;
use App\Models\Schedule;
use App\Models\StudentAttendance;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

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

            // Validate Signature
            $expectedSignature = hash_hmac('sha256', "{$nis}:{$timestamp}", config('app.key'));
            if ($signature !== $expectedSignature) {
                return response()->json(['success' => false, 'message' => 'Token keamanan tidak valid.'], 403);
            }

            // Find Student
            $student = Student::where('nis', $nis)->first();
            if (!$student) {
                return response()->json(['success' => false, 'message' => 'Siswa tidak terdaftar.'], 404);
            }

            // Check Active Class
            if (!$student->academic_class_id) {
                return response()->json(['success' => false, 'message' => 'Siswa belum terdaftar di kelas manapun.'], 400);
            }

            // Find Current Schedule
            $now = Carbon::now();
            $day = strtolower($now->format('l'));
            $time = $now->toTimeString();

            $schedule = Schedule::where('class_id', $student->academic_class_id)
                ->where('day', $day)
                ->where('start_time', '<=', $time)
                ->where('end_time', '>=', $time)
                ->first();

            if (!$schedule) {
                return response()->json(['success' => false, 'message' => 'Tidak ada jadwal pelajaran aktif saat ini.'], 404);
            }

            // Record / Update Attendance
            // Logic: If already present, just confirm. If alpha/missing, mark as present.
            $attendance = StudentAttendance::updateOrCreate(
                [
                    'schedule_id' => $schedule->id,
                    'student_id' => $student->id,
                    'date' => $now->toDateString(),
                ],
                [
                    'academic_class_id' => $student->academic_class_id,
                    'recorded_by' => $schedule->teacher_id, // Attributed to the schedule teacher
                    'status' => 'hadir',
                    'notes' => 'Presensi Mandiri via QR'
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Presensi berhasil dicatat!',
                'data' => [
                    'student_name' => $student->name,
                    'subject' => $schedule->subject,
                    'teacher' => $schedule->teacher->name ?? 'System',
                    'time' => $now->format('H:i')
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Gagal memproses QR: ' . $e->getMessage()], 500);
        }
    }
}
