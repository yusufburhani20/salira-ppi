<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class FinalAssessment extends Model
{
    protected $guarded = ['id'];

    public function semester()
    {
        return $this->belongsTo(Semester::class);
    }

    public function academicClass()
    {
        return $this->belongsTo(AcademicClass::class, 'academic_class_id');
    }

    public function subject()
    {
        return $this->belongsTo(Subject::class);
    }

    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function scores()
    {
        return $this->hasMany(FinalAssessmentScore::class);
    }

    /**
     * Returns whether the assessment belongs to an active semester.
     */
    public function getIsEditableAttribute(): bool
    {
        return (bool) $this->semester?->is_active;
    }
}
