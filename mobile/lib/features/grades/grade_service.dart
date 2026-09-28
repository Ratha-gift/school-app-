import '../../core/api_client.dart';
import '../../core/api_exception.dart';
import 'grade_models.dart';

/// Teacher endpoints for subjects and grades of a class.
class GradeService {
  final ApiClient _api = ApiClient.instance;

  static const _forbidden = 'អ្នកមិនមានសិទ្ធិដាក់ពិន្ទុមុខវិជ្ជានេះទេ';

  /// GET /teacher/classes/{id}/subjects — only subjects this user may grade.
  Future<List<Subject>> getSubjects(int classId) async {
    try {
      final response = await _api.dio.get('/teacher/classes/$classId/subjects');
      return (response.data as List)
          .map((json) => Subject.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  /// GET /teacher/classes/{id}/grades?subject_id=&term=
  Future<ClassGrades> getGrades(int classId, int subjectId, Term term) async {
    try {
      final response = await _api.dio.get(
        '/teacher/classes/$classId/grades',
        queryParameters: {'subject_id': subjectId, 'term': term.apiValue},
      );
      return ClassGrades.fromJson(response.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiException.from(e, forbidden: _forbidden);
    }
  }

  /// POST /teacher/classes/{id}/grades
  /// [scores] maps student id -> score (only students that have a score).
  Future<void> saveGrades(
    int classId,
    int subjectId,
    Term term,
    double maxScore,
    Map<int, double> scores,
  ) async {
    try {
      await _api.dio.post(
        '/teacher/classes/$classId/grades',
        data: {
          'subject_id': subjectId,
          'term': term.apiValue,
          'max_score': maxScore,
          'records': [
            for (final entry in scores.entries)
              {'student_id': entry.key, 'score': entry.value},
          ],
        },
      );
    } catch (e) {
      throw ApiException.from(e, forbidden: _forbidden);
    }
  }
}
