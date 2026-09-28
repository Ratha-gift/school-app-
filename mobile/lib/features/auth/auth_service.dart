import 'package:dio/dio.dart';

import '../../core/api_client.dart';
import 'user.dart';

/// Thrown by [AuthService.login] with a message ready to show to the user.
class AuthException implements Exception {
  final String message;
  const AuthException(this.message);

  @override
  String toString() => message;
}

/// Talks to the /login, /me and /logout endpoints.
class AuthService {
  final ApiClient _api = ApiClient.instance;

  /// Logs in, saves the token, and returns the user.
  /// Throws [AuthException] with a Khmer message on failure.
  Future<User> login(String email, String password) async {
    try {
      final response = await _api.dio.post(
        '/login',
        data: {'email': email, 'password': password, 'device_name': 'mobile'},
        // 401 here means wrong password, not an expired session.
        options: Options(extra: {ApiClient.skipAuthRedirect: true}),
      );
      final data = response.data as Map<String, dynamic>;
      await _api.saveToken(data['token'] as String);
      return User.fromJson(data['user'] as Map<String, dynamic>);
    } on DioException catch (e) {
      throw AuthException(_messageFor(e));
    }
  }

  /// Returns the current user if the saved token is still valid, else null.
  /// If the token is missing or /me fails, the token is deleted.
  Future<User?> currentUser() async {
    final token = await _api.readToken();
    if (token == null) return null;

    try {
      final response = await _api.dio.get(
        '/me',
        // A 401 here is normal (old token): we handle it ourselves.
        options: Options(extra: {ApiClient.skipAuthRedirect: true}),
      );
      return User.fromJson(response.data as Map<String, dynamic>);
    } catch (_) {
      await _api.deleteToken();
      return null;
    }
  }

  /// Revokes the token on the server, then ALWAYS deletes it locally.
  Future<void> logout() async {
    try {
      await _api.dio.post(
        '/logout',
        // HomeScreen navigates to LoginScreen itself after logout.
        options: Options(extra: {ApiClient.skipAuthRedirect: true}),
      );
    } catch (_) {
      // Ignore: we log out locally even if the server call fails.
    } finally {
      await _api.deleteToken();
    }
  }

  /// Turns a Dio error into a user-friendly Khmer message.
  String _messageFor(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return 'មិនអាចភ្ជាប់ទៅ server បានទេ';
      default:
        break;
    }

    final status = e.response?.statusCode;
    final data = e.response?.data;

    if (status == 401) {
      return 'អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ';
    }
    if (status == 422 && data is Map && data['message'] is String) {
      return data['message'] as String; // Laravel validation message
    }
    return 'មានបញ្ហាកើតឡើង សូមព្យាយាមម្ដងទៀត'; // generic fallback
  }
}
