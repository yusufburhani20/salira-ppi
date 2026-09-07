<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttendanceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'date' => $this->date ? $this->date->format('Y-m-d') : null,
            'check_in' => $this->check_in,
            'check_out' => $this->check_out,
            'status' => $this->status?->value ?? $this->status,
            'notes' => $this->notes,
            'verification_status' => $this->verification_status?->value ?? $this->verification_status,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'photo_url' => $this->photo_url,
            'checkout_photo_url' => $this->checkout_photo_url,
            'created_at' => $this->created_at ? $this->created_at->toDateTimeString() : null,
        ];
    }
}
