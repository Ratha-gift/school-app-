import { LuGraduationCap, LuHeartHandshake, LuIdCard, LuPencil, LuTrash2, LuUserMinus } from "react-icons/lu";
import Link from "next/link";
import { DeleteButton } from "@/components/form-parts";
import { Alert, BackLink, Card, CardTitle, PageHeader, btnSecondary, linkClass } from "@/components/ui";
import { api, apiAll } from "@/lib/api";
import { formatDate, genderLabels, relationshipLabels } from "@/lib/labels";
import { getParam } from "@/lib/search-params";
import type { Student, User, Wrapped } from "@/lib/types";
import { addGuardian, deleteStudent, removeGuardian } from "../actions";
import { GuardianForm } from "../guardian-form";

export default async function StudentDetailPage(props: PageProps<"/students/[id]">) {
  const { id } = await props.params;
  const params = await props.searchParams;

  const [{ data: student }, parents] = await Promise.all([
    api<Wrapped<Student>>(`/admin/students/${id}`),
    apiAll<User>("/admin/users", { role: "parent" }),
  ]);
  const guardians = student.guardians ?? [];

  const info = [
    ["កូដសិស្ស", student.student_code],
    ["ភេទ", genderLabels[student.gender]],
    ["ថ្ងៃខែឆ្នាំកំណើត", formatDate(student.date_of_birth)],
  ];

  return (
    <>
      <BackLink href="/students">សិស្ស</BackLink>
      <PageHeader
        icon={LuGraduationCap}
        title={student.name}
        actions={
          <Link href={`/students/${id}/edit`} className={btnSecondary}>
            <LuPencil size={16} />
            កែប្រែ
          </Link>
        }
      />
      {getParam(params, "created") && (
        <div className="mb-4">
          <Alert type="success">បានបង្កើតសិស្សរួចរាល់</Alert>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardTitle icon={LuIdCard}>ព័ត៌មានសិស្ស</CardTitle>
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
            {info.map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-slate-500">{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
            <dt className="text-slate-500">ថ្នាក់</dt>
            <dd>
              {student.class ? (
                <Link href={`/classes/${student.class.id}`} className={linkClass}>
                  {student.class.name}
                </Link>
              ) : (
                "–"
              )}
            </dd>
          </dl>
        </Card>

        <Card>
          <CardTitle icon={LuHeartHandshake}>ឪពុកម្ដាយ / អាណាព្យាបាល</CardTitle>
          <ul className="mb-5 divide-y divide-slate-100">
            {guardians.length === 0 && <li className="py-2 text-sm text-slate-400">មិនទាន់មាន</li>}
            {guardians.map((g) => (
              <li key={g.id} className="flex flex-wrap items-start justify-between gap-3 py-3">
                <div>
                  <p className="font-medium">{g.name}</p>
                  <p className="text-sm text-slate-500">
                    {relationshipLabels[g.relationship ?? ""] ?? g.relationship} · {g.email}
                  </p>
                </div>
                <DeleteButton
                  action={removeGuardian.bind(null, student.id, g.id)}
                  confirmText={`ដក ${g.name} ចេញពី ${student.name}?`}
                  label="ដកចេញ"
                  icon={LuUserMinus}
                />
              </li>
            ))}
          </ul>
          <GuardianForm action={addGuardian.bind(null, student.id)} parents={parents} />
        </Card>

        <Card>
          <CardTitle icon={LuTrash2}>លុបសិស្ស</CardTitle>
          <p className="mb-3 text-sm text-slate-500">
            វត្តមាន និងពិន្ទុទាំងអស់របស់សិស្សនេះនឹងត្រូវលុបផងដែរ។
          </p>
          <DeleteButton
            action={deleteStudent.bind(null, student.id)}
            confirmText={`តើអ្នកពិតជាចង់លុប ${student.name} មែនទេ? វត្តមាន និងពិន្ទុរបស់សិស្សនេះនឹងបាត់ទាំងអស់។`}
          />
        </Card>
      </div>
    </>
  );
}
