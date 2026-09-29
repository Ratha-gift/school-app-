<?php

namespace Tests\Feature\Admin;

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;

class AdminClassTest extends AdminTestCase
{
    private function teacher(): User
    {
        return User::where('email', 'teacher@school.com')->first();
    }

    public function test_admin_lists_classes_with_students_count(): void
    {
        SchoolClass::factory()->create(['name' => '8B', 'grade_level' => 8]);

        $this->actingAsAdmin()->getJson('/api/admin/classes?search=7A')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', '7A')
            ->assertJsonPath('data.0.students_count', 5)
            ->assertJsonPath('data.0.homeroom_teacher.name', 'Teacher One');
    }

    public function test_admin_creates_shows_updates_and_deletes_a_class(): void
    {
        $this->actingAsAdmin();

        $id = $this->postJson('/api/admin/classes', [
            'name' => '8A', 'grade_level' => 8, 'academic_year' => '2026-2027',
            'homeroom_teacher_id' => $this->teacher()->id,
        ])->assertCreated()
            ->assertJsonPath('data.students_count', 0)
            ->assertJsonPath('data.homeroom_teacher.id', $this->teacher()->id)
            ->json('data.id');

        $this->getJson("/api/admin/classes/{$id}")->assertOk()->assertJsonPath('data.name', '8A');

        $this->putJson("/api/admin/classes/{$id}", [
            'name' => '8A', 'grade_level' => 8, 'academic_year' => '2026-2027', 'homeroom_teacher_id' => null,
        ])->assertOk()->assertJsonPath('data.homeroom_teacher', null);

        $this->deleteJson("/api/admin/classes/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('school_classes', ['id' => $id]);
    }

    public function test_class_validation_errors(): void
    {
        $this->actingAsAdmin();
        $parent = User::where('email', 'parent@school.com')->first();

        $this->postJson('/api/admin/classes', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'grade_level', 'academic_year']);

        // Duplicate name in the same year, bad year format, homeroom teacher who is not a teacher
        $this->postJson('/api/admin/classes', [
            'name' => '7A', 'grade_level' => 13, 'academic_year' => '2026', 'homeroom_teacher_id' => $parent->id,
        ])->assertStatus(422)->assertJsonValidationErrors(['grade_level', 'academic_year', 'homeroom_teacher_id']);

        $this->postJson('/api/admin/classes', [
            'name' => '7A', 'grade_level' => 7, 'academic_year' => '2026-2027',
        ])->assertStatus(422)->assertJsonValidationErrors('name');

        // Same name in another year is fine
        $this->postJson('/api/admin/classes', [
            'name' => '7A', 'grade_level' => 7, 'academic_year' => '2027-2028',
        ])->assertCreated();
    }

    public function test_deleting_a_class_with_students_returns_409(): void
    {
        $class = SchoolClass::where('name', '7A')->first();

        $this->actingAsAdmin()->deleteJson("/api/admin/classes/{$class->id}")
            ->assertStatus(409)
            ->assertJsonPath('message', 'Cannot delete class 7A: it still has 5 student(s). Move or remove them first.');

        $this->assertDatabaseHas('school_classes', ['id' => $class->id]);
    }

    public function test_admin_lists_and_syncs_class_subjects(): void
    {
        $class = SchoolClass::where('name', '7A')->first();
        $math = Subject::where('code', 'MATH')->first();
        $science = Subject::factory()->create(['name' => 'Science', 'code' => 'SCI']);
        $teacher2 = User::factory()->create(['role' => 'teacher', 'name' => 'Teacher Two']);

        $this->actingAsAdmin();

        $this->getJson("/api/admin/classes/{$class->id}/subjects")
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.teacher.name', 'Teacher One');

        // Keep Math with a new teacher, add Science without teacher, drop the others
        $this->putJson("/api/admin/classes/{$class->id}/subjects", [
            'subjects' => [
                ['subject_id' => $math->id, 'teacher_id' => $teacher2->id],
                ['subject_id' => $science->id, 'teacher_id' => null],
            ],
        ])->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.code', 'MATH')
            ->assertJsonPath('data.0.teacher.id', $teacher2->id)
            ->assertJsonPath('data.1.code', 'SCI')
            ->assertJsonPath('data.1.teacher', null);

        $this->assertDatabaseCount('class_subject', 2);

        // Empty list removes all
        $this->putJson("/api/admin/classes/{$class->id}/subjects", ['subjects' => []])
            ->assertOk()->assertJsonCount(0, 'data');
    }

    public function test_class_subject_sync_validation(): void
    {
        $class = SchoolClass::where('name', '7A')->first();
        $math = Subject::where('code', 'MATH')->first();
        $parent = User::where('email', 'parent@school.com')->first();

        $this->actingAsAdmin();

        $this->putJson("/api/admin/classes/{$class->id}/subjects", [])
            ->assertStatus(422)->assertJsonValidationErrors('subjects');

        $this->putJson("/api/admin/classes/{$class->id}/subjects", [
            'subjects' => [
                ['subject_id' => $math->id, 'teacher_id' => $parent->id], // not a teacher
                ['subject_id' => $math->id],                                // duplicate
                ['subject_id' => 99999],                                    // unknown
            ],
        ])->assertStatus(422)->assertJsonValidationErrors([
            'subjects.0.teacher_id', 'subjects.1.subject_id', 'subjects.2.subject_id',
        ]);

        $this->assertDatabaseCount('class_subject', 3); // unchanged
    }
}
