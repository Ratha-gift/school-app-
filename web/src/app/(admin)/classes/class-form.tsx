"use client";

import { useActionState } from "react";
import { LuPlus, LuSave } from "react-icons/lu";
import { FormMessage, SubmitButton } from "@/components/form-parts";
import { Field, inputClass } from "@/components/ui";
import { initialFormState, type FormState } from "@/lib/form-state";
import type { Ref, SchoolClass } from "@/lib/types";

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  schoolClass?: SchoolClass;
  teachers: Ref[]; // options for the homeroom teacher <select>
};

export function ClassForm({ action, schoolClass, teachers }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);

  const initial: Record<string, string> = {
    name: schoolClass?.name ?? "",
    grade_level: String(schoolClass?.grade_level ?? ""),
    academic_year: schoolClass?.academic_year ?? "",
    homeroom_teacher_id: String(schoolClass?.homeroom_teacher?.id ?? ""),
  };
  const value = (name: string) => state.values?.[name] ?? initial[name];

  return (
    <form action={formAction} className="max-w-lg space-y-4">
      <FormMessage state={state} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="ឈ្មោះថ្នាក់" error={state.errors?.name}>
          <input name="name" defaultValue={value("name")} required placeholder="7A" className={inputClass} />
        </Field>
        <Field label="កម្រិតថ្នាក់" error={state.errors?.grade_level}>
          <input
            name="grade_level"
            type="number"
            min={1}
            max={12}
            defaultValue={value("grade_level")}
            required
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="ឆ្នាំសិក្សា" error={state.errors?.academic_year}>
        <input
          name="academic_year"
          defaultValue={value("academic_year")}
          required
          placeholder="2026-2027"
          className={inputClass}
        />
      </Field>
      <Field label="គ្រូបន្ទុកថ្នាក់" error={state.errors?.homeroom_teacher_id}>
        <select name="homeroom_teacher_id" defaultValue={value("homeroom_teacher_id")} className={inputClass}>
          <option value="">— គ្មាន —</option>
          {teachers.map((teacher) => (
            <option key={teacher.id} value={teacher.id}>
              {teacher.name}
            </option>
          ))}
        </select>
      </Field>
      <SubmitButton icon={schoolClass ? LuSave : LuPlus}>{schoolClass ? "រក្សាទុក" : "បង្កើត"}</SubmitButton>
    </form>
  );
}
