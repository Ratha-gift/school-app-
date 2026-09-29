<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin \App\Models\Student */
class StudentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'student_code'  => $this->student_code,
            'first_name'    => $this->first_name,
            'last_name'     => $this->last_name,
            'name'          => $this->first_name . ' ' . $this->last_name,
            'gender'        => $this->gender,
            'date_of_birth' => $this->date_of_birth?->toDateString(),
            'class'         => $this->whenLoaded('schoolClass', fn () => $this->schoolClass
                ? ['id' => $this->schoolClass->id, 'name' => $this->schoolClass->name]
                : null),
            'guardians'     => GuardianResource::collection($this->whenLoaded('guardians')),
            'created_at'    => $this->created_at,
            'updated_at'    => $this->updated_at,
        ];
    }
}
