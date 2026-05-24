<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('final_assessment_scores', function (Blueprint $table) {
            $table->unsignedTinyInteger('attendance_percentage')->default(100)->after('score');
            $table->unsignedTinyInteger('attitude_score')->nullable()->after('attendance_percentage');
            $table->unsignedTinyInteger('interest_score')->nullable()->after('attitude_score');
            $table->unsignedTinyInteger('character_score')->nullable()->after('interest_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('final_assessment_scores', function (Blueprint $table) {
            $table->dropColumn(['attendance_percentage', 'attitude_score', 'interest_score', 'character_score']);
        });
    }
};
