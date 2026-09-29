"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { errorState, successState, textOrNull, type FormState } from "@/lib/form";
import type { Subject, Wrapped } from "@/lib/types";

function subjectBody(formData: FormData) {
  return {
    name: textOrNull(formData, "name"),
    name_km: textOrNull(formData, "name_km"),
    code: textOrNull(formData, "code"),
  };
}

export async function createSubject(_prev: FormState, formData: FormData): Promise<FormState> {
  let subject: Wrapped<Subject>;
  try {
    subject = await api<Wrapped<Subject>>("/admin/subjects", { method: "POST", body: subjectBody(formData) });
  } catch (error) {
    return errorState(error, formData);
  }
  redirect(`/subjects/${subject.data.id}/edit?created=1`);
}

export async function updateSubject(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await api(`/admin/subjects/${id}`, { method: "PUT", body: subjectBody(formData) });
  } catch (error) {
    return errorState(error, formData);
  }
  revalidatePath(`/subjects/${id}/edit`);
  return successState("រក្សាទុករួចរាល់", formData);
}

export async function deleteSubject(id: number): Promise<FormState> {
  try {
    await api(`/admin/subjects/${id}`, { method: "DELETE" });
  } catch (error) {
    return errorState(error); // 409 when the subject already has grades
  }
  redirect("/subjects?deleted=1");
}
