<?php

namespace App\Enums;

enum AgendaStatus: string
{
    case draft = 'draft';
    case published = 'published';

    public function label(): string
    {
        return match($this) {
            self::draft => 'Draft',
            self::published => 'Published',
        };
    }
}
