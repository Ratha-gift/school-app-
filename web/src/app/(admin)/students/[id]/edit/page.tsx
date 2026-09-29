import { LuPencil } from "react-icons/lu";
import { BackLink, Card, PageHeader } from "@/components/ui";
import { api, apiAll } from "@/lib/api";
import type { SchoolClass, Student, Wrapped } from "@/lib/types";
import { updateStudent } from "../../actions";
import { StudentForm } from "../../student-form";

export default async function EditStudentPage(props: PageProps<"/students/[id]/edit">) {
  const { id } = await props.params;
  const [{ data: student }, classes] = await Promise.all([
    api<Wrapped<Student>>(`/admin/students/${id}`),
    apiAll<SchoolClass>("/admin/classes"),
  ]);

  return (
    <>
      <BackLink href={`/students/${id}`}>{student.name}</BackLink>
      <PageHeader icon={LuPencil} title={`កែប្រែ ${student.name}`} />
      <Card>
        <StudentForm action={updateStudent.bind(null, student.id)} student={student} classes={classes} />
      </Card>
    </>
  );
}
