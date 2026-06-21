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
        Schema::create('computer_labs', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('location')->nullable();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('computer_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('lab_id')->constrained('computer_labs')->cascadeOnDelete();
            $table->string('code')->unique(); // e.g. LAB1-PC01
            $table->string('name');
            $table->string('brand')->nullable();
            $table->string('processor')->nullable();
            $table->string('ram')->nullable();
            $table->string('storage')->nullable();
            $table->string('gpu')->nullable();
            $table->string('os')->nullable();
            $table->string('status')->default('active'); // active, maintenance, broken
            $table->text('note')->nullable();
            $table->timestamps();
        });

        Schema::create('computer_issues', function (Blueprint $table) {
            $table->id();
            $table->foreignId('computer_unit_id')->constrained('computer_units')->cascadeOnDelete();
            $table->string('reporter_name'); // Free text (could be student name or teacher name)
            $table->text('description');
            $table->string('photo_path')->nullable();
            $table->string('status')->default('pending'); // pending, open, resolved
            $table->text('resolution_notes')->nullable();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('computer_issues');
        Schema::dropIfExists('computer_units');
        Schema::dropIfExists('computer_labs');
    }
};
