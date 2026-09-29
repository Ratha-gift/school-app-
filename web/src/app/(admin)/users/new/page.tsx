import { LuUserPlus } from "react-icons/lu";
import { BackLink, Card, PageHeader } from "@/components/ui";
import { createUser } from "../actions";
import { UserForm } from "../user-form";

export default function NewUserPage() {
  return (
    <>
      <BackLink href="/users">អ្នកប្រើ</BackLink>
      <PageHeader icon={LuUserPlus} title="បង្កើតអ្នកប្រើថ្មី" />
      <Card>
        <UserForm action={createUser} />
      </Card>
    </>
  );
}
