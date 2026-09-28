<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;


#[Fillable(['name', 'email', 'password', 'role'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    
    protected function casts(): array
    {
        
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
        
    }
        // ឪពុកម្ដាយ → កូន
    public function children()
    {
        return $this->belongsToMany(Student::class, 'guardian_student', 'guardian_id', 'student_id')
            ->withPivot('relationship')
            ->withTimestamps();
    }

    // គ្រូ → ថ្នាក់ដែលខ្លួនបន្ទុក
    public function homeroomClasses()
    {
        return $this->hasMany(SchoolClass::class, 'homeroom_teacher_id');
    }

    // គ្រូ → ថ្នាក់ដែលខ្លួនបង្រៀន
    public function teachingClasses()
    {
        return $this->belongsToMany(SchoolClass::class, 'class_subject', 'teacher_id', 'school_class_id')
            ->withPivot('subject_id')
            ->withTimestamps();
    }

    // សិស្ស → profile សិស្ស
    public function studentProfile()
    {
        return $this->hasOne(Student::class);
    }
   
}
