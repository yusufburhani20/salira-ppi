<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriveFileShare extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function driveFile()
    {
        return $this->belongsTo(DriveFile::class);
    }

    public function sharedTo()
    {
        return $this->morphTo('shared_to');
    }
}
