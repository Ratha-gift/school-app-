import 'package:flutter/material.dart';

import '../../core/api_exception.dart';
import '../../core/error_view.dart';
import '../../core/theme.dart';
import '../grades/grade_models.dart';
import 'parent_models.dart';
import 'parent_service.dart';

/// "ពិន្ទុ" tab: a child's grades for one term.
class ChildGradesTab extends StatefulWidget {
  final int childId;

  const ChildGradesTab({super.key, required this.childId});

  @override
  State<ChildGradesTab> createState() => _ChildGradesTabState();
}

class _ChildGradesTabState extends State<ChildGradesTab>
    with AutomaticKeepAliveClientMixin {
  final _service = ParentService();

  Term _term = Term.semester1;
  ChildGrades? _data;
  bool _loading = true;
  String? _error;
  int _loadId = 0;

  @override
  bool get wantKeepAlive => true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final loadId = ++_loadId;
    try {
      final data = await _service.getGrades(widget.childId, _term);
      if (!mounted || loadId != _loadId) return;
      setState(() {
        _data = data;
        _error = null;
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted || loadId != _loadId) return;
      setState(() {
        _error = e.message;
        _loading = false;
      });
    }
  }

  void _reload() {
    setState(() {
      _loading = true;
      _error = null;
    });
    _load();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context);
    return Column(
      children: [
        Container(
          width: double.infinity,
          color: Colors.white,
          padding: const EdgeInsets.all(12),
          child: SegmentedButton<Term>(
            segments: [
              for (final term in Term.values)
                ButtonSegment(value: term, label: Text(term.label)),
            ],
            selected: {_term},
            showSelectedIcon: false,
            onSelectionChanged: (selection) {
              _term = selection.first;
              _reload();
            },
          ),
        ),
        Expanded(child: _buildBody()),
      ],
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_error != null) {
      return Center(
        child: ErrorView(message: _error!, onRetry: _reload),
      );
    }

    final data = _data!;
    return RefreshIndicator(
      onRefresh: _load,
      child: ListView(
        physics: const AlwaysScrollableScrollPhysics(),
        padding: const EdgeInsets.all(16),
        children: [
          if (data.grades.isEmpty)
            const Padding(
              padding: EdgeInsets.all(32),
              child: Text(
                'មិនទាន់មានពិន្ទុសម្រាប់ឆមាសនេះទេ',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
            )
          else ...[
            _buildAverage(data.averagePercentage),
            const SizedBox(height: 12),
            for (final grade in data.grades) _buildGrade(grade),
          ],
        ],
      ),
    );
  }

  Widget _buildAverage(double? average) {
    return Card(
      color: AppColors.primary,
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const Icon(Icons.emoji_events_outlined, color: Colors.white),
            const SizedBox(width: 12),
            const Expanded(
              child: Text(
                'មធ្យមភាគ',
                style: TextStyle(color: Colors.white, fontSize: 16),
              ),
            ),
            Text(
              average == null ? '–' : '${formatScore(average)}%',
              style: const TextStyle(
                color: Colors.white,
                fontSize: 22,
                fontWeight: FontWeight.bold,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildGrade(SubjectGrade grade) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    grade.subject.displayName,
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                ),
                Text(
                  '${formatScore(grade.score)} / ${formatScore(grade.maxScore)}',
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
              ],
            ),
            const SizedBox(height: 8),
            // value is 0.0 .. 1.0
            LinearProgressIndicator(
              value: (grade.percentage / 100).clamp(0.0, 1.0),
              minHeight: 8,
              borderRadius: BorderRadius.circular(4),
              backgroundColor: Colors.grey.shade200,
            ),
            const SizedBox(height: 4),
            Text(
              '${formatScore(grade.percentage)}%',
              style: const TextStyle(color: Colors.grey, fontSize: 12),
            ),
          ],
        ),
      ),
    );
  }
}
