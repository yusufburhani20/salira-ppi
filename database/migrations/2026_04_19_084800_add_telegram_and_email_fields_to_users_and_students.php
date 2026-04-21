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
        Schema::table('users', function (Blueprint $table) {
            $table->string('telegram_id')->nullable()->after('phone')->comment('Telegram Chat ID or Username');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->string('parent_email')->nullable()->after('parent_phone');
            $table->string('parent_telegram_id')->nullable()->after('parent_email')->comment('Parent Telegram Chat ID or Username');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('telegram_id');
        });

        Schema::table('students', function (Blueprint $table) {
            $table->dropColumn(['parent_email', 'parent_telegram_id']);
        });
    }
};
