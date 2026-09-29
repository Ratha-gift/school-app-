import { LuPencil } from "react-icons/lu";
import { BackLink, Card, PageHeader } from "@/components/ui";
import { api, apiAll } from "@/lib/api";
import type { SchoolClass, User, Wrapped } from "@/lib/types";
import { updateClass } from "../../actions";
import { ClassForm } from "../../class-form";

export default async function EditClassPage(props: PageProps<"/classes/[id]/edit">) {
  const { id } = await props.params;
  const [{ data: schoolClass }, teachers] = await Promise.all([
    api<Wrapped<SchoolClass>>(`/admin/classes/${id}`),
    apiAll<User>("/admin/users", { role: "teacher" }),
  ]);

  return (
    <>
      <BackLink href={`/classes/${id}`}>ថ្នាក់ {schoolClass.name}</BackLink>
      <PageHeader icon={LuPencil} title={`កែប្រែថ្នាក់ ${schoolClass.name}`} />
      <Card>
        <ClassForm action={updateClass.bind(null, schoolClass.id)} schoolClass={schoolClass} teachers={teachers} />
      </Card>
    </>
  );
}
