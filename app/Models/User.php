<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Spatie\Permission\Traits\HasRoles;
use App\Enums\UserStatus;

class User extends Authenticatable
{
    use HasFactory, Notifiable, HasRoles;

    protected $guarded = ['id'];
    protected $hidden = ['password', 'remember_token'];
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'status' => UserStatus::class,
        'last_login_at' => 'datetime',
    ];

    public function classesAsHomeroom()
    {
        return $this->hasMany(AcademicClass::class, 'homeroom_teacher_id');
    }

    public function schedules()
    {
        return $this->hasMany(Schedule::class, 'teacher_id');
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function recordedStudentAttendances()
    {
        return $this->hasMany(StudentAttendance::class, 'recorded_by');
    }

    public function classAgendas()
    {
        return $this->hasMany(ClassAgenda::class, 'teacher_id');
    }

    public function studentConsultations()
    {
        return $this->hasMany(StudentConsultation::class, 'teacher_id');
    }

    public function permissionRequests()
    {
        return $this->hasMany(PermissionRequest::class);
    }

    public function approvedPermissions()
    {
        return $this->hasMany(PermissionRequest::class, 'approved_by');
    }

    public function inventoryLogs()
    {
        return $this->hasMany(InventoryLog::class);
    }

    public function sessions()
    {
        return $this->hasMany(Session::class);
    }

    public function pushSubscriptions()
    {
        return $this->morphMany(PushSubscription::class, 'subscribable');
    }

    public function isOnline()
    {
        return $this->sessions()->where('last_activity', '>=', now()->subMinutes(5)->getTimestamp())->exists();
    }
}
