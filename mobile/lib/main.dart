import 'package:flutter/material.dart';

import 'core/api_client.dart';
import 'core/theme.dart';
import 'features/auth/auth_service.dart';
import 'features/auth/login_screen.dart';
import 'features/auth/user.dart';
import 'features/home/home_screen.dart';

/// Lets us navigate from outside the widget tree (e.g. from ApiClient),
/// where there is no BuildContext.
final navigatorKey = GlobalKey<NavigatorState>();

void main() {
  // When any request returns 401, ApiClient deletes the token and calls
  // this: go to LoginScreen and clear the whole navigation stack.
  ApiClient.instance.onUnauthorized = () {
    navigatorKey.currentState?.pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  };

  runApp(const SchoolApp());
}

class SchoolApp extends StatelessWidget {
  const SchoolApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'School App',
      navigatorKey: navigatorKey,
      debugShowCheckedModeBanner: false,
      theme: buildAppTheme(),
      home: const StartupScreen(),
    );
  }
}

/// First screen: checks the saved token, then shows Home or Login.
class StartupScreen extends StatefulWidget {
  const StartupScreen({super.key});

  @override
  State<StartupScreen> createState() => _StartupScreenState();
}

class _StartupScreenState extends State<StartupScreen> {
  // Created once when the State is created. If we called currentUser()
  // inside build(), every rebuild would send a new /me request.
  late final Future<User?> _userFuture = AuthService().currentUser();

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<User?>(
      future: _userFuture,
      builder: (context, snapshot) {
        // Still waiting for /me -> show a spinner.
        if (snapshot.connectionState != ConnectionState.done) {
          return const Scaffold(
            body: Center(child: CircularProgressIndicator()),
          );
        }
        final user = snapshot.data;
        return user != null ? HomeScreen(user: user) : const LoginScreen();
      },
    );
  }
}
