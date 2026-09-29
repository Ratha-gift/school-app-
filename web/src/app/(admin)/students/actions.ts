"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { errorState, numberOrNull, successState, textOrNull, type FormState } from "@/lib/form";
import type { Student, Wrapped } from "@/lib/types";

function studentBody(formData: FormData) {
  return {
    student_code: textOrNull(formData, "student_code"),
    first_name: textOrNull(formData, "first_name"),
    last_name: textOrNull(formData, "last_name"),
    gender: textOrNull(formData, "gender"),
    date_of_birth: textOrNull(formData, "date_of_birth"),
    school_class_id: numberOrNull(formData, "school_class_id"),
  };
}

export async function createStudent(_prev: FormState, formData: FormData): Promise<FormState> {
  let created: Wrapped<Student>;
  try {
    created = await api<Wrapped<Student>>("/admin/students", { method: "POST", body: studentBody(formData) });
  } catch (error) {
    return errorState(error, formData);
  }
  redirect(`/students/${created.data.id}?created=1`);
}

export async function updateStudent(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await api(`/admin/students/${id}`, { method: "PUT", body: studentBody(formData) });
  } catch (error) {
    return errorState(error, formData);
  }
  revalidatePath(`/students/${id}`, "layout");
  return successState("រក្សាទុករួចរាល់", formData);
}

export async function deleteStudent(id: number): Promise<FormState> {
  try {
    await api(`/admin/students/${id}`, { method: "DELETE" });
  } catch (error) {
    return errorState(error);
  }
  redirect("/students?deleted=1");
}

/** Link a parent account to the student (or change the relationship). */
export async function addGuardian(studentId: number, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await api(`/admin/students/${studentId}/guardians`, {
      method: "POST",
      body: {
        guardian_id: numberOrNull(formData, "guardian_id"),
        relationship: textOrNull(formData, "relationship"),
      },
    });
  } catch (error) {
    return errorState(error, formData);
  }
  revalidatePath(`/students/${studentId}`);
  return successState("បានភ្ជាប់ឪពុកម្ដាយរួចរាល់");
}

export async function removeGuardian(studentId: number, guardianId: number): Promise<FormState> {
  try {
    await api(`/admin/students/${studentId}/guardians/${guardianId}`, { method: "DELETE" });
  } catch (error) {
    return errorState(error);
  }
  revalidatePath(`/students/${studentId}`);
  return successState("បានដកចេញរួចរាល់");
}
