<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\DailyAssessment;
use App\Models\StudentScore;
use App\Models\ClassAgenda;
use App\Models\StudentConsultation;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Barryvdh\DomPDF\Facade\Pdf;
use App\Models\Setting;

class RecapController extends Controller
{
    public function index()
    {
        $classes = AcademicClass::with('academicYear')->get();
        $subjects = Subject::with('academicClasses:id')->orderBy('name')->get();
        
        return Inertia::render('Admin/Reports/Index', [
            'classes' => $classes,
            'subjects' => $subjects,
        ]);
    }

    // --- Attendance Recap ---
    public function attendanceData(Request $request)
    {
        $request->validate([
            'academic_class_id' => 'required|exists:academic_classes,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $classId = $request->academic_class_id;
        $start = Carbon::parse($request->start_date)->startOfDay();
        $end = Carbon::parse($request->end_date)->endOfDay();

        $attendances = StudentAttendance::where('academic_class_id', $classId)
            ->whereNotNull('class_agenda_id')
            ->whereBetween('date', [$start, $end])
            ->get();

        // Generate date range - Only show dates that have attendance data
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
                $daily[$date] = $att ? $att->status->value : '-';
            }

            $report[] = [
                'id' => $student->id,
                'name' => $student->name,
                'daily' => $daily,
                'summary' => [
                    'hadir' => $studentAtts->where('status.value', 'hadir')->count(),
                    'sakit' => $studentAtts->where('status.value', 'sakit')->count(),
                    'izin' => $studentAtts->where('status.value', 'izin')->count(),
                    'alpha' => $studentAtts->where('status.value', 'alpha')->count(),
                    'terlambat' => $studentAtts->where('status.value', 'terlambat')->count(),
                ]
            ];
        }

        return response()->json([
            'dates' => $dates,
            'report' => $report,
            'class' => AcademicClass::find($classId)->name,
            'range' => $start->format('d M Y') . ' - ' . $end->format('d M Y')
        ]);
    }

    // --- Attendance Recap (Per Subject) ---
    public function attendanceSubjectData(Request $request)
    {
        $request->validate([
            'academic_class_id' => 'required|exists:academic_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $classId = $request->academic_class_id;
        $subjectId = $request->subject_id;
        $start = Carbon::parse($request->start_date)->startOfDay();
        $end = Carbon::parse($request->end_date)->endOfDay();

        // Ambil agenda kelas yang sesuai subject
        $agendas = ClassAgenda::where('academic_class_id', $classId)
            ->where('subject_id', $subjectId)
            ->whereBetween('date', [$start, $end])
            ->pluck('id');

        $attendances = StudentAttendance::whereIn('class_agenda_id', $agendas)->get();

        // Generate date range - Only show dates that have attendance data for THIS SUBJECT
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
                $daily[$date] = $att ? $att->status->value : '-';
            }

            $report[] = [
                'id' => $student->id,
                'name' => $student->name,
                'daily' => $daily,
                'summary' => [
                    'hadir' => $studentAtts->where('status.value', 'hadir')->count(),
                    'sakit' => $studentAtts->where('status.value', 'sakit')->count(),
                    'izin' => $studentAtts->where('status.value', 'izin')->count(),
                    'alpha' => $studentAtts->where('status.value', 'alpha')->count(),
                    'terlambat' => $studentAtts->where('status.value', 'terlambat')->count(),
                ]
            ];
        }

        $subjectName = Subject::find($subjectId)->name;

        return response()->json([
            'dates' => $dates,
            'report' => $report,
            'class' => AcademicClass::find($classId)->name,
            'subject' => $subjectName,
            'range' => $start->format('d M Y') . ' - ' . $end->format('d M Y')
        ]);
    }

    // --- Assessments Recap (Detailed) ---
    public function assessmentData(Request $request)
    {
        $request->validate([
            'academic_class_id' => 'required|exists:academic_classes,id',
            'subject_id' => 'required|exists:subjects,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $start = Carbon::parse($request->start_date)->startOfDay();
        $end = Carbon::parse($request->end_date)->endOfDay();

        $assessments = DailyAssessment::where('academic_class_id', $request->academic_class_id)
            ->where('subject_id', $request->subject_id)
            ->whereBetween('date', [$start, $end])
            ->with(['scores.student'])
            ->orderBy('date')
            ->get()
            ->map(function($a) {
                $a->date_formatted = $a->date->format('Y-m-d');
                return $a;
            });

        return response()->json([
            'assessments' => $assessments,
            'range' => $start->format('d M Y') . ' - ' . $end->format('d M Y')
        ]);
    }

    // --- Agendas Recap ---
    public function agendaData(Request $request)
    {
        $request->validate([
            'academic_class_id' => 'required|exists:academic_classes,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $agendas = ClassAgenda::where('academic_class_id', $request->academic_class_id)
            ->whereBetween('date', [$request->start_date, $request->end_date])
            ->with(['teacher', 'subject'])
            ->orderBy('date')
            ->get();

        return response()->json($agendas);
    }

    // --- Consultations Recap ---
    public function consultationData(Request $request)
    {
        $request->validate([
            'academic_class_id' => 'nullable|exists:academic_classes,id',
            'student_id' => 'nullable|exists:students,id',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
        ]);

        $query = StudentConsultation::whereBetween('consultation_date', [$request->start_date, $request->end_date])
            ->with(['student', 'homeroomTeacher', 'academicClass']);

        if ($request->academic_class_id) {
            $query->where('class_id', $request->academic_class_id);
        }

        $consultations = $query->orderBy('consultation_date')->get()->map(function($c) {
            $c->date_formatted = Carbon::parse($c->consultation_date)->format('Y-m-d');
            return $c;
        });

        return response()->json($consultations);
    }

    // --- Export Methods ---
    public function attendanceExport(Request $request)
    {
        $data = $this->attendanceData($request)->getData(true);
        return Excel::download(new \App\Exports\AttendanceRecapExport($data), 'rekap_absensi.xlsx');
    }

    public function attendanceSubjectExport(Request $request)
    {
        $data = $this->attendanceSubjectData($request)->getData(true);
        return Excel::download(new \App\Exports\AttendanceSubjectRecapExport($data), 'rekap_absensi_mapel.xlsx');
    }

    public function assessmentExport(Request $request)
    {
        $data = $this->assessmentData($request)->getData(true);
        
        $subject = \App\Models\Subject::find($request->subject_id);
        $class = \App\Models\AcademicClass::find($request->academic_class_id);
        $teacherName = auth()->user() ? auth()->user()->name : 'Guru';
        
        $meta = [
            'school_name' => Setting::get('school_name', 'SALIRA ACADEMY'),
            'class_name' => $class ? $class->name : 'Semua Kelas',
            'subject_name' => $subject ? $subject->name : 'Semua Mapel',
            'range' => $data['range'],
            'teacher_name' => $teacherName
        ];
        
        return Excel::download(new \App\Exports\AssessmentRecapExport($data, $meta), 'rekap_asesmen.xlsx');
    }

    public function agendaExport(Request $request)
    {
        $agendas = $this->agendaData($request)->getData(true);
        
        $matrix = null;
        if ($request->academic_class_id && $request->start_date && $request->end_date) {
            $matrix = $this->attendanceData($request)->getData(true);
        }
        
        $class = \App\Models\AcademicClass::find($request->academic_class_id);
        $teacherName = auth()->user() ? auth()->user()->name : 'Guru';
        
        $meta = [
            'school_name' => Setting::get('school_name', 'SALIRA ACADEMY'),
            'class_name' => $class ? $class->name : 'Semua Kelas',
            'range' => Carbon::parse($request->start_date)->format('d/m/Y') . ' - ' . Carbon::parse($request->end_date)->format('d/m/Y'),
            'teacher_name' => $teacherName
        ];
        
        return Excel::download(new \App\Exports\AgendaRecapExport($agendas, $matrix, $meta), 'rekap_jurnal_mengajar.xlsx');
    }

    public function consultationExport(Request $request)
    {
        $consultations = $this->consultationData($request)->getData(true);
        
        $class = $request->academic_class_id ? \App\Models\AcademicClass::find($request->academic_class_id) : null;
        $teacherName = auth()->user() ? auth()->user()->name : 'Guru Wali/BK';
        
        $meta = [
            'school_name' => Setting::get('school_name', 'SALIRA ACADEMY'),
            'class_name' => $class ? $class->name : 'Semua Kelas',
            'range' => Carbon::parse($request->start_date)->format('d/m/Y') . ' - ' . Carbon::parse($request->end_date)->format('d/m/Y'),
            'teacher_name' => $teacherName
        ];
        
        return Excel::download(new \App\Exports\ConsultationRecapExport($consultations, $meta), 'rekap_bimbingan_siswa.xlsx');
    }

    // --- PDF Exports ---
    private function getPdfSettings($title, $className = null, $range = null, $subjectName = null)
    {
        return [
            'title' => $title,
            'school_name' => Setting::get('school_name', 'SALIRA ACADEMY'),
            'logo' => Setting::get('school_logo'),
            'class_name' => $className,
            'range' => $range,
            'subject_name' => $subjectName
        ];
    }

    public function attendancePdf(Request $request)
    {
        $data = $this->attendanceData($request)->getData(true);
        $settings = $this->getPdfSettings('Rekap Absensi Siswa', $data['class'], $data['range']);
        
        $pdf = Pdf::loadView('reports.attendance_pdf', array_merge($settings, [
            'dates' => $data['dates'],
            'report' => $data['report']
        ]))->setPaper('a4', 'landscape');

        return $pdf->stream('rekap_absensi.pdf');
    }

    public function attendanceSubjectPdf(Request $request)
    {
        $data = $this->attendanceSubjectData($request)->getData(true);
        $settings = $this->getPdfSettings('Rekap Absensi Mata Pelajaran', $data['class'], $data['range'], $data['subject']);
        
        $pdf = Pdf::loadView('reports.attendance_subject_pdf', array_merge($settings, [
            'dates' => $data['dates'],
            'report' => $data['report'],
            'subject' => $data['subject']
        ]))->setPaper('a4', 'landscape');

        return $pdf->stream('rekap_absensi_mapel.pdf');
    }

    public function assessmentPdf(Request $request)
    {
        $data = $this->assessmentData($request)->getData(true);
        $subject = \App\Models\Subject::find($request->subject_id)->name;
        $settings = $this->getPdfSettings('Rekap Asesmen Harian', \App\Models\AcademicClass::find($request->academic_class_id)->name, $data['range'], $subject);
        
        // Collect students
        $students = collect($data['assessments'])->flatMap(function($a) {
            return collect($a['scores'])->pluck('student.name');
        })->unique()->sort()->values();

        $pdf = Pdf::loadView('reports.assessment_pdf', array_merge($settings, [
            'assessments' => $data['assessments'],
            'students' => $students
        ]))->setPaper('a4', 'landscape');

        return $pdf->stream('rekap_asesmen.pdf');
    }

    public function agendaPdf(Request $request)
    {
        $data = $this->agendaData($request)->getData(true);
        
        $matrix = null;
        if ($request->academic_class_id && $request->start_date && $request->end_date) {
            $matrix = $this->attendanceData($request)->getData(true);
        }
        
        $className = \App\Models\AcademicClass::find($request->academic_class_id)->name;
        $start = Carbon::parse($request->start_date)->format('d/m/Y');
        $end = Carbon::parse($request->end_date)->format('d/m/Y');
        $settings = $this->getPdfSettings('Rekap Jurnal / Agenda Mengajar', $className, "$start - $end");

        $pdf = Pdf::loadView('reports.agenda_pdf', array_merge($settings, [
            'data' => $data,
            'matrix' => $matrix
        ]))->setPaper('a4', 'landscape');

        return $pdf->stream('rekap_jurnal.pdf');
    }

    public function consultationPdf(Request $request)
    {
        $data = $this->consultationData($request)->getData(true);
        $className = $request->academic_class_id ? \App\Models\AcademicClass::find($request->academic_class_id)->name : 'Semua Kelas';
        $start = Carbon::parse($request->start_date)->format('d/m/Y');
        $end = Carbon::parse($request->end_date)->format('d/m/Y');
        $settings = $this->getPdfSettings('Rekap Bimbingan Siswa (Konseling)', $className, "$start - $end");

        $pdf = Pdf::loadView('reports.consultation_pdf', array_merge($settings, [
            'data' => $data
        ]))->setPaper('a4', 'landscape');

        return $pdf->stream('rekap_bimbingan.pdf');
    }
}
