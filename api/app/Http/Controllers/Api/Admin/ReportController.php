<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Requests\Admin\AttendanceReportRequest;
use App\Http\Requests\Admin\GradeReportRequest;
use App\Models\Attendance;
use App\Models\Grade;
use App\Models\SchoolClass;
use App\Models\Subject;

class ReportController extends AdminController
{
    // GET /admin/reports/attendance?school_class_id=1&from=2026-09-01&to=2026-09-30
    // attendance_rate = (present + late) / total * 100
    public function attendance(AttendanceReportRequest $request)
    {
        $data = $request->validated();
        $class = SchoolClass::findOrFail($data['school_class_id']);

        $records = Attendance::where('school_class_id', $class->id)
            ->whereDate('date', '>=', $data['from'])
            ->whereDate('date', '<=', $data['to']);

        // [student_id][status] => ចំនួន
        $counts = [];
        foreach ((clone $records)->selectRaw('student_id, status, count(*) as total')->groupBy('student_id', 'status')->get() as $row) {
            $counts[$row->student_id][$row->status] = (int) $row->total;
        }

        $totals = array_fill_keys(Attendance::STATUSES, 0);
        $students = $class->students()->orderBy('first_name')->get()->map(function ($s) use ($counts, &$totals) {
            $row = [];
            foreach (Attendance::STATUSES as $status) {
                $row[$status] = $counts[$s->id][$status] ?? 0;
                $totals[$status] += $row[$status];
            }
            $total = array_sum($row);

            return [
                'id'              => $s->id,
                'student_code'    => $s->student_code,
                'name'            => $s->first_name . ' ' . $s->last_name,
                ...$row,
                'total'           => $total,
                'attendance_rate' => $this->rate($row['present'] + $row['late'], $total),
            ];
        });

        $grandTotal = array_sum($totals);

        return response()->json([
            'class'         => ['id' => $class->id, 'name' => $class->name],
            'from'          => $data['from'],
            'to'            => $data['to'],
            'days_recorded' => (clone $records)->distinct()->count('date'),
            'summary'       => [
                ...$totals,
                'total'           => $grandTotal,
                'attendance_rate' => $this->rate($totals['present'] + $totals['late'], $grandTotal),
            ],
            'students'      => $students,
        ]);
    }

    // GET /admin/reports/grades?school_class_id=1&term=semester_1
    // ពិន្ទុរបស់សិស្សម្នាក់ៗ តាមមុខវិជ្ជា (percentage) + មធ្យមភាគ
    public function grades(GradeReportRequest $request)
    {
        $data = $request->validated();
        $class = SchoolClass::findOrFail($data['school_class_id']);

        $grades = Grade::where('school_class_id', $class->id)
            ->where('term', $data['term'])
            ->get();

        // មុខវិជ្ជារបស់ថ្នាក់ + មុខវិជ្ជាណាដែលមានពិន្ទុ (ទោះបីត្រូវបានដកចេញពីថ្នាក់ហើយ)
        $subjectIds = $class->subjects()->pluck('subjects.id')->merge($grades->pluck('subject_id'))->unique();
        $subjects = Subject::whereIn('id', $subjectIds)->orderBy('name')->get();

        // [student_id][subject_id] => Grade
        $byStudent = $grades->groupBy('student_id')->map(fn ($g) => $g->keyBy('subject_id'));

        $students = $class->students()->orderBy('first_name')->get()->map(function ($s) use ($subjects, $byStudent) {
            $cells = $subjects->map(function ($subject) use ($s, $byStudent) {
                $g = $byStudent[$s->id][$subject->id] ?? null;

                return [
                    'subject_id' => $subject->id,
                    'score'      => $g ? (float) $g->score : null,
                    'max_score'  => $g ? (float) $g->max_score : null,
                    'percentage' => $g ? $this->percentage($g) : null,
                ];
            });

            return [
                'id'                 => $s->id,
                'student_code'       => $s->student_code,
                'name'               => $s->first_name . ' ' . $s->last_name,
                'grades'             => $cells->values(),
                'average_percentage' => $this->average($cells->pluck('percentage')),
            ];
        });

        $subjectAverages = $subjects->map(fn ($subject) => [
            'subject_id'         => $subject->id,
            'graded_count'       => $grades->where('subject_id', $subject->id)->count(),
            'average_percentage' => $this->average(
                $grades->where('subject_id', $subject->id)->map(fn ($g) => $this->percentage($g))
            ),
        ]);

        return response()->json([
            'class'                    => ['id' => $class->id, 'name' => $class->name],
            'term'                     => $data['term'],
            'subjects'                 => $subjects->map(fn ($s) => [
                'id' => $s->id, 'name' => $s->name, 'name_km' => $s->name_km, 'code' => $s->code,
            ]),
            'students'                 => $students,
            'subject_averages'         => $subjectAverages,
            'class_average_percentage' => $this->average($grades->map(fn ($g) => $this->percentage($g))),
        ]);
    }

    private function percentage(Grade $grade): float
    {
        return round($grade->score / $grade->max_score * 100, 2);
    }

    // មធ្យមភាគ (រំលង null), null បើគ្មានតម្លៃ
    private function average($values): ?float
    {
        $values = collect($values)->filter(fn ($v) => $v !== null);

        return $values->isEmpty() ? null : round($values->avg(), 2);
    }

    private function rate(int $part, int $total): ?float
    {
        return $total === 0 ? null : round($part / $total * 100, 2);
    }
}
