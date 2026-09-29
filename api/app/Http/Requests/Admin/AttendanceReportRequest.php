<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Carbon;
use Illuminate\Validation\Validator;

class AttendanceReportRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'school_class_id' => 'required|integer|exists:school_classes,id',
            'from'            => 'required|date_format:Y-m-d',
            'to'              => 'required|date_format:Y-m-d|after_or_equal:from',
        ];
    }

    // មិនឲ្យលើសពី 1 ឆ្នាំ (ការពារ query ធំពេក)
    public function after(): array
    {
        return [
            function (Validator $validator) {
                if ($validator->errors()->isNotEmpty()) {
                    return;
                }
                $from = Carbon::parse($this->input('from'));
                $to = Carbon::parse($this->input('to'));
                if ($from->diffInDays($to) > 366) {
                    $validator->errors()->add('to', 'The date range cannot be longer than one year.');
                }
            },
        ];
    }
}
