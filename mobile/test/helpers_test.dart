import 'package:flutter_test/flutter_test.dart';

import 'package:mobile/core/date_format.dart';
import 'package:mobile/features/attendance/attendance_models.dart';
import 'package:mobile/features/grades/grade_models.dart';
import 'package:mobile/features/parent/parent_models.dart';

void main() {
  group('date_format', () {
    test('formatDate pads day and month', () {
      expect(formatDate(DateTime(2026, 9, 5)), '05/09/2026');
    });

    test('khmerMonthYear', () {
      expect(khmerMonthYear(DateTime(2026, 9, 28)), 'កញ្ញា 2026');
      expect(khmerMonthYear(DateTime(2027, 1, 1)), 'មករា 2027');
      expect(khmerMonthYear(DateTime(2026, 12, 31)), 'ធ្នូ 2026');
    });

    test('khmerWeekday (2026-09-28 is a Monday)', () {
      expect(khmerWeekday(DateTime(2026, 9, 28)), 'ថ្ងៃចន្ទ');
      expect(khmerWeekday(DateTime(2026, 9, 27)), 'ថ្ងៃអាទិត្យ');
    });

    test('apiMonth and monthStart', () {
      expect(apiMonth(DateTime(2026, 3, 15)), '2026-03');
      expect(monthStart(DateTime(2026, 9, 28, 14, 30)), DateTime(2026, 9));
      // Going back from January wraps to December of the previous year.
      expect(DateTime(2026, 1 - 1), DateTime(2025, 12));
    });
  });

  group('grade helpers', () {
    test('formatScore drops useless decimals', () {
      expect(formatScore(90), '90');
      expect(formatScore(85.5), '85.5');
      expect(formatScore(72.25), '72.25');
      expect(formatScore(80.10), '80.1');
    });

    test('parseScore accepts dot and comma', () {
      expect(parseScore('85.5'), 85.5);
      expect(parseScore(' 85,5 '), 85.5);
      expect(parseScore(''), isNull);
      expect(parseScore('abc'), isNull);
    });

    test('validateScore', () {
      expect(validateScore('', 100), isNull); // not graded yet: OK
      expect(validateScore('', 100, required: true), isNotNull);
      expect(validateScore('50', 100), isNull);
      expect(validateScore('0', 100), isNull);
      expect(validateScore('100', 100), isNull);
      expect(validateScore('100.5', 100), isNotNull);
      expect(validateScore('-1', 100), isNotNull);
      expect(validateScore('1.2.3', 100), isNotNull);
      expect(validateScore('45', 40), isNotNull);
    });

    test('average', () {
      expect(average([]), isNull);
      expect(average([80, 90, 70]), 80);
      expect(average([85.5]), 85.5);
    });

    test('Subject.displayName falls back to English', () {
      expect(
        const Subject(id: 1, name: 'Math', nameKm: 'គណិតវិទ្យា').displayName,
        'គណិតវិទ្យា',
      );
      expect(const Subject(id: 1, name: 'Math').displayName, 'Math');
      expect(
        const Subject(id: 1, name: 'Math', nameKm: '').displayName,
        'Math',
      );
    });
  });

  group('JSON parsing', () {
    test('ClassGrades handles int and null scores', () {
      final grades = ClassGrades.fromJson({
        'max_score': 100,
        'students': [
          {'id': 1, 'student_code': 'STU0001', 'name': 'A', 'score': 90},
          {'id': 2, 'student_code': 'STU0002', 'name': 'B', 'score': 72.5},
          {'id': 3, 'student_code': 'STU0003', 'name': 'C', 'score': null},
        ],
      });
      expect(grades.maxScore, 100.0);
      expect(grades.students.map((s) => s.score), [90.0, 72.5, null]);
    });

    test('ChildAttendance summary and records', () {
      final data = ChildAttendance.fromJson({
        'summary': {'present': 2, 'absent': 1, 'late': 0, 'excused': 0},
        'records': [
          {'date': '2026-09-28', 'status': 'absent', 'note': 'sick'},
        ],
      });
      expect(data.summary[AttendanceStatus.present], 2);
      expect(data.summary[AttendanceStatus.absent], 1);
      expect(data.records.single.date, DateTime(2026, 9, 28));
      expect(data.records.single.status, AttendanceStatus.absent);
    });

    test('ChildGrades with null average', () {
      final data = ChildGrades.fromJson({
        'grades': <dynamic>[],
        'average_percentage': null,
      });
      expect(data.grades, isEmpty);
      expect(data.averagePercentage, isNull);
    });

    test('Child with and without class', () {
      final json = {
        'id': 1,
        'student_code': 'STU0001',
        'name': 'Sokha Chan',
        'gender': 'male',
        'class': {'id': 1, 'name': '7A'},
      };
      expect(Child.fromJson(json).className, '7A');
      expect(Child.fromJson({...json, 'class': null}).className, isNull);
    });
  });
}
