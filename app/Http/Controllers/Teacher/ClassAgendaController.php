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

use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;

class ClassAgendaController extends Controller
{
    public function index(Request $request)
    {
        $query = ClassAgenda::with('academicClass')
            ->where('teacher_id', Auth::id());

        // Filters
        if ($request->academic_class_id) {
            $query->where('academic_class_id', $request->academic_class_id);
        }
        if ($request->start_date) {
            $query->whereDate('date', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('date', '<=', $request->end_date);
        }

        $agendas = $query->latest('date')
            ->latest('id')
            ->get();

        return Inertia::render('Teacher/Agendas/Index', [
            'agendas' => $agendas,
            'classes' => AcademicClass::all(),
            'filters' => $request->only(['academic_class_id', 'start_date', 'end_date'])
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
        $date    = $request->query('date', Carbon::today()->toDateString());
        $agendaId = $request->query('agenda_id'); // ID agenda jika sedang edit jurnal yang sudah ada

        $class = AcademicClass::with(['students' => function ($q) {
            $q->wherePivot('is_active', true)->orderBy('name');
        }])->findOrFail($classId);

        // === PRIORITAS 1: Jika sedang edit agenda yang sudah ada, gunakan data yang sudah disimpan guru ===
        if ($agendaId) {
            $savedAttendances = StudentAttendance::where('class_agenda_id', $agendaId)
                ->get()
                ->keyBy('student_id');

            if ($savedAttendances->isNotEmpty()) {
                $students = $class->students->map(function ($student) use ($savedAttendances) {
                    $existing = $savedAttendances->get($student->id);
                    return array_merge($student->toArray(), [
                        'current_status' => $existing ? ($existing->status->value ?? $existing->status) : 'hadir',
                        'attendance_id'  => $existing?->id,
                    ]);
                });
                return response()->json($students);
            }
        }

        // === PRIORITAS 2: Cek apakah ada aktivitas tapping hari ini di kelas ini ===
        // Record tap memiliki schedule_id = null dan class_agenda_id = null
        $tapRecords = StudentAttendance::whereIn('student_id', $class->students->pluck('id'))
            ->whereDate('date', $date)
            ->whereNull('schedule_id')
            ->whereNull('class_agenda_id')
            ->get()
            ->keyBy('student_id');

        // === PRIORITAS 3: Jika TIDAK ADA tap sama sekali di kelas ini → semua default Hadir ===
        $hasTapping = $tapRecords->isNotEmpty();

        $students = $class->students->map(function ($student) use ($tapRecords, $hasTapping) {
            $tapRecord = $tapRecords->get($student->id);

            if ($hasTapping) {
                // Ada aktivitas tap: siswa yang tap = Hadir, yang tidak tap = Alpha
                $status        = $tapRecord ? ($tapRecord->status->value ?? $tapRecord->status) : 'alpha';
                $attendance_id = $tapRecord?->id;
            } else {
                // Tidak ada tap sama sekali → fallback semua Hadir
                $status        = 'hadir';
                $attendance_id = null;
            }

            return array_merge($student->toArray(), [
                'current_status' => $status,
                'attendance_id'  => $attendance_id,
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

    public function exportExcel(Request $request)
    {
        $data = $this->getExportData($request);
        
        $subjectName = $request->subject_id ? \App\Models\Subject::find($request->subject_id)->name : 'Semua Mapel';

        $meta = [
            'school_name' => \App\Models\Setting::get('school_name', 'SALIRA ACADEMY'),
            'class_name' => $request->academic_class_id ? \App\Models\AcademicClass::find($request->academic_class_id)->name : 'Semua Kelas',
            'subject_name' => $subjectName,
            'range' => ($request->start_date ?? 'Awal') . ' - ' . ($request->end_date ?? 'Sekarang'),
            'teacher_name' => Auth::user()->name
        ];

        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\AgendaRecapExport($data, $matrix, $meta), 'jurnal_mengajar.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $data = $this->getExportData($request);
        $className = $request->academic_class_id ? AcademicClass::find($request->academic_class_id)->name : 'Semua Kelas';
        $subjectName = $request->subject_id ? Subject::find($request->subject_id)->name : 'Semua Mapel';
        $range = ($request->start_date ?? 'Awal') . ' - ' . ($request->end_date ?? 'Sekarang');
        
        $logo = \App\Models\Setting::get('school_logo');
        $logoPath = null;
        if ($logo) {
            if (file_exists(public_path('storage/' . $logo))) {
                $logoPath = public_path('storage/' . $logo);
            } elseif (file_exists(storage_path('app/public/' . $logo))) {
                $logoPath = storage_path('app/public/' . $logo);
            } elseif (file_exists(public_path($logo))) {
                $logoPath = public_path($logo);
            }
        }

        $settings = [
            'title' => 'Rekap Jurnal & Presensi Terpadu',
            'school_name' => \App\Models\Setting::get('school_name', 'SALIRA ACADEMY'),
            'school_address' => \App\Models\Setting::get('school_address'),
            'logo' => $logoPath,
            'class_name' => $className,
            'subject_name' => $subjectName,
            'range' => $range,
            'teacher_name' => Auth::user()->name
        ];

        // Get Matrix Data if class is selected
        $matrix = null;
        if ($request->academic_class_id && $request->start_date && $request->end_date) {
            $matrix = $this->prepareDetailedAttendanceReport($request);
        }

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.agenda_pdf', array_merge($settings, [
            'data' => $data,
            'matrix' => $matrix
        ]))->setPaper('a4', 'landscape');

        return $pdf->stream('jurnal_mengajar.pdf');
    }

    private function getExportData(Request $request)
    {
        $query = ClassAgenda::with(['teacher', 'subject', 'academicClass', 'attendances.student'])
            ->where('teacher_id', Auth::id());

        if ($request->academic_class_id) {
            $query->where('academic_class_id', $request->academic_class_id);
        }
        if ($request->subject_id) {
            $query->where('subject_id', $request->subject_id);
        }
        if ($request->start_date) {
            $query->whereDate('date', '>=', $request->start_date);
        }
        if ($request->end_date) {
            $query->whereDate('date', '<=', $request->end_date);
        }

        return $query->latest('date')->get()->toArray();
    }

    public function exportAttendanceExcel(Request $request)
    {
        $data = $this->prepareDetailedAttendanceReport($request);
        return Excel::download(new \App\Exports\AttendanceDetailedRecapExport($data), 'rekap_absensi_detail.xlsx');
    }

    public function exportAttendancePdf(Request $request)
    {
        $data = $this->prepareDetailedAttendanceReport($request);
        
        $logo = \App\Models\Setting::get('school_logo');
        $logoPath = null;
        if ($logo) {
            if (file_exists(public_path('storage/' . $logo))) {
                $logoPath = public_path('storage/' . $logo);
            } elseif (file_exists(storage_path('app/public/' . $logo))) {
                $logoPath = storage_path('app/public/' . $logo);
            } elseif (file_exists(public_path($logo))) {
                $logoPath = public_path($logo);
            }
        }

        $settings = [
            'title' => 'Rekap Absensi Detail',
            'school_name' => \App\Models\Setting::get('school_name', 'SALIRA ACADEMY'),
            'school_address' => \App\Models\Setting::get('school_address'),
            'logo' => $logoPath,
            'class_name' => $data['class'],
            'range' => $data['range'],
            'subject' => $data['subject']
        ];
        
        $pdf = Pdf::loadView('reports.attendance_subject_pdf', array_merge($settings, [
            'dates' => $data['dates'],
            'report' => $data['report'],
            'subject' => $data['subject']
        ]))->setPaper('a4', 'landscape');

        return $pdf->stream('rekap_absensi_detail.pdf');
    }

    public function getDetailedAttendanceData(Request $request)
    {
        $data = $this->prepareDetailedAttendanceReport($request);
        return response()->json($data);
    }

    private function prepareDetailedAttendanceReport(Request $request)
    {
        $request->validate([
            'academic_class_id' => 'required|exists:academic_classes,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $classId = $request->academic_class_id;
        $start = Carbon::parse($request->start_date)->startOfDay();
        $end = Carbon::parse($request->end_date)->endOfDay();

        // Get agendas for this teacher in this class
        $query = ClassAgenda::where('teacher_id', Auth::id())
            ->where('academic_class_id', $classId)
            ->whereBetween('date', [$start, $end]);

        if ($request->subject_id) {
            $query->where('subject_id', $request->subject_id);
        }

        $agendas = $query->pluck('id');
        $attendances = StudentAttendance::whereIn('class_agenda_id', $agendas)->get();

        $dates = $attendances->pluck('date')->map(function($d) {
            return Carbon::parse($d)->format('Y-m-d');
        })->unique()->sort()->values()->toArray();

        $students = Student::whereHas('academicClasses', function($q) use ($classId) {
            $q->where('academic_classes.id', $classId);
        })->orderBy('name')->get();

        $report = [];
        foreach ($students as $student) {
            $studentAtts = $attendances->where('student_id', $student->id);
            
            $daily = [];
            foreach ($dates as $date) {
                $att = $studentAtts->filter(function($item) use ($date) {
                    return Carbon::parse($item->date)->format('Y-m-d') === $date;
                })->first();
                $daily[$date] = $att ? ($att->status->value ?? $att->status) : '-';
            }

            $report[] = [
                'id' => $student->id,
                'name' => $student->name,
                'daily' => $daily,
                'summary' => [
                    'hadir' => $studentAtts->where('status', 'hadir')->count(),
                    'sakit' => $studentAtts->where('status', 'sakit')->count(),
                    'izin' => $studentAtts->where('status', 'izin')->count(),
                    'alpha' => $studentAtts->where('status', 'alpha')->count(),
                    'terlambat' => $studentAtts->where('status', 'terlambat')->count(),
                ]
            ];
        }

        $subjectName = $request->subject_id ? Subject::find($request->subject_id)->name : 'Semua Mapel';

        return [
            'dates' => $dates,
            'report' => $report,
            'class' => AcademicClass::find($classId)->name,
            'subject' => $subjectName,
            'range' => $start->format('d M Y') . ' - ' . $end->format('d M Y')
        ];
    }
}
