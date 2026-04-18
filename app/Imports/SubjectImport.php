<?php

namespace App\Imports;

use App\Models\Subject;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class SubjectImport implements ToCollection, WithHeadingRow, WithValidation
{
    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $subject = Subject::create([
                'code' => $row['kode'],
                'name' => $row['nama_mata_pelajaran'],
                'description' => $row['deskripsi'] ?? null,
            ]);

            if (!empty($row['id_kelas_dipisahkan_koma'])) {
                $classIds = explode(',', $row['id_kelas_dipisahkan_koma']);
                $classIds = array_map('trim', $classIds);
                // Filter out any non-numeric values to avoid SQL errors
                $classIds = array_filter($classIds, 'is_numeric');
                $subject->academicClasses()->sync($classIds);
            }
        }
    }

    public function rules(): array
    {
        return [
            'kode' => 'required|unique:subjects,code',
            'nama_mata_pelajaran' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
            'id_kelas_dipisahkan_koma' => 'nullable|string',
        ];
    }
}
