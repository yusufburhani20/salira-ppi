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
        Schema::table('daily_assessments', function (Blueprint $table) {
            $table->foreignId('subject_id')->nullable()->after('academic_class_id')->constrained('subjects')->onDelete('set null');
        });

        Schema::table('class_agendas', function (Blueprint $table) {
            $table->foreignId('subject_id')->nullable()->after('academic_class_id')->constrained('subjects')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('daily_assessments', function (Blueprint $table) {
            $table->dropForeign(['subject_id']);
            $table->dropColumn('subject_id');
        });

        Schema::table('class_agendas', function (Blueprint $table) {
            $table->dropForeign(['subject_id']);
            $table->dropColumn('subject_id');
        });
    }
};
