<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Subject */
class SubjectResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'name'          => $this->name,
            'name_km'       => $this->name_km,
            'code'          => $this->code,
            'classes_count' => $this->whenCounted('classes'),
            'grades_count'  => $this->whenCounted('grades'),
            // គ្រូដែលបង្រៀនមុខវិជ្ជានេះក្នុងថ្នាក់មួយ (តែក្នុង /admin/classes/{id}/subjects)
            'teacher'       => $this->whenLoaded('teacher', fn () => $this->teacher
                ? ['id' => $this->teacher->id, 'name' => $this->teacher->name]
                : null),
            'created_at'    => $this->created_at,
            'updated_at'    => $this->updated_at,
        ];
    }
}
