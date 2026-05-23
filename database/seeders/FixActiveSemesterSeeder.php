<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Semester;
use App\Models\AcademicYear;

class FixActiveSemesterSeeder extends Seeder
{
    public function run(): void
    {
        // Nonaktifkan semua semester
        Semester::where('is_active', true)->update(['is_active' => false]);

        // Cari tahun ajaran aktif
        $activeYear = AcademicYear::where('is_active', true)->first();

        if ($activeYear) {
            // Aktifkan semester Ganjil dari tahun aktif
            $semester = Semester::where('academic_year_id', $activeYear->id)
                ->where('name', 'Ganjil')
                ->first();

            if ($semester) {
                $semester->update(['is_active' => true]);
                echo "Semester aktif disetel: {$semester->name} - {$activeYear->name}\n";
            } else {
                echo "Semester Ganjil tidak ditemukan untuk {$activeYear->name}\n";
            }
        } else {
            echo "Tidak ada tahun ajaran aktif.\n";
        }
    }
}
