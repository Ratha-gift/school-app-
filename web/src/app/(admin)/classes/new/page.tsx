import { LuSchool } from "react-icons/lu";
import { BackLink, Card, PageHeader } from "@/components/ui";
import { apiAll } from "@/lib/api";
import type { User } from "@/lib/types";
import { createClass } from "../actions";
import { ClassForm } from "../class-form";

export default async function NewClassPage() {
  const teachers = await apiAll<User>("/admin/users", { role: "teacher" });

  return (
    <>
      <BackLink href="/classes">ថ្នាក់</BackLink>
      <PageHeader icon={LuSchool} title="បង្កើតថ្នាក់ថ្មី" />
      <Card>
        <ClassForm action={createClass} teachers={teachers} />
      </Card>
    </>
  );
}
