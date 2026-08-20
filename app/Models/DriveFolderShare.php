<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriveFolderShare extends Model
{
    use HasFactory;

    protected $fillable = ['drive_folder_id', 'shared_to_type', 'shared_to_id'];

    public function folder()
    {
        return $this->belongsTo(DriveFolder::class, 'drive_folder_id');
    }

    public function sharedTo()
    {
        return $this->morphTo('shared_to');
    }
}
