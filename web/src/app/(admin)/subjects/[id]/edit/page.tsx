import { LuBookOpen, LuTrash2 } from "react-icons/lu";
import { DeleteButton } from "@/components/form-parts";
import { Alert, BackLink, Card, CardTitle, PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { getParam } from "@/lib/search-params";
import type { Subject, Wrapped } from "@/lib/types";
import { deleteSubject, updateSubject } from "../../actions";
import { SubjectForm } from "../../subject-form";

export default async function EditSubjectPage(props: PageProps<"/subjects/[id]/edit">) {
  const { id } = await props.params;
  const params = await props.searchParams;
  const { data: subject } = await api<Wrapped<Subject>>(`/admin/subjects/${id}`);

  return (
    <>
      <BackLink href="/subjects">មុខវិជ្ជា</BackLink>
      <PageHeader
        icon={LuBookOpen}
        title={subject.name_km ?? subject.name}
        subtitle={`${subject.code} · ${subject.classes_count ?? 0} ថ្នាក់ · ${subject.grades_count ?? 0} ពិន្ទុ`}
      />
      {getParam(params, "created") && (
        <div className="mb-4">
          <Alert type="success">បានបង្កើតមុខវិជ្ជារួចរាល់</Alert>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          <SubjectForm action={updateSubject.bind(null, subject.id)} subject={subject} />
        </Card>
        <Card>
          <CardTitle icon={LuTrash2}>លុបមុខវិជ្ជា</CardTitle>
          <p className="mb-3 text-sm text-slate-500">មិនអាចលុបមុខវិជ្ជាដែលមានពិន្ទុរួចហើយបានទេ។</p>
          <DeleteButton
            action={deleteSubject.bind(null, subject.id)}
            confirmText={`តើអ្នកពិតជាចង់លុបមុខវិជ្ជា ${subject.name} មែនទេ?`}
          />
        </Card>
      </div>
    </>
  );
}
