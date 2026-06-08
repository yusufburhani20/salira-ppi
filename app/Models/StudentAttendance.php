<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\AttendanceStatus;

class StudentAttendance extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'date' => 'date:Y-m-d',
        'status' => AttendanceStatus::class,
    ];

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function academicClass()
    {
        return $this->belongsTo(AcademicClass::class, 'academic_class_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function recordedBy()
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }

    public function classAgenda()
    {
        return $this->belongsTo(ClassAgenda::class, 'class_agenda_id');
    }

    public static function getDailyStatusFromAttendances($dayEntries)
    {
        if ($dayEntries->isEmpty()) {
            return '-';
        }

        $totalCount = $dayEntries->count();
        $alphaCount = $dayEntries->filter(function($entry) {
            $val = $entry->status->value ?? $entry->status;
            return strtolower($val) === 'alpha';
        })->count();

        if ($alphaCount >= 3 || ($alphaCount === $totalCount && $totalCount > 0)) {
            return 'alpha';
        }

        $nonAlphaEntries = $dayEntries->filter(function($entry) {
            $val = $entry->status->value ?? $entry->status;
            return strtolower($val) !== 'alpha';
        });

        if ($nonAlphaEntries->isEmpty()) {
            return 'alpha';
        }

        // Priority: sakit > izin > terlambat > hadir
        $priority = ['sakit', 'izin', 'terlambat', 'hadir'];
        foreach ($priority as $pStatus) {
            if ($nonAlphaEntries->contains(function($entry) use ($pStatus) {
                $val = $entry->status->value ?? $entry->status;
                return strtolower($val) === $pStatus;
            })) {
                return $pStatus;
            }
        }

        $firstStatus = $nonAlphaEntries->first()->status;
        return $firstStatus->value ?? $firstStatus;
    }
}

