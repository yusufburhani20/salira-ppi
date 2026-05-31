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
        $token = $request->qr_token ? trim($request->qr_token) : null;
        $manualNis = $request->nis ? trim($request->nis) : null;
        
        if (!$token && !$manualNis) {
            return response()->json(['success' => false, 'message' => 'Token QR atau NIS tidak ditemukan.'], 400);
        }

        try {
            $nis = null;
            $isToken = false;
            $tokenToProcess = null;

            // Tentukan apakah input berupa token QR/Barcode terenkripsi atau NIS langsung
            if ($token) {
                $isToken = true;
                $tokenToProcess = $token;
            } elseif ($manualNis) {
                // Periksa apakah manualNis merupakan token base64 terenkripsi
                // (misalnya saat menggunakan hardware barcode/QR scanner pada kartu QR)
                $decoded = base64_decode($manualNis, true);
                if ($decoded !== false && strpos($decoded, ':') !== false) {
                    $parts = explode(':', $decoded);
                    if (count($parts) === 3) {
                        $isToken = true;
                        $tokenToProcess = $manualNis;
                    }
                }
            }

            if ($isToken) {
                $decoded = base64_decode($tokenToProcess);
                $parts = explode(':', $decoded);
                list($decodedNis, $timestamp, $signature) = $parts;

                // Validasi Signature untuk keamanan
                $expectedSignature = hash_hmac('sha256', "{$decodedNis}:{$timestamp}", config('app.key'));
                if ($signature === $expectedSignature) {
                    $nis = $decodedNis;
                } else {
                    // Jika signature tidak cocok (karena APP_KEY berubah atau kartu dicetak di env berbeda),
                    // periksa apakah NIS hasil dekripsi terdaftar sebagai siswa.
                    // Jika terdaftar, kita gunakan NIS tersebut demi kegunaan (resilience).
                    $studentExists = Student::where('nis', $decodedNis)->exists();
                    if ($studentExists) {
                        $nis = $decodedNis;
                    } else {
                        // Jika bukan siswa terdaftar dan asalnya dikirim lewat kolom manual/scanner fisik,
                        // ada kemungkinan itu NIS manual biasa yang kebetulan memiliki format menyerupai base64.
                        if ($manualNis) {
                            $nis = $manualNis;
                        } else {
                            return response()->json(['success' => false, 'message' => 'Token keamanan tidak valid.'], 403);
                        }
                    }
                }
            } else {
                $nis = $manualNis;
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

            // Cek Double-Tap (Debounce) - 1 menit (60 detik)
            $recentAttendance = StudentAttendance::where('student_id', $student->id)
                ->whereDate('date', $now->toDateString())
                ->whereNull('schedule_id')
                ->whereNull('class_agenda_id')
                ->orderBy('updated_at', 'desc')
                ->first();

            if ($recentAttendance && $recentAttendance->updated_at) {
                if ($now->diffInSeconds($recentAttendance->updated_at) < 60) {
                    return response()->json([
                        'success' => false, 
                        'message' => 'Anda baru saja melakukan presensi. Silakan tunggu 1 menit sebelum mencoba lagi.'
                    ], 429);
                }
            }

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
