import Link from "next/link";
import { LuEye, LuGraduationCap, LuUserPlus } from "react-icons/lu";
import { Pagination } from "@/components/pagination";
import { LiveFilters } from "@/components/live-filters";
import { Alert, EmptyRow, PageHeader, Table, Td, btnPrimary, linkClass } from "@/components/ui";
import { api, apiAll } from "@/lib/api";
import { genderLabels } from "@/lib/labels";
import { getParam } from "@/lib/search-params";
import type { Paginated, SchoolClass, Student } from "@/lib/types";

export default async function StudentsPage(props: PageProps<"/students">) {
  const params = await props.searchParams;
  const search = getParam(params, "search");
  const classId = getParam(params, "school_class_id");
  const page = getParam(params, "page");

  const [students, classes] = await Promise.all([
    api<Paginated<Student>>("/admin/students", { query: { search, school_class_id: classId, page } }),
    apiAll<SchoolClass>("/admin/classes"),
  ]);

  return (
    <>
      <PageHeader
        title="សិស្ស"
        icon={LuGraduationCap}
        actions={
          <Link href="/students/new" className={btnPrimary}>
            <LuUserPlus size={16} />
            បង្កើតសិស្ស
          </Link>
        }
      />
      {getParam(params, "deleted") && (
        <div className="mb-4">
          <Alert type="success">បានលុបសិស្សរួចរាល់</Alert>
        </div>
      )}

      <LiveFilters
        fields={[
          { type: "search", name: "search", placeholder: "ស្វែងរកឈ្មោះ ឬកូដ..." },
          {
            type: "select",
            name: "school_class_id",
            emptyLabel: "គ្រប់ថ្នាក់",
            options: classes.map((c) => ({ value: String(c.id), label: `${c.name} (${c.academic_year})` })),
          },
        ]}
      >
        <Table
          head={["កូដ", "ឈ្មោះ", "ភេទ", "ថ្នាក់", "ឪពុកម្ដាយ", ""]}
          footer={<Pagination meta={students.meta} path="/students" params={{ search, school_class_id: classId }} />}
        >
          {students.data.length === 0 && <EmptyRow colSpan={6} />}
          {students.data.map((s) => (
            <tr key={s.id}>
              <Td className="font-mono text-xs">{s.student_code}</Td>
              <Td className="font-medium">{s.name}</Td>
              <Td>{genderLabels[s.gender]}</Td>
              <Td>{s.class?.name ?? "–"}</Td>
              <Td>{s.guardians?.map((g) => g.name).join(", ") || "–"}</Td>
              <Td className="text-right">
                <Link href={`/students/${s.id}`} className={`${linkClass} inline-flex items-center gap-1`}>
                  <LuEye size={15} />
                  មើល
                </Link>
              </Td>
            </tr>
          ))}
        </Table>
      </LiveFilters>
    </>
  );
}
