// Small date helpers (no `intl` package needed).

const _khmerMonths = [
  'មករា',
  'កុម្ភៈ',
  'មីនា',
  'មេសា',
  'ឧសភា',
  'មិថុនា',
  'កក្កដា',
  'សីហា',
  'កញ្ញា',
  'តុលា',
  'វិច្ឆិកា',
  'ធ្នូ',
];

// DateTime.weekday: 1 = Monday ... 7 = Sunday
const _khmerWeekdays = [
  'ចន្ទ',
  'អង្គារ',
  'ពុធ',
  'ព្រហស្បតិ៍',
  'សុក្រ',
  'សៅរ៍',
  'អាទិត្យ',
];

String _two(int n) => n.toString().padLeft(2, '0');

/// 28/09/2026
String formatDate(DateTime date) =>
    '${_two(date.day)}/${_two(date.month)}/${date.year}';

/// "កញ្ញា 2026"
String khmerMonthYear(DateTime date) =>
    '${_khmerMonths[date.month - 1]} ${date.year}';

/// "ថ្ងៃចន្ទ"
String khmerWeekday(DateTime date) => 'ថ្ងៃ${_khmerWeekdays[date.weekday - 1]}';

/// 2026-09 (format used by the API's ?month= parameter)
String apiMonth(DateTime date) => '${date.year}-${_two(date.month)}';

/// First day of the month of [date] (time removed).
DateTime monthStart(DateTime date) => DateTime(date.year, date.month);
