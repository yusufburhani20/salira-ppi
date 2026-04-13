<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;

class AgendaRecapExport implements FromCollection, WithHeadings, ShouldAutoSize
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
                'Tanggal' => $item['date'],
                'Jam' => $item['lesson_period'],
                'Guru' => $item['teacher']['name'] ?? '-',
                'Mapel' => $item['subject']['name'] ?? ($item['subject_name'] ?? '-'),
                'Topik' => $item['topic'],
                'Aktivitas' => $item['activities'],
            ];
        });
    }

    public function headings(): array
    {
        return [
            ['Rekap Jurnal Mengajar'],
            [],
            ['Tanggal', 'Jam', 'Guru', 'Mata Pelajaran', 'Topik Pembelajaran', 'Ringkasan Aktivitas']
        ];
    }
}
