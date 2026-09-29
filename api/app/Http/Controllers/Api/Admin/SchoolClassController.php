<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\SchoolClassRequest;
use App\Http\Resources\SchoolClassResource;
use App\Models\SchoolClass;
use Illuminate\Http\Request;

class SchoolClassController extends AdminController
{
    // GET /admin/classes?search=7&academic_year=2026-2027&grade_level=7
    public function index(Request $request)
    {
        $perPage = $this->perPage($request);
        $request->validate([
            'academic_year' => 'nullable|string',
            'grade_level'   => 'nullable|integer',
        ]);

        $classes = SchoolClass::query()
            ->with('homeroomTeacher')
            ->withCount('students')
            ->when($request->search, fn ($q, $search) => $q->where('name', 'like', $this->likePattern($search)))
            ->when($request->academic_year, fn ($q, $year) => $q->where('academic_year', $year))
            ->when($request->grade_level, fn ($q, $level) => $q->where('grade_level', $level))
            ->orderByDesc('academic_year')
            ->orderBy('grade_level')
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return SchoolClassResource::collection($classes);
    }

    public function store(SchoolClassRequest $request)
    {
        $class = SchoolClass::create($request->validated());

        return (new SchoolClassResource($this->loadDetails($class)))->response()->setStatusCode(201);
    }

    public function show(SchoolClass $schoolClass)
    {
        return new SchoolClassResource($this->loadDetails($schoolClass));
    }

    public function update(SchoolClassRequest $request, SchoolClass $schoolClass)
    {
        $schoolClass->update($request->validated());

        return new SchoolClassResource($this->loadDetails($schoolClass));
    }

    public function destroy(SchoolClass $schoolClass)
    {
        // កុំលុបថ្នាក់ដែលនៅមានសិស្ស (វត្តមាន/ពិន្ទុរបស់ថ្នាក់នឹងបាត់ទាំងអស់)
        $count = $schoolClass->students()->count();
        if ($count > 0) {
            return response()->json([
                'message' => "Cannot delete class {$schoolClass->name}: it still has {$count} student(s). Move or remove them first.",
            ], 409);
        }

        $schoolClass->delete();

        return response()->noContent();
    }

    private function loadDetails(SchoolClass $class): SchoolClass
    {
        return $class->load('homeroomTeacher')->loadCount('students');
    }
}
