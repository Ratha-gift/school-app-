<?php

namespace App\Policies;

use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\User;
use Illuminate\Auth\Access\Response;

// Laravel រកឃើញ policy នេះដោយស្វ័យប្រវត្តិសម្រាប់ model SchoolClass
// ប្រើ៖ Gate::authorize('access', $schoolClass)
class SchoolClassPolicy
{
    // admin, គ្រូបន្ទុកថ្នាក់ ឬគ្រូដែលបង្រៀនមុខវិជ្ជាណាមួយក្នុងថ្នាក់
    public function access(User $user, SchoolClass $class): Response
    {
        $allowed = $user->role === 'admin'
            || $class->isHomeroomTeacher($user)
            || $class->subjects()->wherePivot('teacher_id', $user->id)->exists();

        return $allowed ? Response::allow() : Response::deny('Not your class');
    }

    // ដាក់ពិន្ទុមុខវិជ្ជា $subject ក្នុងថ្នាក់ $class បានឬទេ
    // ប្រើ៖ Gate::authorize('grade', [$schoolClass, $subject])
    public function grade(User $user, SchoolClass $class, Subject $subject): Response
    {
        $allowed = $class->gradableSubjects($user)->whereKey($subject->id)->exists();

        return $allowed ? Response::allow() : Response::deny('You cannot grade this subject in this class');
    }
}
