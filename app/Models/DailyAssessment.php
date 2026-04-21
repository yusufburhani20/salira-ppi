<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DailyAssessment extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'date' => 'date:Y-m-d',
    ];

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function academicClass()
    {
        return $this->belongsTo(AcademicClass::class, 'academic_class_id');
    }

    public function scores()
    {
        return $this->hasMany(StudentScore::class);
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }
}
