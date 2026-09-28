<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class ParentController extends Controller
{
    // GET /api/parent/children
    public function children(Request $request)
    {
        return $request->user()->children()
            ->with('schoolClass')
            ->orderBy('first_name')
            ->get()
            ->map(fn (Student $s) => [
                'id'           => $s->id,
                'student_code' => $s->student_code,
                'name'         => $s->first_name . ' ' . $s->last_name,
                'gender'       => $s->gender,
                'class'        => $s->schoolClass
                    ? ['id' => $s->schoolClass->id, 'name' => $s->schoolClass->name]
                    : null,
            ]);
    }

    // GET /api/parent/children/{student}/attendance?month=2026-09
    public function attendance(Request $request, Student $student)
    {
        Gate::authorize('viewAsGuardian', $student);

        $data = $request->validate(['month' => 'nullable|date_format:Y-m']);

        // "!" = កំណត់ថ្ងៃទៅ 1 (បើមិនដូច្នេះ ថ្ងៃទី31 អាចលោតទៅខែបន្ទាប់)
        $start = isset($data['month'])
            ? Carbon::createFromFormat('!Y-m', $data['month'])
            : now()->startOfMonth();
        $end = $start->copy()->endOfMonth();

        $records = $student->attendances()
            ->whereDate('date', '>=', $start->toDateString())
            ->whereDate('date', '<=', $end->toDateString())
            ->orderByDesc('date')
            ->get();

        // រាប់តាម status (ចាប់ផ្ដើមពី 0 គ្រប់ status)
        $summary = ['present' => 0, 'absent' => 0, 'late' => 0, 'excused' => 0];
        foreach ($records as $r) {
            $summary[$r->status]++;
        }

        return response()->json([
            'student' => $this->studentInfo($student),
            'month'   => $start->format('Y-m'),
            'summary' => $summary,
            'records' => $records->map(fn ($r) => [
                'date'   => $r->date->toDateString(),
                'status' => $r->status,
                'note'   => $r->note,
            ]),
        ]);
    }

    // GET /api/parent/children/{student}/grades?term=semester_1
    public function grades(Request $request, Student $student)
    {
        Gate::authorize('viewAsGuardian', $student);

        $data = $request->validate([
            'term' => ['nullable', Rule::in(['semester_1', 'semester_2'])],
        ]);
        $term = $data['term'] ?? 'semester_1';

        $grades = $student->grades()
            ->with('subject')
            ->where('term', $term)
            // តែពិន្ទុក្នុងថ្នាក់បច្ចុប្បន្ន (មិនលាយជាមួយឆ្នាំមុន)
            ->when($student->school_class_id, fn ($q, $classId) => $q->where('school_class_id', $classId))
            ->get()
            ->sortBy('subject.name')
            ->values()
            ->map(fn ($g) => [
                'subject'    => [
                    'id'      => $g->subject->id,
                    'name'    => $g->subject->name,
                    'name_km' => $g->subject->name_km,
                ],
                'score'      => (float) $g->score,
                'max_score'  => (float) $g->max_score,
                'percentage' => round($g->score / $g->max_score * 100, 2),
            ]);

        return response()->json([
            'student'            => $this->studentInfo($student),
            'term'               => $term,
            'grades'             => $grades,
            'average_percentage' => $grades->isEmpty() ? null : round($grades->avg('percentage'), 2),
        ]);
    }

    private function studentInfo(Student $student): array
    {
        return ['id' => $student->id, 'name' => $student->first_name . ' ' . $student->last_name];
    }
}
