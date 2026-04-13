<?php

namespace App\Enums;

enum StudentStatus: string
{
    case active = 'active';
    case graduated = 'graduated';
    case transferred = 'transferred';
    case dropped_out = 'dropped_out';

    public function label(): string
    {
        return match($this) {
            self::active => 'Active',
            self::graduated => 'Graduated',
            self::transferred => 'Transferred',
            self::dropped_out => 'Dropped Out',
        };
    }
}
