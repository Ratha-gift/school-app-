import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// One shared Dio instance + secure storage for the whole app.
///
/// Usage: `ApiClient.instance.dio.get('/me')`
class ApiClient {
  // Private constructor: only this file can create an ApiClient.
  ApiClient._() {
    dio.interceptors.add(
      InterceptorsWrapper(
        // Runs before every request: attach the saved token (if any).
        onRequest: (options, handler) async {
          final token = await storage.read(key: tokenKey);
          if (token != null) {
            options.headers['Authorization'] = 'Bearer $token';
          }
          handler.next(options);
        },
      ),
    );
  }

  /// The single shared instance (singleton).
  static final ApiClient instance = ApiClient._();

  /// Key used to store the Sanctum token in secure storage.
  static const tokenKey = 'token';

  // NOTE: 127.0.0.1 works for Linux desktop / iOS simulator / web.
  // The Android emulator needs http://10.0.2.2:8000/api instead.
  static const baseUrl = 'http://127.0.0.1:8000/api';

  final Dio dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      // Laravel returns JSON errors (not HTML redirects) with this header.
      headers: {'Accept': 'application/json'},
    ),
  );

  final FlutterSecureStorage storage = const FlutterSecureStorage();

  Future<String?> readToken() => storage.read(key: tokenKey);
  Future<void> saveToken(String token) =>
      storage.write(key: tokenKey, value: token);
  Future<void> deleteToken() => storage.delete(key: tokenKey);
}
