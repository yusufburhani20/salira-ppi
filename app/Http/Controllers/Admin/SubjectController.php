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
        $subjects = Subject::latest()->paginate(15);
        return Inertia::render('Admin/Subjects/Index', [
            'subjects' => $subjects
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:subjects,code',
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        Subject::create($validated);

        return back()->with('success', 'Mata Pelajaran berhasil ditambahkan.');
    }

    public function update(Request $request, Subject $subject)
    {
        $validated = $request->validate([
            'code' => 'required|string|unique:subjects,code,' . $subject->id,
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
        ]);

        $subject->update($validated);

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
        } catch (\Exception $e) {
            return back()->with('error', 'Gagal mengimport data. Pastikan format file sesuai.');
        }
    }
}
