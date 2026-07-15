<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class AttendanceMultiClassRecapExport implements WithMultipleSheets
{
    protected $sheetsData;

    public function __construct(array $sheetsData)
    {
        $this->sheetsData = $sheetsData;
    }

    public function sheets(): array
    {
        $sheets = [];
        foreach ($this->sheetsData as $classData) {
            $sheets[] = new AttendanceRecapExport($classData);
        }
        return $sheets;
    }
}
