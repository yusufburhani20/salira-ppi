<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Merge existing data: Tingkat + Nama Kelas
        DB::statement("UPDATE academic_classes SET name = CONCAT(level, ' ', name)");

        // 2. Hapus kolom level
        Schema::table('academic_classes', function (Blueprint $table) {
            $table->dropColumn('level');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('academic_classes', function (Blueprint $table) {
            $table->string('level', 50)->after('name')->nullable();
        });
    }
};
