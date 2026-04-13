<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Carbon\Carbon;

class AssessmentRecapExport implements FromCollection, WithHeadings, ShouldAutoSize
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        $assessments = $this->data['assessments'];
        $students = $this->collectStudents($assessments);
        
        $collection = [];
        foreach ($students as $studentName) {
            $row = [$studentName];
            $total = 0;
            $count = 0;
            foreach ($assessments as $a) {
                $score = collect($a['scores'])->firstWhere('student.name', $studentName);
                if ($score && isset($score['score'])) {
                    $row[] = $score['score'];
                    $total += $score['score'];
                    $count++;
                } else {
                    $row[] = '-';
                }
            }
            $row[] = $count > 0 ? number_format($total / $count, 2) : '-';
            $collection[] = $row;
        }

        return collect($collection);
    }

    public function headings(): array
    {
        $dates = collect($this->data['assessments'])->map(function($a) {
            return Carbon\Carbon::parse($a['date'])->format('d/m') . ' (' . $a['title'] . ')';
        })->toArray();

        return [
            ['Rekap Penilaian Harian'],
            ['Rentang: ' . $this->data['range']],
            [],
            array_merge(['Nama Siswa'], $dates, ['Rata-rata'])
        ];
    }

    protected function collectStudents($assessments)
    {
        $students = [];
        foreach ($assessments as $a) {
            foreach ($a['scores'] as $s) {
                if (isset($s['student']['name'])) {
                    $students[] = $s['student']['name'];
                }
            }
        }
        return array_values(array_unique($students));
    }
}
