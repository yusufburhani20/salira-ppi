<?php

namespace App\Enums;

enum ConsultationCategory: string
{
    case akademik = 'akademik';
    case perilaku = 'perilaku';
    case pribadi = 'pribadi';
    case karir = 'karir';
    case kedisiplinan = 'kedisiplinan';
    case pelanggaran = 'pelanggaran';
    case lainnya = 'lainnya';

    public function label(): string
    {
        return match($this) {
            self::akademik => 'Akademik',
            self::perilaku => 'Perilaku',
            self::pribadi => 'Pribadi',
            self::karir => 'Karir',
            self::kedisiplinan => 'Kedisiplinan',
            self::pelanggaran => 'Pelanggaran',
            self::lainnya => 'Lainnya',
        };
    }
}
