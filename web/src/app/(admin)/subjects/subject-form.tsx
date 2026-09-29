"use client";

import { useActionState } from "react";
import { LuPlus, LuSave } from "react-icons/lu";
import { FormMessage, SubmitButton } from "@/components/form-parts";
import { Field, inputClass } from "@/components/ui";
import { initialFormState, type FormState } from "@/lib/form-state";
import type { Subject } from "@/lib/types";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  subject?: Subject;
};

export function SubjectForm({ action, subject }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);
  const value = (name: "name" | "name_km" | "code") => state.values?.[name] ?? subject?.[name] ?? "";

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <FormMessage state={state} />
      <Field label="ឈ្មោះ (អង់គ្លេស)" error={state.errors?.name}>
        <input name="name" defaultValue={value("name")} required className={inputClass} />
      </Field>
      <Field label="ឈ្មោះ (ខ្មែរ)" error={state.errors?.name_km}>
        <input name="name_km" defaultValue={value("name_km")} className={inputClass} />
      </Field>
      <Field label="កូដ" error={state.errors?.code} hint="ឧ. MATH (មិនអាចស្ទួនគ្នា)">
        <input name="code" defaultValue={value("code")} required maxLength={20} className={inputClass} />
      </Field>
      <SubmitButton icon={subject ? LuSave : LuPlus}>{subject ? "រក្សាទុក" : "បង្កើត"}</SubmitButton>
    </form>
  );
}
