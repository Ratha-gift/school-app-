"use client";

import { useActionState, useState } from "react";
import { LuPlus, LuSave, LuX } from "react-icons/lu";
import { FormMessage, SubmitButton } from "@/components/form-parts";
import { btnSecondary, inputClass } from "@/components/ui";
import { initialFormState, type FormState } from "@/lib/form-state";
import type { Ref, Subject } from "@/lib/types";

type Row = { key: number; subjectId: string; teacherId: string };

type Props = {
  action: (prev: FormState, formData: FormData) => Promise<FormState>;
  current: Subject[]; // subjects already in the class (with teacher)
  subjects: Subject[]; // all subjects (options)
  teachers: Ref[]; // all teachers (options)
};

let nextKey = 1000; // unique React keys for new rows

/** Edit the class's subjects: one row = subject + teacher. */
export function SubjectsEditor({ action, current, subjects, teachers }: Props) {
  const [state, formAction] = useActionState(action, initialFormState);

  // Rows are React state (controlled <select>s) so we can add/remove rows.
  const [rows, setRows] = useState<Row[]>(
    current.map((s, i) => ({ key: i, subjectId: String(s.id), teacherId: String(s.teacher?.id ?? "") })),
  );

  const update = (key: number, change: Partial<Row>) =>
    setRows((rows) => rows.map((row) => (row.key === key ? { ...row, ...change } : row)));

  const addRow = () => setRows((rows) => [...rows, { key: nextKey++, subjectId: "", teacherId: "" }]);
  const removeRow = (key: number) => setRows((rows) => rows.filter((row) => row.key !== key));

  return (
    <form action={formAction} className="space-y-3">
      <FormMessage state={state} />

      {rows.length === 0 && <p className="text-sm text-slate-400">មិនទាន់មានមុខវិជ្ជា</p>}

      {rows.map((row, i) => (
        <div key={row.key} className="rounded-lg border border-slate-200 p-3">
          <div className="flex flex-col gap-2 sm:flex-row">
            <select
              name="subject_id"
              value={row.subjectId}
              onChange={(e) => update(row.key, { subjectId: e.target.value })}
              className={inputClass}
              aria-label="មុខវិជ្ជា"
            >
              <option value="">— ជ្រើសមុខវិជ្ជា —</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name_km ?? s.name} ({s.code})
                </option>
              ))}
            </select>
            <select
              name="teacher_id"
              value={row.teacherId}
              onChange={(e) => update(row.key, { teacherId: e.target.value })}
              className={inputClass}
              aria-label="គ្រូ"
            >
              <option value="">— មិនទាន់មានគ្រូ —</option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => removeRow(row.key)}
              className="inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LuX size={16} />
              ដកចេញ
            </button>
          </div>
          {/* Laravel errors are named like "subjects.0.subject_id" */}
          {[state.errors?.[`subjects.${i}.subject_id`], state.errors?.[`subjects.${i}.teacher_id`]]
            .filter(Boolean)
            .map((error) => (
              <p key={error} className="mt-1 text-sm text-red-600">
                {error}
              </p>
            ))}
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={addRow} className={btnSecondary}>
          <LuPlus size={16} />
          បន្ថែមមុខវិជ្ជា
        </button>
        <SubmitButton icon={LuSave}>រក្សាទុកមុខវិជ្ជា</SubmitButton>
      </div>
    </form>
  );
}
