<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ── student_attendances ──────────────────────────────────────────────
        // Paling sering di-query: dashboard stats, laporan absensi, booked-periods
        Schema::table('student_attendances', function (Blueprint $table) {
            $table->index(['date', 'academic_class_id'], 'idx_sa_date_class');
            $table->index(['student_id', 'date'],        'idx_sa_student_date');
            $table->index(['date', 'status'],            'idx_sa_date_status');
        });

        // ── attendances (guru) ───────────────────────────────────────────────
        // Di-query untuk dashboard monitoring kehadiran guru
        Schema::table('attendances', function (Blueprint $table) {
            $table->index(['date', 'user_id'], 'idx_att_date_user');
            $table->index(['date', 'status'],  'idx_att_date_status');
        });

        // ── class_agendas ────────────────────────────────────────────────────
        // Di-query untuk jurnal harian, booked-periods, dan laporan guru
        Schema::table('class_agendas', function (Blueprint $table) {
            $table->index(['date', 'academic_class_id'], 'idx_ca_date_class');
            $table->index(['teacher_id', 'date'],        'idx_ca_teacher_date');
        });

        // ── student_scores ───────────────────────────────────────────────────
        // Di-query untuk ranking nilai di dashboard
        Schema::table('student_scores', function (Blueprint $table) {
            $table->index(['student_id'], 'idx_ss_student');
        });
    }

    public function down(): void
    {
        Schema::table('student_attendances', function (Blueprint $table) {
            $table->dropIndex('idx_sa_date_class');
            $table->dropIndex('idx_sa_student_date');
            $table->dropIndex('idx_sa_date_status');
        });

        Schema::table('attendances', function (Blueprint $table) {
            $table->dropIndex('idx_att_date_user');
            $table->dropIndex('idx_att_date_status');
        });

        Schema::table('class_agendas', function (Blueprint $table) {
            $table->dropIndex('idx_ca_date_class');
            $table->dropIndex('idx_ca_teacher_date');
        });

        Schema::table('student_scores', function (Blueprint $table) {
            $table->dropIndex('idx_ss_student');
        });
    }
};
