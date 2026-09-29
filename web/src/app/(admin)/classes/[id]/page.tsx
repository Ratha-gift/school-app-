import { LuBookOpen, LuPencil, LuSchool, LuTrash2, LuUsers } from "react-icons/lu";
import Link from "next/link";
import { DeleteButton } from "@/components/form-parts";
import { Alert, BackLink, Card, CardTitle, EmptyRow, PageHeader, Table, Td, btnSecondary, linkClass } from "@/components/ui";
import { api, apiAll } from "@/lib/api";
import { genderLabels } from "@/lib/labels";
import { getParam } from "@/lib/search-params";
import type { SchoolClass, Student, Subject, User, Wrapped } from "@/lib/types";
import { deleteClass, syncClassSubjects } from "../actions";
import { SubjectsEditor } from "../subjects-editor";

export default async function ClassDetailPage(props: PageProps<"/classes/[id]">) {
  const { id } = await props.params;
  const params = await props.searchParams;

  // Independent requests -> run them in parallel
  const [{ data: schoolClass }, { data: classSubjects }, students, allSubjects, teachers] = await Promise.all([
    api<Wrapped<SchoolClass>>(`/admin/classes/${id}`),
    api<Wrapped<Subject[]>>(`/admin/classes/${id}/subjects`),
    apiAll<Student>("/admin/students", { school_class_id: id }),
    apiAll<Subject>("/admin/subjects"),
    apiAll<User>("/admin/users", { role: "teacher" }),
  ]);

  return (
    <>
      <BackLink href="/classes">ថ្នាក់</BackLink>
      <PageHeader
        icon={LuSchool}
        title={`ថ្នាក់ ${schoolClass.name}`}
        subtitle={`កម្រិត ${schoolClass.grade_level} · ${schoolClass.academic_year} · គ្រូបន្ទុកថ្នាក់: ${
          schoolClass.homeroom_teacher?.name ?? "–"
        }`}
        actions={
          <Link href={`/classes/${id}/edit`} className={btnSecondary}>
            <LuPencil size={16} />
            កែប្រែ
          </Link>
        }
      />
      {getParam(params, "created") && (
        <div className="mb-4">
          <Alert type="success">បានបង្កើតថ្នាក់រួចរាល់</Alert>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <div>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
            <LuUsers className="text-brand" size={20} />
            សិស្ស ({students.length} នាក់)
          </h2>
          <Table head={["កូដ", "ឈ្មោះ", "ភេទ"]}>
            {students.length === 0 && <EmptyRow colSpan={3} text="មិនមានសិស្សក្នុងថ្នាក់នេះទេ" />}
            {students.map((student) => (
              <tr key={student.id}>
                <Td className="font-mono text-xs">{student.student_code}</Td>
                <Td>
                  <Link href={`/students/${student.id}`} className={linkClass}>
                    {student.name}
                  </Link>
                </Td>
                <Td>{genderLabels[student.gender]}</Td>
              </tr>
            ))}
          </Table>
        </div>

        <div className="space-y-6">
          <Card>
            <CardTitle icon={LuBookOpen}>មុខវិជ្ជា និងគ្រូបង្រៀន</CardTitle>
            <SubjectsEditor
              action={syncClassSubjects.bind(null, schoolClass.id)}
              current={classSubjects}
              subjects={allSubjects}
              teachers={teachers}
            />
          </Card>

          <Card>
            <CardTitle icon={LuTrash2}>លុបថ្នាក់</CardTitle>
            <p className="mb-3 text-sm text-slate-500">មិនអាចលុបថ្នាក់ដែលនៅមានសិស្សបានទេ។</p>
            <DeleteButton
              action={deleteClass.bind(null, schoolClass.id)}
              confirmText={`តើអ្នកពិតជាចង់លុបថ្នាក់ ${schoolClass.name} មែនទេ?`}
            />
          </Card>
        </div>
      </div>
    </>
  );
}
