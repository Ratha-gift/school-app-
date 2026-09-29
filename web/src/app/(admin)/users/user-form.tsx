"use client";

import { useActionState } from "react";
import { LuPlus, LuSave } from "react-icons/lu";
import { FormMessage, SubmitButton } from "@/components/form-parts";
import { Field, inputClass } from "@/components/ui";
import { initialFormState, type FormState } from "@/lib/form-state";
import { roleLabels } from "@/lib/labels";
import type { Role, User } from "@/lib/types";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  user?: User; // undefined = create form
};

export function UserForm({ action, user }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);

  // Submitted value (after an error/save) or the current value.
  const value = (name: keyof User) => state.values?.[name] ?? String(user?.[name] ?? "");

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <FormMessage state={state} />

      <Field label="ឈ្មោះ" error={state.errors?.name}>
        <input name="name" defaultValue={value("name")} required className={inputClass} />
      </Field>

      <Field label="អ៊ីមែល" error={state.errors?.email}>
        <input name="email" type="email" defaultValue={value("email")} required className={inputClass} />
      </Field>

      <Field label="តួនាទី" error={state.errors?.role}>
        <select name="role" defaultValue={value("role") || "teacher"} className={inputClass}>
          {(Object.keys(roleLabels) as Role[]).map((role) => (
            <option key={role} value={role}>
              {roleLabels[role]}
            </option>
          ))}
        </select>
      </Field>

      <Field
        label="ពាក្យសម្ងាត់"
        error={state.errors?.password}
        hint={user ? "ទុកទទេ ប្រសិនបើមិនចង់ប្ដូរពាក្យសម្ងាត់" : "យ៉ាងតិច ៨ តួអក្សរ"}
      >
        <input
          name="password"
          type="password"
          autoComplete="new-password"
          required={!user}
          minLength={8}
          className={inputClass}
        />
      </Field>

      <SubmitButton icon={user ? LuSave : LuPlus}>{user ? "រក្សាទុក" : "បង្កើត"}</SubmitButton>
    </form>
  );
}
