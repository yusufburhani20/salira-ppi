<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StudentAttendance;
use App\Models\StudentScore;
use App\Models\AcademicClass;
use App\Models\Student;
use App\Models\PermissionRequest;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    /**
     * Return dashboard stats:
     *  - attendance_chart: 7-day student attendance counts (by teacher's classes)
     *  - top_students: Top 5 students by average daily assessment score
     *  - leave_summary: Logged-in user leave request summary
     */
    public function stats(Request $request)
    {
        $user = Auth::user();

        // 1. My Classes (classes this teacher records attendance for)
        $myClassIds = AcademicClass::where('homeroom_teacher_id', $user->id)
            ->orWhereHas('agendas', fn($q) => $q->where('teacher_id', $user->id))
            ->pluck('id')
            ->unique();

        // If no direct class association, get all active classes
        if ($myClassIds->isEmpty()) {
            $myClassIds = AcademicClass::pluck('id');
        }

        // 2. Attendance chart: last 7 days student attendance (hadir count per day)
        $attendanceChart = [];
        for ($i = 6; $i >= 0; $i--) {
            $day = Carbon::today()->subDays($i);
            $label = $day->translatedFormat('D'); // Mon, Tue, etc.

            $stats = StudentAttendance::whereIn('academic_class_id', $myClassIds)
                ->whereDate('date', $day)
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            $attendanceChart[] = [
                'label'  => $label,
                'date'   => $day->format('Y-m-d'),
                'hadir'  => (int)($stats['hadir'] ?? 0),
                'sakit'  => (int)($stats['sakit'] ?? 0),
                'izin'   => (int)($stats['izin'] ?? 0),
                'alpha'  => (int)($stats['alpha'] ?? 0),
            ];
        }

        // 3. Top 5 students by average score (from daily assessments by this teacher)
        $topStudents = DB::table('student_scores')
            ->join('daily_assessments', 'student_scores.daily_assessment_id', '=', 'daily_assessments.id')
            ->join('students', 'student_scores.student_id', '=', 'students.id')
            ->where('daily_assessments.teacher_id', $user->id)
            ->select(
                'students.id',
                'students.name',
                'students.nisn',
                DB::raw('ROUND(AVG(student_scores.score), 1) as avg_score'),
                DB::raw('COUNT(student_scores.id) as total_assessments')
            )
            ->groupBy('students.id', 'students.name', 'students.nisn')
            ->orderByDesc('avg_score')
            ->limit(5)
            ->get();

        // 4. Today's attendance summary for teacher's classes
        $todaySummary = StudentAttendance::whereIn('academic_class_id', $myClassIds)
            ->whereDate('date', today())
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        // 5. Leave summary for logged-in teacher
        $leaveSummary = DB::table('permission_requests')
            ->where('user_id', $user->id)
            ->whereYear('created_at', now()->year)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return response()->json([
            'attendance_chart' => $attendanceChart,
            'top_students'     => $topStudents,
            'today_summary'    => [
                'hadir' => (int)($todaySummary['hadir'] ?? 0),
                'sakit' => (int)($todaySummary['sakit'] ?? 0),
                'izin'  => (int)($todaySummary['izin'] ?? 0),
                'alpha' => (int)($todaySummary['alpha'] ?? 0),
            ],
            'leave_summary'    => [
                'pending'  => (int)($leaveSummary['pending'] ?? 0),
                'approved' => (int)($leaveSummary['approved'] ?? 0),
                'rejected' => (int)($leaveSummary['rejected'] ?? 0),
                'total'    => array_sum($leaveSummary),
            ],
        ]);
    }
}
