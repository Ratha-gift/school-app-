import Link from "next/link";
import { LuBookOpen, LuPencil, LuPlus } from "react-icons/lu";
import { Pagination } from "@/components/pagination";
import { LiveFilters } from "@/components/live-filters";
import { Alert, EmptyRow, PageHeader, Table, Td, btnPrimary, linkClass } from "@/components/ui";
import { api } from "@/lib/api";
import { getParam } from "@/lib/search-params";
import type { Paginated, Subject } from "@/lib/types";

export default async function SubjectsPage(props: PageProps<"/subjects">) {
  const params = await props.searchParams;
  const search = getParam(params, "search");
  const page = getParam(params, "page");

  const subjects = await api<Paginated<Subject>>("/admin/subjects", { query: { search, page } });

  return (
    <>
      <PageHeader
        title="មុខវិជ្ជា"
        icon={LuBookOpen}
        actions={
          <Link href="/subjects/new" className={btnPrimary}>
            <LuPlus size={16} />
            បង្កើតមុខវិជ្ជា
          </Link>
        }
      />
      {getParam(params, "deleted") && (
        <div className="mb-4">
          <Alert type="success">បានលុបមុខវិជ្ជារួចរាល់</Alert>
        </div>
      )}

      <LiveFilters fields={[{ type: "search", name: "search", placeholder: "ស្វែងរកឈ្មោះ ឬកូដ..." }]}>
        <Table
          head={["កូដ", "ឈ្មោះ", "ឈ្មោះខ្មែរ", "ចំនួនថ្នាក់", ""]}
          footer={<Pagination meta={subjects.meta} path="/subjects" params={{ search }} />}
        >
          {subjects.data.length === 0 && <EmptyRow colSpan={5} />}
          {subjects.data.map((subject) => (
            <tr key={subject.id}>
              <Td className="font-mono text-xs">{subject.code}</Td>
              <Td className="font-medium">{subject.name}</Td>
              <Td>{subject.name_km ?? "–"}</Td>
              <Td>{subject.classes_count ?? 0}</Td>
              <Td className="text-right">
                <Link href={`/subjects/${subject.id}/edit`} className={`${linkClass} inline-flex items-center gap-1`}>
                  <LuPencil size={15} />
                  កែប្រែ
                </Link>
              </Td>
            </tr>
          ))}
        </Table>
      </LiveFilters>
    </>
  );
}
