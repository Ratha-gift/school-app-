import 'package:flutter_test/flutter_test.dart';

import 'package:mobile/features/attendance/attendance_models.dart';
import 'package:mobile/features/attendance/attendance_service.dart';
import 'package:mobile/features/classes/school_class.dart';

void main() {
  test('SchoolClass.fromJson', () {
    final c = SchoolClass.fromJson({
      'id': 1,
      'name': '7A',
      'grade_level': 7,
      'academic_year': '2026-2027',
      'homeroom_teacher_id': 2,
      'students_count': 5,
    });
    expect(c.name, '7A');
    expect(c.studentsCount, 5);
  });

  test('AttendanceStudent.fromJson handles null and known statuses', () {
    final json = {
      'id': 2,
      'student_code': 'STU0002',
      'name': 'Dara Kim',
      'gender': 'female',
      'status': 'absent',
      'note': 'sick',
    };
    expect(AttendanceStudent.fromJson(json).status, AttendanceStatus.absent);
    expect(
      AttendanceStudent.fromJson({...json, 'status': null}).status,
      isNull,
    );
  });

  test('apiDate pads month and day', () {
    expect(apiDate(DateTime(2026, 9, 5)), '2026-09-05');
  });
}
