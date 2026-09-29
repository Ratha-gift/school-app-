<?php

namespace Tests\Feature\Admin;

use App\Models\Subject;

class AdminSubjectTest extends AdminTestCase
{
    public function test_admin_lists_and_searches_subjects(): void
    {
        $this->actingAsAdmin();

        $this->getJson('/api/admin/subjects')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.classes_count', 1);

        $this->getJson('/api/admin/subjects?search=' . urlencode('គណិត'))
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.code', 'MATH');
    }

    public function test_admin_creates_shows_updates_and_deletes_a_subject(): void
    {
        $this->actingAsAdmin();

        $id = $this->postJson('/api/admin/subjects', [
            'name' => 'Science', 'name_km' => 'វិទ្យាសាស្ត្រ', 'code' => 'SCI',
        ])->assertCreated()->assertJsonPath('data.code', 'SCI')->json('data.id');

        $this->getJson("/api/admin/subjects/{$id}")
            ->assertOk()
            ->assertJsonPath('data.grades_count', 0);

        $this->putJson("/api/admin/subjects/{$id}", [
            'name' => 'Physics', 'name_km' => null, 'code' => 'SCI',
        ])->assertOk()->assertJsonPath('data.name', 'Physics');

        $this->deleteJson("/api/admin/subjects/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('subjects', ['id' => $id]);
    }

    public function test_subject_validation_errors(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/admin/subjects', [])
            ->assertStatus(422)->assertJsonValidationErrors(['name', 'code']);

        $this->postJson('/api/admin/subjects', ['name' => 'Maths 2', 'code' => 'MATH'])
            ->assertStatus(422)->assertJsonValidationErrors('code');

        // Updating a subject with its own code is fine
        $math = Subject::where('code', 'MATH')->first();
        $this->putJson("/api/admin/subjects/{$math->id}", ['name' => 'Math', 'code' => 'MATH'])->assertOk();
    }

    public function test_deleting_a_subject_with_grades_returns_409(): void
    {
        $math = Subject::where('code', 'MATH')->first(); // seeded with 5 grades

        $this->actingAsAdmin()->deleteJson("/api/admin/subjects/{$math->id}")
            ->assertStatus(409)
            ->assertJsonPath('message', 'Cannot delete subject Mathematics: it has 5 grade(s) recorded.');

        $this->assertDatabaseHas('subjects', ['id' => $math->id]);
    }
}
