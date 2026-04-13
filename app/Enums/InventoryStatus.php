<?php

namespace App\Enums;

enum InventoryStatus: string
{
    case tersedia = 'tersedia';
    case dipinjam = 'dipinjam';
    case perbaikan = 'perbaikan';
    case dihapus = 'dihapus';

    public function label(): string
    {
        return match($this) {
            self::tersedia => 'Tersedia',
            self::dipinjam => 'Dipinjam',
            self::perbaikan => 'Perbaikan',
            self::dihapus => 'Dihapus',
        };
    }
}
