<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Student;
use App\Models\AcademicClass;
use App\Exports\StudentsExport;
use App\Imports\StudentsImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Enums\Gender;
use App\Enums\StudentStatus;

class StudentController extends Controller
{
    public function index(Request $request)
    {
        $query = Student::with('academicClasses')->orderBy('name');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('nisn', 'like', "%{$search}%")
                  ->orWhere('nis', 'like', "%{$search}%");
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $students = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Students/Index', [
            'students'   => $students,
            'filters'    => $request->only(['search', 'status']),
            'classes'    => AcademicClass::orderBy('name')->get(['id', 'name']),
            'canManage'  => auth()->user()->hasAnyRole(['Super Admin', 'Staff/TU']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nisn'              => 'required|string|unique:students',
            'nis'               => 'nullable|string|unique:students',
            'name'              => 'required|string|max:255',
            'gender'            => 'required|in:L,P',
            'status'            => 'required|in:' . implode(',', array_column(StudentStatus::cases(), 'value')),
            'birth_place'       => 'nullable|string',
            'birth_date'        => 'nullable|date',
            'parent_name'       => 'nullable|string',
            'parent_phone'      => 'nullable|string',
            'parent_email'      => 'nullable|email|max:255',
            'parent_telegram_id' => 'nullable|string|max:100',
            'academic_class_id' => 'nullable|exists:academic_classes,id',
        ]);

        $studentData = \Illuminate\Support\Arr::except($validated, ['academic_class_id']);
        $student = Student::create($studentData);

        if (!empty($validated['academic_class_id'])) {
            $student->academicClasses()->attach($validated['academic_class_id'], ['is_active' => true]);
        }

        return redirect()->back()->with('success', 'Data siswa berhasil ditambahkan.');
    }

    public function update(Request $request, Student $student)
    {
        $validated = $request->validate([
            'nisn'              => 'required|string|unique:students,nisn,' . $student->id,
            'nis'               => 'nullable|string|unique:students,nis,' . $student->id,
            'name'              => 'required|string|max:255',
            'gender'            => 'required|in:L,P',
            'status'            => 'required|in:' . implode(',', array_column(StudentStatus::cases(), 'value')),
            'birth_place'       => 'nullable|string',
            'birth_date'        => 'nullable|date',
            'parent_name'       => 'nullable|string',
            'parent_phone'      => 'nullable|string',
            'parent_email'      => 'nullable|email|max:255',
            'parent_telegram_id' => 'nullable|string|max:100',
            'academic_class_id' => 'nullable|exists:academic_classes,id',
        ]);

        $studentData = \Illuminate\Support\Arr::except($validated, ['academic_class_id']);
        $student->update($studentData);

        if ($request->has('academic_class_id')) {
            if (!empty($validated['academic_class_id'])) {
                $student->academicClasses()->sync([$validated['academic_class_id'] => ['is_active' => true]]);
            } else {
                $student->academicClasses()->detach();
            }
        }

        return redirect()->back()->with('success', 'Data siswa berhasil diperbarui.');
    }

    public function destroy(Student $student)
    {
        $student->delete();
        return redirect()->back()->with('success', 'Data siswa berhasil dihapus.');
    }

    public function export()
    {
        return Excel::download(new StudentsExport(), 'data-siswa-' . now()->format('Ymd') . '.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|extensions:xlsx,xls,csv|max:5120',
        ]);

        Excel::import(new StudentsImport(), $request->file('file'));

        return redirect()->back()->with('success', 'Import data siswa berhasil.');
    }

    public function template()
    {
        $columns = [
            'NISN', 'NIS', 'Nama Lengkap', 'Jenis Kelamin (L/P)',
            'Tempat Lahir', 'Tanggal Lahir (YYYY-MM-DD)',
            'Nama Orang Tua', 'No. Telepon Orang Tua',
            'Status', 'Nama Kelas',
        ];

        $callback = function () use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            // Example row
            fputcsv($file, ['1234567890', 'S001', 'Budi Santoso', 'L', 'Jakarta', '2007-05-15', 'Andi Santoso', '08123456789', 'active', 'X IPA 1']);
            fclose($file);
        };

        return response()->streamDownload($callback, 'template-siswa.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }

    public function printCards($academic_class_id)
    {
        $academicClass = AcademicClass::findOrFail($academic_class_id);
        
        // Cukup ambil siswa aktif di kelas tersebut
        $students = Student::whereHas('academicClasses', function($q) use ($academic_class_id) {
            $q->where('academic_classes.id', $academic_class_id)
              ->where('class_members.is_active', true);
        })->where('status', 'active')->orderBy('name')->get();

        // Siapkan token QR per siswa
        $studentsWithTokens = $students->map(function ($student) {
            $timestamp = time();
            // Sama dengan PortalController: NIS:Timestamp:HashedSignature
            $signature = hash_hmac('sha256', "{$student->nis}:{$timestamp}", config('app.key'));
            $qrToken = base64_encode("{$student->nis}:{$timestamp}:{$signature}");
            
            return array_merge($student->toArray(), [
                'qr_token' => $qrToken
            ]);
        });

        $settings = [
            'school_name' => \App\Models\Setting::get('school_name', 'SALIRA ACADEMY'),
            'school_logo' => \App\Models\Setting::get('school_logo') ? '/storage/' . \App\Models\Setting::get('school_logo') : null,
            'school_address' => \App\Models\Setting::get('school_address', 'Alamat Sekolah'),
        ];

        return Inertia::render('Admin/Students/PrintCards', [
            'academicClass' => $academicClass,
            'students' => $studentsWithTokens,
            'settings' => $settings,
        ]);
    }
}
