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
            $attendances = collect($item['attendances'] ?? []);
            $hadir = $attendances->where('status', 'hadir')->count();
            $sakit = $attendances->where('status', 'sakit')->count();
            $izin = $attendances->where('status', 'izin')->count();
            $alpha = $attendances->where('status', 'alpha')->count();
            
            $absentDetails = $attendances->whereIn('status', ['sakit', 'izin', 'alpha'])
                ->map(function($a) {
                    return ($a['student']['name'] ?? 'Siswa') . ' (' . strtoupper(substr($a['status'], 0, 1)) . ')';
                })->implode(', ');

            return [
                'Tanggal' => $item['date'],
                'Jam' => $item['lesson_period'],
                'Guru' => $item['teacher']['name'] ?? '-',
                'Mapel' => $item['subject']['name'] ?? ($item['subject_name'] ?? '-'),
                'Topik' => $item['topic'],
                'H' => $hadir,
                'S' => $sakit,
                'I' => $izin,
                'A' => $alpha,
                'Keterangan' => $absentDetails ?: '-',
            ];
        });
    }

    public function headings(): array
    {
        return [
            ['Rekap Jurnal Mengajar'],
            [],
            ['Tanggal', 'Jam', 'Guru', 'Mata Pelajaran', 'Topik Pembelajaran', 'H', 'S', 'I', 'A', 'Keterangan Absensi']
        ];
    }
}
