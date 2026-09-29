<?php

namespace App\Http\Controllers\Api\Admin;

use App\Models\Attendance;
use App\Models\SchoolClass;
use App\Models\Student;
use App\Models\User;

class DashboardController extends AdminController
{
    // GET /admin/dashboard
    public function __invoke()
    {
        $today = now()->toDateString();

        // ចំនួនតាម status សម្រាប់ថ្ងៃនេះ (ចាប់ផ្ដើមពី 0 គ្រប់ status)
        $byStatus = Attendance::whereDate('date', $today)
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');
        $summary = [];
        foreach (Attendance::STATUSES as $status) {
            $summary[$status] = (int) ($byStatus[$status] ?? 0);
        }

        // ថ្នាក់ដែលមានសិស្ស ប៉ុន្តែមិនទាន់កត់វត្តមានថ្ងៃនេះ
        $missing = SchoolClass::has('students')
            ->whereDoesntHave('attendances', fn ($q) => $q->whereDate('date', $today))
            ->with('homeroomTeacher')
            ->withCount('students')
            ->orderBy('name')
            ->get()
            ->map(fn ($c) => [
                'id'               => $c->id,
                'name'             => $c->name,
                'students_count'   => $c->students_count,
                'homeroom_teacher' => $c->homeroomTeacher
                    ? ['id' => $c->homeroomTeacher->id, 'name' => $c->homeroomTeacher->name]
                    : null,
            ]);

        return response()->json([
            'counts' => [
                'students' => Student::count(),
                'teachers' => User::where('role', 'teacher')->count(),
                'parents'  => User::where('role', 'parent')->count(),
                'classes'  => SchoolClass::count(),
            ],
            'today' => [
                'date'    => $today,
                'summary' => $summary,
                'total'   => array_sum($summary),
            ],
            'classes_without_attendance_today' => $missing,
        ]);
    }
}
