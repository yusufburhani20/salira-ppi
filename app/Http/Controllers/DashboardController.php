<?php

namespace App\Http\Controllers;

use App\Models\Attendance;
use App\Models\StudentAttendance;
use App\Models\StudentConsultation;
use App\Models\InventoryItem;
use App\Models\InventoryBarcode;
use App\Models\Student;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        if ($request->user()->hasRole('Kepala Sekolah')) {
            return redirect()->route('admin.leader-dashboard');
        }

        $today = Carbon::today();
        $classId = $request->academic_class_id;

        // 0. Classes for Filter
        $classes = \App\Models\AcademicClass::all();
        
        // 1. Basic Stats (Filtered by Class if selected)
        $studentsQuery = StudentAttendance::whereDate('date', $today);
        if ($classId) $studentsQuery->where('academic_class_id', $classId);

        $consultationQuery = StudentConsultation::where('follow_up_status', '!=', 'completed');
        if ($classId) $consultationQuery->where('class_id', $classId);

        // Cache stats selama 5 menit — data absensi tidak berubah setiap detik
        $statsCacheKey = 'dashboard_stats_' . $today->toDateString() . '_class_' . ($classId ?: 'all');
        $stats = Cache::remember($statsCacheKey, 300, function () use ($studentsQuery, $consultationQuery) {
            return [
                'students_present'      => (clone $studentsQuery)->where('status', 'hadir')->distinct('student_id')->count(),
                'students_permit'       => (clone $studentsQuery)->whereIn('status', ['izin', 'sakit'])->distinct('student_id')->count(),
                'consultations_pending' => $consultationQuery->count(),
                'items_borrowed'        => InventoryItem::where('status', 'dipinjam')->count(),
            ];
        });

        // 2. Attendance Chart (Custom Range or Last 7 Days)
        $totalStudents = $classId 
            ? Student::whereHas('academicClasses', fn($q) => $q->where('academic_classes.id', $classId)->where('class_members.is_active', true))->count() 
            : Student::count();
        $totalStudents = $totalStudents ?: 1;

        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::today()->subDays(6);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::today();
        
        if ($startDate->greaterThan($endDate)) {
            $temp = $startDate;
            $startDate = $endDate;
            $endDate = $temp;
        }

        $diffInDays = $startDate->diffInDays($endDate);
        if ($diffInDays > 30) { // Max 31 days
            $startDate = (clone $endDate)->subDays(30);
            $diffInDays = 30;
        }

        $presentCounts = StudentAttendance::where('status', 'hadir')
            ->whereBetween('date', [$startDate->toDateString(), $endDate->toDateString()])
            ->when($classId, fn($q) => $q->where('academic_class_id', $classId))
            ->select(\Illuminate\Support\Facades\DB::raw('DATE(date) as date_only'), \Illuminate\Support\Facades\DB::raw('COUNT(DISTINCT student_id) as total'))
            ->groupBy('date_only')
            ->get()
            ->pluck('total', 'date_only');

        $chartData = [];
        for ($i = $diffInDays; $i >= 0; $i--) {
            $date = (clone $endDate)->subDays($i);
            $dateStr = $date->toDateString();
            $presentCount = $presentCounts[$dateStr] ?? 0;
            $percentage = round(($presentCount / $totalStudents) * 100);
            
            $chartData[] = [
                'label' => $date->isToday() ? 'Hari ini' : 'H-'.$i,
                'height' => $percentage,
                'date' => $date->format('d/m'),
                'present' => $presentCount,
                'total' => $totalStudents,
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

        // 5. Inventory Summary — 1 query GROUP BY, bukan 5 query terpisah
        $invGrouped = Cache::remember('inventory_stats', 300, function () {
            return InventoryBarcode::select('status', DB::raw('count(*) as total'))
                ->groupBy('status')
                ->pluck('total', 'status')
                ->toArray();
        });
        $inventoryStats = [
            'total'     => array_sum($invGrouped),
            'tersedia'  => $invGrouped['tersedia'] ?? 0,
            'dipinjam'  => $invGrouped['dipinjam'] ?? 0,
            'perbaikan' => $invGrouped['perbaikan'] ?? 0,
            'dihapus'   => $invGrouped['dihapus'] ?? 0,
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
            'filters' => [
                'academic_class_id' => $request->academic_class_id,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ]
        ]);
    }
}
