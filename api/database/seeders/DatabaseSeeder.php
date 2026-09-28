<?php

namespace Database\Seeders;

use App\Models\SchoolClass;
use App\Models\Student;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Users
        User::create(['name' => 'Admin', 'email' => 'admin@school.com', 'password' => 'password', 'role' => 'admin']);
        $teacher = User::create(['name' => 'Teacher One', 'email' => 'teacher@school.com', 'password' => 'password', 'role' => 'teacher']);
        $parent  = User::create(['name' => 'Parent One', 'email' => 'parent@school.com', 'password' => 'password', 'role' => 'parent']);

        // ថ្នាក់
        $class = SchoolClass::create([
            'name' => '7A',
            'grade_level' => 7,
            'academic_year' => '2026-2027',
            'homeroom_teacher_id' => $teacher->id,
        ]);

        // មុខវិជ្ជា
        $subjects = [
            ['name' => 'Mathematics', 'name_km' => 'គណិតវិទ្យា', 'code' => 'MATH'],
            ['name' => 'Khmer',       'name_km' => 'ភាសាខ្មែរ',   'code' => 'KHM'],
            ['name' => 'English',     'name_km' => 'ភាសាអង់គ្លេស', 'code' => 'ENG'],
        ];
        foreach ($subjects as $data) {
            $subject = Subject::create($data);
            $class->subjects()->attach($subject->id, ['teacher_id' => $teacher->id]);
        }

        // សិស្ស
        $students = [
            ['Sokha', 'Chan', 'male'],
            ['Dara', 'Kim', 'female'],
            ['Vuthy', 'Sok', 'male'],
            ['Sreymom', 'Heng', 'female'],
            ['Rithy', 'Meas', 'male'],
        ];
        foreach ($students as $i => [$first, $last, $gender]) {
            $student = Student::create([
                'student_code'    => 'STU' . str_pad($i + 1, 4, '0', STR_PAD_LEFT),
                'first_name'      => $first,
                'last_name'       => $last,
                'gender'          => $gender,
                'school_class_id' => $class->id,
            ]);

            // សិស្សទីមួយជាកូនរបស់ Parent One
            if ($i === 0) {
                $student->guardians()->attach($parent->id, ['relationship' => 'father']);
            }
        }
    }
}
