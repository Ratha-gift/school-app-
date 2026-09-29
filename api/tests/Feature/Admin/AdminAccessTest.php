<?php

namespace Tests\Feature\Admin;

use Laravel\Sanctum\Sanctum;
use PHPUnit\Framework\Attributes\DataProvider;

class AdminAccessTest extends AdminTestCase
{
    public static function endpoints(): array
    {
        return [
            'dashboard'          => ['get', '/api/admin/dashboard'],
            'users index'        => ['get', '/api/admin/users'],
            'users store'        => ['post', '/api/admin/users'],
            'users show'         => ['get', '/api/admin/users/1'],
            'users update'       => ['put', '/api/admin/users/1'],
            'users destroy'      => ['delete', '/api/admin/users/2'],
            'classes index'      => ['get', '/api/admin/classes'],
            'classes store'      => ['post', '/api/admin/classes'],
            'class subjects'     => ['get', '/api/admin/classes/1/subjects'],
            'class subjects put' => ['put', '/api/admin/classes/1/subjects'],
            'subjects index'     => ['get', '/api/admin/subjects'],
            'subjects destroy'   => ['delete', '/api/admin/subjects/1'],
            'students index'     => ['get', '/api/admin/students'],
            'students update'    => ['put', '/api/admin/students/1'],
            'guardians index'    => ['get', '/api/admin/students/1/guardians'],
            'guardians store'    => ['post', '/api/admin/students/1/guardians'],
            'guardians destroy'  => ['delete', '/api/admin/students/1/guardians/3'],
            'attendance report'  => ['get', '/api/admin/reports/attendance'],
            'grades report'      => ['get', '/api/admin/reports/grades'],
        ];
    }

    #[DataProvider('endpoints')]
    public function test_guest_gets_401(string $method, string $url): void
    {
        $this->json($method, $url)->assertUnauthorized();
    }

    #[DataProvider('endpoints')]
    public function test_teacher_gets_403(string $method, string $url): void
    {
        Sanctum::actingAs($this->userWithRole('teacher'));
        $this->json($method, $url)->assertForbidden();
    }

    #[DataProvider('endpoints')]
    public function test_parent_gets_403(string $method, string $url): void
    {
        Sanctum::actingAs($this->userWithRole('parent'));
        $this->json($method, $url)->assertForbidden();
    }

    public function test_student_role_gets_403(): void
    {
        Sanctum::actingAs($this->userWithRole('student'));
        $this->getJson('/api/admin/users')->assertForbidden();
    }

    public function test_admin_can_still_use_teacher_endpoints(): void
    {
        $this->actingAsAdmin()->getJson('/api/teacher/classes/1/subjects')->assertOk();
    }

    public function test_cors_allows_nextjs_dev_origin(): void
    {
        $this->call('OPTIONS', '/api/admin/users', server: [
            'HTTP_ORIGIN'                        => 'http://localhost:3000',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
        ])
            ->assertNoContent()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    }

    public function test_cors_rejects_unknown_origin(): void
    {
        $response = $this->call('OPTIONS', '/api/admin/users', server: [
            'HTTP_ORIGIN'                        => 'http://evil.example',
            'HTTP_ACCESS_CONTROL_REQUEST_METHOD' => 'GET',
        ]);

        $this->assertNotSame('http://evil.example', $response->headers->get('Access-Control-Allow-Origin'));
    }
}
