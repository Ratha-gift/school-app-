<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\StudentRequest;
use App\Http\Resources\StudentResource;
use App\Models\Student;
use Illuminate\Http\Request;

class StudentController extends AdminController
{
    // GET /admin/students?school_class_id=1&search=dara
    public function index(Request $request)
    {
        $perPage = $this->perPage($request);
        $request->validate(['school_class_id' => 'nullable|integer']);

        $students = Student::query()
            ->with(['schoolClass', 'guardians'])
            ->when($request->school_class_id, fn ($q, $id) => $q->where('school_class_id', $id))
            ->when($request->search, function ($q, $search) {
                $like = $this->likePattern($search);
                $q->where(fn ($q) => $q->where('student_code', 'like', $like)
                    ->orWhere('first_name', 'like', $like)
                    ->orWhere('last_name', 'like', $like));
            })
            ->orderBy('first_name')
            ->orderBy('last_name')
            ->paginate($perPage)
            ->withQueryString();

        return StudentResource::collection($students);
    }

    public function store(StudentRequest $request)
    {
        $student = Student::create($request->validated());

        return (new StudentResource($student->load(['schoolClass', 'guardians'])))
            ->response()->setStatusCode(201);
    }

    public function show(Student $student)
    {
        return new StudentResource($student->load(['schoolClass', 'guardians']));
    }

    public function update(StudentRequest $request, Student $student)
    {
        $student->update($request->validated());

        return new StudentResource($student->load(['schoolClass', 'guardians']));
    }

    public function destroy(Student $student)
    {
        // វត្តមាន ពិន្ទុ និងការភ្ជាប់ឪពុកម្ដាយ ត្រូវលុបតាម (cascade)
        $student->delete();

        return response()->noContent();
    }
}
