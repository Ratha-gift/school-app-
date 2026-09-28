import 'package:flutter/material.dart';

import '../../core/api_exception.dart';
import '../../core/error_view.dart';
import '../../core/theme.dart';
import '../attendance/attendance_screen.dart';
import '../grades/grades_screen.dart';
import 'class_service.dart';
import 'school_class.dart';

/// Home content for teachers/admins: "ថ្នាក់របស់ខ្ញុំ" + class cards.
class ClassListView extends StatefulWidget {
  /// Shown at the top of the list (the greeting), so it scrolls with it.
  final Widget header;

  const ClassListView({super.key, required this.header});

  @override
  State<ClassListView> createState() => _ClassListViewState();
}

class _ClassListViewState extends State<ClassListView> {
  final _classService = ClassService();

  List<SchoolClass> _classes = [];
  bool _loading = true; // we load right away
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadClasses();
  }

  /// Used on start, by retry and by pull-to-refresh.
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

  /// Bottom sheet: attendance or grades for this class.
  Future<void> _openClassMenu(SchoolClass schoolClass) async {
    // The sheet returns the screen to open (or null if dismissed).
    final screen = await showModalBottomSheet<Widget>(
      context: context,
      showDragHandle: true,
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text(
                'ថ្នាក់ ${schoolClass.name}',
                style: Theme.of(sheetContext).textTheme.titleMedium,
              ),
            ),
            ListTile(
              leading: const Icon(
                Icons.fact_check_outlined,
                color: AppColors.primary,
              ),
              title: const Text('វត្តមាន'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () =>
                  Navigator.of(sheetContext)
                      .pop(AttendanceScreen(schoolClass: schoolClass)),
            ),
            ListTile(
              leading: const Icon(
                Icons.grade_outlined,
                color: AppColors.primary,
              ),
              title: const Text('ពិន្ទុ'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () =>
                  Navigator.of(sheetContext)
                      .pop(GradesScreen(schoolClass: schoolClass)),
            ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
    if (screen == null || !mounted) return;
    Navigator.of(context).push(MaterialPageRoute(builder: (_) => screen));
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _loadClasses,
      // ListView (not Column) so pull-to-refresh works even when short.
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          widget.header,
          const SizedBox(height: 24),
          Text(
            'ថ្នាក់របស់ខ្ញុំ',
            style: Theme.of(context).textTheme.titleLarge
                ?.copyWith(fontWeight: FontWeight.w600),
          ),
          const SizedBox(height: 12),
          ..._buildContent(),
        ],
      ),
    );
  }

  List<Widget> _buildContent() {
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
        onTap: () => _openClassMenu(schoolClass),
      ),
    );
  }
}
