import Link from "next/link";
import { LuEye, LuPlus, LuSchool } from "react-icons/lu";
import { Pagination } from "@/components/pagination";
import { LiveFilters } from "@/components/live-filters";
import { Alert, EmptyRow, PageHeader, Table, Td, btnPrimary, linkClass } from "@/components/ui";
import { api } from "@/lib/api";
import { getParam } from "@/lib/search-params";
import type { Paginated, SchoolClass } from "@/lib/types";

export default async function ClassesPage(props: PageProps<"/classes">) {
  const params = await props.searchParams;
  const search = getParam(params, "search");
  const page = getParam(params, "page");

  const classes = await api<Paginated<SchoolClass>>("/admin/classes", { query: { search, page } });

  return (
    <>
      <PageHeader
        title="ថ្នាក់"
        icon={LuSchool}
        actions={
          <Link href="/classes/new" className={btnPrimary}>
            <LuPlus size={16} />
            បង្កើតថ្នាក់
          </Link>
        }
      />
      {getParam(params, "deleted") && (
        <div className="mb-4">
          <Alert type="success">បានលុបថ្នាក់រួចរាល់</Alert>
        </div>
      )}

      <LiveFilters fields={[{ type: "search", name: "search", placeholder: "ស្វែងរកឈ្មោះថ្នាក់..." }]}>
        <Table
          head={["ថ្នាក់", "កម្រិត", "ឆ្នាំសិក្សា", "គ្រូបន្ទុកថ្នាក់", "សិស្ស", ""]}
          footer={<Pagination meta={classes.meta} path="/classes" params={{ search }} />}
        >
          {classes.data.length === 0 && <EmptyRow colSpan={6} />}
          {classes.data.map((c) => (
            <tr key={c.id}>
              <Td className="font-medium">{c.name}</Td>
              <Td>{c.grade_level}</Td>
              <Td>{c.academic_year}</Td>
              <Td>{c.homeroom_teacher?.name ?? "–"}</Td>
              <Td>{c.students_count ?? 0} នាក់</Td>
              <Td className="text-right">
                <Link href={`/classes/${c.id}`} className={`${linkClass} inline-flex items-center gap-1`}>
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
