<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\Student;
use App\Models\StudentAttendance;
use App\Models\AcademicYear;
use App\Exports\StudentAttendanceReportExport;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class StudentAttendanceReportController extends Controller
{
    public function index()
    {
        $classes = AcademicClass::with('academicYear')->get();
        $academicYears = AcademicYear::all();
        
        return Inertia::render('Admin/Reports/StudentAttendanceReport', [
            'classes' => $classes,
            'academicYears' => $academicYears,
        ]);
    }

    public function getReport(Request $request)
    {
        $request->validate([
            'academic_class_id' => 'required|exists:academic_classes,id',
            'month' => 'required|integer|between:1,12',
            'year' => 'required|integer',
        ]);

        $data = $this->prepareReportData($request);

        return response()->json($data);
    }

    public function exportExcel(Request $request)
    {
        $data = $this->prepareReportData($request);
        $fileName = "Rekap_Absensi_" . $data['class']->name . "_" . $data['monthName'] . "_" . $data['year'] . ".xlsx";
        
        return Excel::download(new StudentAttendanceReportExport($data), $fileName);
    }

    protected function prepareReportData(Request $request)
    {
        $classId = $request->academic_class_id;
        $month = $request->month;
        $year = $request->year;

        $startDate = Carbon::createFromDate($year, $month, 1)->startOfMonth();
        $endDate = Carbon::createFromDate($year, $month, 1)->endOfMonth();
        $daysInMonth = $startDate->daysInMonth;

        $class = AcademicClass::findOrFail($classId);
        $students = Student::whereHas('academicClasses', function($q) use ($classId) {
            $q->where('academic_classes.id', $classId);
        })->orderBy('name')->get();

        $attendancesData = StudentAttendance::where('academic_class_id', $classId)
            ->whereBetween('date', [$startDate, $endDate])
            ->get();

        $priority = ['alpha', 'sakit', 'izin', 'terlambat', 'hadir'];

        $report = [];
        foreach ($students as $student) {
            $studentData = [
                'name' => $student->name,
                'days' => array_fill(1, $daysInMonth, null),
                'summary' => ['hadir' => 0, 'sakit' => 0, 'izin' => 0, 'alpha' => 0, 'terlambat' => 0]
            ];

            $studentAttendances = $attendancesData->where('student_id', $student->id);

            for ($d = 1; $d <= $daysInMonth; $d++) {
                $dayDate = Carbon::createFromDate($year, $month, $d)->format('Y-m-d');
                // Use filter instead of where to handle Carbon objects comparison correctly
                $dayEntries = $studentAttendances->filter(function($entry) use ($dayDate) {
                    return $entry->date->format('Y-m-d') === $dayDate;
                });

                if ($dayEntries->isNotEmpty()) {
                    $worstStatus = 'hadir';
                    $highestPriorityIndex = 5;
                    foreach ($dayEntries as $entry) {
                        $idx = array_search($entry->status->value, $priority);
                        if ($idx !== false && $idx < $highestPriorityIndex) {
                            $highestPriorityIndex = $idx;
                            $worstStatus = $entry->status->value;
                        }
                    }
                    $studentData['days'][$d] = $worstStatus;
                    $studentData['summary'][$worstStatus]++;
                }
            }
            $report[] = $studentData;
        }

        return [
            'report' => $report,
            'daysInMonth' => $daysInMonth,
            'monthName' => $startDate->translatedFormat('F'),
            'year' => $year,
            'class' => $class
        ];
    }
}
