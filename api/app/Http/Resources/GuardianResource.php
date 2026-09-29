<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

// ឪពុកម្ដាយរបស់សិស្ស (User + relationship ពី guardian_student)
/** @mixin \App\Models\User */
class GuardianResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'name'         => $this->name,
            'email'        => $this->email,
            'relationship' => $this->pivot?->relationship,
        ];
    }
}
