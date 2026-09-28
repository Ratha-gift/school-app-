import '../../core/api_client.dart';
import '../../core/api_exception.dart';
import 'attendance_models.dart';

/// Loads and saves a class's attendance for one day.
class AttendanceService {
  final ApiClient _api = ApiClient.instance;

  /// GET /teacher/classes/{id}/attendance?date=YYYY-MM-DD
  /// Throws [ApiException] on failure.
  Future<List<AttendanceStudent>> getAttendance(
    int classId,
    DateTime date,
  ) async {
    try {
      final response = await _api.dio.get(
        '/teacher/classes/$classId/attendance',
        queryParameters: {'date': apiDate(date)},
      );
      final students = response.data['students'] as List;
      return students
          .map(
            (json) => AttendanceStudent.fromJson(json as Map<String, dynamic>),
          )
          .toList();
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  /// POST /teacher/classes/{id}/attendance
  /// Every student must have a status. Throws [ApiException] on failure.
  Future<void> saveAttendance(
    int classId,
    DateTime date,
    List<AttendanceStudent> students,
  ) async {
    try {
      await _api.dio.post(
        '/teacher/classes/$classId/attendance',
        data: {
          'date': apiDate(date),
          'records': [
            for (final student in students)
              {
                'student_id': student.id,
                'status': student.status!.apiValue,
                'note': student.note,
              },
          ],
        },
      );
    } catch (e) {
      throw ApiException.from(e);
    }
  }
}

/// Formats a date as YYYY-MM-DD (the format the API expects).
String apiDate(DateTime date) {
  final month = date.month.toString().padLeft(2, '0');
  final day = date.day.toString().padLeft(2, '0');
  return '${date.year}-$month-$day';
}
