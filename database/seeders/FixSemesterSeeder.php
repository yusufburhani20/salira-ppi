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
            $startYear = (int) substr($year->name, 0, 4);
            if ($startYear < 2000) $startYear = (int) date('Y');
            $endYear = $startYear + 1;

            // Ganjil
            $ganjil = Semester::where('academic_year_id', $year->id)
                ->where('name', 'Ganjil')
                ->first();
            if ($ganjil) {
                $ganjil->update([
                    'start_date' => $startYear . '-07-01',
                    'end_date'   => $startYear . '-12-31',
                ]);
                echo "Semester Ganjil disinkronisasi untuk: {$year->name}\n";
            } else {
                Semester::create([
                    'academic_year_id' => $year->id,
                    'name'       => 'Ganjil',
                    'is_active'  => true,
                    'start_date' => $startYear . '-07-01',
                    'end_date'   => $startYear . '-12-31',
                ]);
                echo "Semester Ganjil dibuat untuk: {$year->name}\n";
            }

            // Genap
            $genap = Semester::where('academic_year_id', $year->id)
                ->where('name', 'Genap')
                ->first();
            if ($genap) {
                $genap->update([
                    'start_date' => $endYear . '-01-01',
                    'end_date'   => $endYear . '-06-30',
                ]);
                echo "Semester Genap disinkronisasi untuk: {$year->name}\n";
            } else {
                Semester::create([
                    'academic_year_id' => $year->id,
                    'name'       => 'Genap',
                    'is_active'  => false,
                    'start_date' => $endYear . '-01-01',
                    'end_date'   => $endYear . '-06-30',
                ]);
                echo "Semester Genap dibuat untuk: {$year->name}\n";
            }
        }
    }
}
