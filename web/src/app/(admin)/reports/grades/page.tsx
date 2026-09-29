import { EmptyRow, Table, Td } from "@/components/ui";
import { api, apiAll, ApiError } from "@/lib/api";
import { formatNumber, termLabels } from "@/lib/labels";
import { getParam } from "@/lib/search-params";
import type { GradeReport, SchoolClass, Term } from "@/lib/types";
import { LiveFilters } from "@/components/live-filters";
import { ReportError, ReportsHeader, loadReport } from "../report-parts";

export default async function GradesReportPage(props: PageProps<"/reports/grades">) {
  const params = await props.searchParams;
  const classId = getParam(params, "school_class_id");
  const term = getParam(params, "term") || "semester_1";

  const classes = await apiAll<SchoolClass>("/admin/classes");

  const report = classId
    ? await loadReport(() =>
        api<GradeReport>("/admin/reports/grades", { query: { school_class_id: classId, term } }),
      )
    : null;

  return (
    <>
      <ReportsHeader active="grades" />

      <LiveFilters
        fields={[
          {
            type: "select",
            name: "school_class_id",
            label: "ថ្នាក់",
            emptyLabel: "— ជ្រើសថ្នាក់ —",
            options: classes.map((c) => ({ value: String(c.id), label: `${c.name} (${c.academic_year})` })),
          },
          {
            type: "select",
            name: "term",
            label: "ឆមាស",
            defaultValue: "semester_1",
            options: (Object.keys(termLabels) as Term[]).map((t) => ({ value: t, label: termLabels[t] })),
          },
        ]}
      >
        {!report && <p className="text-slate-500">សូមជ្រើសថ្នាក់ ដើម្បីមើលរបាយការណ៍។</p>}
        {report instanceof ApiError && <ReportError error={report} />}

        {report && !(report instanceof ApiError) && (
          <>
            <p className="mb-3 text-sm text-slate-600">
              ថ្នាក់ {report.class.name} · {termLabels[report.term]} · មធ្យមភាគថ្នាក់:{" "}
              <strong>{formatNumber(report.class_average_percentage, "%")}</strong>
            </p>
            <Table head={["ឈ្មោះ", ...report.subjects.map((s) => s.name_km ?? s.name), "មធ្យមភាគ"]}>
              {report.students.length === 0 && <EmptyRow colSpan={report.subjects.length + 2} />}
              {report.students.map((student) => (
                <tr key={student.id}>
                  <Td className="font-medium">
                    {student.name}
                    <span className="block font-mono text-xs text-slate-400">{student.student_code}</span>
                  </Td>
                  {student.grades.map((g) => (
                    <Td key={g.subject_id}>
                      {g.score === null ? (
                        <span className="text-slate-300">–</span>
                      ) : (
                        <>
                          {formatNumber(g.score)}/{formatNumber(g.max_score)}
                          <span className="block text-xs text-slate-500">{formatNumber(g.percentage, "%")}</span>
                        </>
                      )}
                    </Td>
                  ))}
                  <Td className="font-semibold">{formatNumber(student.average_percentage, "%")}</Td>
                </tr>
              ))}
              {report.students.length > 0 && (
                <tr className="bg-slate-50 font-semibold">
                  <Td>មធ្យមភាគមុខវិជ្ជា</Td>
                  {report.subject_averages.map((a) => (
                    <Td key={a.subject_id}>
                      {formatNumber(a.average_percentage, "%")}
                      <span className="block text-xs font-normal text-slate-500">{a.graded_count} នាក់</span>
                    </Td>
                  ))}
                  <Td>{formatNumber(report.class_average_percentage, "%")}</Td>
                </tr>
              )}
            </Table>
          </>
        )}
      </LiveFilters>
    </>
  );
}
