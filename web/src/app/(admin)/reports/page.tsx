import { redirect } from "next/navigation";

// /reports has no content of its own: open the attendance report.
export default function ReportsPage() {
  redirect("/reports/attendance");
}
