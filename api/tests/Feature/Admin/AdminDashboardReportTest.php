<?php

namespace Tests\Feature\Admin;

use App\Models\Attendance;
use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;

class AdminDashboardReportTest extends AdminTestCase
{
    private SchoolClass $class;

    protected function setUp(): void
    {
        parent::setUp();
        $this->class = SchoolClass::where('name', '7A')->first();
    }

    private function record(Student $student, string $date, string $status): void
    {
        Attendance::create([
            'student_id' => $student->id, 'school_class_id' => $this->class->id,
            'date' => $date, 'status' => $status,
        ]);
    }

    public function test_dashboard_counts_and_missing_classes(): void
    {
        $this->actingAsAdmin();

        // Nothing recorded today: 7A is listed as missing
        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('counts', ['students' => 5, 'teachers' => 1, 'parents' => 2, 'classes' => 1])
            ->assertJsonPath('today.date', now()->toDateString())
            ->assertJsonPath('today.summary', ['present' => 0, 'absent' => 0, 'late' => 0, 'excused' => 0])
            ->assertJsonPath('classes_without_attendance_today.0.name', '7A')
            ->assertJsonPath('classes_without_attendance_today.0.students_count', 5);

        $students = $this->class->students;
        $this->record($students[0], now()->toDateString(), 'present');
        $this->record($students[1], now()->toDateString(), 'absent');
        $this->record($students[2], now()->subDay()->toDateString(), 'late'); // not today

        $this->getJson('/api/admin/dashboard')
            ->assertOk()
            ->assertJsonPath('today.summary', ['present' => 1, 'absent' => 1, 'late' => 0, 'excused' => 0])
            ->assertJsonPath('today.total', 2)
            ->assertJsonCount(0, 'classes_without_attendance_today');
    }

    public function test_attendance_report(): void
    {
        $sokha = Student::where('first_name', 'Sokha')->first();
        $dara = Student::where('first_name', 'Dara')->first();
        $this->record($sokha, '2026-09-01', 'present');
        $this->record($sokha, '2026-09-02', 'late');
        $this->record($sokha, '2026-09-03', 'absent');
        $this->record($sokha, '2026-09-04', 'excused');
        $this->record($dara, '2026-09-01', 'present');
        $this->record($dara, '2026-10-01', 'absent'); // outside range

        $response = $this->actingAsAdmin()->getJson(
            "/api/admin/reports/attendance?school_class_id={$this->class->id}&from=2026-09-01&to=2026-09-30"
        )->assertOk()
            ->assertJsonPath('class.name', '7A')
            ->assertJsonPath('days_recorded', 4)
            ->assertJsonPath('summary.total', 5)
            ->assertJsonCount(5, 'students');

        $rows = collect($response->json('students'))->keyBy('name');
        $this->assertSame(
            ['present' => 1, 'absent' => 1, 'late' => 1, 'excused' => 1, 'total' => 4],
            collect($rows['Sokha Chan'])->only(['present', 'absent', 'late', 'excused', 'total'])->all()
        );
        $this->assertEquals(50, $rows['Sokha Chan']['attendance_rate']);   // (present + late) / total
        $this->assertEquals(100, $rows['Dara Kim']['attendance_rate']);
        $this->assertNull($rows['Vuthy Sok']['attendance_rate']);          // no records
        $this->assertEquals(60, $response->json('summary.attendance_rate')); // 3 of 5
    }

    public function test_attendance_report_validation(): void
    {
        $this->actingAsAdmin();

        $this->getJson('/api/admin/reports/attendance')
            ->assertStatus(422)->assertJsonValidationErrors(['school_class_id', 'from', 'to']);

        $this->getJson("/api/admin/reports/attendance?school_class_id={$this->class->id}&from=2026-09-30&to=2026-09-01")
            ->assertStatus(422)->assertJsonValidationErrors('to');

        $this->getJson("/api/admin/reports/attendance?school_class_id={$this->class->id}&from=2025-01-01&to=2026-09-01")
            ->assertStatus(422)->assertJsonValidationErrors('to');
    }

    public function test_grades_report(): void
    {
        // Known scores for Sokha instead of random seeded ones
        $sokha = Student::where('first_name', 'Sokha')->first();
        $sokha->grades()->delete();
        foreach ([['MATH', 80, 100], ['KHM', 45, 50]] as [$code, $score, $max]) {
            Grade::create([
                'student_id' => $sokha->id, 'subject_id' => Subject::where('code', $code)->value('id'),
                'school_class_id' => $this->class->id, 'term' => 'semester_1',
                'score' => $score, 'max_score' => $max,
            ]);
        }

        $response = $this->actingAsAdmin()->getJson(
            "/api/admin/reports/grades?school_class_id={$this->class->id}&term=semester_1"
        )->assertOk()
            ->assertJsonPath('term', 'semester_1')
            ->assertJsonCount(3, 'subjects')
            ->assertJsonCount(5, 'students')
            ->assertJsonCount(3, 'subject_averages')
            ->assertJsonStructure(['class_average_percentage']);

        // Subjects ordered by name: English, Khmer, Mathematics
        $this->assertSame(['ENG', 'KHM', 'MATH'], array_column($response->json('subjects'), 'code'));

        $row = collect($response->json('students'))->firstWhere('name', 'Sokha Chan');
        $this->assertNull($row['grades'][0]['score']);            // English: not graded
        $this->assertEquals(90, $row['grades'][1]['percentage']); // Khmer 45/50
        $this->assertEquals(80, $row['grades'][2]['percentage']); // Math 80/100
        $this->assertEquals(85, $row['average_percentage']);      // nulls are skipped

        $english = collect($response->json('subject_averages'))->firstWhere('subject_id', Subject::where('code', 'ENG')->value('id'));
        $this->assertSame(4, $english['graded_count']);
    }

    public function test_grades_report_without_grades_has_null_averages(): void
    {
        $this->actingAsAdmin()->getJson("/api/admin/reports/grades?school_class_id={$this->class->id}&term=semester_2")
            ->assertOk()
            ->assertJsonPath('class_average_percentage', null)
            ->assertJsonPath('students.0.average_percentage', null);
    }

    public function test_grades_report_validation(): void
    {
        $this->actingAsAdmin()->getJson('/api/admin/reports/grades?school_class_id=99999&term=semester_3')
            ->assertStatus(422)
            ->assertJsonValidationErrors(['school_class_id', 'term']);
    }
}
