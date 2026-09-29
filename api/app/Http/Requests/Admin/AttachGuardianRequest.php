<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class AttachGuardianRequest extends FormRequest
{
    public const RELATIONSHIPS = ['father', 'mother', 'guardian', 'parent'];

    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'guardian_id'  => ['required', 'integer', Rule::exists('users', 'id')->where('role', 'parent')],
            'relationship' => ['nullable', Rule::in(self::RELATIONSHIPS)],
        ];
    }

    public function messages(): array
    {
        return [
            'guardian_id.exists' => 'The guardian must be a user with role parent.',
        ];
    }
}
