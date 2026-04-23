<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicClass;
use App\Models\AcademicYear;
use App\Models\User;
use App\Exports\ClassesExport;
use App\Imports\ClassesImport;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class AcademicClassController extends Controller
{
    public function index(Request $request)
    {
        $query = AcademicClass::with(['academicYear', 'homeroomTeacher'])->withCount('students');

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $classes = $query->orderBy('name')->paginate(15)->withQueryString();

        return Inertia::render('Admin/Classes/Index', [
            'classes'       => $classes,
            'academicYears' => AcademicYear::orderBy('name', 'desc')->get(),
            'teachers'      => User::role('Guru/Dosen')->get(['id', 'name', 'nip']),
            'filters'       => $request->only(['search']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'academic_year_id' => 'nullable|exists:academic_years,id',
            'name'             => 'required|string|max:255',
            'homeroom_teacher_id' => 'nullable|exists:users,id',
        ]);

        // Gunakan tahun ajaran yang dipilih, atau fallback ke yang aktif, atau buat baru
        $academicYearId = $validated['academic_year_id']
            ?? AcademicYear::where('is_active', true)->value('id')
            ?? AcademicYear::firstOrCreate(['name' => date('Y') . '/' . (date('Y') + 1)], ['is_active' => true])->id;

        AcademicClass::create([
            'academic_year_id'    => $academicYearId,
            'name'                => $validated['name'],
            'homeroom_teacher_id' => $validated['homeroom_teacher_id'],
        ]);

        return redirect()->back()->with('success', 'Data kelas berhasil ditambahkan.');
    }

    public function update(Request $request, AcademicClass $class)
    {
        $validated = $request->validate([
            'academic_year_id'    => 'nullable|exists:academic_years,id',
            'name'                => 'required|string|max:255',
            'homeroom_teacher_id' => 'nullable|exists:users,id',
        ]);

        $academicYearId = $validated['academic_year_id'] ?? $class->academic_year_id;

        $class->update([
            'academic_year_id'    => $academicYearId,
            'name'                => $validated['name'],
            'homeroom_teacher_id' => $validated['homeroom_teacher_id'],
        ]);

        return redirect()->back()->with('success', 'Data kelas berhasil diperbarui.');
    }

    public function destroy(AcademicClass $class)
    {
        $class->delete();
        return redirect()->back()->with('success', 'Data kelas berhasil dihapus.');
    }

    public function export()
    {
        return Excel::download(new ClassesExport(), 'data-kelas-' . now()->format('Ymd') . '.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|file|extensions:xlsx,xls,csv|max:5120',
        ]);

        Excel::import(new ClassesImport(), $request->file('file'));

        return redirect()->back()->with('success', 'Import data kelas berhasil.');
    }

    public function template()
    {
        $columns = ['Nama Kelas', 'Tahun Ajaran', 'Wali Kelas'];

        $callback = function () use ($columns) {
            $file = fopen('php://output', 'w');
            fputcsv($file, $columns);
            fputcsv($file, ['X IPA 1', '2024/2025', 'Budi Raharjo']);
            fclose($file);
        };

        return response()->streamDownload($callback, 'template-kelas.csv', [
            'Content-Type' => 'text/csv',
        ]);
    }
}
