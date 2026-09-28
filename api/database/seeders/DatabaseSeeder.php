<?php

namespace Database\Seeders;

use App\Models\Grade;
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
        $parent2 = User::create(['name' => 'Parent Two', 'email' => 'parent2@school.com', 'password' => 'password', 'role' => 'parent']);

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
        $subjectModels = [];
        foreach ($subjects as $data) {
            $subject = $subjectModels[] = Subject::create($data);
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

            // សិស្សទីពីរជាកូនរបស់ Parent Two (សម្រាប់តេស្តថា parent មើលកូនគេមិនបាន)
            if ($i === 1) {
                $student->guardians()->attach($parent2->id, ['relationship' => 'mother']);
            }

            // ពិន្ទុគំរូ semester_1 គ្រប់មុខវិជ្ជា (50.0 – 100.0, ជំហាន 0.5)
            foreach ($subjectModels as $subject) {
                Grade::create([
                    'student_id'      => $student->id,
                    'subject_id'      => $subject->id,
                    'school_class_id' => $class->id,
                    'term'            => 'semester_1',
                    'score'           => random_int(100, 200) / 2,
                    'max_score'       => 100,
                    'recorded_by'     => $teacher->id,
                ]);
            }
        }
    }
}
