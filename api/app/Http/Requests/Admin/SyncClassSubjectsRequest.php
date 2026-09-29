<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

// PUT /admin/classes/{id}/subjects
// {"subjects": [{"subject_id": 1, "teacher_id": 2}, {"subject_id": 3, "teacher_id": null}]}
// បញ្ជីនេះជំនួសបញ្ជីចាស់ទាំងស្រុង ([] = ដកមុខវិជ្ជាទាំងអស់)
class SyncClassSubjectsRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'subjects'              => 'present|array',
            'subjects.*.subject_id' => 'required|integer|distinct|exists:subjects,id',
            'subjects.*.teacher_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where('role', 'teacher')],
        ];
    }

    public function messages(): array
    {
        return [
            'subjects.*.teacher_id.exists' => 'The teacher must be a user with role teacher.',
        ];
    }
}
