<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PushSubscription extends Model
{
    protected $fillable = [
        'subscribable_type',
        'subscribable_id',
        'endpoint',
        'p256dh',
        'auth',
    ];

    /**
     * Get the owning subscribable model (User or Student).
     */
    public function subscribable()
    {
        return $this->morphTo();
    }
}
