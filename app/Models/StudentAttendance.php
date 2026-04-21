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
}
