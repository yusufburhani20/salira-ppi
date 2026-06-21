<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\AttendanceStatus;

class EveningStudyAttendance extends Model
{
    protected $guarded = ['id'];

    protected $casts = [
        'status' => AttendanceStatus::class,
    ];

    public function eveningStudy()
    {
        return $this->belongsTo(EveningStudy::class, 'evening_study_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class, 'student_id');
    }
}
