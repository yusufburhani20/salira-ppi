<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Bill extends Model
{
    protected $fillable = [
        'bill_number', 'student_id', 'title', 'month', 'year', 'amount',
        'status', 'snap_token', 'snap_token_expires_at', 'paid_at',
        'payment_method', 'admin_fee', 'midtrans_order_id',
    ];

    protected $casts = [
        'paid_at'               => 'datetime',
        'snap_token_expires_at' => 'datetime',
        'admin_fee'             => 'integer',
    ];

    public function student()
    {
        return $this->belongsTo(Student::class);
    }
}
