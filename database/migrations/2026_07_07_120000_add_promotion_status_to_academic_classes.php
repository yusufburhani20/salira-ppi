<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('academic_classes', function (Blueprint $table) {
            $table->string('promotion_status')->nullable()->after('homeroom_teacher_id'); // 'promoted' or 'graduated'
        });

        // Auto-cleanup and mark already promoted classes based on existing student memberships
        try {
            $activeYearId = DB::table('academic_years')->where('is_active', true)->value('id');
            if ($activeYearId) {
                // Get all class IDs in the active academic year
                $activeClassIds = DB::table('academic_classes')->where('academic_year_id', $activeYearId)->pluck('id')->toArray();
                
                if (!empty($activeClassIds)) {
                    // Find students who have active memberships in the active academic year classes
                    $studentIdsWithNewClass = DB::table('class_members')
                        ->whereIn('class_id', $activeClassIds)
                        ->where('is_active', true)
                        ->pluck('student_id')
                        ->toArray();

                    if (!empty($studentIdsWithNewClass)) {
                        // Find their old memberships in non-active classes
                        $oldMemberships = DB::table('class_members')
                            ->whereNotIn('class_id', $activeClassIds)
                            ->whereIn('student_id', $studentIdsWithNewClass)
                            ->where('is_active', true)
                            ->get();

                        if ($oldMemberships->isNotEmpty()) {
                            // Deactivate old memberships (set is_active = false)
                            DB::table('class_members')
                                ->whereNotIn('class_id', $activeClassIds)
                                ->whereIn('student_id', $studentIdsWithNewClass)
                                ->update(['is_active' => false]);

                            // Mark those old classes as promoted
                            $oldClassIds = $oldMemberships->pluck('class_id')->unique()->toArray();
                            DB::table('academic_classes')
                                ->whereIn('id', $oldClassIds)
                                ->update(['promotion_status' => 'promoted']);
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            // Silence exception so migration doesn't crash if tables are empty/modified
        }
    }

    public function down(): void
    {
        Schema::table('academic_classes', function (Blueprint $table) {
            $table->dropColumn('promotion_status');
        });
    }
};
