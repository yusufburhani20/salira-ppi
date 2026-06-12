<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Schema;
use App\Models\Setting;

$alertTime = '08:00';
$userReminderIn = '07:30';
$userReminderOut = '15:00';
$userReminderEnabled = '1';

try {
    if (Schema::hasTable('settings')) {
        $alertTime = Setting::where('key', 'attendance_alert_time')->value('value') ?? '08:00';
        $userReminderIn = Setting::where('key', 'user_attendance_reminder_time_in')->value('value') ?? '07:30';
        $userReminderOut = Setting::where('key', 'user_attendance_reminder_time_out')->value('value') ?? '15:00';
        $userReminderEnabled = Setting::where('key', 'user_attendance_reminder_enabled')->value('value') ?? '1';
    }
} catch (\Exception $e) {
    // Abaikan jika DB belum terkoneksi atau tabel belum ada (saat composer install awal)
}

Schedule::command('salira:send-absence-alerts')->dailyAt($alertTime);

// Pengingat absensi Guru & Pegawai (Check-in, Check-out)
if ($userReminderEnabled === '1') {
    Schedule::command('salira:send-user-attendance-reminders check_in')
        ->dailyAt($userReminderIn)
        ->skip(fn() => now()->isSunday());

    Schedule::command('salira:send-user-attendance-reminders check_out')
        ->dailyAt($userReminderOut)
        ->skip(fn() => now()->isSunday());
}
