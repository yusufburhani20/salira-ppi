<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

// Usually Pivot models extend Illuminate\Database\Eloquent\Relations\Pivot, but this can also just be a normal model if we query it directly.
class ClassMember extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'is_active' => 'boolean',
    ];
}
