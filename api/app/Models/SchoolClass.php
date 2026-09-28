<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SchoolClass extends Model
{
    use HasFactory;

    protected $guarded = [];

    public function homeroomTeacher()
    {
        return $this->belongsTo(User::class, 'homeroom_teacher_id');
    }

    public function students()
    {
        return $this->hasMany(Student::class);
    }

    public function subjects()
    {
        return $this->belongsToMany(Subject::class, 'class_subject')
            ->withPivot('teacher_id')
            ->withTimestamps();
    }

    public function attendances()
    {
        return $this->hasMany(Attendance::class);
    }

    public function isHomeroomTeacher(User $user): bool
    {
        return (int) $this->homeroom_teacher_id === (int) $user->id;
    }

    // មុខវិជ្ជាដែល $user អាចដាក់ពិន្ទុបានក្នុងថ្នាក់នេះ៖
    // admin និងគ្រូបន្ទុកថ្នាក់ = គ្រប់មុខវិជ្ជា, គ្រូផ្សេង = តែមុខវិជ្ជាដែលខ្លួនបង្រៀន
    public function gradableSubjects(User $user)
    {
        $query = $this->subjects();

        if ($user->role === 'admin' || $this->isHomeroomTeacher($user)) {
            return $query;
        }

        return $query->wherePivot('teacher_id', $user->id);
    }
}