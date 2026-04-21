<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\AgendaStatus;

class ClassAgenda extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'date' => 'date:Y-m-d',
        'status' => AgendaStatus::class,
    ];

    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    public function academicClass()
    {
        return $this->belongsTo(AcademicClass::class, 'academic_class_id');
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function attendances()
    {
        return $this->hasMany(StudentAttendance::class, 'class_agenda_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
