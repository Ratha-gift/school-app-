<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\SubjectRequest;
use App\Http\Resources\SubjectResource;
use App\Models\Subject;
use Illuminate\Http\Request;

class SubjectController extends AdminController
{
    // GET /admin/subjects?search=math
    public function index(Request $request)
    {
        $perPage = $this->perPage($request);

        $subjects = Subject::query()
            ->withCount('classes')
            ->when($request->search, function ($q, $search) {
                $like = $this->likePattern($search);
                $q->where(fn ($q) => $q->where('name', 'like', $like)
                    ->orWhere('name_km', 'like', $like)
                    ->orWhere('code', 'like', $like));
            })
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString();

        return SubjectResource::collection($subjects);
    }

    public function store(SubjectRequest $request)
    {
        $subject = Subject::create($request->validated());

        return (new SubjectResource($subject))->response()->setStatusCode(201);
    }

    public function show(Subject $subject)
    {
        return new SubjectResource($subject->loadCount(['classes', 'grades']));
    }

    public function update(SubjectRequest $request, Subject $subject)
    {
        $subject->update($request->validated());

        return new SubjectResource($subject);
    }

    public function destroy(Subject $subject)
    {
        // កុំលុបមុខវិជ្ជាដែលមានពិន្ទុរួចហើយ (ពិន្ទុនឹងបាត់ទាំងអស់)
        $count = $subject->grades()->count();
        if ($count > 0) {
            return response()->json([
                'message' => "Cannot delete subject {$subject->name}: it has {$count} grade(s) recorded.",
            ], 409);
        }

        $subject->delete(); // class_subject rows ត្រូវលុបតាម (cascade)

        return response()->noContent();
    }
}
