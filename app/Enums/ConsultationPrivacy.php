<?php

namespace App\Enums;

enum ConsultationPrivacy: string
{
    case normal = 'normal';
    case confidential = 'confidential';

    public function label(): string
    {
        return match($this) {
            self::normal => 'Normal',
            self::confidential => 'Confidential',
        };
    }
}
