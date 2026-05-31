<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\PermissionType;
use App\Enums\PermissionStatus;

class PermissionRequest extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'start_date' => 'date:Y-m-d',
        'end_date' => 'date:Y-m-d',
        'type' => PermissionType::class,
        'status' => PermissionStatus::class,
        'approved_at' => 'datetime',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function student()
    {
        return $this->belongsTo(Student::class);
    }

    public function approvedBy()
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function addressedTo()
    {
        return $this->belongsTo(User::class, 'addressed_to');
    }
}
