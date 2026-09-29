<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StudentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'student_code'    => ['required', 'string', 'max:20', Rule::unique('students', 'student_code')->ignore($this->route('student'))],
            'first_name'      => 'required|string|max:100',
            'last_name'       => 'required|string|max:100',
            'gender'          => 'required|in:male,female',
            'date_of_birth'   => 'nullable|date_format:Y-m-d|before:today',
            'school_class_id' => 'nullable|integer|exists:school_classes,id',
        ];
    }
}
