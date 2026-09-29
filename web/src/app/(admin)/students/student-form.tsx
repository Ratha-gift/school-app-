"use client";

import { useActionState } from "react";
import { LuPlus, LuSave } from "react-icons/lu";
import { FormMessage, SubmitButton } from "@/components/form-parts";
import { Field, inputClass } from "@/components/ui";
import { initialFormState, type FormState } from "@/lib/form-state";
import { genderLabels } from "@/lib/labels";
import type { Gender, Ref, Student } from "@/lib/types";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  student?: Student;
  classes: Ref[];
};

export function StudentForm({ action, student, classes }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);

  const initial: Record<string, string> = {
    student_code: student?.student_code ?? "",
    first_name: student?.first_name ?? "",
    last_name: student?.last_name ?? "",
    gender: student?.gender ?? "male",
    date_of_birth: student?.date_of_birth ?? "",
    school_class_id: String(student?.class?.id ?? ""),
  };
  const value = (name: string) => state.values?.[name] ?? initial[name];
  const error = (name: string) => state.errors?.[name];

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <FormMessage state={state} />
      <Field label="កូដសិស្ស" error={error("student_code")}>
        <input name="student_code" defaultValue={value("student_code")} required placeholder="STU0001" className={inputClass} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="នាមខ្លួន" error={error("first_name")}>
          <input name="first_name" defaultValue={value("first_name")} required className={inputClass} />
        </Field>
        <Field label="នាមត្រកូល" error={error("last_name")}>
          <input name="last_name" defaultValue={value("last_name")} required className={inputClass} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ភេទ" error={error("gender")}>
          <select name="gender" defaultValue={value("gender")} className={inputClass}>
            {(Object.keys(genderLabels) as Gender[]).map((g) => (
              <option key={g} value={g}>
                {genderLabels[g]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="ថ្ងៃខែឆ្នាំកំណើត" error={error("date_of_birth")}>
          <input name="date_of_birth" type="date" defaultValue={value("date_of_birth")} className={inputClass} />
        </Field>
      </div>
      <Field label="ថ្នាក់" error={error("school_class_id")}>
        <select name="school_class_id" defaultValue={value("school_class_id")} className={inputClass}>
          <option value="">— មិនទាន់មានថ្នាក់ —</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </Field>
      <SubmitButton icon={student ? LuSave : LuPlus}>{student ? "រក្សាទុក" : "បង្កើត"}</SubmitButton>
    </form>
  );
}
