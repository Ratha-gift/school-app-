import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../core/api_exception.dart';
import '../../core/error_view.dart';
import '../../core/theme.dart';
import '../classes/school_class.dart';
import 'grade_models.dart';
import 'grade_service.dart';

/// Enter scores for one class, one subject, one term.
class GradesScreen extends StatefulWidget {
  final SchoolClass schoolClass;

  const GradesScreen({super.key, required this.schoolClass});

  @override
  State<GradesScreen> createState() => _GradesScreenState();
}

class _GradesScreenState extends State<GradesScreen> {
  final _service = GradeService();

  // Subjects (loaded once)
  List<Subject> _subjects = [];
  bool _loadingSubjects = true;
  String? _subjectsError;

  // Current selection
  Subject? _subject;
  Term _term = Term.semester1;

  // Grades for the current selection
  List<StudentGrade> _students = [];
  double _maxScore = 100;
  bool _loadingGrades = false;
  String? _gradesError;
  bool _saving = false;

  /// One text controller per student (key = student id).
  final Map<int, TextEditingController> _controllers = {};

  /// Text of each field as last loaded/saved, to detect unsaved changes.
  Map<int, String> _savedTexts = {};

  /// Ignore responses of older loads (see AttendanceScreen).
  int _loadId = 0;

  @override
  void initState() {
    super.initState();
    _loadSubjects();
  }

  @override
  void dispose() {
    _disposeControllers();
    super.dispose();
  }

  void _disposeControllers() {
    for (final controller in _controllers.values) {
      controller.dispose();
    }
    _controllers.clear();
  }

  // ---------------------------------------------------------------- helpers

  String _textOf(int studentId) => _controllers[studentId]?.text.trim() ?? '';

  bool get _hasChanges =>
      _students.any((s) => _textOf(s.id) != (_savedTexts[s.id] ?? ''));

  /// Error message for one student's field (null = OK).
  String? _errorFor(int studentId) => validateScore(
    _textOf(studentId),
    _maxScore,
    // Had a saved score -> can't be emptied (the API can't delete it).
    required: (_savedTexts[studentId] ?? '').isNotEmpty,
  );

  /// Scores that are filled in and valid (student id -> score).
  Map<int, double> get _enteredScores => {
    for (final s in _students)
      if (_textOf(s.id).isNotEmpty && _errorFor(s.id) == null)
        s.id: parseScore(_textOf(s.id))!,
  };

  bool get _canSave =>
      !_saving &&
      !_loadingGrades &&
      _gradesError == null &&
      _students.every((s) => _errorFor(s.id) == null) &&
      _enteredScores.isNotEmpty;

  // ---------------------------------------------------------------- actions

  Future<void> _loadSubjects() async {
    try {
      final subjects = await _service.getSubjects(widget.schoolClass.id);
      if (!mounted) return;
      setState(() {
        _subjects = subjects;
        _loadingSubjects = false;
        if (subjects.isNotEmpty) {
          _subject = subjects.first;
          _loadingGrades = true;
        }
      });
      if (_subject != null) _loadGrades();
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() {
        _subjectsError = e.message;
        _loadingSubjects = false;
      });
    }
  }

  void _retrySubjects() {
    setState(() {
      _loadingSubjects = true;
      _subjectsError = null;
    });
    _loadSubjects();
  }

  /// Loads grades for [_subject] + [_term]. Callers set _loadingGrades.
  Future<void> _loadGrades() async {
    final loadId = ++_loadId;
    try {
      final result = await _service.getGrades(
        widget.schoolClass.id,
        _subject!.id,
        _term,
      );
      if (!mounted || loadId != _loadId) return;
      setState(() {
        _maxScore = result.maxScore;
        _students = result.students;
        // New controllers filled with the saved scores.
        _disposeControllers();
        for (final s in _students) {
          _controllers[s.id] = TextEditingController(
            text: s.score == null ? '' : formatScore(s.score!),
          );
        }
        _rememberSavedTexts();
        _loadingGrades = false;
      });
    } on ApiException catch (e) {
      if (!mounted || loadId != _loadId) return;
      setState(() {
        _gradesError = e.message;
        _loadingGrades = false;
      });
    }
  }

  void _reloadGrades() {
    setState(() {
      _loadingGrades = true;
      _gradesError = null;
    });
    _loadGrades();
  }

  void _rememberSavedTexts() {
    _savedTexts = {for (final s in _students) s.id: _textOf(s.id)};
  }

  /// Switch subject and/or term (asks first if there are unsaved changes).
  Future<void> _changeSelection({Subject? subject, Term? term}) async {
    final newSubject = subject ?? _subject;
    final newTerm = term ?? _term;
    if (newSubject == _subject && newTerm == _term) return;
    if (_hasChanges && !await _confirmDiscard()) return;
    if (!mounted) return;
    setState(() {
      _subject = newSubject;
      _term = newTerm;
    });
    _reloadGrades();
  }

  Future<void> _save() async {
    // Unfocus so the keyboard closes.
    FocusScope.of(context).unfocus();
    setState(() => _saving = true);
    try {
      await _service.saveGrades(
        widget.schoolClass.id,
        _subject!.id,
        _term,
        _maxScore,
        _enteredScores,
      );
      if (!mounted) return;
      setState(() {
        _saving = false;
        _rememberSavedTexts();
      });
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('រក្សាទុកពិន្ទុរួចរាល់')));
    } on ApiException catch (e) {
      if (!mounted) return;
      setState(() => _saving = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message), backgroundColor: AppColors.error),
      );
    }
  }

  /// Same dialog as AttendanceScreen.
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
    return discard ?? false;
  }

  // --------------------------------------------------------------------- UI

  @override
  Widget build(BuildContext context) {
    return PopScope(
      canPop: !_hasChanges,
      onPopInvokedWithResult: (didPop, result) async {
        if (didPop) return;
        final leave = await _confirmDiscard();
        if (leave && context.mounted) Navigator.of(context).pop();
      },
      child: Scaffold(
        appBar: AppBar(title: Text('ពិន្ទុ ${widget.schoolClass.name}')),
        body: _buildBody(),
        bottomNavigationBar: _subject == null
            ? null
            : SafeArea(
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

  Widget _buildBody() {
    if (_loadingSubjects) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_subjectsError != null) {
      return Center(
        child: ErrorView(message: _subjectsError!, onRetry: _retrySubjects),
      );
    }
    if (_subjects.isEmpty) {
      return const Center(
        child: Text(
          'មិនមានមុខវិជ្ជាដែលអ្នកអាចដាក់ពិន្ទុបានទេ',
          style: TextStyle(color: Colors.grey),
        ),
      );
    }

    return Column(
      children: [
        _buildSelectors(),
        Expanded(child: _buildGrades()),
      ],
    );
  }

  /// Subject dropdown + term buttons.
  Widget _buildSelectors() {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          // InputDecorator gives the dropdown the same look as text fields.
          InputDecorator(
            decoration: const InputDecoration(
              labelText: 'មុខវិជ្ជា',
              contentPadding: EdgeInsets.symmetric(horizontal: 12),
            ),
            child: DropdownButtonHideUnderline(
              child: DropdownButton<Subject>(
                value: _subject,
                isExpanded: true,
                items: [
                  for (final subject in _subjects)
                    DropdownMenuItem(
                      value: subject,
                      child: Text(subject.displayName),
                    ),
                ],
                onChanged: _saving
                    ? null
                    : (subject) => _changeSelection(subject: subject),
              ),
            ),
          ),
          const SizedBox(height: 12),
          SegmentedButton<Term>(
            segments: [
              for (final term in Term.values)
                ButtonSegment(value: term, label: Text(term.label)),
            ],
            selected: {_term},
            showSelectedIcon: false,
            onSelectionChanged: _saving
                ? null
                : (selection) => _changeSelection(term: selection.first),
          ),
        ],
      ),
    );
  }

  Widget _buildGrades() {
    if (_loadingGrades) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_gradesError != null) {
      return Center(
        child: ErrorView(message: _gradesError!, onRetry: _reloadGrades),
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
        for (final student in _students) _buildStudentRow(student),
      ],
    );
  }

  /// "មធ្យមភាគថ្នាក់ 78.5 / 100 · បានបញ្ចូល 4/5 នាក់"
  Widget _buildSummary() {
    final scores = _enteredScores.values;
    final avg = average(scores);
    return Card(
      color: Colors.white,
      margin: EdgeInsets.zero,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const Icon(Icons.analytics_outlined, color: AppColors.primary),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    avg == null
                        ? 'មធ្យមភាគថ្នាក់ –'
                        : 'មធ្យមភាគថ្នាក់ ${formatScore(_round2(avg))} / ${formatScore(_maxScore)}',
                    style: const TextStyle(fontWeight: FontWeight.w600),
                  ),
                  Text(
                    'បានបញ្ចូល ${scores.length}/${_students.length} នាក់',
                    style: const TextStyle(color: Colors.grey, fontSize: 12),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStudentRow(StudentGrade student) {
    return Card(
      color: Colors.white,
      margin: const EdgeInsets.only(top: 8),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Expanded(
              child: Padding(
                padding: const EdgeInsets.only(top: 4),
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
                  ],
                ),
              ),
            ),
            const SizedBox(width: 12),
            SizedBox(
              width: 130,
              child: TextField(
                controller: _controllers[student.id],
                enabled: !_saving,
                keyboardType: const TextInputType.numberWithOptions(
                  decimal: true,
                ),
                // Only digits, "." and "," can be typed.
                inputFormatters: [
                  FilteringTextInputFormatter.allow(RegExp(r'[0-9.,]')),
                ],
                textInputAction: TextInputAction.next,
                textAlign: TextAlign.end,
                decoration: InputDecoration(
                  isDense: true,
                  suffixText: '/ ${formatScore(_maxScore)}',
                  errorText: _errorFor(student.id),
                  errorMaxLines: 2,
                ),
                // Rebuild so the error, average and save button update.
                onChanged: (_) => setState(() {}),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

double _round2(double value) => (value * 100).round() / 100;
