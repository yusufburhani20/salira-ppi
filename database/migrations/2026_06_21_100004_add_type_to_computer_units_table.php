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
        Schema::table('computer_units', function (Blueprint $table) {
            $table->string('type')->default('pc')->after('lab_id'); // pc, switch, router, lemari, other
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('computer_units', function (Blueprint $table) {
            $table->dropColumn('type');
        });
    }
};
