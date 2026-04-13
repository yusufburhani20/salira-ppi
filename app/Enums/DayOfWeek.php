<?php

namespace App\Enums;

enum DayOfWeek: string
{
    case monday = 'monday';
    case tuesday = 'tuesday';
    case wednesday = 'wednesday';
    case thursday = 'thursday';
    case friday = 'friday';
    case saturday = 'saturday';
    case sunday = 'sunday';

    public function label(): string
    {
        return match($this) {
            self::monday => 'Monday',
            self::tuesday => 'Tuesday',
            self::wednesday => 'Wednesday',
            self::thursday => 'Thursday',
            self::friday => 'Friday',
            self::saturday => 'Saturday',
            self::sunday => 'Sunday',
        };
    }
}
