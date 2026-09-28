import 'dart:io' show Platform;

import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
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
        // Runs when a request fails. A 401 means our token is no longer
        // valid (expired or revoked), so log the user out everywhere.
        onError: (error, handler) async {
          final skip = error.requestOptions.extra[skipAuthRedirect] == true;
          if (error.response?.statusCode == 401 && !skip) {
            // Only redirect once: if several requests fail at the same
            // time, the first one deletes the token and the rest skip this.
            if (await readToken() != null) {
              await deleteToken();
              onUnauthorized?.call();
            }
          }
          // Pass the error on so the caller still gets its exception.
          handler.next(error);
        },
      ),
    );
  }

  /// Called after a 401 (the token was already deleted). main.dart sets
  /// this to navigate to LoginScreen. It's a callback so that this core
  /// file doesn't need to import any screens.
  void Function()? onUnauthorized;

  /// Put `extra: {ApiClient.skipAuthRedirect: true}` in a request's Options
  /// when that request handles 401 itself (e.g. /me at startup, /logout).
  static const skipAuthRedirect = 'skipAuthRedirect';

  /// The single shared instance (singleton).
  static final ApiClient instance = ApiClient._();

  /// Key used to store the Sanctum token in secure storage.
  static const tokenKey = 'token';

  /// The API address. Override it at build time with --dart-define:
  ///
  ///   flutter run --dart-define=API_URL=http://192.168.1.20:8000/api
  ///
  /// (use your computer's LAN IP to test on a real phone; start Laravel
  /// with `php artisan serve --host=0.0.0.0` so the phone can reach it).
  ///
  /// Without API_URL:
  /// - Android emulator: 10.0.2.2 = "the computer running the emulator"
  /// - everything else (Linux desktop, iOS simulator, web): 127.0.0.1
  static final String baseUrl = _defaultBaseUrl();

  static String _defaultBaseUrl() {
    // `const` is required: the value is baked in at compile time.
    const fromDefine = String.fromEnvironment('API_URL');
    if (fromDefine.isNotEmpty) return fromDefine;

    // Platform (dart:io) doesn't work on web, so check kIsWeb first.
    if (!kIsWeb && Platform.isAndroid) return 'http://10.0.2.2:8000/api';
    return 'http://127.0.0.1:8000/api';
  }

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
