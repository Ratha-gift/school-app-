import { LuBookOpen } from "react-icons/lu";
import { BackLink, Card, PageHeader } from "@/components/ui";
import { createSubject } from "../actions";
import { SubjectForm } from "../subject-form";

export default function NewSubjectPage() {
  return (
    <>
      <BackLink href="/subjects">មុខវិជ្ជា</BackLink>
      <PageHeader icon={LuBookOpen} title="បង្កើតមុខវិជ្ជាថ្មី" />
      <Card>
        <SubjectForm action={createSubject} />
      </Card>
    </>
  );
}
