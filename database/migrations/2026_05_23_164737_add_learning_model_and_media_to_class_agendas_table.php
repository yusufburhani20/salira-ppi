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
            $table->text('learning_model')->after('activities')->nullable();
            $table->text('learning_media')->after('learning_model')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('class_agendas', function (Blueprint $table) {
            $table->dropColumn(['learning_model', 'learning_media']);
        });
    }
};
