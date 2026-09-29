import { LuTrash2, LuUserCog } from "react-icons/lu";
import { DeleteButton } from "@/components/form-parts";
import { Alert, BackLink, Card, CardTitle, PageHeader } from "@/components/ui";
import { api } from "@/lib/api";
import { getParam } from "@/lib/search-params";
import type { User, Wrapped } from "@/lib/types";
import { deleteUser, updateUser } from "../../actions";
import { UserForm } from "../../user-form";

export default async function EditUserPage(props: PageProps<"/users/[id]/edit">) {
  const { id } = await props.params;
  const params = await props.searchParams;
  const { data: user } = await api<Wrapped<User>>(`/admin/users/${id}`);

  return (
    <>
      <BackLink href="/users">អ្នកប្រើ</BackLink>
      <PageHeader icon={LuUserCog} title={user.name} subtitle={user.email} />

      {getParam(params, "created") && (
        <div className="mb-4">
          <Alert type="success">បានបង្កើតអ្នកប្រើរួចរាល់</Alert>
        </div>
      )}

      <div className="space-y-6">
        <Card>
          {/* bind() fixes the first argument (id) of the Server Action */}
          <UserForm action={updateUser.bind(null, user.id)} user={user} />
        </Card>

        <Card>
          <CardTitle icon={LuTrash2}>លុបអ្នកប្រើ</CardTitle>
          <p className="mb-3 text-sm text-slate-500">ការលុបមិនអាចត្រឡប់វិញបានទេ។</p>
          <DeleteButton
            action={deleteUser.bind(null, user.id)}
            confirmText={`តើអ្នកពិតជាចង់លុប ${user.name} មែនទេ?`}
          />
        </Card>
      </div>
    </>
  );
}
