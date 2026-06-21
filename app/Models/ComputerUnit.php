<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ComputerUnit extends Model
{
    protected $guarded = ['id'];

    public function lab()
    {
        return $this->belongsTo(ComputerLab::class, 'lab_id');
    }

    public function issues()
    {
        return $this->hasMany(ComputerIssue::class, 'computer_unit_id');
    }
}
