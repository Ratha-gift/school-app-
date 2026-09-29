// Khmer labels (and colors) used across the admin pages.

import type { AttendanceStatus, Gender, Role, Term } from "./types";

export const roleLabels: Record<Role, string> = {
  admin: "អ្នកគ្រប់គ្រង",
  teacher: "គ្រូ",
  parent: "ឪពុកម្ដាយ",
  student: "សិស្ស",
};

export const genderLabels: Record<Gender, string> = {
  male: "ប្រុស",
  female: "ស្រី",
};

export const termLabels: Record<Term, string> = {
  semester_1: "ឆមាសទី ១",
  semester_2: "ឆមាសទី ២",
};

export const relationshipLabels: Record<string, string> = {
  father: "ឪពុក",
  mother: "ម្ដាយ",
  guardian: "អាណាព្យាបាល",
  parent: "ឪពុកម្ដាយ",
};

/** Same labels and colors as the mobile app (green / red / orange / blue). */
export const statusInfo: Record<
  AttendanceStatus,
  { label: string; text: string; bg: string; border: string }
> = {
  present: { label: "មក", text: "text-green-600", bg: "bg-green-600", border: "border-green-600" },
  absent: { label: "អវត្តមាន", text: "text-red-600", bg: "bg-red-600", border: "border-red-600" },
  late: { label: "យឺត", text: "text-orange-600", bg: "bg-orange-600", border: "border-orange-600" },
  excused: { label: "ច្បាប់", text: "text-blue-600", bg: "bg-blue-600", border: "border-blue-600" },
};

export const statuses = Object.keys(statusInfo) as AttendanceStatus[];

/** 85.5 -> "85.5", 90 -> "90", null -> "–" */
export function formatNumber(value: number | null | undefined, suffix = ""): string {
  if (value === null || value === undefined) return "–";
  return `${Number(value.toFixed(2))}${suffix}`;
}

/** "2026-09-28" -> "28/09/2026" */
export function formatDate(value: string | null | undefined): string {
  if (!value) return "–";
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${day}/${month}/${year}`;
}
