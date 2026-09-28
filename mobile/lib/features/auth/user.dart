/// The logged-in user, as returned by the API.
class User {
  final int id;
  final String name;
  final String email;
  final String role; // admin, teacher, parent or student

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
  });

  /// Builds a User from a JSON map like
  /// {"id":1,"name":"Teacher One","email":"...","role":"teacher"}.
  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'] as int,
      name: json['name'] as String,
      email: json['email'] as String,
      role: json['role'] as String,
    );
  }
}
