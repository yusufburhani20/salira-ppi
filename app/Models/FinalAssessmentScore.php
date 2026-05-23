<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinalAssessmentScore extends Model
{
    protected $guarded = ['id'];

    public function finalAssessment()
    {
        return $this->belongsTo(FinalAssessment::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
