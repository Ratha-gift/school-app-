<?php

namespace Database\Factories;

use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Student>
 */
class StudentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'student_code'    => 'STU' . fake()->unique()->numerify('9###'),
            'first_name'      => fake()->firstName(),
            'last_name'       => fake()->lastName(),
            'gender'          => fake()->randomElement(['male', 'female']),
            'school_class_id' => SchoolClass::factory(),
        ];
    }
}
