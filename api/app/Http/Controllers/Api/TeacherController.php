<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SchoolClass;
use Illuminate\Http\Request;

class TeacherController extends Controller
{
    public function classes(Request $request)
    {
        $userId = $request->user()->id;

        return SchoolClass::where('homeroom_teacher_id', $userId)
            ->orWhereHas('subjects', fn ($q) => $q->where('class_subject.teacher_id', $userId))
            ->withCount('students')
            ->orderBy('name')
            ->get();
    }
}