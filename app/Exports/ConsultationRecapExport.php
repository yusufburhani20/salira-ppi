<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class ConsultationRecapExport implements FromCollection, WithHeadings, ShouldAutoSize
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        return collect($this->data)->map(function($item) {
            return [
                'Tanggal' => $item['consultation_date'],
                'Siswa' => $item['student']['name'] ?? '-',
                'Kelas' => $item['academic_class']['name'] ?? '-',
                'Guru Wali' => $item['teacher']['name'] ?? '-',
                'Kategori' => $item['category'],
                'Perihal' => $item['subject'],
                'Masalah' => $item['problem_description'],
                'Saran' => $item['advice_given'],
                'Status' => $item['follow_up_status'],
            ];
        });
    }

    public function headings(): array
    {
        return [
            ['Rekap Bimbingan Siswa'],
            [],
            ['Tanggal', 'Nama Siswa', 'Kelas', 'Guru Wali', 'Kategori', 'Perihal/Subjek', 'Deskripsi Masalah', 'Saran Diberikan', 'Status']
        ];
    }
}
