<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        try {
            // Get all student IDs who currently have at least one active class membership
            $activeStudentIds = DB::table('class_members')
                ->where('is_active', true)
                ->pluck('student_id')
                ->unique()
                ->toArray();

            // Find students who have historical class memberships but NO active class membership anywhere
            $homelessStudents = DB::table('class_members')
                ->whereNotIn('student_id', $activeStudentIds)
                ->select('student_id')
                ->distinct()
                ->pluck('student_id')
                ->toArray();

            if (!empty($homelessStudents)) {
                $affectedClassIds = [];
                
                foreach ($homelessStudents as $studentId) {
                    // Find their latest class membership
                    $latestMembership = DB::table('class_members')
                        ->where('student_id', $studentId)
                        ->orderBy('id', 'desc')
                        ->first();

                    if ($latestMembership) {
                        // Restore it to active
                        DB::table('class_members')
                            ->where('id', $latestMembership->id)
                            ->update(['is_active' => true]);

                        $affectedClassIds[] = $latestMembership->class_id;
                    }
                }

                if (!empty($affectedClassIds)) {
                    // Reset promotion_status to null for these classes
                    DB::table('academic_classes')
                        ->whereIn('id', array_unique($affectedClassIds))
                        ->update(['promotion_status' => null]);
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
