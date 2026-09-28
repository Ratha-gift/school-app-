<?php

namespace App\Policies;

use App\Models\Student;
use App\Models\User;
use Illuminate\Auth\Access\Response;

class StudentPolicy
{
    // ឪពុកម្ដាយមើលបានតែកូនខ្លួនឯង
    // ឆ្លើយ 404 (មិនមែន 403) ដើម្បីកុំឲ្យដឹងថាសិស្សនោះមាន
    public function viewAsGuardian(User $user, Student $student): Response
    {
        return $user->children()->whereKey($student->id)->exists()
            ? Response::allow()
            : Response::denyAsNotFound();
    }
}
