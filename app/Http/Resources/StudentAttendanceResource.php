<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class StudentAttendanceResource extends JsonResource
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
            'status' => $this->status?->value ?? $this->status,
            'notes' => $this->notes,
            'academic_class_id' => $this->academic_class_id,
            'student_id' => $this->student_id,
            'student_name' => $this->student ? $this->student->name : null,
            'recorded_by' => $this->recorded_by,
            'created_at' => $this->created_at ? $this->created_at->toDateTimeString() : null,
        ];
    }
}
