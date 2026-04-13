<?php

namespace App\Enums;

enum InventoryAction: string
{
    case masuk = 'masuk';
    case keluar = 'keluar';
    case pinjam = 'pinjam';
    case kembali = 'kembali';
    case perbaikan = 'perbaikan';
    case pemusnahan = 'pemusnahan';

    public function label(): string
    {
        return match($this) {
            self::masuk => 'Masuk',
            self::keluar => 'Keluar',
            self::pinjam => 'Pinjam',
            self::kembali => 'Kembali',
            self::perbaikan => 'Perbaikan',
            self::pemusnahan => 'Pemusnahan',
        };
    }
}
