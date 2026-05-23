<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\AcademicYear;
use App\Models\Semester;

class FixSemesterSeeder extends Seeder
{
    public function run(): void
    {
        $years = AcademicYear::all();

        foreach ($years as $year) {
            if ($year->semesters()->count() === 0) {
                $startYear = (int) substr($year->name, 0, 4);
                if ($startYear < 2000) $startYear = (int) date('Y');
                $endYear = $startYear + 1;

                Semester::create([
                    'academic_year_id' => $year->id,
                    'name'       => 'Ganjil',
                    'is_active'  => true,
                    'start_date' => $startYear . '-07-01',
                    'end_date'   => $startYear . '-12-31',
                ]);

                Semester::create([
                    'academic_year_id' => $year->id,
                    'name'       => 'Genap',
                    'is_active'  => false,
                    'start_date' => $endYear . '-01-01',
                    'end_date'   => $endYear . '-06-30',
                ]);

                echo "Semester dibuat untuk: {$year->name}\n";
            } else {
                echo "{$year->name} sudah punya semester.\n";
            }
        }
    }
}
