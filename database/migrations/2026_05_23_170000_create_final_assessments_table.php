<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('final_assessments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('semester_id')->constrained('semesters')->onDelete('cascade');
            $table->foreignId('academic_class_id')->constrained('academic_classes')->onDelete('cascade');
            $table->foreignId('subject_id')->constrained('subjects')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['ASAS', 'ASAT']); // ASAS=Sem Ganjil, ASAT=Sem Genap (pengganti ASAS)
            $table->text('description')->nullable();
            $table->timestamps();

            // Prevent duplicate: 1 record per class-subject-semester-type
            $table->unique(['semester_id', 'academic_class_id', 'subject_id', 'type'], 'final_assessment_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('final_assessments');
    }
};
