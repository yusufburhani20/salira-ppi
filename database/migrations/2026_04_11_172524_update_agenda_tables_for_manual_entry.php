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
        Schema::table('class_agendas', function (Blueprint $table) {
            // Check if column exists before trying to modify it
            $table->foreignId('schedule_id')->nullable()->change();
            
            $table->foreignId('academic_class_id')->after('schedule_id')->nullable()->constrained('academic_classes')->onDelete('cascade');
            $table->string('subject')->after('academic_class_id')->nullable();
            $table->string('lesson_period')->after('subject')->nullable();
        });

        Schema::table('student_attendances', function (Blueprint $table) {
            $table->foreignId('schedule_id')->nullable()->change();
            $table->foreignId('academic_class_id')->after('schedule_id')->nullable()->constrained('academic_classes')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_agendas', function (Blueprint $table) {
            $table->dropForeign(['academic_class_id']);
            $table->dropColumn(['academic_class_id', 'subject', 'lesson_period']);
            $table->foreignId('schedule_id')->nullable(false)->change();
        });

        Schema::table('student_attendances', function (Blueprint $table) {
            $table->dropForeign(['academic_class_id']);
            $table->dropColumn(['academic_class_id']);
            $table->foreignId('schedule_id')->nullable(false)->change();
        });
    }
};
