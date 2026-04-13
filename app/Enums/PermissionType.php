<?php

namespace App\Enums;

enum PermissionType: string
{
    case sakit = 'sakit';
    case izin = 'izin';
    case cuti = 'cuti';
    case dispensasi = 'dispensasi';

    public function label(): string
    {
        return match($this) {
            self::sakit => 'Sakit',
            self::izin => 'Izin',
            self::cuti => 'Cuti',
            self::dispensasi => 'Dispensasi',
        };
    }
}
