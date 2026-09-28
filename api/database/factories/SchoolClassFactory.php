<?php

namespace Database\Factories;

use App\Models\SchoolClass;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SchoolClass>
 */
class SchoolClassFactory extends Factory
{
    public function definition(): array
    {
        $grade = fake()->numberBetween(7, 12);

        return [
            'name'                => $grade . fake()->unique()->randomLetter(),
            'grade_level'         => $grade,
            'academic_year'       => '2026-2027',
            'homeroom_teacher_id' => null,
        ];
    }
}
