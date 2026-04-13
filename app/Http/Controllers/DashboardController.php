<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\StudentAttendance;
use App\Models\StudentConsultation;
use App\Models\InventoryItem;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $today = Carbon::today();
        $classId = $request->academic_class_id;

        // 0. Classes for Filter
        $classes = \App\Models\AcademicClass::all();
        
        // 1. Basic Stats (Filtered by Class if selected)
        $studentsQuery = StudentAttendance::whereDate('date', $today);
        if ($classId) $studentsQuery->where('academic_class_id', $classId);

        $consultationQuery = StudentConsultation::where('follow_up_status', '!=', 'completed');
        if ($classId) $consultationQuery->where('class_id', $classId);

        $stats = [
            'students_present' => (clone $studentsQuery)->where('status', 'hadir')->distinct('student_id')->count(),
            'students_permit' => (clone $studentsQuery)->whereIn('status', ['izin', 'sakit'])->distinct('student_id')->count(),
            'consultations_pending' => $consultationQuery->count(),
            'items_borrowed' => InventoryItem::where('status', 'dipinjam')->count(),
        ];

        // 2. Weekly Attendance Chart (Last 7 Days)
        // If class is selected, base the total on that class size
        $totalStudents = $classId 
            ? Student::whereHas('academicClasses', fn($q) => $q->where('class_id', $classId))->count() 
            : Student::count();
        $totalStudents = $totalStudents ?: 1;

        $chartData = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i);
            $presentQuery = StudentAttendance::where('status', 'hadir')->whereDate('date', $date);
            if ($classId) $presentQuery->where('academic_class_id', $classId);
            
            $presentCount = $presentQuery->distinct('student_id')->count();
            $percentage = round(($presentCount / $totalStudents) * 100);
            
            $chartData[] = [
                'label' => $i === 0 ? 'Hari ini' : 'H-'.$i,
                'height' => $percentage,
                'date' => $date->format('d/m'),
            ];
        }

        // 3. Leaderboards / Rankings
        // a. Attendance Ranking (Top 5)
        $attRankingQuery = StudentAttendance::where('status', 'hadir')
            ->select('student_id', \Illuminate\Support\Facades\DB::raw('count(*) as total'))
            ->groupBy('student_id')
            ->orderByDesc('total')
            ->with('student');
        
        if ($classId) {
            $attRankingQuery->where('academic_class_id', $classId);
        }

        $attendanceRanking = $attRankingQuery->limit(5)->get()->map(function($item) {
            return [
                'name' => $item->student->name ?? 'Unknown',
                'value' => $item->total . ' Kehadiran',
                'avatar' => $item->student->avatar ?? null,
            ];
        });

        // b. Assessment Ranking (Top 5)
        $scoreRankingQuery = \App\Models\StudentScore::query()
            ->join('students', 'student_scores.student_id', '=', 'students.id')
            ->select('student_scores.student_id', \Illuminate\Support\Facades\DB::raw('AVG(score) as average'))
            ->groupBy('student_scores.student_id')
            ->orderByDesc('average')
            ->with('student');

        if ($classId) {
            $scoreRankingQuery->join('daily_assessments', 'student_scores.daily_assessment_id', '=', 'daily_assessments.id')
                ->where('daily_assessments.academic_class_id', $classId);
        }

        $assessmentRanking = $scoreRankingQuery->limit(5)->get()->map(function($item) {
            return [
                'name' => $item->student->name ?? 'Unknown',
                'value' => round($item->average, 1),
                'avatar' => $item->student->avatar ?? null,
            ];
        });

        // 4. User Monitoring & Personal Attendance
        $activeUsers = User::whereHas('sessions', function($q) {
            $q->where('last_activity', '>=', now()->subMinutes(5)->getTimestamp());
        })->select('id', 'name', 'email', 'avatar')->get();

        $lastLogins = User::whereNotNull('last_login_at')
            ->latest('last_login_at')
            ->select('id', 'name', 'email', 'avatar', 'last_login_at')
            ->limit(5)->get()
            ->map(function($user) {
                $user->time_ago = $user->last_login_at->diffForHumans();
                return $user;
            });

        $todayAttendance = Attendance::where('user_id', $request->user()->id)
            ->whereDate('date', $today)->first();

        // 5. Inventory Summary
        $inventoryStats = [
            'total' => \App\Models\InventoryBarcode::count(),
            'tersedia' => \App\Models\InventoryBarcode::where('status', 'tersedia')->count(),
            'dipinjam' => \App\Models\InventoryBarcode::where('status', 'dipinjam')->count(),
            'perbaikan' => \App\Models\InventoryBarcode::where('status', 'perbaikan')->count(),
            'dihapus' => \App\Models\InventoryBarcode::where('status', 'dihapus')->count(),
        ];

        return Inertia::render('Dashboard', [
            'stats' => $stats,
            'chartData' => $chartData,
            'activeUsers' => $activeUsers,
            'lastLogins' => $lastLogins,
            'todayAttendance' => $todayAttendance,
            'attendanceRanking' => $attendanceRanking,
            'assessmentRanking' => $assessmentRanking,
            'inventoryStats' => $inventoryStats,
            'classes' => $classes,
            'filters' => $request->only('academic_class_id')
        ]);
    }
}
