<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithDrawings;
use Maatwebsite\Excel\Concerns\WithCharts;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithTitle;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;
use PhpOffice\PhpSpreadsheet\Chart\Chart;
use PhpOffice\PhpSpreadsheet\Chart\DataSeries;
use PhpOffice\PhpSpreadsheet\Chart\DataSeriesValues;
use PhpOffice\PhpSpreadsheet\Chart\Legend;
use PhpOffice\PhpSpreadsheet\Chart\PlotArea;
use PhpOffice\PhpSpreadsheet\Chart\Title as ChartTitle;

class AttendanceRecapExport implements FromCollection, WithHeadings, ShouldAutoSize, WithDrawings, WithCharts, WithStyles, WithTitle, \Maatwebsite\Excel\Concerns\WithCustomStartCell
{
    protected $data;

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function collection()
    {
        $reportData = collect($this->data['report']);
        $dates = $this->data['dates'];
        $studentsCount = count($reportData);
        
        // 1. Regular Student Records
        $collection = $reportData->map(function($row, $index) use ($dates) {
            $record = [
                'No' => $index + 1,
                'Nama Siswa' => $row['name'],
            ];

            foreach ($dates as $date) {
                $statusVal = $row['daily'][$date] ?? '-';
                $abb = '-';
                if ($statusVal === 'hadir') $abb = 'H';
                elseif ($statusVal === 'sakit') $abb = 'S';
                elseif ($statusVal === 'izin') $abb = 'I';
                elseif ($statusVal === 'alpha') $abb = 'A';
                elseif ($statusVal === 'terlambat') $abb = 'T';
                
                $record[$date] = $abb;
            }

            $record['H'] = $row['summary']['hadir'];
            $record['S'] = $row['summary']['sakit'];
            $record['I'] = $row['summary']['izin'];
            $record['A'] = $row['summary']['alpha'];
            $record['T'] = $row['summary']['terlambat'];

            return $record;
        });

        // 2. Compute Daily Totals and Percentage
        $totalHadir = ['No' => '', 'Nama Siswa' => 'Total Hadir'];
        $totalSakit = ['No' => '', 'Nama Siswa' => 'Total Sakit'];
        $totalIzin  = ['No' => '', 'Nama Siswa' => 'Total Izin'];
        $totalAlpha = ['No' => '', 'Nama Siswa' => 'Total Alpha'];
        $totalTard  = ['No' => '', 'Nama Siswa' => 'Total Terlambat'];
        $pctRow     = ['No' => '', 'Nama Siswa' => 'Persentase Kehadiran (%)'];
        
        $sumHadir = 0;
        $sumSakit = 0;
        $sumIzin  = 0;
        $sumAlpha = 0;
        $sumTard  = 0;

        foreach ($dates as $date) {
            $cHadir = 0;
            $cSakit = 0;
            $cIzin  = 0;
            $cAlpha = 0;
            $cTard  = 0;
            
            foreach ($reportData as $row) {
                $statusVal = $row['daily'][$date] ?? '-';
                if ($statusVal === 'hadir') $cHadir++;
                elseif ($statusVal === 'sakit') $cSakit++;
                elseif ($statusVal === 'izin') $cIzin++;
                elseif ($statusVal === 'alpha') $cAlpha++;
                elseif ($statusVal === 'terlambat') $cTard++;
            }
            
            $totalHadir[$date] = $cHadir;
            $totalSakit[$date] = $cSakit;
            $totalIzin[$date]  = $cIzin;
            $totalAlpha[$date] = $cAlpha;
            $totalTard[$date]  = $cTard;
            
            $present = $cHadir + $cTard;
            $pctRow[$date] = $studentsCount > 0 ? round(($present / $studentsCount) * 100) : 0;
            
            $sumHadir += $cHadir;
            $sumSakit += $cSakit;
            $sumIzin  += $cIzin;
            $sumAlpha += $cAlpha;
            $sumTard  += $cTard;
        }

        // Add overall totals in the summary columns
        $totalHadir['H'] = $sumHadir;  $totalHadir['S'] = ''; $totalHadir['I'] = ''; $totalHadir['A'] = ''; $totalHadir['T'] = '';
        $totalSakit['H'] = ''; $totalSakit['S'] = $sumSakit;  $totalSakit['I'] = ''; $totalSakit['A'] = ''; $totalSakit['T'] = '';
        $totalIzin['H']  = ''; $totalIzin['S'] = ''; $totalIzin['I']  = $sumIzin;   $totalIzin['A'] = ''; $totalIzin['T'] = '';
        $totalAlpha['H'] = ''; $totalAlpha['S'] = ''; $totalAlpha['I']  = ''; $totalAlpha['A'] = $sumAlpha;  $totalAlpha['T'] = '';
        $totalTard['H']  = ''; $totalTard['S'] = ''; $totalTard['I']  = ''; $totalTard['A'] = ''; $totalTard['T']  = $sumTard;

        // Overall average percentage
        $totalSum = $sumHadir + $sumSakit + $sumIzin + $sumAlpha + $sumTard;
        $totalPresent = $sumHadir + $sumTard;
        $pctRow['H'] = $totalSum > 0 ? round(($totalPresent / $totalSum) * 100) . '%' : '0%';
        $pctRow['S'] = ''; $pctRow['I'] = ''; $pctRow['A'] = ''; $pctRow['T'] = '';

        $collection->push($totalHadir);
        $collection->push($totalSakit);
        $collection->push($totalIzin);
        $collection->push($totalAlpha);
        $collection->push($totalTard);
        $collection->push($pctRow);

        return $collection;
    }

    public function startCell(): string
    {
        return 'A6';
    }

    public function headings(): array
    {
        $headers = ['No', 'Nama Siswa'];
        foreach ($this->data['dates'] as $date) {
            $headers[] = \Carbon\Carbon::parse($date)->format('d/m');
        }
        return array_merge($headers, ['H', 'S', 'I', 'A', 'T']);
    }

    public function title(): string
    {
        return 'Rekap Presensi';
    }

    public function drawings()
    {
        $logo = \App\Models\Setting::get('school_logo');
        if ($logo && file_exists(public_path('storage/' . $logo))) {
            $drawing = new Drawing();
            $drawing->setName('Logo Sekolah');
            $drawing->setDescription('Logo');
            $drawing->setPath(public_path('storage/' . $logo));
            $drawing->setHeight(50);
            $drawing->setCoordinates('A1');
            $drawing->setOffsetX(15);
            $drawing->setOffsetY(10);
            return $drawing;
        }
        return [];
    }

    public function charts()
    {
        $D = count($this->data['dates']);
        if ($D == 0) return [];
        
        $S = count($this->data['report']);
        $startColLetter = 'C';
        $endColLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex(2 + $D);
        
        // Persentase Kehadiran (%) row is at index: 6 (headings) + S (students) + 6 (summary rows) = 12 + S
        $pctRow = 6 + $S + 6;
        
        $categories = [
            new DataSeriesValues(
                DataSeriesValues::DATASERIES_TYPE_STRING, 
                '\'Rekap Presensi\'!$C$6:$' . $endColLetter . '$6', 
                null, 
                $D
            ),
        ];
        
        $values = [
            new DataSeriesValues(
                DataSeriesValues::DATASERIES_TYPE_NUMBER, 
                '\'Rekap Presensi\'!$C$' . $pctRow . ':$' . $endColLetter . '$' . $pctRow, 
                null, 
                $D
            ),
        ];
        
        $series = new DataSeries(
            DataSeries::TYPE_BARCHART,
            DataSeries::GROUPING_STANDARD,
            range(0, count($values) - 1),
            [],
            $categories,
            $values
        );
        
        $plotArea = new PlotArea(null, [$series]);
        $legend = new Legend(Legend::POSITION_RIGHT, null, false);
        $title = new ChartTitle('Grafik Persentase Kehadiran Harian (%)');
        
        $chart = new Chart(
            'attendance_chart',
            $title,
            $legend,
            $plotArea,
            true,
            DataSeries::EMPTY_AS_GAP,
            null,
            null
        );
        
        $chartStartRow = 6 + $S + 9;
        $chartEndRow = $chartStartRow + 15;
        
        $chart->setTopLeftPosition('A' . $chartStartRow);
        $chart->setBottomRightPosition('K' . $chartEndRow);
        
        return $chart;
    }

    public function styles(Worksheet $sheet)
    {
        // Write the title block manually starting at Column C
        $sheet->setCellValue('C1', 'REKAPITULASI ABSENSI SISWA');
        $sheet->setCellValue('C2', \App\Models\Setting::get('school_name', 'SALIRA ACADEMY'));
        $sheet->setCellValue('C3', 'Periode: ' . $this->data['range']);
        $sheet->setCellValue('C4', 'Dicetak pada: ' . date('d/m/Y H:i:s'));

        $D = count($this->data['dates']);
        $S = count($this->data['report']);
        $endRow = 6 + $S + 6;
        
        $lastColIndex = 2 + $D + 5;
        $lastColLetter = \PhpOffice\PhpSpreadsheet\Cell\Coordinate::stringFromColumnIndex($lastColIndex);
        
        $sheet->getStyle('C1')->getFont()->setBold(true)->setSize(14)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('4F46E5'));
        $sheet->getStyle('C2')->getFont()->setBold(true)->setSize(11);
        $sheet->getStyle('C3')->getFont()->setItalic(true)->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('64748B'));
        $sheet->getStyle('C4')->getFont()->setSize(9)->setColor(new \PhpOffice\PhpSpreadsheet\Style\Color('64748B'));
        
        // Header Row (Row 6) styling
        $headerRange = 'A6:' . $lastColLetter . '6';
        $sheet->getStyle($headerRange)->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['rgb' => 'FFFFFF'],
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4F46E5'],
            ],
            'alignment' => [
                'horizontal' => \PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER,
                'vertical' => \PhpOffice\PhpSpreadsheet\Style\Alignment::VERTICAL_CENTER,
            ]
        ]);
        
        $sheet->getStyle('A7:B' . $endRow)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_LEFT);
        $otherRange = 'C7:' . $lastColLetter . $endRow;
        $sheet->getStyle($otherRange)->getAlignment()->setHorizontal(\PhpOffice\PhpSpreadsheet\Style\Alignment::HORIZONTAL_CENTER);
        
        $borderRange = 'A6:' . $lastColLetter . $endRow;
        $sheet->getStyle($borderRange)->applyFromArray([
            'borders' => [
                'allBorders' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_THIN,
                    'color' => ['rgb' => 'CBD5E1'],
                ],
            ],
        ]);
        
        $summaryStartRow = 6 + $S + 1;
        $summaryRange = 'A' . $summaryStartRow . ':' . $lastColLetter . $endRow;
        $sheet->getStyle($summaryRange)->applyFromArray([
            'font' => [
                'bold' => true,
            ],
            'fill' => [
                'fillType' => \PhpOffice\PhpSpreadsheet\Style\Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'F1F5F9'],
            ],
        ]);
        
        $pctRow = 6 + $S + 6;
        $sheet->getStyle('A' . $pctRow . ':' . $lastColLetter . $pctRow)->applyFromArray([
            'borders' => [
                'bottom' => [
                    'borderStyle' => \PhpOffice\PhpSpreadsheet\Style\Border::BORDER_DOUBLE,
                    'color' => ['rgb' => '000000'],
                ],
            ],
        ]);
        
        $sheet->getRowDimension(6)->setRowHeight(28);
        for ($r = 7; $r <= $endRow; $r++) {
            $sheet->getRowDimension($r)->setRowHeight(20);
        }
        
        return [];
    }
}
