/// A class (e.g. "7A") as returned by GET /teacher/classes.
///
/// Named SchoolClass because `Class` would be confusing next to Dart's
/// `class` keyword.
class SchoolClass {
  final int id;
  final String name;
  final int gradeLevel;
  final String academicYear;
  final int? homeroomTeacherId; // may be null if no homeroom teacher
  final int studentsCount;

  const SchoolClass({
    required this.id,
    required this.name,
    required this.gradeLevel,
    required this.academicYear,
    required this.homeroomTeacherId,
    required this.studentsCount,
  });

  factory SchoolClass.fromJson(Map<String, dynamic> json) {
    return SchoolClass(
      id: json['id'] as int,
      name: json['name'] as String,
      gradeLevel: json['grade_level'] as int,
      academicYear: json['academic_year'] as String,
      homeroomTeacherId: json['homeroom_teacher_id'] as int?,
      studentsCount: json['students_count'] as int? ?? 0,
    );
  }
}
