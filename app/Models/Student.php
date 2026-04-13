<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\Gender;
use App\Enums\StudentStatus;

class Student extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'birth_date' => 'date',
        'gender' => Gender::class,
        'status' => StudentStatus::class,
    ];
    protected $appends = ['academic_class', 'academic_class_id'];

    public function getAcademicClassAttribute()
    {
        return $this->academicClasses->where('pivot.is_active', true)->last();
    }

    public function getAcademicClassIdAttribute()
    {
        // Safe null coalescing
        $ac = $this->academic_class;
        return $ac ? $ac->id : null;
    }

    public function academicClasses()
    {
        return $this->belongsToMany(AcademicClass::class, 'class_members', 'student_id', 'class_id')->withPivot('is_active')->withTimestamps();
    }

    public function attendances()
    {
        return $this->hasMany(StudentAttendance::class);
    }

    public function consultations()
    {
        return $this->hasMany(StudentConsultation::class);
    }
}
