import { LuGraduationCap } from "react-icons/lu";
import { BackLink, Card, PageHeader } from "@/components/ui";
import { apiAll } from "@/lib/api";
import type { SchoolClass } from "@/lib/types";
import { createStudent } from "../actions";
import { StudentForm } from "../student-form";

export default async function NewStudentPage() {
  const classes = await apiAll<SchoolClass>("/admin/classes");

  return (
    <>
      <BackLink href="/students">សិស្ស</BackLink>
      <PageHeader icon={LuGraduationCap} title="បង្កើតសិស្សថ្មី" />
      <Card>
        <StudentForm action={createStudent} classes={classes} />
      </Card>
    </>
  );
}
