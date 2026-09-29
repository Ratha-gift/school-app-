<?php

namespace App\Http\Requests\Admin;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator;

// ប្រើសម្រាប់ទាំង store (POST) និង update (PUT/PATCH)
class UserRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // route middleware role:admin ពិនិត្យរួចហើយ
    }

    public function rules(): array
    {
        $user = $this->route('user'); // null ពេលបង្កើតថ្មី

        return [
            'name'     => 'required|string|max:255',
            'email'    => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user)],
            'role'     => ['required', Rule::in(User::ROLES)],
            // ពេល update: ទុកទទេ = មិនប្ដូរពាក្យសម្ងាត់
            'password' => [$user ? 'nullable' : 'required', 'string', 'min:8', 'max:255'],
        ];
    }

    // admin មិនអាចដកតួនាទី admin ពីខ្លួនឯងបានទេ (ការពារ lock out)
    public function after(): array
    {
        return [
            function (Validator $validator) {
                $user = $this->route('user');
                if ($user && $user->is($this->user()) && $this->input('role') !== 'admin') {
                    $validator->errors()->add('role', 'You cannot remove your own admin role.');
                }
            },
        ];
    }
}
