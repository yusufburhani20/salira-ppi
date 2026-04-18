<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Subject;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\SubjectExport;
use App\Exports\SubjectTemplateExport;
use App\Imports\SubjectImport;

class SubjectController extends Controller
{
    public function index()
    {
        $subjects = Subject::with('academicClasses')->latest()->paginate(15);
        $classes = \App\Models\AcademicClass::all();
        
        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => $subjects,
            'classes' => $classes,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:subjects,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'academic_class_ids' => 'nullable|array',
            'academic_class_ids.*' => 'exists:academic_classes,id',
        ]);

        $subject = Subject::create([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        if (isset($validated['academic_class_ids'])) {
            $subject->academicClasses()->sync($validated['academic_class_ids']);
        }

        return back()->with('success', 'Mata Pelajaran berhasil ditambahkan.');
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:subjects,code,' . $subject->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'academic_class_ids' => 'nullable|array',
            'academic_class_ids.*' => 'exists:academic_classes,id',
        ]);

        $subject->update([
            'code' => $validated['code'],
            'name' => $validated['name'],
            'description' => $validated['description'] ?? null,
        ]);

        if (isset($validated['academic_class_ids'])) {
            $subject->academicClasses()->sync($validated['academic_class_ids']);
        } else {
            $subject->academicClasses()->sync([]);
        }

        return back()->with('success', 'Mata Pelajaran berhasil diperbarui.');
    }

    public function destroy(Subject $subject)
    {
        $subject->delete();
        return back()->with('success', 'Mata Pelajaran berhasil dihapus.');
    }

    public function export()
    {
        return Excel::download(new SubjectExport, 'mata_pelajaran_' . date('YmdHis') . '.xlsx');
    }

    public function template()
    {
        return Excel::download(new SubjectTemplateExport, 'template_import_matpel.xlsx');
    }

    public function import(Request $request)
    {
        $request->validate([
            'file' => 'required|mimes:xlsx,xls,csv|max:5120',
        ]);

        try {
            Excel::import(new SubjectImport, $request->file('file'));
            return back()->with('success', 'Data Mata Pelajaran berhasil diimport.');
        } catch (\Maatwebsite\Excel\Validators\ValidationException $e) {
            $failures = $e->failures();
            $messages = [];
            foreach ($failures as $failure) {
                $messages[] = 'Baris ' . $failure->row() . ': ' . implode(', ', $failure->errors());
            }
            return back()->with('error', 'Validasi gagal: ' . implode(' | ', $messages));
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengimport data: ' . $e->getMessage());
        }
    }
}
