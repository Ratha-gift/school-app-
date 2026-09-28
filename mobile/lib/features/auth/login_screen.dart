import 'package:flutter/material.dart';

import '../../core/theme.dart';
import '../home/home_screen.dart';
import 'auth_service.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _authService = AuthService();

  // TODO: remove the prefilled credentials before release.
  final _emailController = TextEditingController(text: 'teacher@school.com');
  final _passwordController = TextEditingController(text: 'password');

  bool _loading = false; // true while the request is running
  bool _obscurePassword = true; // hide password by default
  String? _error; // error message shown under the fields

  @override
  void dispose() {
    // Controllers must be disposed to free resources.
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    // Ignore extra taps / Enter presses while already loading.
    if (_loading) return;
    // Run the validators; stop if any field is invalid.
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _loading = true;
      _error = null;
    });

    try {
      final user = await _authService.login(
        _emailController.text.trim(),
        _passwordController.text,
      );
      // The widget may have been removed while we were waiting.
      if (!mounted) return;
      // Replace the login screen so "back" doesn't return to it.
      Navigator.of(context).pushReplacement(
        MaterialPageRoute(builder: (_) => HomeScreen(user: user)),
      );
    } on AuthException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final textTheme = Theme.of(context).textTheme;

    return Scaffold(
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 400),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.stretch,
                children: [
                  const Icon(Icons.school, size: 64, color: AppColors.primary),
                  const SizedBox(height: 16),
                  Text(
                    'School App',
                    textAlign: TextAlign.center,
                    style: textTheme.headlineMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'ចូលប្រើប្រាស់គណនីរបស់អ្នក',
                    textAlign: TextAlign.center,
                    style: textTheme.bodyMedium?.copyWith(color: Colors.grey),
                  ),
                  const SizedBox(height: 32),

                  // Email field
                  TextFormField(
                    controller: _emailController,
                    keyboardType: TextInputType.emailAddress,
                    textInputAction: TextInputAction.next, // Enter -> next
                    decoration: const InputDecoration(
                      labelText: 'អ៊ីមែល',
                      prefixIcon: Icon(Icons.email_outlined),
                    ),
                    validator: (value) {
                      final email = value?.trim() ?? '';
                      if (email.isEmpty) return 'សូមបញ្ចូលអ៊ីមែល';
                      if (!email.contains('@')) return 'អ៊ីមែលមិនត្រឹមត្រូវ';
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),

                  // Password field with show/hide toggle
                  TextFormField(
                    controller: _passwordController,
                    obscureText: _obscurePassword,
                    textInputAction: TextInputAction.done,
                    onFieldSubmitted: (_) => _submit(), // Enter -> submit
                    decoration: InputDecoration(
                      labelText: 'ពាក្យសម្ងាត់',
                      prefixIcon: const Icon(Icons.lock_outline),
                      suffixIcon: IconButton(
                        icon: Icon(
                          _obscurePassword
                              ? Icons.visibility_outlined
                              : Icons.visibility_off_outlined,
                        ),
                        onPressed: () => setState(
                          () => _obscurePassword = !_obscurePassword,
                        ),
                      ),
                    ),
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'សូមបញ្ចូលពាក្យសម្ងាត់';
                      }
                      return null;
                    },
                  ),

                  // Error message from the server (if any)
                  if (_error != null) ...[
                    const SizedBox(height: 12),
                    Text(
                      _error!,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: AppColors.error),
                    ),
                  ],
                  const SizedBox(height: 24),

                  // Submit button: disabled (onPressed = null) while loading
                  FilledButton(
                    onPressed: _loading ? null : _submit,
                    child: _loading
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Text('ចូល'),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
