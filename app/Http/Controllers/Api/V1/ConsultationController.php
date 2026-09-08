<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\StudentConsultation;
use App\Models\AcademicClass;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Enums\ConsultationCategory;
use App\Enums\FollowUpStatus;
use App\Enums\ConsultationPrivacy;

class ConsultationController extends Controller
{
    public function index(Request $request)
    {
        $query = StudentConsultation::with(['student', 'academicClass'])
            ->where('teacher_id', Auth::id());

        if ($request->academic_class_id) {
            $query->where('class_id', $request->academic_class_id);
        }
        if ($request->category) {
            $query->where('category', $request->category);
        }

        $consultations = $query->latest('consultation_date')->paginate(20);

        return response()->json([
            'data' => $consultations->map(fn($c) => $this->formatConsultation($c)),
            'meta' => [
                'current_page' => $consultations->currentPage(),
                'last_page'    => $consultations->lastPage(),
                'total'        => $consultations->total(),
            ],
        ]);
    }

    public function store(Request $request)
    {
        $categoryValues = array_column(ConsultationCategory::cases(), 'value');
        $followUpValues = array_column(FollowUpStatus::cases(), 'value');

        $validated = $request->validate([
            'student_id'          => 'required|exists:students,id',
            'academic_class_id'   => 'required|exists:academic_classes,id',
            'consultation_date'   => 'required|date',
            'category'            => 'required|in:' . implode(',', $categoryValues),
            'description'         => 'required|string',
            'follow_up'           => 'nullable|string',
            'follow_up_status'    => 'nullable|in:' . implode(',', $followUpValues),
        ]);

        $consultation = StudentConsultation::create(array_merge($validated, [
            'teacher_id' => Auth::id(),
            'class_id'   => $validated['academic_class_id'],
            'privacy'    => ConsultationPrivacy::Internal->value,
        ]));

        return response()->json([
            'message' => 'Catatan konsultasi berhasil disimpan',
            'data'    => $this->formatConsultation($consultation->load(['student', 'academicClass'])),
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $consultation = StudentConsultation::where('teacher_id', Auth::id())->findOrFail($id);

        $validated = $request->validate([
            'description'      => 'sometimes|string',
            'follow_up'        => 'nullable|string',
            'follow_up_status' => 'nullable|string',
        ]);

        $consultation->update($validated);

        return response()->json([
            'message' => 'Konsultasi berhasil diperbarui',
            'data'    => $this->formatConsultation($consultation->load(['student', 'academicClass'])),
        ]);
    }

    public function destroy($id)
    {
        $consultation = StudentConsultation::where('teacher_id', Auth::id())->findOrFail($id);
        $consultation->delete();
        return response()->json(['message' => 'Konsultasi berhasil dihapus']);
    }

    public function getFormData()
    {
        return response()->json([
            'classes'    => AcademicClass::all(['id', 'name']),
            'categories' => array_column(ConsultationCategory::cases(), 'value'),
            'follow_up_statuses' => array_column(FollowUpStatus::cases(), 'value'),
        ]);
    }

    public function getStudents($classId)
    {
        $students = Student::whereHas('academicClasses', function ($q) use ($classId) {
            $q->where('class_id', $classId)->where('is_active', true);
        })->orderBy('name')->get(['students.id', 'students.name', 'students.nisn']);
        return response()->json(['data' => $students]);
    }

    private function formatConsultation(StudentConsultation $c): array
    {
        return [
            'id'                => $c->id,
            'consultation_date' => $c->consultation_date,
            'category'          => $c->category,
            'description'       => $c->description,
            'follow_up'         => $c->follow_up,
            'follow_up_status'  => $c->follow_up_status,
            'student_name'      => $c->student?->name,
            'student_id'        => $c->student_id,
            'class_name'        => $c->academicClass?->name,
            'academic_class_id' => $c->class_id,
        ];
    }
}
