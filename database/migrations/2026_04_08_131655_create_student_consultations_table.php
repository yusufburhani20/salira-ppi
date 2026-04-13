<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('student_consultations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->foreignId('teacher_id')->constrained('users')->onDelete('cascade'); // guru wali
            $table->foreignId('class_id')->constrained('academic_classes')->onDelete('cascade');
            $table->date('consultation_date');
            $table->enum('category', ['akademik', 'perilaku', 'pribadi', 'karir', 'lainnya']);
            $table->string('subject');
            $table->text('problem_description');
            $table->text('advice_given')->nullable();
            $table->text('action_plan')->nullable();
            $table->text('follow_up_notes')->nullable();
            $table->date('follow_up_date')->nullable();
            $table->enum('follow_up_status', ['pending', 'in_progress', 'completed'])->nullable();
            $table->boolean('parent_contacted')->default(false);
            $table->text('parent_feedback')->nullable();
            $table->string('attachment_path')->nullable();
            $table->enum('privacy_level', ['normal', 'confidential'])->default('normal');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('student_consultations');
    }
};
