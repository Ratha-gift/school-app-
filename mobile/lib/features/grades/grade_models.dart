/// The two terms of the school year.
enum Term {
  semester1('semester_1', 'ឆមាសទី ១'),
  semester2('semester_2', 'ឆមាសទី ២');

  const Term(this.apiValue, this.label);

  /// Value the API uses, e.g. "semester_1".
  final String apiValue;

  /// Khmer label shown in the UI.
  final String label;
}

/// A school subject, e.g. Mathematics / គណិតវិទ្យា.
class Subject {
  final int id;
  final String name;
  final String? nameKm;
  final String? code;

  const Subject({required this.id, required this.name, this.nameKm, this.code});

  /// Khmer name if there is one, otherwise the English name.
  String get displayName =>
      (nameKm == null || nameKm!.isEmpty) ? name : nameKm!;

  factory Subject.fromJson(Map<String, dynamic> json) {
    return Subject(
      id: json['id'] as int,
      name: json['name'] as String,
      nameKm: json['name_km'] as String?,
      code: json['code'] as String?,
    );
  }
}

/// One student row on the teacher's grades screen.
class StudentGrade {
  final int id;
  final String studentCode;
  final String name;
  final double? score; // null = not graded yet

  const StudentGrade({
    required this.id,
    required this.studentCode,
    required this.name,
    required this.score,
  });

  factory StudentGrade.fromJson(Map<String, dynamic> json) {
    return StudentGrade(
      id: json['id'] as int,
      studentCode: json['student_code'] as String,
      name: json['name'] as String,
      // JSON numbers can arrive as int (90) or double (90.5).
      score: (json['score'] as num?)?.toDouble(),
    );
  }
}

/// Response of GET /teacher/classes/{id}/grades.
class ClassGrades {
  final double maxScore;
  final List<StudentGrade> students;

  const ClassGrades({required this.maxScore, required this.students});

  factory ClassGrades.fromJson(Map<String, dynamic> json) {
    return ClassGrades(
      maxScore: (json['max_score'] as num).toDouble(),
      students: (json['students'] as List)
          .map((s) => StudentGrade.fromJson(s as Map<String, dynamic>))
          .toList(),
    );
  }
}

// ------------------------------------------------------------ pure helpers

/// 90.0 -> "90", 85.5 -> "85.5", 72.25 -> "72.25"
String formatScore(double score) {
  if (score == score.roundToDouble()) return score.toInt().toString();
  // Up to 2 decimals, without trailing zeros (85.50 -> 85.5).
  return score
      .toStringAsFixed(2)
      .replaceFirst(RegExp(r'0+$'), '')
      .replaceFirst(RegExp(r'\.$'), '');
}

/// Parses what the user typed. Accepts "85.5" and "85,5". Returns null if
/// the text is empty or not a number.
double? parseScore(String text) {
  return double.tryParse(text.trim().replaceAll(',', '.'));
}

/// Returns an error message for a score field, or null if it's OK.
///
/// Empty is OK (student not graded yet) unless [required] is true: that's
/// used when the student already has a saved score, because the API can't
/// delete a score — clearing the field would silently do nothing.
String? validateScore(String text, double maxScore, {bool required = false}) {
  if (text.trim().isEmpty) {
    return required ? 'សូមបញ្ចូលពិន្ទុ' : null;
  }
  final score = parseScore(text);
  if (score == null) return 'សូមបញ្ចូលលេខ';
  if (score < 0 || score > maxScore) {
    return 'ចន្លោះ 0–${formatScore(maxScore)}';
  }
  return null;
}

/// Average of [values], or null if there are none.
double? average(Iterable<double> values) {
  if (values.isEmpty) return null;
  return values.reduce((a, b) => a + b) / values.length;
}
