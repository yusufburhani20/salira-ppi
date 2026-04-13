<?php

namespace App\Enums;

enum PermissionStatus: string
{
    case pending = 'pending';
    case approved = 'approved';
    case rejected = 'rejected';

    public function label(): string
    {
        return match($this) {
            self::pending => 'Pending',
            self::approved => 'Approved',
            self::rejected => 'Rejected',
        };
    }
}
