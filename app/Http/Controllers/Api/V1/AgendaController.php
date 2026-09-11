<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ClassAgenda;
use App\Models\AcademicClass;
use App\Models\Subject;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Enums\AttendanceStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AgendaController extends Controller
{
    public function index(Request $request)
    {
        $query = ClassAgenda::with(['academicClass', 'subject'])
            ->where('teacher_id', Auth::id());

        if ($request->academic_class_id) {
            $query->where('academic_class_id', $request->academic_class_id);
        }
        if ($request->start_date) {
            $query->whereDate('date', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('date', '<=', $request->end_date);
        }

        $agendas = $query->latest('date')->latest('id')->paginate(20);

        return response()->json([
            'data' => $agendas->map(fn($a) => $this->formatAgenda($a)),
            'meta' => [
                'current_page' => $agendas->currentPage(),
                'last_page'    => $agendas->lastPage(),
                'total'        => $agendas->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'academic_class_id' => 'required|exists:academic_classes,id',
            'subject_id'        => 'required|exists:subjects,id',
            'date'              => 'required|date',
            'lesson_hour_start' => 'required|integer|min:1',
            'lesson_hour_end'   => 'required|integer|gte:lesson_hour_start',
            'topic'             => 'required|string|max:500',
            'notes'             => 'nullable|string',
            'attendances'       => 'nullable|array',
            'attendances.*.student_id' => 'exists:students,id',
            'attendances.*.status'     => 'in:hadir,sakit,izin,alpha',
        ]);

        DB::beginTransaction();
        try {
            $agenda = ClassAgenda::create([
                'teacher_id'        => Auth::id(),
                'academic_class_id' => $validated['academic_class_id'],
                'subject_id'        => $validated['subject_id'],
                'date'              => $validated['date'],
                'lesson_hour_start' => $validated['lesson_hour_start'],
                'lesson_hour_end'   => $validated['lesson_hour_end'],
                'topic'             => $validated['topic'],
                'notes'             => $validated['notes'] ?? null,
            ]);

            // Store student attendance if provided
            if (!empty($validated['attendances'])) {
                foreach ($validated['attendances'] as $att) {
                    StudentAttendance::updateOrCreate(
                        ['student_id' => $att['student_id'], 'date' => $validated['date']],
                        [
                            'status'         => $att['status'],
                            'class_agenda_id' => $agenda->id,
                        ]
                    );
                }
            }

            DB::commit();
            return response()->json(['message' => 'Jurnal berhasil disimpan', 'data' => $this->formatAgenda($agenda->load(['academicClass', 'subject']))], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['message' => 'Gagal menyimpan jurnal: ' . $e->getMessage()], 500);
        }
    }

    public function show($id)
    {
        $agenda = ClassAgenda::with(['academicClass', 'subject'])->where('teacher_id', Auth::id())->findOrFail($id);
        return response()->json(['data' => $this->formatAgenda($agenda)]);
    }

    public function getStudents($id)
    {
        $agenda = ClassAgenda::where('teacher_id', Auth::id())->findOrFail($id);
        $students = Student::whereHas('academicClasses', function ($q) use ($agenda) {
            $q->where('class_id', $agenda->academic_class_id)->where('is_active', true);
        })->orderBy('name')->get(['students.id', 'students.name', 'students.nisn']);

        // Get existing attendance for this date
        $existingAttendances = StudentAttendance::where('date', $agenda->date)
            ->whereIn('student_id', $students->pluck('id'))
            ->get()
            ->keyBy('student_id');

        $result = $students->map(fn($s) => [
            'id'     => $s->id,
            'name'   => $s->name,
            'nisn'   => $s->nisn,
            'status' => $existingAttendances[$s->id]->status ?? 'hadir',
        ]);

        return response()->json(['data' => $result]);
    }

    public function getClasses()
    {
        $classes = AcademicClass::all(['id', 'name']);
        $subjects = Subject::orderBy('name')->get(['id', 'name']);
        return response()->json(['classes' => $classes, 'subjects' => $subjects]);
    }

    public function update(Request $request, $id)
    {
        $agenda = ClassAgenda::where('teacher_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'date'              => 'required|date',
            'lesson_hour_start' => 'required|integer|min:1',
            'lesson_hour_end'   => 'required|integer|min:1',
            'topic'             => 'required|string|max:255',
            'notes'             => 'nullable|string',
        ]);

        $agenda->update([
            'date'              => $validated['date'],
            'lesson_hour_start' => $validated['lesson_hour_start'],
            'lesson_hour_end'   => $validated['lesson_hour_end'],
            'topic'             => $validated['topic'],
            'notes'             => $validated['notes'] ?? null,
        ]);

        return response()->json(['message' => 'Jurnal berhasil diperbarui', 'data' => $this->formatAgenda($agenda->load(['academicClass', 'subject']))]);
    }

    public function destroy($id)
    {
        $agenda = ClassAgenda::where('teacher_id', Auth::id())->findOrFail($id);
        $agenda->delete();
        return response()->json(['message' => 'Jurnal berhasil dihapus']);
    }

    private function formatAgenda(ClassAgenda $a): array
    {
        return [
            'id'                => $a->id,
            'date'              => $a->date,
            'topic'             => $a->topic,
            'notes'             => $a->notes,
            'lesson_hour_start' => $a->lesson_hour_start,
            'lesson_hour_end'   => $a->lesson_hour_end,
            'class_name'        => $a->academicClass?->name,
            'subject_name'      => $a->subject?->name,
            'academic_class_id' => $a->academic_class_id,
            'subject_id'        => $a->subject_id,
        ];
    }
}
