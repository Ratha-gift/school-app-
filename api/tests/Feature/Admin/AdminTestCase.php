<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

// Base for admin tests: seeded database + helpers to log in as each role.
abstract class AdminTestCase extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed();
        $this->admin = User::where('email', 'admin@school.com')->first();
    }

    protected function actingAsAdmin(): static
    {
        Sanctum::actingAs($this->admin);

        return $this;
    }

    protected function userWithRole(string $role): User
    {
        return User::where('role', $role)->first() ?? User::factory()->create(['role' => $role]);
    }
}
