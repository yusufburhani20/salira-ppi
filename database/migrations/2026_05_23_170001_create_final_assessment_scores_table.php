<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('final_assessment_scores', function (Blueprint $table) {
            $table->id();
            $table->foreignId('final_assessment_id')->constrained('final_assessments')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('students')->onDelete('cascade');
            $table->unsignedTinyInteger('score'); // 0-100
            $table->text('notes')->nullable();
            $table->timestamps();

            // Prevent duplicate scores per student per assessment
            $table->unique(['final_assessment_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('final_assessment_scores');
    }
};
