<?php

use App\Http\Controllers\Api\Admin;
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

// Admin API (សម្រាប់គេហទំព័រ admin Next.js)
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/dashboard', Admin\DashboardController::class)->name('dashboard');
    Route::get('/reports/attendance', [Admin\ReportController::class, 'attendance'])->name('reports.attendance');
    Route::get('/reports/grades', [Admin\ReportController::class, 'grades'])->name('reports.grades');

    Route::apiResource('users', Admin\UserController::class);

    Route::apiResource('classes', Admin\SchoolClassController::class)->parameters(['classes' => 'schoolClass']);
    Route::get('/classes/{schoolClass}/subjects', [Admin\ClassSubjectController::class, 'index'])->name('classes.subjects.index');
    Route::put('/classes/{schoolClass}/subjects', [Admin\ClassSubjectController::class, 'sync'])->name('classes.subjects.sync');

    Route::apiResource('subjects', Admin\SubjectController::class);

    Route::apiResource('students', Admin\StudentController::class);
    Route::get('/students/{student}/guardians', [Admin\StudentGuardianController::class, 'index'])->name('students.guardians.index');
    Route::post('/students/{student}/guardians', [Admin\StudentGuardianController::class, 'store'])->name('students.guardians.store');
    Route::delete('/students/{student}/guardians/{guardian}', [Admin\StudentGuardianController::class, 'destroy'])->name('students.guardians.destroy');
});
