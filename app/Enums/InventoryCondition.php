<?php

namespace App\Enums;

enum InventoryCondition: string
{
    case baik = 'baik';
    case rusak_ringan = 'rusak_ringan';
    case rusak_berat = 'rusak_berat';

    public function label(): string
    {
        return match($this) {
            self::baik => 'Baik',
            self::rusak_ringan => 'Rusak Ringan',
            self::rusak_berat => 'Rusak Berat',
        };
    }
}
