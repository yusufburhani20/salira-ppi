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
        Schema::table('subjects', function (Blueprint $table) {
            $table->integer('kkm')->default(75)->after('description');
        });

        Schema::table('daily_assessments', function (Blueprint $table) {
            $table->integer('kkm')->default(75)->after('max_score');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('subjects', function (Blueprint $table) {
            $table->dropColumn('kkm');
        });

        Schema::table('daily_assessments', function (Blueprint $table) {
            $table->dropColumn('kkm');
        });
    }
};
