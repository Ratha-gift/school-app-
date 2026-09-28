<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\Subject;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;

class GradeController extends Controller
{
    private const TERMS = ['semester_1', 'semester_2'];

    // GET /api/teacher/classes/{schoolClass}/subjects
    // មុខវិជ្ជាដែលអ្នកប្រើអាចដាក់ពិន្ទុបានក្នុងថ្នាក់នេះ
    public function subjects(Request $request, SchoolClass $schoolClass)
    {
        Gate::authorize('access', $schoolClass);

        return $schoolClass->gradableSubjects($request->user())
            ->orderBy('subjects.name')
            ->get()
            ->map(fn (Subject $s) => [
                'id'      => $s->id,
                'name'    => $s->name,
                'name_km' => $s->name_km,
                'code'    => $s->code,
            ]);
    }

    // GET /api/teacher/classes/{schoolClass}/grades?subject_id=1&term=semester_1
    public function index(Request $request, SchoolClass $schoolClass)
    {
        $data = $request->validate([
            'subject_id' => 'required|integer|exists:subjects,id',
            'term'       => ['required', Rule::in(self::TERMS)],
        ]);

        $subject = Subject::findOrFail($data['subject_id']);
        Gate::authorize('grade', [$schoolClass, $subject]);

        $grades = Grade::where('school_class_id', $schoolClass->id)
            ->where('subject_id', $subject->id)
            ->where('term', $data['term'])
            ->get()
            ->keyBy('student_id');

        $students = $schoolClass->students()->orderBy('first_name')->get()
            ->map(fn ($s) => [
                'id'           => $s->id,
                'student_code' => $s->student_code,
                'name'         => $s->first_name . ' ' . $s->last_name,
                'score'        => isset($grades[$s->id]) ? (float) $grades[$s->id]->score : null,
            ]);

        // ពិន្ទុអតិបរមាដែលបានប្រើពេលរក្សាទុកមុន, បើមិនទាន់មាន = 100
        $maxScore = $grades->isNotEmpty() ? (float) $grades->first()->max_score : 100;

        return response()->json([
            'class'     => ['id' => $schoolClass->id, 'name' => $schoolClass->name],
            'subject'   => ['id' => $subject->id, 'name' => $subject->name, 'name_km' => $subject->name_km],
            'term'      => $data['term'],
            'max_score' => $maxScore,
            'students'  => $students,
        ]);
    }

    // POST /api/teacher/classes/{schoolClass}/grades
    public function store(Request $request, SchoolClass $schoolClass)
    {
        // បើមិនបានផ្ញើ max_score ទេ ប្រើ 100 (ត្រូវការសម្រាប់ rule lte:max_score)
        $request->mergeIfMissing(['max_score' => 100]);

        $data = $request->validate([
            'subject_id'           => 'required|integer|exists:subjects,id',
            'term'                 => ['required', Rule::in(self::TERMS)],
            'max_score'            => 'required|numeric|min:1|max:999.99',
            'records'              => 'required|array|min:1',
            'records.*.student_id' => [
                'required',
                'distinct',
                // សិស្សត្រូវតែនៅក្នុងថ្នាក់នេះ
                Rule::exists('students', 'id')->where('school_class_id', $schoolClass->id),
            ],
            'records.*.score'      => 'required|numeric|min:0|lte:max_score',
        ]);

        $subject = Subject::findOrFail($data['subject_id']);
        Gate::authorize('grade', [$schoolClass, $subject]);

        DB::transaction(function () use ($data, $schoolClass, $request) {
            foreach ($data['records'] as $r) {
                Grade::updateOrCreate(
                    [
                        'student_id'      => $r['student_id'],
                        'subject_id'      => $data['subject_id'],
                        'school_class_id' => $schoolClass->id,
                        'term'            => $data['term'],
                    ],
                    [
                        'score'       => $r['score'],
                        'max_score'   => $data['max_score'],
                        'recorded_by' => $request->user()->id,
                    ]
                );
            }
        });

        return response()->json([
            'message' => 'Grades saved',
            'count'   => count($data['records']),
        ]);
    }
}
