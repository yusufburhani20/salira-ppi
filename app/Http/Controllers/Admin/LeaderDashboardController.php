<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StudentAttendance;
use App\Models\Attendance;
use App\Models\Student;
use App\Models\User;
use App\Models\Bill;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class LeaderDashboardController extends Controller
{
    public function index(\Illuminate\Http\Request $request)
    {
        $today = Carbon::today()->toDateString();
        
        $classId = $request->academic_class_id;
        
        // 1. Statistik Kehadiran Siswa Hari Ini
        $totalStudentsQuery = Student::query();
        if ($classId) {
            $totalStudentsQuery->whereHas('academicClasses', fn($q) => $q->where('academic_classes.id', $classId)->where('class_members.is_active', true));
        }
        $totalStudents = $totalStudentsQuery->count();

        $studentPresenceQuery = StudentAttendance::whereDate('date', $today);
        if ($classId) {
            $studentPresenceQuery->where('academic_class_id', $classId);
        }
        $studentPresence = $studentPresenceQuery
            ->select('status', DB::raw('count(distinct student_id) as total'))
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        // 2. Statistik Kehadiran Guru Hari Ini
        $totalTeachers = User::role(['Guru', 'Wali Kelas'])->count();
        $teacherPresenceCount = Attendance::whereDate('date', $today)
            ->whereNotNull('check_in')
            ->count();

        // 3. Ringkasan Keuangan (Bulan Ini)
        $billingStats = Bill::where('month', Carbon::now()->format('F'))
            ->where('year', Carbon::now()->year)
            ->select('status', DB::raw('sum(amount) as total'))
            ->groupBy('status')
            ->get()
            ->keyBy('status');

        // 4. Tren Kehadiran Siswa
        $startDate = $request->start_date ? Carbon::parse($request->start_date) : Carbon::today()->subDays(6);
        $endDate = $request->end_date ? Carbon::parse($request->end_date) : Carbon::today();
        
        if ($startDate->greaterThan($endDate)) {
            $temp = $startDate;
            $startDate = $endDate;
            $endDate = $temp;
        }

        $diffInDays = $startDate->diffInDays($endDate);
        if ($diffInDays > 30) {
            $startDate = (clone $endDate)->subDays(30);
            $diffInDays = 30;
        }

        $weeklyTrend = [];
        for ($i = $diffInDays; $i >= 0; $i--) {
            $date = (clone $endDate)->subDays($i);
            $countQuery = StudentAttendance::whereDate('date', $date->toDateString())
                ->whereIn('status', ['hadir', 'tap']);
            if ($classId) {
                $countQuery->where('academic_class_id', $classId);
            }
            $count = $countQuery->distinct()->count('student_id');
            
            $weeklyTrend[] = [
                'date' => $date->format('d/m'),
                'count' => $count
            ];
        }

        // 5. User Monitoring & Personal Attendance
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

        // 6. Inventory Summary
        $inventoryStats = [
            'total' => \App\Models\InventoryBarcode::count(),
            'tersedia' => \App\Models\InventoryBarcode::where('status', 'tersedia')->count(),
            'dipinjam' => \App\Models\InventoryBarcode::where('status', 'dipinjam')->count(),
            'perbaikan' => \App\Models\InventoryBarcode::where('status', 'perbaikan')->count(),
            'dihapus' => \App\Models\InventoryBarcode::where('status', 'dihapus')->count(),
        ];

        return Inertia::render('Admin/Dashboard/Leader', [
            'stats' => [
                'students' => [
                    'total' => $totalStudents,
                    'present' => ($studentPresence['hadir']?->total ?? 0) + ($studentPresence['tap']?->total ?? 0),
                    'absent' => $studentPresence['alpha']?->total ?? 0,
                    'sick' => $studentPresence['sakit']?->total ?? 0,
                    'permission' => $studentPresence['izin']?->total ?? 0,
                ],
                'teachers' => [
                    'total' => $totalTeachers,
                    'present' => $teacherPresenceCount,
                ],
                'finance' => [
                    'paid' => (float)($billingStats['paid']?->total ?? 0),
                    'unpaid' => (float)($billingStats['unpaid']?->total ?? 0),
                ],
                'weeklyTrend' => $weeklyTrend
            ],
            'activeUsers' => $activeUsers,
            'lastLogins' => $lastLogins,
            'inventoryStats' => $inventoryStats,
            'filters' => [
                'academic_class_id' => $classId,
                'start_date' => $startDate->format('Y-m-d'),
                'end_date' => $endDate->format('Y-m-d'),
            ],
            'classes' => \App\Models\AcademicClass::orderBy('name')->get(['id', 'name']),
        ]);
    }
}
