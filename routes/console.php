<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

use Illuminate\Support\Facades\Schedule;
use App\Models\Setting;

Schedule::command('salira:send-absence-alerts')->dailyAt(
    Setting::where('key', 'attendance_alert_time')->value('value') ?? '08:00'
);
