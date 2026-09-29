// TypeScript shapes of the JSON returned by the Laravel admin API
// (see api/app/Http/Resources and api/app/Http/Controllers/Api/Admin).

export type Role = "admin" | "teacher" | "parent" | "student";
export type Gender = "male" | "female";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";
export type Term = "semester_1" | "semester_2";

/** A small {id, name} reference, e.g. a class's homeroom teacher. */
export type Ref = { id: number; name: string };

export type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  created_at: string;
  updated_at: string;
};

export type Subject = {
  id: number;
  name: string;
  name_km: string | null;
  code: string;
  classes_count?: number;
  grades_count?: number;
  /** Only in /admin/classes/{id}/subjects */
  teacher?: Ref | null;
};

export type SchoolClass = {
  id: number;
  name: string;
  grade_level: number;
  academic_year: string;
  homeroom_teacher?: Ref | null;
  students_count?: number;
};

export type Guardian = {
  id: number;
  name: string;
  email: string;
  relationship: string | null;
};

export type Student = {
  id: number;
  student_code: string;
  first_name: string;
  last_name: string;
  name: string;
  gender: Gender;
  date_of_birth: string | null;
  class?: Ref | null;
  guardians?: Guardian[];
};

/** Laravel paginated resource collection. */
export type Paginated<T> = {
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
  };
};

/** A single resource is wrapped in {"data": ...}. */
export type Wrapped<T> = { data: T };

export type Dashboard = {
  counts: { students: number; teachers: number; parents: number; classes: number };
  today: { date: string; summary: Record<AttendanceStatus, number>; total: number };
  classes_without_attendance_today: {
    id: number;
    name: string;
    students_count: number;
    homeroom_teacher: Ref | null;
  }[];
};

export type AttendanceReport = {
  class: Ref;
  from: string;
  to: string;
  days_recorded: number;
  summary: Record<AttendanceStatus, number> & { total: number; attendance_rate: number | null };
  students: ({
    id: number;
    student_code: string;
    name: string;
    total: number;
    attendance_rate: number | null;
  } & Record<AttendanceStatus, number>)[];
};

export type GradeCell = {
  subject_id: number;
  score: number | null;
  max_score: number | null;
  percentage: number | null;
};

export type GradeReport = {
  class: Ref;
  term: Term;
  subjects: { id: number; name: string; name_km: string | null; code: string }[];
  students: {
    id: number;
    student_code: string;
    name: string;
    grades: GradeCell[];
    average_percentage: number | null;
  }[];
  subject_averages: { subject_id: number; graded_count: number; average_percentage: number | null }[];
  class_average_percentage: number | null;
};
