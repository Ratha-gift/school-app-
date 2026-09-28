<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // ថ្នាក់រៀន
        Schema::create('school_classes', function (Blueprint $table) {
            $table->id();
            $table->string('name');                      // ឧ. 7A
            $table->unsignedTinyInteger('grade_level');  // ឧ. 7
            $table->string('academic_year');             // ឧ. 2026-2027
            $table->foreignId('homeroom_teacher_id')->nullable()
                  ->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['name', 'academic_year']);
        });

        // សិស្ស
        Schema::create('students', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->unique()
                  ->constrained()->nullOnDelete();       // គណនី login (optional)
            $table->string('student_code')->unique();
            $table->string('first_name');
            $table->string('last_name');
            $table->enum('gender', ['male', 'female']);
            $table->date('date_of_birth')->nullable();
            $table->foreignId('school_class_id')->nullable()
                  ->constrained()->nullOnDelete();
            $table->timestamps();
        });

        // ឪពុកម្ដាយ ↔ កូន
        Schema::create('guardian_student', function (Blueprint $table) {
            $table->id();
            $table->foreignId('guardian_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->string('relationship')->default('parent'); // father, mother, guardian
            $table->timestamps();

            $table->unique(['guardian_id', 'student_id']);
        });

        // មុខវិជ្ជា
        Schema::create('subjects', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('name_km')->nullable();
            $table->string('code')->unique();
            $table->timestamps();
        });

        // ថ្នាក់ ↔ មុខវិជ្ជា ↔ គ្រូ
        Schema::create('class_subject', function (Blueprint $table) {
            $table->id();
            $table->foreignId('school_class_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('teacher_id')->nullable()
                  ->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['school_class_id', 'subject_id']);
        });

        // វត្តមាន
        Schema::create('attendances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained()->cascadeOnDelete();
            $table->date('date');
            $table->enum('status', ['present', 'absent', 'late', 'excused']);
            $table->string('note')->nullable();
            $table->foreignId('recorded_by')->nullable()
                  ->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['student_id', 'date']);       // មួយថ្ងៃមួយ record
            $table->index(['school_class_id', 'date']);   // ស្វែងរកលឿន
        });

        // ពិន្ទុ
        Schema::create('grades', function (Blueprint $table) {
            $table->id();
            $table->foreignId('student_id')->constrained()->cascadeOnDelete();
            $table->foreignId('subject_id')->constrained()->cascadeOnDelete();
            $table->foreignId('school_class_id')->constrained()->cascadeOnDelete();
            $table->string('term');                        // ឧ. semester_1
            $table->decimal('score', 5, 2);
            $table->decimal('max_score', 5, 2)->default(100);
            $table->foreignId('recorded_by')->nullable()
                  ->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->unique(['student_id', 'subject_id', 'school_class_id', 'term']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('grades');
        Schema::dropIfExists('attendances');
        Schema::dropIfExists('class_subject');
        Schema::dropIfExists('subjects');
        Schema::dropIfExists('guardian_student');
        Schema::dropIfExists('students');
        Schema::dropIfExists('school_classes');
    }
};