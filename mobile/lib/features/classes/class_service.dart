import '../../core/api_client.dart';
import '../../core/api_exception.dart';
import 'school_class.dart';

/// Loads the classes of the logged-in teacher.
class ClassService {
  final ApiClient _api = ApiClient.instance;

  /// GET /teacher/classes. Throws [ApiException] on failure.
  Future<List<SchoolClass>> getClasses() async {
    try {
      final response = await _api.dio.get('/teacher/classes');
      final list = response.data as List;
      return list
          .map((json) => SchoolClass.fromJson(json as Map<String, dynamic>))
          .toList();
    } catch (e) {
      throw ApiException.from(e);
    }
  }
}
