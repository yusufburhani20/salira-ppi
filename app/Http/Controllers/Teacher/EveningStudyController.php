<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\EveningStudy;
use App\Models\EveningStudyAttendance;
use App\Models\PermissionRequest;
use App\Models\Student;
use App\Enums\PermissionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class EveningStudyController extends Controller
{
    /**
     * Display a listing of evening study logs.
     */
    public function index()
    {
        $eveningStudies = EveningStudy::with(['academicClass', 'supervisor'])
            ->latest('date')
            ->paginate(15);

        return Inertia::render('Teacher/EveningStudies/Index', [
            'eveningStudies' => $eveningStudies
        ]);
    }

    /**
     * Show the form for creating a new evening study log.
     */
    public function create()
    {
        $classes = AcademicClass::whereHas('academicYear', function($q) {
            $q->where('is_active', true);
        })->get();

        if ($classes->isEmpty()) {
            $classes = AcademicClass::all();
        }

        return Inertia::render('Teacher/EveningStudies/Form', [
            'classes' => $classes,
            'isEdit' => false,
            'eveningStudy' => null
        ]);
    }

    /**
     * Store a newly created evening study journal and its attendances in storage.
     */
    public function store(Request $request)
    {
        $request->validate([
            'date' => 'required|date',
            'academic_class_id' => 'required|exists:academic_classes,id',
            'activity_name' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'photo' => 'required|image|max:3072', // Required on create, Max 3MB
            'attendance' => 'required|array',
            'attendance.*.student_id' => 'required|exists:students,id',
            'attendance.*.status' => 'required|string|in:hadir,sakit,izin,alpha,terlambat',
            'attendance.*.notes' => 'nullable|string|max:255',
        ]);

        $photoPath = $request->file('photo')->store('evening_studies', 'public');

        DB::transaction(function () use ($request, $photoPath) {
            $eveningStudy = EveningStudy::create([
                'date' => $request->date,
                'academic_class_id' => $request->academic_class_id,
                'supervisor_id' => Auth::id(),
                'activity_name' => $request->activity_name,
                'notes' => $request->notes,
                'photo_path' => $photoPath,
            ]);

            foreach ($request->attendance as $att) {
                EveningStudyAttendance::create([
                    'evening_study_id' => $eveningStudy->id,
                    'student_id' => $att['student_id'],
                    'status' => $att['status'],
                    'notes' => $att['notes'] ?? null,
                ]);
            }
        });

        return redirect()->route('teacher.evening-studies.index')
            ->with('success', 'Jurnal dan Absensi Belajar Malam berhasil disimpan.');
    }

    /**
     * Display the specified evening study log details.
     */
    public function show(EveningStudy $eveningStudy)
    {
        $eveningStudy->load(['academicClass', 'supervisor', 'attendances.student']);
        return Inertia::render('Teacher/EveningStudies/Show', [
            'eveningStudy' => $eveningStudy
        ]);
    }

    /**
     * Show the form for editing the specified evening study log.
     */
    public function edit(EveningStudy $eveningStudy)
    {
        $eveningStudy->load('attendances.student');
        
        $classes = AcademicClass::whereHas('academicYear', function($q) {
            $q->where('is_active', true);
        })->get();

        if ($classes->isEmpty()) {
            $classes = AcademicClass::all();
        }

        return Inertia::render('Teacher/EveningStudies/Form', [
            'classes' => $classes,
            'isEdit' => true,
            'eveningStudy' => $eveningStudy
        ]);
    }

    /**
     * Update the specified evening study log in storage.
     */
    public function update(Request $request, EveningStudy $eveningStudy)
    {
        $request->validate([
            'date' => 'required|date',
            'academic_class_id' => 'required|exists:academic_classes,id',
            'activity_name' => 'required|string|max:255',
            'notes' => 'nullable|string',
            'photo' => 'nullable|image|max:3072', // Optional on edit
            'attendance' => 'required|array',
            'attendance.*.student_id' => 'required|exists:students,id',
            'attendance.*.status' => 'required|string|in:hadir,sakit,izin,alpha,terlambat',
            'attendance.*.notes' => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($request, $eveningStudy) {
            $updateData = [
                'date' => $request->date,
                'academic_class_id' => $request->academic_class_id,
                'activity_name' => $request->activity_name,
                'notes' => $request->notes,
            ];

            if ($request->hasFile('photo')) {
                $updateData['photo_path'] = $request->file('photo')->store('evening_studies', 'public');
            }

            $eveningStudy->update($updateData);

            // Re-sync attendance records
            // We can delete and recreate to make it clean
            $eveningStudy->attendances()->delete();

            foreach ($request->attendance as $att) {
                EveningStudyAttendance::create([
                    'evening_study_id' => $eveningStudy->id,
                    'student_id' => $att['student_id'],
                    'status' => $att['status'],
                    'notes' => $att['notes'] ?? null,
                ]);
            }
        });

        return redirect()->route('teacher.evening-studies.index')
            ->with('success', 'Jurnal dan Absensi Belajar Malam berhasil diperbarui.');
    }

    /**
     * Remove the specified evening study log from storage.
     */
    public function destroy(EveningStudy $eveningStudy)
    {
        $eveningStudy->delete(); // Cascades deletes to attendances
        return redirect()->route('teacher.evening-studies.index')
            ->with('success', 'Jurnal Belajar Malam berhasil dihapus.');
    }

    /**
     * API: Get students for evening study attendance with daily permission sync.
     */
    public function getStudents(Request $request, $classId)
    {
        $date = $request->query('date', Carbon::today()->toDateString());
        $editId = $request->query('edit_id');

        $class = AcademicClass::with(['students' => function ($q) {
            $q->wherePivot('is_active', true)->orderBy('name');
        }])->findOrFail($classId);

        // Fetch saved attendance if any
        $savedAttendances = collect();
        if ($editId) {
            $eveningStudy = EveningStudy::find($editId);
            if ($eveningStudy) {
                $savedAttendances = $eveningStudy->attendances->keyBy('student_id');
            }
        } else {
            // Check if there is already a saved evening study on this date
            $eveningStudy = EveningStudy::where('academic_class_id', $classId)
                ->whereDate('date', $date)
                ->first();
            if ($eveningStudy) {
                $savedAttendances = $eveningStudy->attendances->keyBy('student_id');
            }
        }

        // Fetch approved daily student permissions for sync
        $permissions = PermissionRequest::whereDate('start_date', '<=', $date)
            ->whereDate('end_date', '>=', $date)
            ->where('status', PermissionStatus::approved)
            ->get()
            ->keyBy('student_id');

        $students = $class->students->map(function ($student) use ($savedAttendances, $permissions) {
            $existing = $savedAttendances->get($student->id);

            if ($existing) {
                $status = $existing->status->value ?? $existing->status;
                $notes = $existing->notes ?? '';
            } else {
                $perm = $permissions->get($student->id);
                if ($perm) {
                    $status = ($perm->type->value ?? $perm->type) === 'sakit' ? 'sakit' : 'izin';
                    $notes = 'Auto-sync perizinan: ' . ($perm->reason ?: $perm->type->label());
                } else {
                    $status = 'hadir';
                    $notes = '';
                }
            }

            return array_merge($student->toArray(), [
                'current_status' => $status,
                'notes' => $notes,
            ]);
        });

        return response()->json($students);
    }
}
