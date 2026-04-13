<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('academic_classes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('academic_year_id')->constrained()->onDelete('cascade');
            $table->string('name');
            $table->string('level'); 
            $table->foreignId('homeroom_teacher_id')->nullable()->constrained('users')->nullOnDelete(); // wali kelas
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('academic_classes');
    }
};
