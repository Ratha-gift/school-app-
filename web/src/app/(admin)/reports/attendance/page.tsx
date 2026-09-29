import { EmptyRow, Table, Td } from "@/components/ui";
import { api, apiAll, ApiError } from "@/lib/api";
import { formatDate, formatNumber, statusInfo, statuses } from "@/lib/labels";
import { getParam } from "@/lib/search-params";
import type { AttendanceReport, SchoolClass } from "@/lib/types";
import { LiveFilters } from "@/components/live-filters";
import { ReportError, ReportsHeader, loadReport } from "../report-parts";

/** YYYY-MM-DD in the server's local time zone. */
function isoDate(date: Date): string {
  return date.toLocaleDateString("en-CA");
}

export default async function AttendanceReportPage(props: PageProps<"/reports/attendance">) {
  const params = await props.searchParams;
  const now = new Date();
  const classId = getParam(params, "school_class_id");
  // Default range: this month until today
  const from = getParam(params, "from") || isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
  const to = getParam(params, "to") || isoDate(now);

  const classes = await apiAll<SchoolClass>("/admin/classes");

  // Only load the report once a class is chosen
  const report = classId
    ? await loadReport(() =>
        api<AttendanceReport>("/admin/reports/attendance", { query: { school_class_id: classId, from, to } }),
      )
    : null;

  return (
    <>
      <ReportsHeader active="attendance" />

      {/* Changing any filter reloads the report right away */}
      <LiveFilters
        fields={[
          {
            type: "select",
            name: "school_class_id",
            label: "ថ្នាក់",
            emptyLabel: "— ជ្រើសថ្នាក់ —",
            options: classes.map((c) => ({ value: String(c.id), label: `${c.name} (${c.academic_year})` })),
          },
          { type: "date", name: "from", label: "ពីថ្ងៃ", defaultValue: from },
          { type: "date", name: "to", label: "ដល់ថ្ងៃ", defaultValue: to },
        ]}
      >
        {!report && <p className="text-slate-500">សូមជ្រើសថ្នាក់ ដើម្បីមើលរបាយការណ៍។</p>}
        {report instanceof ApiError && <ReportError error={report} />}

        {report && !(report instanceof ApiError) && (
          <>
            <p className="mb-3 text-sm text-slate-600">
              ថ្នាក់ {report.class.name} · {formatDate(report.from)} – {formatDate(report.to)} · បានកត់{" "}
              {report.days_recorded} ថ្ងៃ · អត្រាមករៀន (មក + យឺត):{" "}
              <strong>{formatNumber(report.summary.attendance_rate, "%")}</strong>
            </p>
            <Table
              head={[
                "កូដ",
                "ឈ្មោះ",
                ...statuses.map((s) => <span key={s} className={statusInfo[s].text}>{statusInfo[s].label}</span>),
                "សរុប",
                "អត្រាមករៀន",
              ]}
            >
              {report.students.length === 0 && <EmptyRow colSpan={8} />}
              {report.students.map((s) => (
                <tr key={s.id}>
                  <Td className="font-mono text-xs">{s.student_code}</Td>
                  <Td className="font-medium">{s.name}</Td>
                  {statuses.map((status) => (
                    <Td key={status}>{s[status]}</Td>
                  ))}
                  <Td>{s.total}</Td>
                  <Td>{formatNumber(s.attendance_rate, "%")}</Td>
                </tr>
              ))}
              {report.students.length > 0 && (
                <tr className="bg-slate-50 font-semibold">
                  <Td />
                  <Td>សរុប</Td>
                  {statuses.map((status) => (
                    <Td key={status}>{report.summary[status]}</Td>
                  ))}
                  <Td>{report.summary.total}</Td>
                  <Td>{formatNumber(report.summary.attendance_rate, "%")}</Td>
                </tr>
              )}
            </Table>
          </>
        )}
      </LiveFilters>
    </>
  );
}
