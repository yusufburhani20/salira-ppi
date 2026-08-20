<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriveFile extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    public function owner()
    {
        return $this->morphTo();
    }

    public function shares()
    {
        return $this->hasMany(DriveFileShare::class);
    }

    public function folder()
    {
        return $this->belongsTo(DriveFolder::class, 'folder_id');
    }
}
