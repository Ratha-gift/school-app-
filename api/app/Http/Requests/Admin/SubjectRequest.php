<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class SubjectRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name'    => 'required|string|max:100',
            'name_km' => 'nullable|string|max:100',
            'code'    => ['required', 'string', 'max:20', Rule::unique('subjects', 'code')->ignore($this->route('subject'))],
        ];
    }
}
