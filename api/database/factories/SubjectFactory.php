<?php

namespace Database\Factories;

use App\Models\Subject;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Subject>
 */
class SubjectFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name'    => fake()->unique()->word(),
            'name_km' => null,
            'code'    => fake()->unique()->bothify('SUB-###'),
        ];
    }
}
