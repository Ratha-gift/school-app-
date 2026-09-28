import 'package:flutter/material.dart';

import '../../core/api_exception.dart';
import '../../core/error_view.dart';
import 'child_detail_screen.dart';
import 'parent_models.dart';
import 'parent_service.dart';

/// Home content for parents: "កូនរបស់ខ្ញុំ" + child cards.
class ChildrenListView extends StatefulWidget {
  /// Shown at the top of the list (the greeting).
  final Widget header;

  const ChildrenListView({super.key, required this.header});

  @override
  State<ChildrenListView> createState() => _ChildrenListViewState();
}

class _ChildrenListViewState extends State<ChildrenListView> {
  final _service = ParentService();

  List<Child> _children = [];
  bool _loading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadChildren();
  }

  Future<void> _loadChildren() async {
    try {
      final children = await _service.getChildren();
      if (!mounted) return;
      setState(() {
        _children = children;
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
    _loadChildren();
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _loadChildren,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          widget.header,
          const SizedBox(height: 24),
          Text(
            'កូនរបស់ខ្ញុំ',
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
    if (_children.isEmpty) {
      return const [
        Padding(
          padding: EdgeInsets.all(32),
          child: Text(
            'មិនទាន់មានកូនភ្ជាប់ជាមួយគណនីនេះទេ',
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey),
          ),
        ),
      ];
    }
    return [for (final child in _children) _buildChildCard(child)];
  }

  Widget _buildChildCard(Child child) {
    final isFemale = child.gender == 'female';
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 12),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        // Avatar color/icon by gender.
        leading: CircleAvatar(
          backgroundColor: isFemale
              ? const Color(0xFFFCE7F3)
              : const Color(0xFFDBEAFE),
          foregroundColor: isFemale
              ? const Color(0xFFDB2777)
              : const Color(0xFF2563EB),
          child: Icon(isFemale ? Icons.face_3 : Icons.face),
        ),
        title: Text(
          child.name,
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          '${child.className == null ? 'មិនទាន់មានថ្នាក់' : 'ថ្នាក់ ${child.className}'}'
          ' • ${child.studentCode}',
        ),
        trailing: const Icon(Icons.chevron_right),
        onTap: () => Navigator.of(context).push(
          MaterialPageRoute(builder: (_) => ChildDetailScreen(child: child)),
        ),
      ),
    );
  }
}
