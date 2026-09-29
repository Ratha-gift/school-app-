import Link from "next/link";
import { LuPencil, LuUserPlus, LuUsers } from "react-icons/lu";
import { FilterTabs } from "@/components/filter-tabs";
import { Pagination } from "@/components/pagination";
import { LiveFilters } from "@/components/live-filters";
import { Alert, Badge, EmptyRow, PageHeader, Table, Td, btnPrimary, linkClass } from "@/components/ui";
import { api } from "@/lib/api";
import { roleLabels } from "@/lib/labels";
import { buildQuery, getParam } from "@/lib/search-params";
import type { Paginated, Role, User } from "@/lib/types";

export default async function UsersPage(props: PageProps<"/users">) {
  const params = await props.searchParams;
  const role = getParam(params, "role");
  const search = getParam(params, "search");
  const page = getParam(params, "page");

  const users = await api<Paginated<User>>("/admin/users", { query: { role, search, page } });

  const tabs = [
    { value: "", label: "ទាំងអស់", href: "/users" + buildQuery({ search }) },
    ...(Object.keys(roleLabels) as Role[]).map((r) => ({
      value: r,
      label: roleLabels[r],
      href: "/users" + buildQuery({ role: r, search }),
    })),
  ];

  return (
    <>
      <PageHeader
        title="អ្នកប្រើ"
        icon={LuUsers}
        actions={
          <Link href="/users/new" className={btnPrimary}>
            <LuUserPlus size={16} />
            បង្កើតអ្នកប្រើ
          </Link>
        }
      />

      {getParam(params, "deleted") && (
        <div className="mb-4">
          <Alert type="success">បានលុបអ្នកប្រើរួចរាល់</Alert>
        </div>
      )}

      <FilterTabs tabs={tabs} active={role} />
      {/* Typing filters the table automatically (see LiveFilters) */}
      <LiveFilters fields={[{ type: "search", name: "search", placeholder: "ស្វែងរកឈ្មោះ ឬអ៊ីមែល..." }]}>
        <Table
          head={["ឈ្មោះ", "អ៊ីមែល", "តួនាទី", ""]}
          footer={<Pagination meta={users.meta} path="/users" params={{ role, search }} />}
        >
          {users.data.length === 0 && <EmptyRow colSpan={4} />}
          {users.data.map((user) => (
            <tr key={user.id}>
              <Td className="font-medium">{user.name}</Td>
              <Td>{user.email}</Td>
              <Td>
                <Badge>{roleLabels[user.role]}</Badge>
              </Td>
              <Td className="text-right">
                <Link href={`/users/${user.id}/edit`} className={`${linkClass} inline-flex items-center gap-1`}>
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
