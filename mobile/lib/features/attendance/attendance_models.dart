import 'package:flutter/material.dart';

/// The 4 possible attendance values, each with a Khmer label and a color.
///
/// This is an "enhanced enum": every value carries its own fields.
enum AttendanceStatus {
  present('មក', Color(0xFF16A34A)), // green
  absent('អវត្តមាន', Color(0xFFDC2626)), // red
  late('យឺត', Color(0xFFEA580C)), // orange
  excused('ច្បាប់', Color(0xFF2563EB)); // blue

  const AttendanceStatus(this.label, this.color);

  final String label;
  final Color color;

  /// The value the API uses, e.g. "present". It matches the enum name.
  String get apiValue => name;

  /// Converts the API string to an enum value. Returns null for null or
  /// unknown values (null = attendance not recorded yet).
  static AttendanceStatus? fromApi(String? value) {
    for (final status in values) {
      if (status.name == value) return status;
    }
    return null;
  }
}

/// One student row on the attendance screen.
class AttendanceStudent {
  final int id;
  final String studentCode;
  final String name;
  final String? gender;
  final String? note;

  /// Not final: the teacher changes it on screen (inside setState).
  AttendanceStatus? status;

  AttendanceStudent({
    required this.id,
    required this.studentCode,
    required this.name,
    required this.gender,
    required this.note,
    required this.status,
  });

  factory AttendanceStudent.fromJson(Map<String, dynamic> json) {
    return AttendanceStudent(
      id: json['id'] as int,
      studentCode: json['student_code'] as String,
      name: json['name'] as String,
      gender: json['gender'] as String?,
      note: json['note'] as String?,
      status: AttendanceStatus.fromApi(json['status'] as String?),
    );
  }
}
