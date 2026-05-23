<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromView;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use Illuminate\Contracts\View\View;

class FinalAssessmentExport implements FromView, WithTitle, ShouldAutoSize
{
    protected array $data;
    protected array $meta;

    public function __construct(array $data, array $meta)
    {
        $this->data = $data;
        $this->meta = $meta;
    }

    public function view(): View
    {
        return view('exports.final_assessment_excel', array_merge($this->data, $this->meta));
    }

    public function title(): string
    {
        return 'Rekap Asesmen Akhir';
    }
}
