"use client";

import { useActionState } from "react";
import { LuUserPlus } from "react-icons/lu";
import { FormMessage, SubmitButton } from "@/components/form-parts";
import { Field, inputClass } from "@/components/ui";
import { initialFormState, type FormState } from "@/lib/form-state";
import { relationshipLabels } from "@/lib/labels";
import type { Ref } from "@/lib/types";

/** Add a parent (+ relationship) to a student. */
export function GuardianForm({
  action,
  parents,
}: {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  parents: Ref[];
}) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form action={formAction} className="space-y-3">
      <FormMessage state={state} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="ឪពុកម្ដាយ" error={state.errors?.guardian_id}>
          <select name="guardian_id" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              — ជ្រើសរើស —
            </option>
            {parents.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ទំនាក់ទំនង" error={state.errors?.relationship}>
          <select name="relationship" defaultValue="parent" className={inputClass}>
            {Object.entries(relationshipLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <SubmitButton icon={LuUserPlus}>ភ្ជាប់</SubmitButton>
    </form>
  );
}
