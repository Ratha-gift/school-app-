<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\AttachGuardianRequest;
use App\Http\Resources\GuardianResource;
use App\Models\Student;
use App\Models\User;

// ភ្ជាប់ / ផ្ដាច់ ឪពុកម្ដាយ (role parent) ជាមួយសិស្ស
class StudentGuardianController extends AdminController
{
    // GET /admin/students/{student}/guardians
    public function index(Student $student)
    {
        return GuardianResource::collection($student->guardians()->orderBy('name')->get());
    }

    // POST /admin/students/{student}/guardians {"guardian_id": 3, "relationship": "father"}
    // បើភ្ជាប់រួចហើយ = កែ relationship (200), បើថ្មី = 201
    public function store(AttachGuardianRequest $request, Student $student)
    {
        $data = $request->validated();

        $result = $student->guardians()->syncWithoutDetaching([
            $data['guardian_id'] => ['relationship' => $data['relationship'] ?? 'parent'],
        ]);

        return GuardianResource::collection($student->guardians()->orderBy('name')->get())
            ->response()
            ->setStatusCode($result['attached'] ? 201 : 200);
    }

    // DELETE /admin/students/{student}/guardians/{guardian}
    public function destroy(Student $student, User $guardian)
    {
        $detached = $student->guardians()->detach($guardian->id);
        abort_if($detached === 0, 404);

        return response()->noContent();
    }
}
