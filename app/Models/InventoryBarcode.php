<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\InventoryCondition;
use App\Enums\InventoryStatus;

class InventoryBarcode extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'condition' => InventoryCondition::class,
        'status' => InventoryStatus::class,
    ];

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }

    public function logs()
    {
        return $this->hasMany(InventoryLog::class, 'barcode_id');
    }
}
