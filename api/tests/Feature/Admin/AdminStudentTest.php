<?php

namespace Tests\Feature\Admin;

use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;

class AdminStudentTest extends AdminTestCase
{
    public function test_admin_lists_students_with_class_and_guardians(): void
    {
        $other = SchoolClass::factory()->create();
        Student::factory()->count(2)->create(['school_class_id' => $other->id]);
        $class = SchoolClass::where('name', '7A')->first();

        $this->actingAsAdmin();

        $this->getJson('/api/admin/students')->assertOk()->assertJsonPath('meta.total', 7);

        $this->getJson("/api/admin/students?school_class_id={$class->id}")
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('data.0.name', 'Dara Kim')
            ->assertJsonPath('data.0.class.name', '7A')
            ->assertJsonPath('data.0.guardians.0.email', 'parent2@school.com')
            ->assertJsonPath('data.0.guardians.0.relationship', 'mother');

        $this->getJson('/api/admin/students?search=STU0003')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.first_name', 'Vuthy');
    }

    public function test_admin_creates_shows_updates_and_deletes_a_student(): void
    {
        $class = SchoolClass::where('name', '7A')->first();
        $this->actingAsAdmin();

        $id = $this->postJson('/api/admin/students', [
            'student_code' => 'STU0100', 'first_name' => 'Bopha', 'last_name' => 'Ly',
            'gender' => 'female', 'date_of_birth' => '2014-05-01', 'school_class_id' => $class->id,
        ])->assertCreated()
            ->assertJsonPath('data.name', 'Bopha Ly')
            ->assertJsonPath('data.date_of_birth', '2014-05-01')
            ->assertJsonPath('data.class.id', $class->id)
            ->assertJsonPath('data.guardians', [])
            ->json('data.id');

        $this->getJson("/api/admin/students/{$id}")->assertOk()->assertJsonPath('data.student_code', 'STU0100');

        $this->putJson("/api/admin/students/{$id}", [
            'student_code' => 'STU0100', 'first_name' => 'Bopha', 'last_name' => 'Ly',
            'gender' => 'female', 'date_of_birth' => null, 'school_class_id' => null,
        ])->assertOk()
            ->assertJsonPath('data.class', null)
            ->assertJsonPath('data.date_of_birth', null);

        $this->deleteJson("/api/admin/students/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('students', ['id' => $id]);
    }

    public function test_student_validation_errors(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/admin/students', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['student_code', 'first_name', 'last_name', 'gender']);

        $this->postJson('/api/admin/students', [
            'student_code' => 'STU0001', 'first_name' => 'A', 'last_name' => 'B', 'gender' => 'other',
            'date_of_birth' => '2999-01-01', 'school_class_id' => 99999,
        ])->assertStatus(422)->assertJsonValidationErrors([
            'student_code', 'gender', 'date_of_birth', 'school_class_id',
        ]);
    }

    public function test_admin_manages_guardians(): void
    {
        $student = Student::where('first_name', 'Vuthy')->first(); // no guardian yet
        $parent = User::where('email', 'parent@school.com')->first();
        $this->actingAsAdmin();

        $this->getJson("/api/admin/students/{$student->id}/guardians")->assertOk()->assertJsonCount(0, 'data');

        $this->postJson("/api/admin/students/{$student->id}/guardians", [
            'guardian_id' => $parent->id, 'relationship' => 'father',
        ])->assertCreated()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.relationship', 'father');

        // Posting again updates the relationship instead of duplicating
        $this->postJson("/api/admin/students/{$student->id}/guardians", [
            'guardian_id' => $parent->id, 'relationship' => 'guardian',
        ])->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.relationship', 'guardian');

        // The parent now sees this child in the parent API
        $this->assertTrue($parent->children()->whereKey($student->id)->exists());

        $this->deleteJson("/api/admin/students/{$student->id}/guardians/{$parent->id}")->assertNoContent();
        $this->assertFalse($parent->children()->whereKey($student->id)->exists());

        // Not linked anymore -> 404
        $this->deleteJson("/api/admin/students/{$student->id}/guardians/{$parent->id}")->assertNotFound();
    }

    public function test_guardian_must_be_a_parent(): void
    {
        $student = Student::first();
        $teacher = User::where('email', 'teacher@school.com')->first();

        $this->actingAsAdmin()->postJson("/api/admin/students/{$student->id}/guardians", [
            'guardian_id' => $teacher->id, 'relationship' => 'uncle',
        ])->assertStatus(422)->assertJsonValidationErrors(['guardian_id', 'relationship']);
    }
}
