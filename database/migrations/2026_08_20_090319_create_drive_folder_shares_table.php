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
        Schema::create('drive_folder_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drive_folder_id')->constrained('drive_folders')->cascadeOnDelete();
            $table->string('shared_to_type');
            $table->unsignedBigInteger('shared_to_id');
            $table->timestamps();
        
            $table->index(['shared_to_type', 'shared_to_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drive_folder_shares');
    }
};
