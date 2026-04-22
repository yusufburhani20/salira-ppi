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
    public function index()
    {
        $assessments = DailyAssessment::with(['academicClass'])
            ->where('teacher_id', Auth::id())
            ->latest()
            ->paginate(15);

        $classes = AcademicClass::all();
        $subjects = Subject::with('academicClasses:id')->orderBy('name')->get();

        return Inertia::render('Teacher/Assessments/Index', [
            'assessments' => $assessments,
            'classes' => $classes,
            'subjects' => $subjects,
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
}
