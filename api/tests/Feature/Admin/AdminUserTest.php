<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserTest extends AdminTestCase
{
    public function test_admin_lists_users_with_pagination_filter_and_search(): void
    {
        $this->actingAsAdmin();

        $this->getJson('/api/admin/users?per_page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('meta.per_page', 2)
            ->assertJsonPath('meta.total', 4)
            ->assertJsonStructure(['data' => [['id', 'name', 'email', 'role']], 'links', 'meta']);

        $this->getJson('/api/admin/users?role=parent')
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/admin/users?search=teacher@')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.email', 'teacher@school.com');
    }

    public function test_per_page_is_limited_to_100(): void
    {
        $this->actingAsAdmin()->getJson('/api/admin/users?per_page=101')
            ->assertStatus(422)->assertJsonValidationErrors('per_page');
    }

    public function test_admin_creates_shows_updates_and_deletes_a_user(): void
    {
        $this->actingAsAdmin();

        $id = $this->postJson('/api/admin/users', [
            'name' => 'Teacher Two', 'email' => 'teacher2@school.com',
            'role' => 'teacher', 'password' => 'secret123',
        ])->assertCreated()
            ->assertJsonPath('data.role', 'teacher')
            ->assertJsonMissingPath('data.password')
            ->json('data.id');

        $this->assertTrue(Hash::check('secret123', User::find($id)->password));

        $this->getJson("/api/admin/users/{$id}")->assertOk()->assertJsonPath('data.name', 'Teacher Two');

        // Update without password keeps the old one
        $this->putJson("/api/admin/users/{$id}", [
            'name' => 'Teacher 2', 'email' => 'teacher2@school.com', 'role' => 'teacher',
        ])->assertOk()->assertJsonPath('data.name', 'Teacher 2');
        $this->assertTrue(Hash::check('secret123', User::find($id)->password));

        // Update with password changes it
        $this->putJson("/api/admin/users/{$id}", [
            'name' => 'Teacher 2', 'email' => 'teacher2@school.com', 'role' => 'teacher', 'password' => 'newpass123',
        ])->assertOk();
        $this->assertTrue(Hash::check('newpass123', User::find($id)->password));

        $this->deleteJson("/api/admin/users/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('users', ['id' => $id]);
    }

    public function test_user_validation_errors(): void
    {
        $this->actingAsAdmin();

        $this->postJson('/api/admin/users', [])
            ->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'role', 'password']);

        $this->postJson('/api/admin/users', [
            'name' => 'X', 'email' => 'teacher@school.com', 'role' => 'janitor', 'password' => 'short',
        ])->assertStatus(422)->assertJsonValidationErrors(['email', 'role', 'password']);

        $this->getJson('/api/admin/users?role=janitor')->assertStatus(422);
    }

    public function test_admin_cannot_delete_or_demote_themselves(): void
    {
        $this->actingAsAdmin();

        $this->deleteJson("/api/admin/users/{$this->admin->id}")
            ->assertForbidden()
            ->assertJson(['message' => 'You cannot delete your own account.']);

        $this->putJson("/api/admin/users/{$this->admin->id}", [
            'name' => 'Admin', 'email' => 'admin@school.com', 'role' => 'teacher',
        ])->assertStatus(422)->assertJsonValidationErrors('role');

        $this->assertDatabaseHas('users', ['id' => $this->admin->id, 'role' => 'admin']);
    }

    public function test_deleting_a_user_revokes_their_tokens(): void
    {
        $parent = User::where('email', 'parent2@school.com')->first();
        $parent->createToken('mobile');

        $this->actingAsAdmin()->deleteJson("/api/admin/users/{$parent->id}")->assertNoContent();

        $this->assertDatabaseMissing('personal_access_tokens', ['tokenable_id' => $parent->id]);
    }
}
