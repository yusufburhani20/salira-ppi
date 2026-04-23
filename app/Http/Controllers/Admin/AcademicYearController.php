<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AcademicYear;
use App\Models\Semester;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class AcademicYearController extends Controller
{
    public function index()
    {
        return Inertia::render('Admin/AcademicYears/Index', [
            'academicYears' => AcademicYear::with('semesters')->orderBy('name', 'desc')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name',
            'is_active' => 'boolean',
        ]);

        DB::transaction(function () use ($validated) {
            if ($validated['is_active'] ?? false) {
                AcademicYear::where('is_active', true)->update(['is_active' => false]);
            }

            $academicYear = AcademicYear::create($validated);

            // Default semesters for new academic year
            Semester::create([
                'academic_year_id' => $academicYear->id,
                'name' => 'Ganjil',
                'is_active' => true,
            ]);
            Semester::create([
                'academic_year_id' => $academicYear->id,
                'name' => 'Genap',
                'is_active' => false,
            ]);
        });

        return redirect()->back()->with('success', 'Tahun ajaran berhasil ditambahkan.');
    }

    public function update(Request $request, AcademicYear $academicYear)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:academic_years,name,' . $academicYear->id,
        ]);

        $academicYear->update($validated);

        return redirect()->back()->with('success', 'Tahun ajaran berhasil diperbarui.');
    }

    public function destroy(AcademicYear $academicYear)
    {
        if ($academicYear->is_active) {
            return redirect()->back()->with('error', 'Tahun ajaran aktif tidak dapat dihapus.');
        }

        $academicYear->delete();
        return redirect()->back()->with('success', 'Tahun ajaran berhasil dihapus.');
    }

    public function toggleActive(AcademicYear $academicYear)
    {
        DB::transaction(function () use ($academicYear) {
            AcademicYear::where('is_active', true)->update(['is_active' => false]);
            $academicYear->update(['is_active' => true]);
        });

        return redirect()->back()->with('success', 'Tahun ajaran aktif berhasil diubah.');
    }

    public function toggleSemester(Semester $semester)
    {
        DB::transaction(function () use ($semester) {
            // Deactivate all semesters in the SAME academic year
            Semester::where('academic_year_id', $semester->academic_year_id)
                ->where('is_active', true)
                ->update(['is_active' => false]);
            
            $semester->update(['is_active' => true]);
        });

        return redirect()->back()->with('success', 'Semester aktif berhasil diubah.');
    }
}
