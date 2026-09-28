<?php

namespace Tests\Feature;

use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\Subject;
use App\Models\User;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TeacherGradeTest extends TestCase
{
    use RefreshDatabase;

    private User $teacher;
    private SchoolClass $class;
    private Subject $math;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(); // DatabaseSeeder: teacher@school.com, class 7A, 3 subjects, 5 students

        $this->teacher = User::where('email', 'teacher@school.com')->first();
        $this->class   = SchoolClass::where('name', '7A')->first();
        $this->math    = Subject::where('code', 'MATH')->first();
    }

    private function gradesUrl(): string
    {
        return "/api/teacher/classes/{$this->class->id}/grades";
    }

    private function records(float $score = 80): array
    {
        return $this->class->students->map(fn ($s) => ['student_id' => $s->id, 'score' => $score])->all();
    }

    public function test_homeroom_teacher_lists_all_subjects_of_the_class(): void
    {
        Sanctum::actingAs($this->teacher);

        $this->getJson("/api/teacher/classes/{$this->class->id}/subjects")
            ->assertOk()
            ->assertJsonCount(3)
            ->assertJsonStructure([['id', 'name', 'name_km', 'code']]);
    }

    public function test_teacher_reads_grades_for_a_subject(): void
    {
        Sanctum::actingAs($this->teacher);

        $this->getJson($this->gradesUrl() . "?subject_id={$this->math->id}&term=semester_1")
            ->assertOk()
            ->assertJsonPath('class.name', '7A')
            ->assertJsonPath('subject.id', $this->math->id)
            ->assertJsonPath('term', 'semester_1')
            ->assertJsonPath('students.0.name', 'Dara Kim') // ordered by first_name
            ->assertJsonCount(5, 'students')
            ->assertJsonStructure(['max_score', 'students' => [['id', 'student_code', 'name', 'score']]]);
    }

    public function test_students_without_a_grade_have_null_score(): void
    {
        Sanctum::actingAs($this->teacher);

        $this->getJson($this->gradesUrl() . "?subject_id={$this->math->id}&term=semester_2")
            ->assertOk()
            ->assertJsonPath('students.0.score', null)
            ->assertJsonPath('max_score', 100);
    }

    public function test_teacher_saves_grades(): void
    {
        Sanctum::actingAs($this->teacher);

        $this->postJson($this->gradesUrl(), [
            'subject_id' => $this->math->id,
            'term'       => 'semester_2',
            'max_score'  => 50,
            'records'    => $this->records(42.5),
        ])->assertOk()->assertJson(['message' => 'Grades saved', 'count' => 5]);

        $this->assertSame(5, Grade::where('term', 'semester_2')->where('score', 42.5)
            ->where('max_score', 50)->where('recorded_by', $this->teacher->id)->count());

        // Saving again updates instead of creating duplicates
        $this->postJson($this->gradesUrl(), [
            'subject_id' => $this->math->id,
            'term'       => 'semester_2',
            'records'    => $this->records(90),
        ])->assertOk();

        $this->assertSame(5, Grade::where('term', 'semester_2')->count());
        $this->assertSame(5, Grade::where('term', 'semester_2')->where('score', 90)->where('max_score', 100)->count());
    }

    public function test_score_above_max_score_is_rejected(): void
    {
        Sanctum::actingAs($this->teacher);

        $this->postJson($this->gradesUrl(), [
            'subject_id' => $this->math->id,
            'term'       => 'semester_1',
            'max_score'  => 50,
            'records'    => $this->records(60),
        ])->assertStatus(422)->assertJsonValidationErrors('records.0.score');
    }

    public function test_negative_score_is_rejected(): void
    {
        Sanctum::actingAs($this->teacher);

        $this->postJson($this->gradesUrl(), [
            'subject_id' => $this->math->id,
            'term'       => 'semester_1',
            'records'    => $this->records(-1),
        ])->assertStatus(422)->assertJsonValidationErrors('records.0.score');
    }

    public function test_wrong_term_is_rejected(): void
    {
        Sanctum::actingAs($this->teacher);

        $this->postJson($this->gradesUrl(), [
            'subject_id' => $this->math->id,
            'term'       => 'semester_3',
            'records'    => $this->records(),
        ])->assertStatus(422)->assertJsonValidationErrors('term');

        $this->getJson($this->gradesUrl() . "?subject_id={$this->math->id}&term=summer")
            ->assertStatus(422)->assertJsonValidationErrors('term');
    }

    public function test_student_from_another_class_is_rejected(): void
    {
        Sanctum::actingAs($this->teacher);
        $outsider = Student::factory()->create(); // in a new, different class

        $this->postJson($this->gradesUrl(), [
            'subject_id' => $this->math->id,
            'term'       => 'semester_1',
            'records'    => [['student_id' => $outsider->id, 'score' => 70]],
        ])->assertStatus(422)->assertJsonValidationErrors('records.0.student_id');

        $this->assertDatabaseMissing('grades', ['student_id' => $outsider->id]);
    }

    public function test_subject_teacher_only_grades_own_subject(): void
    {
        // A teacher who only teaches Science in 7A (not the homeroom teacher)
        $scienceTeacher = User::factory()->create(['role' => 'teacher']);
        $science = Subject::factory()->create(['name' => 'Science', 'code' => 'SCI']);
        $this->class->subjects()->attach($science->id, ['teacher_id' => $scienceTeacher->id]);

        Sanctum::actingAs($scienceTeacher);

        // Only sees Science
        $this->getJson("/api/teacher/classes/{$this->class->id}/subjects")
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.code', 'SCI');

        // Can grade Science
        $this->postJson($this->gradesUrl(), [
            'subject_id' => $science->id,
            'term'       => 'semester_1',
            'records'    => $this->records(75),
        ])->assertOk();

        // Cannot read or save Math
        $this->getJson($this->gradesUrl() . "?subject_id={$this->math->id}&term=semester_1")
            ->assertForbidden();

        $this->postJson($this->gradesUrl(), [
            'subject_id' => $this->math->id,
            'term'       => 'semester_1',
            'records'    => $this->records(10),
        ])->assertForbidden();

        $this->assertDatabaseMissing('grades', ['subject_id' => $this->math->id, 'score' => 10]);
    }

    public function test_teacher_of_another_class_gets_403(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'teacher']));

        $this->getJson("/api/teacher/classes/{$this->class->id}/subjects")
            ->assertForbidden()
            ->assertJson(['message' => 'Not your class']);

        $this->getJson("/api/teacher/classes/{$this->class->id}/attendance")
            ->assertForbidden();
    }

    public function test_admin_can_grade_any_subject(): void
    {
        Sanctum::actingAs(User::where('email', 'admin@school.com')->first());

        $this->getJson("/api/teacher/classes/{$this->class->id}/subjects")
            ->assertOk()
            ->assertJsonCount(3);

        $this->postJson($this->gradesUrl(), [
            'subject_id' => $this->math->id,
            'term'       => 'semester_2',
            'records'    => $this->records(88),
        ])->assertOk();
    }
}
