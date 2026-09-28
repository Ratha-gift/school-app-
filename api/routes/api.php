<?php

use App\Http\Controllers\Api\AttendanceController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\GradeController;
use App\Http\Controllers\Api\ParentController;
use App\Http\Controllers\Api\TeacherController;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // គ្រូ និង admin
    Route::middleware('role:teacher,admin')->prefix('teacher')->group(function () {
        Route::get('/classes', [TeacherController::class, 'classes']);
        Route::get('/classes/{schoolClass}/attendance', [AttendanceController::class, 'index']);
        Route::post('/classes/{schoolClass}/attendance', [AttendanceController::class, 'store']);
        Route::get('/classes/{schoolClass}/subjects', [GradeController::class, 'subjects']);
        Route::get('/classes/{schoolClass}/grades', [GradeController::class, 'index']);
        Route::post('/classes/{schoolClass}/grades', [GradeController::class, 'store']);
    });

    // ឪពុកម្ដាយ
    Route::middleware('role:parent')->prefix('parent')->group(function () {
        Route::get('/children', [ParentController::class, 'children']);
        Route::get('/children/{student}/attendance', [ParentController::class, 'attendance']);
        Route::get('/children/{student}/grades', [ParentController::class, 'grades']);
    });
});
