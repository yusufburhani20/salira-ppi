<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Enums\InventoryAction;

class InventoryLog extends Model
{
    protected $guarded = ['id'];
    protected $casts = [
        'action' => InventoryAction::class,
    ];

    public function item()
    {
        return $this->belongsTo(InventoryItem::class, 'item_id');
    }

    public function barcode()
    {
        return $this->belongsTo(InventoryBarcode::class, 'barcode_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
