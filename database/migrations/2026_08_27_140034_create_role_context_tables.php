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
        // Tabel programs
        if (!Schema::hasTable('programs')) {
            Schema::create('programs', function (Blueprint $table) {
                $table->id();
                $table->string('name');
                $table->timestamps();
            });
        }

        // Pivot program_heads (Kepala Program Keahlian)
        Schema::create('program_heads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('program_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            // Seorang user bisa jadi kepala di beberapa program, tapi mencegah duplikat spesifik
            $table->unique(['user_id', 'program_id']);
        });

        // Pivot class_teachers (Wali Kelas)
        Schema::create('class_teachers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            // Menyesuaikan dengan tabel kelas yang ada (academic_classes)
            $table->foreignId('academic_class_id')->constrained('academic_classes')->onDelete('cascade');
            $table->timestamps();

            // Seorang user bisa jadi wali di beberapa kelas, mencegah duplikat spesifik
            $table->unique(['user_id', 'academic_class_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('class_teachers');
        Schema::dropIfExists('program_heads');
        Schema::dropIfExists('programs');
    }
};
