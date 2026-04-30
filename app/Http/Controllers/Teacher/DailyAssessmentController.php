<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\DailyAssessment;
use App\Models\StudentScore;
use App\Models\AcademicClass;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Notifications\PortalNotification;

class DailyAssessmentController extends Controller
{
    public function index(Request $request)
    {
        $query = DailyAssessment::with(['academicClass'])
            ->where('teacher_id', Auth::id());

        // Filters
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

        $assessments = $query->latest()
            ->paginate(15)
            ->withQueryString();

        $classes = AcademicClass::all();
        $subjects = Subject::orderBy('name')->get();

        return Inertia::render('Teacher/Assessments/Index', [
            'assessments' => $assessments,
            'classes' => $classes,
            'subjects' => $subjects,
            'filters' => $request->only(['academic_class_id', 'subject_id', 'start_date', 'end_date'])
        ]);
    }

    public function create(Request $request)
    {
        $classes = AcademicClass::all();
        $subjects = Subject::with('academicClasses:id')->orderBy('name')->get();
        $selectedClassId = $request->class_id;
        $students = [];

        if ($selectedClassId) {
            $class = AcademicClass::with('students')->find($selectedClassId);
            if ($class) {
                $students = $class->students;
            }
        }

        return Inertia::render('Teacher/Assessments/Form', [
            'classes' => $classes,
            'subjects' => $subjects,
            'students' => $students,
            'selectedClassId' => $selectedClassId,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'academic_class_id' => 'required|exists:academic_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'subject' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'scores' => 'required|array',
            'scores.*.student_id' => 'required|exists:students,id',
            'scores.*.score' => 'required|numeric|min:0|max:100',
            'scores.*.notes' => 'nullable|string|max:255',
            'learning_objective' => 'nullable|string',
        ]);

        $subjectName = Subject::find($request->subject_id)->name;

        DB::transaction(function () use ($request, $subjectName) {
            $assessment = DailyAssessment::create([
                'teacher_id' => Auth::id(),
                'academic_class_id' => $request->academic_class_id,
                'subject_id' => $request->subject_id,
                'subject' => $subjectName, // Keep for compatibility
                'title' => $request->title,
                'learning_objective' => $request->learning_objective,
                'date' => $request->date,
                'max_score' => 100,
                'description' => $request->description,
            ]);

            foreach ($request->scores as $scoreData) {
                $studentScore = StudentScore::create([
                    'daily_assessment_id' => $assessment->id,
                    'student_id' => $scoreData['student_id'],
                    'score' => $scoreData['score'],
                    'notes' => $scoreData['notes'] ?? null,
                ]);

                // Notify Student
                $student = \App\Models\Student::find($scoreData['student_id']);
                if ($student) {
                    $student->notify(new PortalNotification(
                        "Nilai baru diterbitkan untuk mata pelajaran {$subjectName}: {$request->title}",
                        ['type' => 'score', 'id' => $assessment->id]
                    ));
                }
            }
        });

        return redirect()->route('teacher.assessments.index')->with('success', 'Penilaian harian berhasil disimpan.');
    }

    public function edit($id)
    {
        $assessment = DailyAssessment::with(['scores.student', 'academicClass'])->findOrFail($id);
        
        if ($assessment->teacher_id !== Auth::id()) {
            abort(403);
        }

        $classes = AcademicClass::all();
        $subjects = Subject::with('academicClasses:id')->orderBy('name')->get();

        return Inertia::render('Teacher/Assessments/Form', [
            'assessment' => $assessment,
            'classes' => $classes,
            'subjects' => $subjects,
            'students' => $assessment->scores->map(function($s) {
                return array_merge($s->student->toArray(), [
                    'score' => $s->score,
                    'notes' => $s->notes
                ]);
            }),
        ]);
    }

    public function update(Request $request, $id)
    {
        $assessment = DailyAssessment::findOrFail($id);

        if ($assessment->teacher_id !== Auth::id()) {
            abort(403);
        }

        $request->validate([
            'subject_id' => 'required|exists:subjects,id',
            'subject' => 'nullable|string|max:255',
            'title' => 'required|string|max:255',
            'date' => 'required|date',
            'scores' => 'required|array',
            'scores.*.student_id' => 'required|exists:students,id',
            'scores.*.score' => 'required|numeric|min:0|max:100',
            'scores.*.notes' => 'nullable|string|max:255',
            'learning_objective' => 'nullable|string',
        ]);

        $subjectName = Subject::find($request->subject_id)->name;

        DB::transaction(function () use ($request, $assessment, $subjectName) {
            $assessment->update([
                'subject_id' => $request->subject_id,
                'subject' => $subjectName,
                'title' => $request->title,
                'learning_objective' => $request->learning_objective,
                'date' => $request->date,
                'description' => $request->description,
            ]);

            foreach ($request->scores as $scoreData) {
                $isNew = !StudentScore::where('daily_assessment_id', $assessment->id)
                    ->where('student_id', $scoreData['student_id'])
                    ->exists();

                StudentScore::updateOrCreate(
                    [
                        'daily_assessment_id' => $assessment->id,
                        'student_id' => $scoreData['student_id']
                    ],
                    [
                        'score' => $scoreData['score'],
                        'notes' => $scoreData['notes'] ?? null,
                    ]
                );

                if ($isNew) {
                    $student = \App\Models\Student::find($scoreData['student_id']);
                    if ($student) {
                        $student->notify(new PortalNotification(
                            "Nilai Anda untuk mata pelajaran {$subjectName} telah diperbarui: {$request->title}",
                            ['type' => 'score', 'id' => $assessment->id]
                        ));
                    }
                }
            }
        });

        return redirect()->route('teacher.assessments.index')->with('success', 'Penilaian harian berhasil diperbarui.');
    }

    public function destroy($id)
    {
        $assessment = DailyAssessment::findOrFail($id);

        if ($assessment->teacher_id !== Auth::id()) {
            abort(403);
        }

        $assessment->delete();

        return back()->with('success', 'Penilaian harian berhasil dihapus.');
    }

    public function exportExcel(Request $request)
    {
        $data = $this->getExportData($request);
        return \Maatwebsite\Excel\Facades\Excel::download(new \App\Exports\AssessmentRecapExport($data), 'rekap_penilaian.xlsx');
    }

    public function exportPdf(Request $request)
    {
        $data = $this->getExportData($request);
        $className = $request->academic_class_id ? AcademicClass::find($request->academic_class_id)->name : 'Semua Kelas';
        $subjectName = $request->subject_id ? Subject::find($request->subject_id)->name : 'Semua Mapel';
        
        $settings = [
            'title' => 'Rekap Penilaian Harian',
            'school_name' => \App\Models\Setting::get('school_name', 'SALIRA ACADEMY'),
            'logo' => \App\Models\Setting::get('school_logo'),
            'class_name' => $className,
            'subject_name' => $subjectName,
            'range' => $data['range'],
            'teacher_name' => Auth::user()->name
        ];

        // Collect students for table rows
        $students = collect($data['assessments'])->flatMap(function($a) {
            return collect($a['scores'])->pluck('student.name');
        })->unique()->sort()->values();

        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('reports.assessment_pdf', array_merge($settings, [
            'assessments' => $data['assessments'],
            'students' => $students
        ]))->setPaper('a4', 'landscape');

        return $pdf->stream('rekap_penilaian.pdf');
    }

    private function getExportData(Request $request)
    {
        $query = DailyAssessment::where('teacher_id', Auth::id())
            ->with(['scores.student', 'academicClass', 'subject']);

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

        $assessments = $query->orderBy('date')->get()->toArray();
        $start = $request->start_date ?? 'Awal';
        $end = $request->end_date ?? 'Sekarang';

        return [
            'assessments' => $assessments,
            'range' => "$start - $end"
        ];
    }
}
