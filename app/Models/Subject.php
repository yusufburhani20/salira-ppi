<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    protected $fillable = ['code', 'name', 'description', 'kkm'];

    public function academicClasses()
    {
        return $this->belongsToMany(AcademicClass::class, 'academic_class_subject', 'subject_id', 'academic_class_id')->withTimestamps();
    }
}
