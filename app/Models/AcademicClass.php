<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicClass extends Model
{
    protected $guarded = ['id'];

    public function academicYear()
    {
        return $this->belongsTo(AcademicYear::class);
    }

    public function homeroomTeacher()
    {
        return $this->belongsTo(User::class, 'homeroom_teacher_id');
    }

    public function students()
    {
        return $this->belongsToMany(Student::class, 'class_members', 'class_id', 'student_id')->withPivot('is_active')->withTimestamps();
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'class_id');
    }

    public function studentConsultations()
    {
        return $this->hasMany(StudentConsultation::class, 'class_id');
    }
}
