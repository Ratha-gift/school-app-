<?php

namespace Tests\Feature;

use App\Models\Attendance;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ParentTest extends TestCase
{
    use RefreshDatabase;

    private User $parent;
    private Student $child;       // Sokha Chan (parent@school.com)
    private Student $otherChild;  // Dara Kim (parent2@school.com)

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();

        $this->parent     = User::where('email', 'parent@school.com')->first();
        $this->child      = Student::where('first_name', 'Sokha')->first();
        $this->otherChild = Student::where('first_name', 'Dara')->first();
    }

    public function test_parent_cannot_access_teacher_routes(): void
    {
        Sanctum::actingAs($this->parent);
        $classId = SchoolClass::first()->id;

        $this->getJson('/api/teacher/classes')->assertForbidden();
        $this->getJson("/api/teacher/classes/{$classId}/subjects")->assertForbidden();
        $this->postJson("/api/teacher/classes/{$classId}/grades", [])->assertForbidden();
    }

    public function test_teacher_cannot_access_parent_routes(): void
    {
        Sanctum::actingAs(User::where('email', 'teacher@school.com')->first());

        $this->getJson('/api/parent/children')->assertForbidden();
        $this->getJson("/api/parent/children/{$this->child->id}/grades")->assertForbidden();
    }

    public function test_guest_gets_401(): void
    {
        $this->getJson('/api/parent/children')->assertUnauthorized();
    }

    public function test_parent_sees_only_own_children(): void
    {
        Sanctum::actingAs($this->parent);

        $this->getJson('/api/parent/children')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $this->child->id)
            ->assertJsonPath('0.name', 'Sokha Chan')
            ->assertJsonPath('0.class.name', '7A');
    }

    public function test_parent_sees_monthly_attendance_summary(): void
    {
        $teacherId = User::where('email', 'teacher@school.com')->value('id');
        $make = fn (string $date, string $status, ?string $note = null) => Attendance::create([
            'student_id'      => $this->child->id,
            'school_class_id' => $this->child->school_class_id,
            'date'            => $date,
            'status'          => $status,
            'note'            => $note,
            'recorded_by'     => $teacherId,
        ]);
        $make('2026-09-01', 'present');
        $make('2026-09-02', 'absent', 'sick');
        $make('2026-09-03', 'present');
        $make('2026-09-30', 'late');
        $make('2026-08-31', 'present'); // other month: not counted

        Sanctum::actingAs($this->parent);

        $this->getJson("/api/parent/children/{$this->child->id}/attendance?month=2026-09")
            ->assertOk()
            ->assertJsonPath('student.name', 'Sokha Chan')
            ->assertJsonPath('month', '2026-09')
            ->assertJsonPath('summary', ['present' => 2, 'absent' => 1, 'late' => 1, 'excused' => 0])
            ->assertJsonCount(4, 'records')
            ->assertJsonPath('records.0', ['date' => '2026-09-30', 'status' => 'late', 'note' => null]) // newest first
            ->assertJsonPath('records.2.note', 'sick');
    }

    public function test_attendance_defaults_to_current_month(): void
    {
        Sanctum::actingAs($this->parent);

        $this->getJson("/api/parent/children/{$this->child->id}/attendance")
            ->assertOk()
            ->assertJsonPath('month', now()->format('Y-m'));
    }

    public function test_invalid_month_is_rejected(): void
    {
        Sanctum::actingAs($this->parent);

        $this->getJson("/api/parent/children/{$this->child->id}/attendance?month=2026-13")
            ->assertStatus(422)
            ->assertJsonValidationErrors('month');
    }

    public function test_parent_sees_grades_with_percentages(): void
    {
        // Replace the random seeded scores with known values
        $this->child->grades()->delete();
        $classId = $this->child->school_class_id;
        foreach ([['MATH', 80, 100], ['KHM', 45, 50], ['ENG', 70, 100]] as [$code, $score, $max]) {
            $this->child->grades()->create([
                'subject_id'      => \App\Models\Subject::where('code', $code)->value('id'),
                'school_class_id' => $classId,
                'term'            => 'semester_1',
                'score'           => $score,
                'max_score'       => $max,
            ]);
        }

        Sanctum::actingAs($this->parent);

        $response = $this->getJson("/api/parent/children/{$this->child->id}/grades")
            ->assertOk()
            ->assertJsonPath('term', 'semester_1') // default term
            ->assertJsonCount(3, 'grades')
            ->assertJsonStructure(['grades' => [['subject' => ['id', 'name', 'name_km'], 'score', 'max_score', 'percentage']]]);

        // Ordered by subject name: English, Khmer, Mathematics
        $this->assertEquals([70, 90, 80], array_column($response->json('grades'), 'percentage'));
        $this->assertEquals(80, $response->json('average_percentage'));
    }

    public function test_average_is_null_without_grades(): void
    {
        Sanctum::actingAs($this->parent);

        $this->getJson("/api/parent/children/{$this->child->id}/grades?term=semester_2")
            ->assertOk()
            ->assertJsonPath('grades', [])
            ->assertJsonPath('average_percentage', null);
    }

    public function test_parent_gets_404_for_another_parents_child(): void
    {
        Sanctum::actingAs($this->parent);

        $this->getJson("/api/parent/children/{$this->otherChild->id}/attendance")->assertNotFound();
        $other = $this->getJson("/api/parent/children/{$this->otherChild->id}/grades")->assertNotFound();

        // Same response body as a student that doesn't exist at all
        $missing = $this->getJson('/api/parent/children/999999/grades')->assertNotFound();
        $this->assertSame($missing->json(), $other->json());
    }

    public function test_second_parent_sees_their_own_child(): void
    {
        Sanctum::actingAs(User::where('email', 'parent2@school.com')->first());

        $this->getJson('/api/parent/children')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.id', $this->otherChild->id);

        $this->getJson("/api/parent/children/{$this->child->id}/grades")->assertNotFound();
    }
}
