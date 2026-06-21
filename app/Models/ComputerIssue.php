<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class ComputerIssue extends Model
{
    protected $guarded = ['id'];

    protected $appends = ['photo_url'];

    protected static function booted()
    {
        static::creating(function ($issue) {
            if (empty($issue->ticket_code)) {
                $issue->ticket_code = 'TKT-' . strtoupper(bin2hex(random_bytes(4)));
            }
        });
    }

    public function unit()
    {
        return $this->belongsTo(ComputerUnit::class, 'computer_unit_id');
    }

    public function resolver()
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    public function getPhotoUrlAttribute()
    {
        return $this->photo_path ? Storage::url($this->photo_path) : null;
    }
}
