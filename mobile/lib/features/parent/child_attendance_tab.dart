import 'package:flutter/material.dart';

import '../../core/api_exception.dart';
import '../../core/date_format.dart';
import '../../core/error_view.dart';
import '../attendance/attendance_models.dart';
import '../attendance/status_badge.dart';
import 'parent_models.dart';
import 'parent_service.dart';

/// "វត្តមាន" tab: one month of a child's attendance.
class ChildAttendanceTab extends StatefulWidget {
  final int childId;

  const ChildAttendanceTab({super.key, required this.childId});

  @override
  State<ChildAttendanceTab> createState() => _ChildAttendanceTabState();
}

// AutomaticKeepAliveClientMixin keeps this tab's state (and data) alive
// when the user switches to the other tab and back.
class _ChildAttendanceTabState extends State<ChildAttendanceTab>
    with AutomaticKeepAliveClientMixin {
  final _service = ParentService();

  DateTime _month = monthStart(DateTime.now());
  ChildAttendance? _data;
  bool _loading = true;
  String? _error;
  int _loadId = 0;

  @override
  bool get wantKeepAlive => true;

  bool get _isCurrentMonth => _month == monthStart(DateTime.now());

  @override
  void initState() {
    super.initState();
    _load();
  }

  /// Also used by pull-to-refresh.
  Future<void> _load() async {
    final loadId = ++_loadId;
    try {
      final data = await _service.getAttendance(widget.childId, _month);
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

  /// Go [delta] months back (-1) or forward (+1).
  void _changeMonth(int delta) {
    // DateTime handles overflow: month 0 = December of the previous year.
    setState(() => _month = DateTime(_month.year, _month.month + delta));
    _reload();
  }

  @override
  Widget build(BuildContext context) {
    super.build(context); // required by AutomaticKeepAliveClientMixin
    return Column(
      children: [
        _buildMonthBar(),
        Expanded(child: _buildBody()),
      ],
    );
  }

  /// ‹ កញ្ញា 2026 ›
  Widget _buildMonthBar() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            tooltip: 'ខែមុន',
            onPressed: () => _changeMonth(-1),
          ),
          Expanded(
            child: Text(
              khmerMonthYear(_month),
              textAlign: TextAlign.center,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 16),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            tooltip: 'ខែបន្ទាប់',
            // Can't go into the future.
            onPressed: _isCurrentMonth ? null : () => _changeMonth(1),
          ),
        ],
      ),
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
          // Summary: one badge per status, same colors as AttendanceScreen.
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              for (final status in AttendanceStatus.values)
                CountBadge(
                  label: status.label,
                  count: data.summary[status] ?? 0,
                  color: status.color,
                ),
            ],
          ),
          const SizedBox(height: 16),
          if (data.records.isEmpty)
            const Padding(
              padding: EdgeInsets.all(32),
              child: Text(
                'មិនមានកំណត់ត្រាវត្តមានក្នុងខែនេះទេ',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey),
              ),
            ),
          for (final record in data.records) _buildRecord(record),
        ],
      ),
    );
  }

  Widget _buildRecord(AttendanceRecord record) {
    final note = record.note;
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 8),
      child: ListTile(
        title: Text(
          formatDate(record.date),
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(
          note == null || note.isEmpty
              ? khmerWeekday(record.date)
              : '${khmerWeekday(record.date)} · $note',
        ),
        trailing: record.status == null
            ? const Text('–')
            : StatusChip(status: record.status!),
      ),
    );
  }
}
