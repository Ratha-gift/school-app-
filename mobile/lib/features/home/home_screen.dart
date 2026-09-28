import 'package:flutter/material.dart';

import '../../core/api_exception.dart';
import '../../core/error_view.dart';
import '../../core/theme.dart';
import '../attendance/attendance_screen.dart';
import '../auth/auth_service.dart';
import '../auth/login_screen.dart';
import '../auth/user.dart';
import '../classes/class_service.dart';
import '../classes/school_class.dart';

class HomeScreen extends StatefulWidget {
  final User user;

  const HomeScreen({super.key, required this.user});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _classService = ClassService();

  List<SchoolClass> _classes = [];
  bool _loading = false;
  String? _error;

  /// Only teachers and admins can see classes (for now).
  bool get _canSeeClasses =>
      widget.user.role == 'teacher' || widget.user.role == 'admin';

  @override
  void initState() {
    super.initState();
    if (_canSeeClasses) {
      // Can't call setState() in initState, so set the flag directly.
      _loading = true;
      _loadClasses();
    }
  }

  /// Loads the classes. Used on start, by the retry button and by
  /// pull-to-refresh (RefreshIndicator waits for this Future).
  Future<void> _loadClasses() async {
    try {
      final classes = await _classService.getClasses();
      if (!mounted) return;
      setState(() {
        _classes = classes;
        _error = null;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  void _retry() {
    setState(() {
      _loading = true;
      _error = null;
    });
    _loadClasses();
  }

  Future<void> _logout() async {
    // logout() never throws: it always deletes the local token.
    await AuthService().logout();
    if (!mounted) return;
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
            onPressed: _logout,
          ),
        ],
      ),
      body: _canSeeClasses
          ? RefreshIndicator(
              onRefresh: _loadClasses,
              // ListView (not Column) so pull-to-refresh works even when
              // the content is short.
              child: ListView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                children: [
                  _buildGreeting(),
                  const SizedBox(height: 24),
                  Text(
                    'ថ្នាក់របស់ខ្ញុំ',
                    style: Theme.of(context).textTheme.titleLarge
                        ?.copyWith(fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 12),
                  ..._buildClassList(),
                ],
              ),
            )
          : ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _buildGreeting(),
                const SizedBox(height: 48),
                const Text(
                  'មុខងារនេះនឹងមកដល់ឆាប់ៗ',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey, fontSize: 16),
                ),
              ],
            ),
    );
  }

  Widget _buildGreeting() {
    return Row(
      children: [
        Expanded(
          child: Text(
            'សួស្ដី ${widget.user.name}! ',
            style: Theme.of(context).textTheme.headlineSmall,
          ),
        ),
        Chip(label: Text(widget.user.role)),
      ],
    );
  }

  /// Returns the widgets for the class section: spinner, error, empty
  /// message, or one card per class.
  List<Widget> _buildClassList() {
    if (_loading) {
      return const [
        Padding(
          padding: EdgeInsets.all(32),
          child: Center(child: CircularProgressIndicator()),
        ),
      ];
    }
    if (_error != null) {
      return [ErrorView(message: _error!, onRetry: _retry)];
    }
    if (_classes.isEmpty) {
      return const [
        Padding(
          padding: EdgeInsets.all(32),
          child: Text(
            'មិនមានថ្នាក់នៅឡើយទេ',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey),
          ),
        ),
      ];
    }
    return [for (final schoolClass in _classes) _buildClassCard(schoolClass)];
  }

  Widget _buildClassCard(SchoolClass schoolClass) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: const CircleAvatar(
          backgroundColor: AppColors.primary,
          foregroundColor: Colors.white,
          child: Icon(Icons.class_outlined),
        ),
        title: Text(
          schoolClass.name,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          'សិស្ស ${schoolClass.studentsCount} នាក់ • ${schoolClass.academicYear}',
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(
            builder: (_) => AttendanceScreen(schoolClass: schoolClass),
          ),
        ),
      ),
    );
  }
}
