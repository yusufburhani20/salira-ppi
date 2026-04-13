<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class StudentScore extends Model
{
    protected $guarded = ['id'];

    public function assessment()
    {
        return $this->belongsTo(DailyAssessment::class, 'daily_assessment_id');
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
