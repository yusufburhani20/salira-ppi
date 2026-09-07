<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeviceToken extends Model
{
    protected $fillable = [
        'tokenable_type',
        'tokenable_id',
        'token',
        'device_type',
    ];

    public function tokenable()
    {
        return $this->morphTo();
    }
}
