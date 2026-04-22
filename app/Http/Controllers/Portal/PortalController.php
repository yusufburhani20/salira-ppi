<?php

namespace App\Http\Controllers\Portal;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use App\Models\Bill;
use App\Models\StudentAttendance;
use App\Models\StudentScore;
use App\Models\StudentConsultation;
use App\Models\Setting;
use App\Models\Announcement;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;

class PortalController extends Controller
{
    public function dashboard()
    {
        $student = Auth::guard('student')->user();
        $studentId = $student->id;
        
        // Define date range: Let's use start of current year basically or last 6 months
        $startDate = Carbon::now()->subMonths(6)->startOfMonth();
        $endDate = Carbon::now()->addDay(); // up to today

        // 1. Count unpaid bills
        $unpaidBills = Bill::where('student_id', $student->id)
            ->where('status', '!=', 'paid')
            ->count();

        // 2. Get attendance stats for the date range
        $attendances = StudentAttendance::where('student_id', $student->id)
            ->whereBetween('date', [$startDate, $endDate])
            ->get(['status']);

        $statusCounts = $attendances->groupBy(function($a) {
            return (string) ($a->status->value ?? $a->status); // handle enum or string
        })->map->count();

        $attendanceStats = [
            'present' => (int) ($statusCounts['hadir'] ?? $statusCounts['present'] ?? 0),
            'sick' => (int) ($statusCounts['sakit'] ?? $statusCounts['sick'] ?? 0),
            'permission' => (int) ($statusCounts['izin'] ?? $statusCounts['permission'] ?? 0),
            'absent' => (int) ($statusCounts['alpha'] ?? $statusCounts['absent'] ?? 0),
        ];

        // 3. Akademik (Scores grouped by Subject)
        $scores = StudentScore::where('student_id', $studentId)
            ->join('daily_assessments', 'student_scores.daily_assessment_id', '=', 'daily_assessments.id')
            ->join('subjects', 'daily_assessments.subject_id', '=', 'subjects.id')
            ->whereBetween('daily_assessments.date', [$startDate, $endDate])
            ->select(
                'student_scores.score',
                'subjects.id as subject_id',
                'subjects.name as subject_name'
            )
            ->get();

        $academics = $scores->groupBy('subject_id')->map(function($group) {
            return [
                'subject' => $group->first()->subject_name,
                'average' => round($group->avg('score'), 1),
                'count'   => $group->count(),
            ];
        })->values();

        // 4. Bimbingan/Konsultasi Terakhir
        $consultations = StudentConsultation::where('student_id', $studentId)
            ->whereBetween('consultation_date', [$startDate, $endDate])
            ->with('homeroomTeacher:id,name')
            ->orderByDesc('consultation_date')
            ->take(5) // Just load 5 latest
            ->get();

        // 5. Today's Attendance
        $todayAttendance = StudentAttendance::where('student_id', $studentId)
            ->whereDate('date', Carbon::today())
            ->first();

        $todayStatus = $todayAttendance ? (string) ($todayAttendance->status->value ?? $todayAttendance->status) : null;

        // 6. Announcements
        $announcements = Announcement::where('is_active', true)
            ->where(function($q) {
                $q->whereNull('expires_at')->orWhere('expires_at', '>', Carbon::now());
            })
            ->whereIn('target', ['all', 'students'])
            ->latest()
            ->get();

        return Inertia::render('Portal/Dashboard', [
            'student' => $student,
            'unpaidBillsCount' => $unpaidBills,
            'attendanceStats' => $attendanceStats,
            'academics' => $academics,
            'consultations' => $consultations,
            'todayStatus' => $todayStatus,
            'announcements' => $announcements,
        ]);
    }

    public function bills()
    {
        $student = Auth::guard('student')->user();
        $bills = Bill::where('student_id', $student->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $contact = Setting::get('finance_contact', '');
        // Clean non-numeric characters for WA link safety
        $cleanContact = preg_replace('/[^0-9]/', '', $contact);

        return Inertia::render('Portal/Bills', [
            'bills' => $bills,
            'student' => $student,
            'finance_contact' => $cleanContact
        ]);
    }

    public function reportPdf(Request $request)
    {
        $student = Auth::guard('student')->user();
        $studentId = $student->id;

        $month = $request->month;
        $year = $request->year ?? date('Y');

        if ($month) {
            $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
            $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth();
            $rangeText = $startDate->translatedFormat('F Y');
        } else {
            // Default: Current semester / 6 months
            $startDate = Carbon::now()->subMonths(6)->startOfMonth();
            $endDate = Carbon::now()->endOfMonth();
            $rangeText = $startDate->translatedFormat('d M Y') . ' - ' . $endDate->translatedFormat('d M Y');
        }

        // 1. Attendance stats
        $attendances = StudentAttendance::where('student_id', $studentId)
            ->whereBetween('date', [$startDate, $endDate])
            ->get(['status']);

        $statusCounts = $attendances->groupBy(function($a) {
            return (string) ($a->status->value ?? $a->status);
        })->map->count();

        $attendanceSummary = [
            'hadir'     => (int) ($statusCounts['hadir'] ?? $statusCounts['present'] ?? 0),
            'sakit'     => (int) ($statusCounts['sakit'] ?? $statusCounts['sick'] ?? 0),
            'izin'      => (int) ($statusCounts['izin'] ?? $statusCounts['permission'] ?? 0),
            'alpha'     => (int) ($statusCounts['alpha'] ?? $statusCounts['absent'] ?? 0),
            'total'     => $attendances->count(),
        ];
        
        $attendanceSummary['percentage'] = $attendanceSummary['total'] > 0
            ? round(($attendanceSummary['hadir'] / $attendanceSummary['total']) * 100)
            : 100;

        // 2. Academics
        $scores = StudentScore::where('student_id', $studentId)
            ->join('daily_assessments', 'student_scores.daily_assessment_id', '=', 'daily_assessments.id')
            ->join('subjects', 'daily_assessments.subject_id', '=', 'subjects.id')
            ->whereBetween('daily_assessments.date', [$startDate, $endDate])
            ->select('student_scores.score', 'subjects.name as subject_name', 'subjects.id as subject_id')
            ->get();

        $academics = $scores->groupBy('subject_id')->map(function($group) {
            return [
                'subject' => $group->first()->subject_name,
                'average' => round($group->avg('score'), 1),
                'count'   => $group->count(),
                'min'     => (float) $group->min('score'),
                'max'     => (float) $group->max('score'),
            ];
        })->values();

        // 3. Consultations
        $consultations = StudentConsultation::where('student_id', $studentId)
            ->whereBetween('consultation_date', [$startDate, $endDate])
            ->with('homeroomTeacher:id,name')
            ->orderByDesc('consultation_date')
            ->get();

        $settings = [
            'school_name'    => Setting::get('school_name', 'SALIRA ACADEMY'),
            'school_address' => Setting::get('school_address', 'Alamat Sekolah Belum Diatur'),
            'school_phone'   => Setting::get('school_phone', '-'),
            'school_email'   => Setting::get('school_email', '-'),
            'report_location'=> Setting::get('report_location', 'Kota'),
            'school_logo'    => Setting::get('school_logo'),
            'title'          => 'LAPORAN PERKEMBANGAN SISWA (DIGITAL)',
            'range'          => $rangeText,
        ];

        $pdf = Pdf::loadView('reports.student_resume_pdf', array_merge($settings, [
            'student' => $student,
            'attendance' => $attendanceSummary,
            'academics' => $academics,
            'consultations' => $consultations,
        ]))->setPaper('a4', 'portrait');

        return $pdf->stream("Rapor_{$student->name}_{$rangeText}.pdf");
    }

    public function notifications(Request $request)
    {
        $notifications = $request->user()
            ->notifications()
            ->paginate(15);

        return Inertia::render('Portal/Notifications', [
            'notifications' => $notifications,
        ]);
    }

    public function attendance()
    {
        $student = Auth::guard('student')->user();
        $attendances = StudentAttendance::where('student_id', $student->id)
            ->orderBy('date', 'desc')
            ->paginate(20);

        return Inertia::render('Portal/Attendance', [
            'attendances' => $attendances,
        ]);
    }

    public function scores()
    {
        $student = Auth::guard('student')->user();
        
        $scores = StudentScore::with(['dailyAssessment'])
            ->where('student_id', $student->id)
            ->get()
            ->groupBy(function($s) {
                return $s->dailyAssessment->subject;
            });

        return Inertia::render('Portal/Scores', [
            'scores' => $scores,
        ]);
    }

    public function idCard()
    {
        $student = Auth::guard('student')->user();
        
        // Generate secure token for QR
        // Structure: NIS:Timestamp:HashedSignature
        $timestamp = time();
        $signature = hash_hmac('sha256', "{$student->nis}:{$timestamp}", config('app.key'));
        $qrToken = base64_encode("{$student->nis}:{$timestamp}:{$signature}");

        $settings = [
            'school_name' => Setting::get('school_name', 'SALIRA ACADEMY'),
            'school_logo' => Setting::get('school_logo') ? '/storage/' . Setting::get('school_logo') : null,
            'school_address' => Setting::get('school_address', 'Alamat Sekolah'),
        ];

        return Inertia::render('Portal/IdCard', [
            'student' => $student,
            'qrToken' => $qrToken,
            'settings' => $settings,
        ]);
    }
}
