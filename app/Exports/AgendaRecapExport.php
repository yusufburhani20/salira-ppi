<?php

namespace App\Exports;

use Illuminate\Contracts\View\View;
use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithDrawings;
use PhpOffice\PhpSpreadsheet\Worksheet\Drawing;

class AgendaRecapExport implements FromView, ShouldAutoSize, WithTitle, WithDrawings
{
    protected $data;
    protected $matrix;
    protected $meta;

    public function __construct($data, $matrix = null, $meta = [])
    {
        $this->data = $data;
        $this->matrix = $matrix;
        $this->meta = $meta;
    }

    public function view(): View
    {
        return view('exports.agenda_excel', [
            'data' => $this->data,
            'matrix' => $this->matrix,
            'meta' => $this->meta
        ]);
    }

    public function title(): string
    {
        return 'Jurnal & Presensi';
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
}
