<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\ConsultationCategory;
use App\Enums\FollowUpStatus;
use App\Enums\ConsultationPrivacy;

class StudentConsultation extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'consultation_date' => 'date',
        'follow_up_date' => 'date',
        'parent_contacted' => 'boolean',
        'category' => ConsultationCategory::class,
        'follow_up_status' => FollowUpStatus::class,
        'privacy_level' => ConsultationPrivacy::class,
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function homeroomTeacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }

    public function academicClass()
    {
        return $this->belongsTo(AcademicClass::class, 'class_id');
    }
}
