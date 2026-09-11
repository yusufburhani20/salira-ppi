<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\EveningStudy;
use App\Models\EveningStudyAttendance;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EveningStudyController extends Controller
{
    public function index(Request $request)
    {
        $query = EveningStudy::with(['academicClass', 'supervisor', 'attendances']);

        if ($request->academic_class_id) {
            $query->where('academic_class_id', $request->academic_class_id);
        }
        if ($request->start_date) {
            $query->whereDate('date', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('date', '<=', $request->end_date);
        }

        $records = $query->latest('date')->latest('id')->paginate(20);

        return response()->json([
            'data' => $records->map(fn($e) => $this->format($e)),
            'meta' => [
                'current_page' => $records->currentPage(),
                'last_page'    => $records->lastPage(),
                'total'        => $records->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date'              => 'required|date',
            'academic_class_id' => 'required|exists:academic_classes,id',
            'activity_name'     => 'required|string|max:255',
            'notes'             => 'nullable|string',
            'attendance'        => 'required|array',
            'attendance.*.student_id' => 'required|exists:students,id',
            'attendance.*.status'     => 'required|in:hadir,sakit,izin,alpha,terlambat',
            'attendance.*.notes'      => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            $eveningStudy = EveningStudy::create([
                'date'              => $validated['date'],
                'academic_class_id' => $validated['academic_class_id'],
                'supervisor_id'     => Auth::id(),
                'activity_name'     => $validated['activity_name'],
                'notes'             => $validated['notes'] ?? null,
            ]);

            foreach ($validated['attendance'] as $att) {
                EveningStudyAttendance::create([
                    'evening_study_id' => $eveningStudy->id,
                    'student_id'       => $att['student_id'],
                    'status'           => $att['status'],
                    'notes'            => $att['notes'] ?? null,
                ]);
            }

            DB::commit();
            return response()->json([
                'message' => 'Jurnal Belajar Malam berhasil disimpan.',
                'data'    => $this->format($eveningStudy->load(['academicClass', 'supervisor', 'attendances'])),
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $eveningStudy = EveningStudy::with(['academicClass', 'supervisor', 'attendances.student'])->findOrFail($id);
        return response()->json(['data' => $this->formatDetail($eveningStudy)]);
    }

    public function update(Request $request, $id)
    {
        $eveningStudy = EveningStudy::findOrFail($id);

        // Only supervisor can edit their own record
        if ($eveningStudy->supervisor_id !== Auth::id() && !Auth::user()->hasAnyRole(['Super Admin', 'Guru'])) {
            return response()->json(['message' => 'Anda tidak berhak mengedit jurnal ini.'], 403);
        }

        $validated = $request->validate([
            'date'          => 'required|date',
            'activity_name' => 'required|string|max:255',
            'notes'         => 'nullable|string',
            'attendance'    => 'required|array',
            'attendance.*.student_id' => 'required|exists:students,id',
            'attendance.*.status'     => 'required|in:hadir,sakit,izin,alpha,terlambat',
            'attendance.*.notes'      => 'nullable|string|max:255',
        ]);

        DB::beginTransaction();
        try {
            $eveningStudy->update([
                'date'          => $validated['date'],
                'activity_name' => $validated['activity_name'],
                'notes'         => $validated['notes'] ?? null,
            ]);

            EveningStudyAttendance::where('evening_study_id', $eveningStudy->id)->delete();
            foreach ($validated['attendance'] as $att) {
                EveningStudyAttendance::create([
                    'evening_study_id' => $eveningStudy->id,
                    'student_id'       => $att['student_id'],
                    'status'           => $att['status'],
                    'notes'            => $att['notes'] ?? null,
                ]);
            }

            DB::commit();
            return response()->json([
                'message' => 'Jurnal Belajar Malam berhasil diperbarui.',
                'data'    => $this->format($eveningStudy->load(['academicClass', 'supervisor', 'attendances'])),
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        $eveningStudy = EveningStudy::findOrFail($id);
        if ($eveningStudy->supervisor_id !== Auth::id() && !Auth::user()->hasAnyRole(['Super Admin'])) {
            return response()->json(['message' => 'Anda tidak berhak menghapus jurnal ini.'], 403);
        }
        $eveningStudy->delete();
        return response()->json(['message' => 'Jurnal Belajar Malam berhasil dihapus.']);
    }

    public function getStudents($classId)
    {
        $students = Student::whereHas('academicClasses', function ($q) use ($classId) {
            $q->where('class_members.class_id', $classId)->where('class_members.is_active', true);
        })->orderBy('name')->get(['students.id', 'students.name', 'students.nisn']);

        return response()->json(['data' => $students]);
    }

    public function getFormData()
    {
        return response()->json([
            'classes'  => AcademicClass::all(['id', 'name']),
            'statuses' => ['hadir', 'sakit', 'izin', 'alpha', 'terlambat'],
        ]);
    }

    private function format(EveningStudy $e): array
    {
        return [
            'id'             => $e->id,
            'date'           => $e->date,
            'activity_name'  => $e->activity_name,
            'notes'          => $e->notes,
            'class_name'     => $e->academicClass?->name,
            'supervisor'     => $e->supervisor?->name,
            'hadir_count'    => $e->attendances?->where('status', 'hadir')->count() ?? 0,
            'alpha_count'    => $e->attendances?->where('status', 'alpha')->count() ?? 0,
            'total_students' => $e->attendances?->count() ?? 0,
        ];
    }

    private function formatDetail(EveningStudy $e): array
    {
        return array_merge($this->format($e), [
            'attendance' => $e->attendances->map(fn($a) => [
                'student_id'   => $a->student_id,
                'student_name' => $a->student?->name,
                'status'       => $a->status,
                'notes'        => $a->notes,
            ]),
        ]);
    }
}
