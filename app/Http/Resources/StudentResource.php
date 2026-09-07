<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentResource extends JsonResource
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
            'name' => $this->name,
            'nis' => $this->nis,
            'nisn' => $this->nisn,
            'status' => $this->status?->value ?? $this->status,
            'roles' => ['Wali Murid', 'Murid'], // A helper array since students don't use Spatie roles natively
            'photo_url' => $this->photo_url,
            'academic_class' => $this->academic_class ? [
                'id' => $this->academic_class->id,
                'name' => $this->academic_class->name,
                'level' => $this->academic_class->level,
            ] : null,
            'parent' => [
                'name' => $this->parent_name,
                'phone' => $this->parent_phone,
            ]
        ];
    }
}
