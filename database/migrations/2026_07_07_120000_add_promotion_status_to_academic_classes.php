<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('academic_classes', function (Blueprint $table) {
            $table->string('promotion_status')->nullable()->after('homeroom_teacher_id'); // 'promoted' or 'graduated'
        });
    }

    public function down(): void
    {
        Schema::table('academic_classes', function (Blueprint $table) {
            $table->dropColumn('promotion_status');
        });
    }
};
