<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        try {
            $activeYearId = DB::table('academic_years')->where('is_active', true)->value('id');
            if ($activeYearId) {
                // Find all classes that are NOT in the active year
                $oldClassIds = DB::table('academic_classes')
                    ->where('academic_year_id', '!=', $activeYearId)
                    ->pluck('id')
                    ->toArray();

                foreach ($oldClassIds as $classId) {
                    // Check if this class has historical students
                    $totalStudents = DB::table('class_members')
                        ->where('class_id', $classId)
                        ->count();

                    if ($totalStudents > 0) {
                        // Check if it has any active students
                        $activeStudents = DB::table('class_members')
                            ->where('class_id', $classId)
                            ->where('is_active', true)
                            ->count();

                        // If it has historical students but 0 active students, it has been fully promoted/moved
                        if ($activeStudents === 0) {
                            DB::table('academic_classes')
                                ->where('id', $classId)
                                ->update(['promotion_status' => 'promoted']);
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            // Silence exception so migration doesn't crash
        }
    }

    public function down(): void
    {
        // No action needed for rollback
    }
};
