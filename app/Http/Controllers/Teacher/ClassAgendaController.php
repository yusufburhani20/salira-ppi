<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\ClassAgenda;
use App\Models\StudentAttendance;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use App\Notifications\PortalNotification;
use App\Models\Student;

class ClassAgendaController extends Controller
{
    public function index()
    {
        $agendas = ClassAgenda::with('academicClass')
            ->where('teacher_id', Auth::id())
            ->latest('date')
            ->latest('id')
            ->get();

        return Inertia::render('Teacher/Agendas/Index', [
            'agendas' => $agendas
        ]);
    }

    public function create()
    {
        // Primary: Fetch classes from the active academic year
        $classes = AcademicClass::whereHas('academicYear', function($q) {
            $q->where('is_active', true);
        })->get();

        // Fallback: If no classes found in active year, fetch all classes 
        // to prevent empty dropdowns during year transitions.
        if ($classes->isEmpty()) {
            $classes = AcademicClass::all();
        }
        
        return Inertia::render('Teacher/Agendas/Create', [
            'classes' => $classes,
            'subjects' => Subject::with('academicClasses:id')->orderBy('name')->get(),
        ]);
    }

    public function getStudents(Request $request, $classId)
    {
        $date = $request->query('date', Carbon::today()->toDateString());
        
        $class = AcademicClass::with(['students' => function($q) {
            $q->wherePivot('is_active', true)->orderBy('name');
        }])->findOrFail($classId);

        // Find the current or most recent schedule for this class to check QR attendance
        $day = strtolower(Carbon::parse($date)->format('l'));
        $now = Carbon::now();
        $time = $now->toTimeString();

        // Try to find a schedule that matches "now" or just any schedule for today if checking history
        $schedule = Schedule::where('class_id', $classId)
            ->where('day', $day)
            ->where(function($q) use ($time) {
                $q->where('start_time', '<=', $time)
                  ->orWhere('day', '!=', strtolower(Carbon::now()->format('l'))); // If not today, just get any
            })
            ->first();

        $students = $class->students->map(function($student) use ($date, $schedule) {
            $status = 'hadir'; // Default
            $attendance_id = null;
            
            if ($schedule) {
                $existing = StudentAttendance::where('student_id', $student->id)
                    ->where('schedule_id', $schedule->id)
                    ->whereDate('date', $date)
                    ->first();
                
                if ($existing) {
                    $status = $existing->status->value ?? $existing->status;
                    $attendance_id = $existing->id;
                }
            }

            return array_merge($student->toArray(), [
                'current_status' => $status,
                'attendance_id' => $attendance_id
            ]);
        });
        
        return response()->json($students);
    }

    public function store(Request $request)
    {
        $request->validate([
            'academic_class_id' => 'required|exists:academic_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'subject' => 'nullable|string|max:255',
            'lesson_period' => 'required|string|max:50',
            'date' => 'required|date',
            'topic' => 'required|string|max:255',
            'activities' => 'required|string',
            'student_tasks' => 'nullable|string',
            'attendance' => 'required|array', // Structure: [{student_id: 1, status: 'hadir'}]
        ]);

        $subjectName = Subject::find($request->subject_id)->name;

        DB::transaction(function() use ($request, $subjectName) {
            $agenda = ClassAgenda::create([
                'teacher_id' => Auth::id(),
                'academic_class_id' => $request->academic_class_id,
                'subject_id' => $request->subject_id,
                'subject' => $subjectName,
                'lesson_period' => $request->lesson_period,
                'date' => $request->date,
                'topic' => $request->topic,
                'activities' => $request->activities,
                'student_tasks' => $request->student_tasks,
                'status' => 'published',
            ]);

            foreach ($request->attendance as $att) {
                if (!empty($att['id'])) {
                    // Update existing QR attendance
                    StudentAttendance::where('id', $att['id'])->update([
                        'academic_class_id' => $request->academic_class_id,
                        'class_agenda_id' => $agenda->id,
                        'recorded_by' => Auth::id(),
                        'status' => $att['status'],
                        'notes' => $att['notes'] ?? null,
                    ]);
                } else {
                    // Create new attendance
                    StudentAttendance::create([
                        'academic_class_id' => $request->academic_class_id,
                        'class_agenda_id' => $agenda->id,
                        'student_id' => $att['student_id'],
                        'recorded_by' => Auth::id(),
                        'date' => $request->date,
                        'status' => $att['status'],
                        'notes' => $att['notes'] ?? null,
                    ]);
                }

                // Notify if NOT present
                if (in_array(strtolower($att['status']), ['sakit', 'izin', 'alpha', 'absent', 'permission', 'sick'])) {
                    $student = Student::find($att['student_id']);
                    if ($student) {
                        $statusLabel = strtoupper($att['status']);
                        $student->notify(new PortalNotification(
                            "Presensi hari ini ({$request->date}) dicatat sebagai: {$statusLabel} pada mata pelajaran {$subjectName}",
                            ['type' => 'attendance', 'id' => $agenda->id]
                        ));
                    }
                }
            }
        });

        return redirect()->route('teacher.agendas.index')->with('success', 'Jurnal dan Absensi berhasil disimpan.');
    }

    public function edit($id)
    {
        $agenda = ClassAgenda::with(['academicClass', 'attendances'])->findOrFail($id);
        
        // Ensure only the teacher who created it can edit
        if ($agenda->teacher_id !== Auth::id()) {
            abort(403);
        }

        $classes = AcademicClass::whereHas('academicYear', function($q) {
            $q->where('is_active', true);
        })->get();

        if ($classes->isEmpty()) {
            $classes = AcademicClass::all();
        }

        return Inertia::render('Teacher/Agendas/Edit', [
            'agenda' => $agenda,
            'classes' => $classes,
            'subjects' => Subject::with('academicClasses:id')->orderBy('name')->get(),
        ]);
    }

    public function show(Request $request, $id)
    {
        $agenda = ClassAgenda::with([
            'academicClass', 
            'attendances.student'
        ])->findOrFail($id);
        
        if ($agenda->teacher_id !== Auth::id()) {
            abort(403);
        }

        if ($request->wantsJson()) {
            return response()->json($agenda);
        }

        return Inertia::render('Teacher/Agendas/Show', [
            'agenda' => $agenda,
        ]);
    }

    public function update(Request $request, $id)
    {
        $agenda = ClassAgenda::findOrFail($id);
        
        if ($agenda->teacher_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'academic_class_id' => 'required|exists:academic_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'subject' => 'nullable|string|max:255',
            'lesson_period' => 'required|string|max:50',
            'date' => 'required|date',
            'topic' => 'required|string|max:255',
            'activities' => 'required|string',
            'student_tasks' => 'nullable|string',
            'attendance' => 'required|array',
        ]);

        $subjectName = Subject::find($request->subject_id)->name;

        DB::transaction(function() use ($request, $agenda, $subjectName) {
            $agenda->update([
                'academic_class_id' => $request->academic_class_id,
                'subject_id' => $request->subject_id,
                'subject' => $subjectName,
                'lesson_period' => $request->lesson_period,
                'date' => $request->date,
                'topic' => $request->topic,
                'activities' => $request->activities,
                'student_tasks' => $request->student_tasks,
            ]);

            // Update attendance records
            foreach ($request->attendance as $att) {
                StudentAttendance::updateOrCreate(
                    [
                        'class_agenda_id' => $agenda->id,
                        'student_id' => $att['student_id']
                    ],
                    [
                        'academic_class_id' => $request->academic_class_id,
                        'recorded_by' => Auth::id(),
                        'date' => $request->date,
                        'status' => $att['status'],
                        'notes' => $att['notes'] ?? null,
                    ]
                );
            }
        });

        return redirect()->route('teacher.agendas.index')->with('success', 'Jurnal dan Absensi berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $agenda = ClassAgenda::findOrFail($id);

        if ($agenda->teacher_id !== Auth::id()) {
            abort(403);
        }

        $agenda->delete();

        return redirect()->route('teacher.agendas.index')
            ->with('success', 'Jurnal mengajar berhasil dihapus.');
    }
}
