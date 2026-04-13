<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AcademicYear extends Model
{
    protected $guarded = ['id'];

    public function semesters()
    {
        return $this->hasMany(Semester::class);
    }

    public function academicClasses()
    {
        return $this->hasMany(AcademicClass::class);
    }
}
