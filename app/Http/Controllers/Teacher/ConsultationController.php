<?php

namespace App\Http\Controllers\Teacher;

use App\Http\Controllers\Controller;
use App\Models\StudentConsultation;
use App\Models\AcademicClass;
use App\Models\Student;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Enums\ConsultationCategory;
use App\Enums\FollowUpStatus;
use App\Enums\ConsultationPrivacy;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use App\Notifications\PortalNotification;

class ConsultationController extends Controller
{
    public function index()
    {
        $consultations = StudentConsultation::with(['student', 'academicClass'])
            ->where('teacher_id', Auth::id())
            ->latest()
            ->paginate(15);

        $classes = AcademicClass::all();
        
        $categories = [];
        foreach(ConsultationCategory::cases() as $case) {
            $categories[] = ['value' => $case->value, 'label' => $case->label()];
        }

        $statuses = [];
        foreach(FollowUpStatus::cases() as $case) {
            $statuses[] = ['value' => $case->value, 'label' => $case->label()];
        }

        return Inertia::render('Teacher/Consultations/Index', [
            'consultations' => $consultations,
            'classes' => $classes,
            'categories' => $categories,
            'statuses' => $statuses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'student_id' => 'required|exists:students,id',
            'class_id' => 'required|exists:academic_classes,id',
            'category' => ['required', Rule::enum(ConsultationCategory::class)],
            'consultation_date' => 'required|date',
            'subject' => 'required|string|max:255',
            'case_description' => 'required|string',
            'discussion_summary' => 'required|string',
            'follow_up_plan' => 'required|string',
            'follow_up_status' => ['required', Rule::enum(FollowUpStatus::class)],
        ]);

        $consultation = StudentConsultation::create([
            'student_id' => $validated['student_id'],
            'teacher_id' => Auth::id(),
            'class_id' => $validated['class_id'],
            'category' => $validated['category'],
            'consultation_date' => $validated['consultation_date'],
            'subject' => $validated['subject'],
            'problem_description' => $validated['case_description'],
            'advice_given' => $validated['discussion_summary'],
            'action_plan' => $validated['follow_up_plan'],
            'follow_up_status' => $validated['follow_up_status'],
            'privacy_level' => ConsultationPrivacy::normal,
        ]);

        // Notify Student
        $student = Student::find($validated['student_id']);
        if ($student) {
            $student->notify(new PortalNotification(
                "Catatan bimbingan baru telah ditambahkan: {$validated['subject']}",
                ['type' => 'consultation', 'id' => $consultation->id]
            ));
        }

        return back()->with('success', 'Catatan bimbingan berhasil disimpan.');
    }

    public function update(Request $request, StudentConsultation $consultation)
    {
        if ($consultation->teacher_id !== Auth::id()) {
            abort(403);
        }

        $validated = $request->validate([
            'category' => ['required', Rule::enum(ConsultationCategory::class)],
            'consultation_date' => 'required|date',
            'subject' => 'required|string|max:255',
            'case_description' => 'required|string',
            'discussion_summary' => 'required|string',
            'follow_up_plan' => 'required|string',
            'follow_up_status' => ['required', Rule::enum(FollowUpStatus::class)],
        ]);

        $consultation->update([
            'category' => $validated['category'],
            'consultation_date' => $validated['consultation_date'],
            'subject' => $validated['subject'],
            'problem_description' => $validated['case_description'],
            'advice_given' => $validated['discussion_summary'],
            'action_plan' => $validated['follow_up_plan'],
            'follow_up_status' => $validated['follow_up_status'],
        ]);

        return back()->with('success', 'Catatan bimbingan berhasil diperbarui.');
    }

    public function destroy(StudentConsultation $consultation)
    {
        if ($consultation->teacher_id !== Auth::id()) {
            abort(403);
        }

        $consultation->delete();

        return back()->with('success', 'Catatan bimbingan berhasil dihapus.');
    }

    public function getStudents($classId)
    {
        $class = AcademicClass::with('students')->find($classId);
        return response()->json($class ? $class->students : []);
    }
}
