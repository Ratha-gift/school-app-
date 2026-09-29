<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\SyncClassSubjectsRequest;
use App\Http\Resources\SubjectResource;
use App\Models\SchoolClass;
use App\Models\User;

// មុខវិជ្ជារបស់ថ្នាក់មួយ និងគ្រូដែលបង្រៀន (តារាង class_subject)
class ClassSubjectController extends AdminController
{
    // GET /admin/classes/{schoolClass}/subjects
    public function index(SchoolClass $schoolClass)
    {
        return SubjectResource::collection($this->subjectsWithTeacher($schoolClass));
    }

    // PUT /admin/classes/{schoolClass}/subjects
    public function sync(SyncClassSubjectsRequest $request, SchoolClass $schoolClass)
    {
        // [subject_id => ['teacher_id' => ...]] ជាទម្រង់ដែល sync() ត្រូវការ
        $pivot = collect($request->validated('subjects'))
            ->mapWithKeys(fn ($row) => [$row['subject_id'] => ['teacher_id' => $row['teacher_id'] ?? null]])
            ->all();

        $schoolClass->subjects()->sync($pivot);

        return SubjectResource::collection($this->subjectsWithTeacher($schoolClass));
    }

    // មុខវិជ្ជា + relation 'teacher' (រកពី pivot.teacher_id ក្នុង query តែមួយ)
    private function subjectsWithTeacher(SchoolClass $class)
    {
        $subjects = $class->subjects()->orderBy('subjects.name')->get();
        $teachers = User::whereIn('id', $subjects->pluck('pivot.teacher_id')->filter())->get()->keyBy('id');

        return $subjects->each(
            fn ($subject) => $subject->setRelation('teacher', $teachers->get($subject->pivot->teacher_id))
        );
    }
}
