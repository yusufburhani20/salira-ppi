<?php

namespace App\Enums;

enum FollowUpStatus: string
{
    case pending = 'pending';
    case in_progress = 'in_progress';
    case completed = 'completed';

    public function label(): string
    {
        return match($this) {
            self::pending => 'Pending',
            self::in_progress => 'In Progress',
            self::completed => 'Completed',
        };
    }
}
