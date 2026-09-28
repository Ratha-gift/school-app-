<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Attendance;
use App\Models\SchoolClass;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class AttendanceController extends Controller
{
    // GET /api/teacher/classes/{schoolClass}/attendance?date=2026-09-28
    public function index(Request $request, SchoolClass $schoolClass)
    {
        Gate::authorize('access', $schoolClass);

        $date = $request->query('date', now()->toDateString());

        $records = Attendance::where('school_class_id', $schoolClass->id)
            ->whereDate('date', $date)
            ->get()
            ->keyBy('student_id');

        $students = $schoolClass->students()->orderBy('first_name')->get()
            ->map(fn ($s) => [
                'id'           => $s->id,
                'student_code' => $s->student_code,
                'name'         => $s->first_name . ' ' . $s->last_name,
                'gender'       => $s->gender,
                'status'       => $records[$s->id]->status ?? null,
                'note'         => $records[$s->id]->note ?? null,
            ]);

        return response()->json([
            'class'    => ['id' => $schoolClass->id, 'name' => $schoolClass->name],
            'date'     => $date,
            'students' => $students,
        ]);
    }

    // POST /api/teacher/classes/{schoolClass}/attendance
    public function store(Request $request, SchoolClass $schoolClass)
    {
        Gate::authorize('access', $schoolClass);

        $data = $request->validate([
            'date'                 => 'required|date|before_or_equal:today',
            'records'              => 'required|array|min:1',
            'records.*.student_id' => [
                'required',
                Rule::exists('students', 'id')->where('school_class_id', $schoolClass->id),
            ],
            'records.*.status'     => 'required|in:present,absent,late,excused',
            'records.*.note'       => 'nullable|string|max:255',
        ]);

        DB::transaction(function () use ($data, $schoolClass, $request) {
            foreach ($data['records'] as $r) {
                Attendance::updateOrCreate(
                    ['student_id' => $r['student_id'], 'date' => $data['date']],
                    [
                        'school_class_id' => $schoolClass->id,
                        'status'          => $r['status'],
                        'note'            => $r['note'] ?? null,
                        'recorded_by'     => $request->user()->id,
                    ]
                );
            }
        });

        return response()->json([
            'message' => 'Attendance saved',
            'count'   => count($data['records']),
        ]);
    }
}