<?php

namespace App\Imports;

use App\Models\Subject;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use Maatwebsite\Excel\Concerns\WithValidation;

class SubjectImport implements ToModel, WithHeadingRow, WithValidation
{
    public function model(array $row)
    {
        return new Subject([
            'code' => $row['kode'],
            'name' => $row['nama_mata_pelajaran'],
            'description' => $row['deskripsi'],
        ]);
    }

    public function rules(): array
    {
        return [
            'kode' => 'required|unique:subjects,code',
            'nama_mata_pelajaran' => 'required|string|max:255',
            'deskripsi' => 'nullable|string',
        ];
    }
}
