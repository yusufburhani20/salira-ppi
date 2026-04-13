<?php

namespace App\Exports;

use App\Models\Subject;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;

class SubjectExport implements FromCollection, WithHeadings, WithMapping
{
    public function collection()
    {
        return Subject::all();
    }

    public function headings(): array
    {
        return [
            'ID',
            'Kode',
            'Nama Mata Pelajaran',
            'Deskripsi',
            'Dibuat Pada',
        ];
    }

    public function map($subject): array
    {
        return [
            $subject->id,
            $subject->code,
            $subject->name,
            $subject->description,
            $subject->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
