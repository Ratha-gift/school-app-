import 'package:flutter/material.dart';

import '../auth/auth_service.dart';
import '../auth/login_screen.dart';
import '../auth/user.dart';

class HomeScreen extends StatelessWidget {
  final User user;

  const HomeScreen({super.key, required this.user});

  Future<void> _logout(BuildContext context) async {
    // logout() never throws: it always deletes the local token.
    await AuthService().logout();
    if (!context.mounted) return;
    // Go to login and remove every previous screen from the stack.
    Navigator.of(context).pushAndRemoveUntil(
      MaterialPageRoute(builder: (_) => const LoginScreen()),
      (route) => false,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('ទំព័រដើម'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'ចាកចេញ',
            onPressed: () => _logout(context),
          ),
        ],
      ),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'សួស្ដី ${user.name}! 👋',
              style: Theme.of(context).textTheme.headlineSmall,
            ),
            const SizedBox(height: 12),
            Chip(label: Text(user.role)),
          ],
        ),
      ),
    );
  }
}
