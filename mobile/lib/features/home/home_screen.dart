import 'package:flutter/material.dart';

import '../auth/auth_service.dart';
import '../auth/login_screen.dart';
import '../auth/user.dart';
import '../classes/class_list_view.dart';
import '../parent/children_list_view.dart';

/// Home: greeting + content that depends on the user's role.
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
      body: _buildBody(context),
    );
  }

  Widget _buildBody(BuildContext context) {
    final header = _buildGreeting(context);

    switch (user.role) {
      case 'teacher':
      case 'admin':
        return ClassListView(header: header);
      case 'parent':
        return ChildrenListView(header: header);
      default: // student (for now)
        return ListView(
          padding: const EdgeInsets.all(16),
          children: [
            header,
            const SizedBox(height: 48),
            const Text(
              'មុខងារនេះនឹងមកដល់ឆាប់ៗ',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 16),
            ),
          ],
        );
    }
  }

  Widget _buildGreeting(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Text(
            'សួស្ដី ${user.name}! ',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
        ),
        Chip(label: Text(user.role)),
      ],
    );
  }
}
