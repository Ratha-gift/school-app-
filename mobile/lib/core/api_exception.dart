import 'package:dio/dio.dart';

/// An API error with a Khmer message that is ready to show to the user.
///
/// Services catch errors and re-throw them as [ApiException], so screens
/// only need `on ApiException catch (e)` and can display `e.message`.
class ApiException implements Exception {
  final String message;
  const ApiException(this.message);

  /// Converts any error (usually a [DioException]) into an [ApiException].
  ///
  /// [forbidden] is the message for 403; each screen can pass its own
  /// (e.g. "can't grade this subject"). Default: "not your class".
  factory ApiException.from(
    Object error, {
    String forbidden = 'អ្នកមិនមានសិទ្ធិលើថ្នាក់នេះទេ',
  }) {
    if (error is! DioException) {
      // e.g. the JSON didn't have the shape we expected.
      return const ApiException(_generic);
    }

    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return const ApiException('មិនអាចភ្ជាប់ទៅ server បានទេ');
      default:
        break;
    }

    final status = error.response?.statusCode;
    final data = error.response?.data;

    switch (status) {
      case 401:
        return const ApiException('សូមចូលគណនីម្ដងទៀត');
      case 403:
        return ApiException(forbidden);
      case 404:
        return const ApiException('រកមិនឃើញទិន្នន័យ');
      case 422:
        // Laravel validation error: show the server's message.
        if (data is Map && data['message'] is String) {
          return ApiException(data['message'] as String);
        }
    }
    return const ApiException(_generic);
  }

  static const _generic = 'មានបញ្ហាកើតឡើង សូមព្យាយាមម្ដងទៀត';

  @override
  String toString() => message;
}
