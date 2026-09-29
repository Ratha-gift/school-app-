"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { errorState, numberOrNull, successState, textOrNull, type FormState } from "@/lib/form";
import type { SchoolClass, Wrapped } from "@/lib/types";

function classBody(formData: FormData) {
  return {
    name: textOrNull(formData, "name"),
    grade_level: numberOrNull(formData, "grade_level"),
    academic_year: textOrNull(formData, "academic_year"),
    homeroom_teacher_id: numberOrNull(formData, "homeroom_teacher_id"),
  };
}

export async function createClass(_prev: FormState, formData: FormData): Promise<FormState> {
  let created: Wrapped<SchoolClass>;
  try {
    created = await api<Wrapped<SchoolClass>>("/admin/classes", { method: "POST", body: classBody(formData) });
  } catch (error) {
    return errorState(error, formData);
  }
  redirect(`/classes/${created.data.id}?created=1`);
}

export async function updateClass(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await api(`/admin/classes/${id}`, { method: "PUT", body: classBody(formData) });
  } catch (error) {
    return errorState(error, formData);
  }
  revalidatePath(`/classes/${id}`, "layout"); // detail + edit pages
  return successState("រក្សាទុករួចរាល់", formData);
}

export async function deleteClass(id: number): Promise<FormState> {
  try {
    await api(`/admin/classes/${id}`, { method: "DELETE" });
  } catch (error) {
    return errorState(error); // 409 when the class still has students
  }
  redirect("/classes?deleted=1");
}

/**
 * Subjects editor. The form has one "subject_id" and one "teacher_id"
 * <select> per row; getAll() returns them in row order.
 * Sends PUT /admin/classes/{id}/subjects {"subjects": [...]}.
 */
export async function syncClassSubjects(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  const subjectIds = formData.getAll("subject_id");
  const teacherIds = formData.getAll("teacher_id");

  const subjects = subjectIds.map((subjectId, i) => ({
    subject_id: subjectId === "" ? null : Number(subjectId),
    teacher_id: teacherIds[i] ? Number(teacherIds[i]) : null,
  }));

  try {
    await api(`/admin/classes/${id}/subjects`, { method: "PUT", body: { subjects } });
  } catch (error) {
    return errorState(error);
  }
  revalidatePath(`/classes/${id}`);
  return successState("បានរក្សាទុកមុខវិជ្ជារួចរាល់");
}
