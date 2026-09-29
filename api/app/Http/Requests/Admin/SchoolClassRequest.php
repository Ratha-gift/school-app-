<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SchoolClassRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            // ឈ្មោះថ្នាក់មិនអាចស្ទួនក្នុងឆ្នាំសិក្សាតែមួយ
            'name'                => [
                'required', 'string', 'max:50',
                Rule::unique('school_classes', 'name')
                    ->where('academic_year', (string) $this->input('academic_year'))
                    ->ignore($this->route('schoolClass')),
            ],
            'grade_level'         => 'required|integer|between:1,12',
            'academic_year'       => ['required', 'string', 'regex:/^\d{4}-\d{4}$/'],
            'homeroom_teacher_id' => ['nullable', 'integer', Rule::exists('users', 'id')->where('role', 'teacher')],
        ];
    }

    public function messages(): array
    {
        return [
            'name.unique'                => 'A class with this name already exists in this academic year.',
            'academic_year.regex'        => 'The academic year must look like 2026-2027.',
            'homeroom_teacher_id.exists' => 'The homeroom teacher must be a user with role teacher.',
        ];
    }
}
