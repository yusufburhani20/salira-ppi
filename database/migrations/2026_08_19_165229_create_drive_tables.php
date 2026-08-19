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
        Schema::create('drive_files', function (Blueprint $table) {
            $table->id();
            $table->string('owner_type');
            $table->unsignedBigInteger('owner_id');
            $table->string('original_name');
            $table->string('file_path');
            $table->unsignedBigInteger('file_size');
            $table->string('mime_type');
            $table->string('public_token')->nullable()->unique();
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->index(['owner_type', 'owner_id']);
        });

        Schema::create('drive_file_shares', function (Blueprint $table) {
            $table->id();
            $table->foreignId('drive_file_id')->constrained('drive_files')->cascadeOnDelete();
            $table->string('shared_to_type');
            $table->unsignedBigInteger('shared_to_id');
            $table->timestamps();

            $table->index(['shared_to_type', 'shared_to_id']);
        });

        Schema::create('drive_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('admin_id')->constrained('users')->cascadeOnDelete();
            $table->string('action');
            $table->string('target_owner_type')->nullable();
            $table->unsignedBigInteger('target_owner_id')->nullable();
            $table->string('file_name');
            $table->text('details')->nullable();
            $table->timestamps();

            $table->index(['target_owner_type', 'target_owner_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('drive_logs');
        Schema::dropIfExists('drive_file_shares');
        Schema::dropIfExists('drive_files');
    }
};
