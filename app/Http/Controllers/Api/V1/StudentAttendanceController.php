<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\StudentAttendanceResource;
use App\Models\AcademicClass;
use App\Models\StudentAttendance;
use App\Models\Student;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Gate;

class StudentAttendanceController extends Controller
{
    public function index(Request $request)
    {
        // Hanya Guru/Staff yang boleh mengakses manajemen absen murid
        if (class_basename($request->user()) === 'Student') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        Gate::authorize('viewAny', StudentAttendance::class);

        $request->validate([
            'class_id' => 'required|exists:academic_classes,id',
            'date' => 'nullable|date',
        ]);

        $date = $request->date ? Carbon::parse($request->date)->toDateString() : Carbon::today()->toDateString();
        
        $attendances = StudentAttendance::with('student')
            ->where('academic_class_id', $request->class_id)
            ->whereDate('date', $date)
            ->get();

        return response()->json([
            'date' => $date,
            'class_id' => $request->class_id,
            'data' => StudentAttendanceResource::collection($attendances)
        ]);
    }

    public function store(Request $request)
    {
        if (class_basename($request->user()) === 'Student') {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        Gate::authorize('create', StudentAttendance::class);

        $request->validate([
            'class_id' => 'required|exists:academic_classes,id',
            'date' => 'nullable|date',
            'attendances' => 'required|array',
            'attendances.*.student_id' => 'required|exists:students,id',
            'attendances.*.status' => 'required|string',
            'attendances.*.notes' => 'nullable|string',
        ]);

        $date = $request->date ? Carbon::parse($request->date)->toDateString() : Carbon::today()->toDateString();
        $classId = $request->class_id;

        $results = [];
        foreach ($request->attendances as $attData) {
            $attendance = StudentAttendance::updateOrCreate(
                [
                    'academic_class_id' => $classId,
                    'student_id' => $attData['student_id'],
                    'date' => $date
                ],
                [
                    'status' => $attData['status'],
                    'notes' => $attData['notes'] ?? null,
                    'recorded_by' => $request->user()->id,
                ]
            );
            $results[] = $attendance;
        }

        return response()->json([
            'message' => 'Berhasil menyimpan presensi murid.',
            'data' => StudentAttendanceResource::collection($results)
        ]);
    }
}
