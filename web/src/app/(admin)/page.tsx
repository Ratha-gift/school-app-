import Link from "next/link";
import {
  LuCalendarDays,
  LuClipboardCheck,
  LuGraduationCap,
  LuHeartHandshake,
  LuLayoutDashboard,
  LuSchool,
  LuUsers,
} from "react-icons/lu";
import { Card, CardTitle, EmptyRow, PageHeader, Table, Td, linkClass } from "@/components/ui";
import { api } from "@/lib/api";
import { formatDate, statusInfo, statuses } from "@/lib/labels";
import type { Dashboard } from "@/lib/types";

export default async function DashboardPage() {
  const data = await api<Dashboard>("/admin/dashboard");

  const stats = [
    { label: "សិស្ស", value: data.counts.students, href: "/students", icon: LuGraduationCap, color: "bg-brand/10 text-brand" },
    { label: "គ្រូ", value: data.counts.teachers, href: "/users?role=teacher", icon: LuUsers, color: "bg-blue-100 text-blue-600" },
    { label: "ឪពុកម្ដាយ", value: data.counts.parents, href: "/users?role=parent", icon: LuHeartHandshake, color: "bg-orange-100 text-orange-600" },
    { label: "ថ្នាក់", value: data.counts.classes, href: "/classes", icon: LuSchool, color: "bg-violet-100 text-violet-600" },
  ];

  return (
    <>
      <PageHeader
        title="ផ្ទាំងគ្រប់គ្រង"
        subtitle={`ថ្ងៃនេះ ${formatDate(data.today.date)}`}
        icon={LuLayoutDashboard}
      />

      {/* Stat cards */}
      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="flex items-center gap-4 transition hover:border-brand">
              <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon size={24} />
              </span>
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-3xl font-semibold">{stat.value}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's attendance */}
        <Card>
          <CardTitle icon={LuClipboardCheck}>វត្តមានថ្ងៃនេះ</CardTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {statuses.map((status) => (
              <div key={status} className={`rounded-lg border-2 p-3 text-center ${statusInfo[status].border}`}>
                <p className={`text-sm font-medium ${statusInfo[status].text}`}>{statusInfo[status].label}</p>
                <p className="mt-1 text-2xl font-semibold">{data.today.summary[status]}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-slate-500">សរុបបានកត់ត្រា {data.today.total} នាក់</p>
        </Card>

        {/* Classes that haven't taken attendance today */}
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <LuCalendarDays className="text-orange-600" size={20} />
            ថ្នាក់ដែលមិនទាន់កត់វត្តមានថ្ងៃនេះ
          </h2>
          <Table head={["ថ្នាក់", "សិស្ស", "គ្រូបន្ទុកថ្នាក់"]}>
            {data.classes_without_attendance_today.length === 0 && (
              <EmptyRow colSpan={3} text="គ្រប់ថ្នាក់បានកត់វត្តមានរួចហើយ" />
            )}
            {data.classes_without_attendance_today.map((c) => (
              <tr key={c.id}>
                <Td>
                  <Link href={`/classes/${c.id}`} className={linkClass}>
                    {c.name}
                  </Link>
                </Td>
                <Td>{c.students_count} នាក់</Td>
                <Td>{c.homeroom_teacher?.name ?? "–"}</Td>
              </tr>
            ))}
          </Table>
        </div>
      </div>
    </>
  );
}
