import '../attendance/attendance_models.dart';
import '../grades/grade_models.dart';

/// A child of the logged-in parent (GET /parent/children).
class Child {
  final int id;
  final String studentCode;
  final String name;
  final String? gender; // "male" / "female"
  final String? className; // null if not in a class

  const Child({
    required this.id,
    required this.studentCode,
    required this.name,
    required this.gender,
    required this.className,
  });

  factory Child.fromJson(Map<String, dynamic> json) {
    final schoolClass = json['class'] as Map<String, dynamic>?;
    return Child(
      id: json['id'] as int,
      studentCode: json['student_code'] as String,
      name: json['name'] as String,
      gender: json['gender'] as String?,
      className: schoolClass?['name'] as String?,
    );
  }
}

/// One day of attendance.
class AttendanceRecord {
  final DateTime date;
  final AttendanceStatus? status;
  final String? note;

  const AttendanceRecord({
    required this.date,
    required this.status,
    required this.note,
  });

  factory AttendanceRecord.fromJson(Map<String, dynamic> json) {
    return AttendanceRecord(
      date: DateTime.parse(json['date'] as String),
      status: AttendanceStatus.fromApi(json['status'] as String?),
      note: json['note'] as String?,
    );
  }
}

/// Response of GET /parent/children/{id}/attendance?month=
class ChildAttendance {
  final Map<AttendanceStatus, int> summary;
  final List<AttendanceRecord> records; // newest first

  const ChildAttendance({required this.summary, required this.records});

  factory ChildAttendance.fromJson(Map<String, dynamic> json) {
    final summary = json['summary'] as Map<String, dynamic>;
    return ChildAttendance(
      summary: {
        for (final status in AttendanceStatus.values)
          status: (summary[status.apiValue] as num?)?.toInt() ?? 0,
      },
      records: (json['records'] as List)
          .map((r) => AttendanceRecord.fromJson(r as Map<String, dynamic>))
          .toList(),
    );
  }
}

/// One subject's grade for a child.
class SubjectGrade {
  final Subject subject;
  final double score;
  final double maxScore;
  final double percentage; // 0..100

  const SubjectGrade({
    required this.subject,
    required this.score,
    required this.maxScore,
    required this.percentage,
  });

  factory SubjectGrade.fromJson(Map<String, dynamic> json) {
    return SubjectGrade(
      subject: Subject.fromJson(json['subject'] as Map<String, dynamic>),
      score: (json['score'] as num).toDouble(),
      maxScore: (json['max_score'] as num).toDouble(),
      percentage: (json['percentage'] as num).toDouble(),
    );
  }
}

/// Response of GET /parent/children/{id}/grades?term=
class ChildGrades {
  final List<SubjectGrade> grades;
  final double? averagePercentage; // null when there are no grades

  const ChildGrades({required this.grades, required this.averagePercentage});

  factory ChildGrades.fromJson(Map<String, dynamic> json) {
    return ChildGrades(
      grades: (json['grades'] as List)
          .map((g) => SubjectGrade.fromJson(g as Map<String, dynamic>))
          .toList(),
      averagePercentage: (json['average_percentage'] as num?)?.toDouble(),
    );
  }
}
