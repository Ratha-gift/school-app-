"use client";

import { useActionState } from "react";
import { LuLogIn } from "react-icons/lu";
import { FormMessage, SubmitButton } from "@/components/form-parts";
import { Field, inputClass } from "@/components/ui";
import { login } from "@/lib/auth-actions";
import { initialFormState } from "@/lib/form-state";

export function LoginForm() {
  // state = what the `login` Server Action returned last time
  const [state, formAction] = useActionState(login, initialFormState);

  return (
    <form action={formAction} className="space-y-4">
      <FormMessage state={state} />
      <Field label="អ៊ីមែល" error={state.errors?.email}>
        {/* Keep the email after a failed attempt (React resets the form) */}
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          defaultValue={state.values?.email}
          className={inputClass}
        />
      </Field>
      <Field label="ពាក្យសម្ងាត់" error={state.errors?.password}>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className={inputClass}
        />
      </Field>
      <SubmitButton
        icon={LuLogIn}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2.5 font-medium text-white hover:bg-brand-dark disabled:opacity-60">
        ចូល
      </SubmitButton>
    </form>
  );
}
