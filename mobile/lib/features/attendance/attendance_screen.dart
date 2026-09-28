import 'package:flutter/material.dart';

import '../../core/api_exception.dart';
import '../../core/error_view.dart';
import '../../core/theme.dart';
import '../classes/school_class.dart';
import 'attendance_models.dart';
import 'attendance_service.dart';

/// Take attendance for one class on one day.
class AttendanceScreen extends StatefulWidget {
  final SchoolClass schoolClass;

  const AttendanceScreen({super.key, required this.schoolClass});

  @override
  State<AttendanceScreen> createState() => _AttendanceScreenState();
}

class _AttendanceScreenState extends State<AttendanceScreen> {
  final _service = AttendanceService();

  DateTime _date = _today();
  List<AttendanceStudent> _students = [];

  /// Status of each student (by id) as last loaded from / saved to the
  /// server. Comparing against it tells us if there are unsaved changes.
  Map<int, AttendanceStatus?> _savedStatuses = {};

  bool _loading = true; // true on start: we load right away
  bool _saving = false;
  String? _loadError;

  /// Increases on every load. If the user changes the date twice quickly,
  /// only the newest response is used; older ones are ignored.
  int _loadId = 0;

  /// Today with the time removed (00:00).
  static DateTime _today() => DateUtils.dateOnly(DateTime.now());

  bool get _hasChanges =>
      _students.any((student) => student.status != _savedStatuses[student.id]);

  bool get _canSave =>
      !_loading &&
      !_saving &&
      _loadError == null &&
      _students.isNotEmpty &&
      _students.every((student) => student.status != null);

  @override
  void initState() {
    super.initState();
    _load();
  }

  // ---------------------------------------------------------------- actions

  /// Loads attendance for [_date]. Callers set `_loading = true` first.
  Future<void> _load() async {
    final loadId = ++_loadId;
    try {
      final students = await _service.getAttendance(
        widget.schoolClass.id,
        _date,
      );
      // Ignore if the screen is closed or a newer load was started.
      if (!mounted || loadId != _loadId) return;
      setState(() {
        _students = students;
        _rememberSavedStatuses();
        _loading = false;
      });
    } on ApiException catch (e) {
      if (!mounted || loadId != _loadId) return;
      setState(() {
        _loadError = e.message;
        _loading = false;
      });
    }
  }

  void _reload() {
    setState(() {
      _loading = true;
      _loadError = null;
    });
    _load();
  }

  void _rememberSavedStatuses() {
    _savedStatuses = {
      for (final student in _students) student.id: student.status,
    };
  }

  /// Switches to another day (asks first if there are unsaved changes).
  Future<void> _changeDate(DateTime newDate) async {
    if (DateUtils.isSameDay(newDate, _date)) return;
    if (_hasChanges && !await _confirmDiscard()) return;
    if (!mounted) return;
    setState(() => _date = newDate);
    _reload();
  }

  Future<void> _pickDate() async {
    final picked = await showDatePicker(
      context: context,
      initialDate: _date,
      firstDate: DateTime(2020),
      lastDate: _today(), // no future dates
    );
    if (picked == null || !mounted) return;
    await _changeDate(picked);
  }

  void _markAllPresent() {
    setState(() {
      for (final student in _students) {
        student.status = AttendanceStatus.present;
      }
    });
  }

  Future<void> _save() async {
    setState(() => _saving = true);
    try {
      await _service.saveAttendance(widget.schoolClass.id, _date, _students);
      if (!mounted) return;
      setState(() {
        _saving = false;
        _rememberSavedStatuses(); // nothing is "unsaved" anymore
      });
      ScaffoldMessenger.of(
        context,
      ).showSnackBar(const SnackBar(content: Text('រក្សាទុកវត្តមានរួចរាល់')));
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message), backgroundColor: AppColors.error),
      );
    }
  }

  /// Asks "discard unsaved changes?". Returns true if the user agrees.
  Future<bool> _confirmDiscard() async {
    final discard = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('មិនទាន់រក្សាទុក'),
        content: const Text(
          'អ្នកមានការផ្លាស់ប្ដូរដែលមិនទាន់រក្សាទុក។ តើអ្នកចង់បោះបង់វាទេ?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('បន្តកែ'),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: TextButton.styleFrom(foregroundColor: AppColors.error),
            child: const Text('បោះបង់'),
          ),
        ],
      ),
    );
    return discard ?? false; // tapping outside the dialog = keep editing
  }

  // --------------------------------------------------------------------- UI

  @override
  Widget build(BuildContext context) {
    // PopScope blocks the back button/gesture while there are unsaved
    // changes, and lets us ask the user first.
    return PopScope(
      canPop: !_hasChanges,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return; // already closed (no unsaved changes)
        final leave = await _confirmDiscard();
        if (leave && context.mounted) Navigator.of(context).pop();
      },
      child: Scaffold(
        appBar: AppBar(title: Text('វត្តមាន ${widget.schoolClass.name}')),
        body: Column(
          children: [
            _buildDateBar(),
            Expanded(child: _buildBody()),
          ],
        ),
        bottomNavigationBar: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: FilledButton(
              onPressed: _canSave ? _save : null,
              child: _saving
                  ? const SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Text('រក្សាទុក'),
            ),
          ),
        ),
      ),
    );
  }

  /// Row with ‹ previous day | date (opens picker) | next day ›.
  Widget _buildDateBar() {
    final isToday = DateUtils.isSameDay(_date, _today());
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      child: Row(
        children: [
          IconButton(
            icon: const Icon(Icons.chevron_left),
            tooltip: 'ថ្ងៃមុន',
            onPressed: _saving
                ? null
                : () => _changeDate(_date.subtract(const Duration(days: 1))),
          ),
          Expanded(
            child: TextButton.icon(
              onPressed: _saving ? null : _pickDate,
              icon: const Icon(Icons.calendar_today, size: 18),
              label: Text(_formatDate(_date)),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.chevron_right),
            tooltip: 'ថ្ងៃបន្ទាប់',
            // Can't go past today.
            onPressed: _saving || isToday
                ? null
                : () => _changeDate(_date.add(const Duration(days: 1))),
          ),
        ],
      ),
    );
  }

  Widget _buildBody() {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_loadError != null) {
      return Center(
        child: ErrorView(message: _loadError!, onRetry: _reload),
      );
    }
    if (_students.isEmpty) {
      return const Center(
        child: Text(
          'មិនមានសិស្សក្នុងថ្នាក់នេះទេ',
          style: TextStyle(color: Colors.grey),
        ),
      );
    }

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _buildSummary(),
        const SizedBox(height: 12),
        OutlinedButton.icon(
          onPressed: _saving ? null : _markAllPresent,
          icon: const Icon(Icons.done_all),
          label: const Text('សម្គាល់ថាមកទាំងអស់'),
        ),
        const SizedBox(height: 12),
        for (final student in _students) _buildStudentCard(student),
      ],
    );
  }

  /// Counts per status, e.g. "មក 3  អវត្តមាន 1 ...".
  Widget _buildSummary() {
    final notMarked = _students.where((s) => s.status == null).length;
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        for (final status in AttendanceStatus.values)
          _summaryBadge(
            status.label,
            _students.where((s) => s.status == status).length,
            status.color,
          ),
        if (notMarked > 0) _summaryBadge('មិនទាន់កត់', notMarked, Colors.grey),
      ],
    );
  }

  Widget _summaryBadge(String label, int count, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        border: Border.all(color: color),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        '$label $count',
        style: TextStyle(color: color, fontWeight: FontWeight.w600),
      ),
    );
  }

  Widget _buildStudentCard(AttendanceStudent student) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(bottom: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              student.name,
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            Text(
              student.studentCode,
              style: const TextStyle(color: Colors.grey, fontSize: 12),
            ),
            const SizedBox(height: 8),
            // One colored chip per status; the selected one is filled.
            Wrap(
              spacing: 8,
              runSpacing: 4,
              children: [
                for (final status in AttendanceStatus.values)
                  _statusChip(student, status),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _statusChip(AttendanceStudent student, AttendanceStatus status) {
    final selected = student.status == status;
    return ChoiceChip(
      label: Text(status.label),
      selected: selected,
      showCheckmark: false,
      selectedColor: status.color,
      side: BorderSide(color: status.color),
      labelStyle: TextStyle(
        color: selected ? Colors.white : status.color,
        fontWeight: FontWeight.w600,
      ),
      onSelected: _saving
          ? null
          : (_) => setState(() => student.status = status),
    );
  }
}

/// Formats a date as dd/MM/yyyy for display.
String _formatDate(DateTime date) {
  final day = date.day.toString().padLeft(2, '0');
  final month = date.month.toString().padLeft(2, '0');
  return '$day/$month/${date.year}';
}
