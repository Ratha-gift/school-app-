<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\SchoolClass */
class SchoolClassResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'name'             => $this->name,
            'grade_level'      => $this->grade_level,
            'academic_year'    => $this->academic_year,
            'homeroom_teacher' => $this->whenLoaded('homeroomTeacher', fn () => $this->homeroomTeacher
                ? ['id' => $this->homeroomTeacher->id, 'name' => $this->homeroomTeacher->name]
                : null),
            'students_count'   => $this->whenCounted('students'),
            'subjects'         => SubjectResource::collection($this->whenLoaded('subjects')),
            'created_at'       => $this->created_at,
            'updated_at'       => $this->updated_at,
        ];
    }
}
