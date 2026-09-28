import '../../core/api_client.dart';
import '../../core/api_exception.dart';
import '../../core/date_format.dart';
import '../grades/grade_models.dart';
import 'parent_models.dart';

/// Parent endpoints: my children, their attendance and grades.
class ParentService {
  final ApiClient _api = ApiClient.instance;

  /// GET /parent/children
  Future<List<Child>> getChildren() async {
    try {
      final response = await _api.dio.get('/parent/children');
      return (response.data as List)
          .map((json) => Child.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  /// GET /parent/children/{id}/attendance?month=YYYY-MM
  Future<ChildAttendance> getAttendance(int childId, DateTime month) async {
    try {
      final response = await _api.dio.get(
        '/parent/children/$childId/attendance',
        queryParameters: {'month': apiMonth(month)},
      );
      return ChildAttendance.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  /// GET /parent/children/{id}/grades?term=
  Future<ChildGrades> getGrades(int childId, Term term) async {
    try {
      final response = await _api.dio.get(
        '/parent/children/$childId/grades',
        queryParameters: {'term': term.apiValue},
      );
      return ChildGrades.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiException.from(e);
    }
  }
}
