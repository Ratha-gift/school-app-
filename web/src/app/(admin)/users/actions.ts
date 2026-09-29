"use server";

// Server Actions for users. They run on the server, call Laravel with the
// admin's token (from the httpOnly cookie) and return a FormState.

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import { errorState, successState, textOrNull, type FormState } from "@/lib/form";
import type { User, Wrapped } from "@/lib/types";

function userBody(formData: FormData) {
  return {
    name: textOrNull(formData, "name"),
    email: textOrNull(formData, "email"),
    role: textOrNull(formData, "role"),
    password: textOrNull(formData, "password"), // null on edit = keep current
  };
}

export async function createUser(_prev: FormState, formData: FormData): Promise<FormState> {
  let user: Wrapped<User>;
  try {
    user = await api<Wrapped<User>>("/admin/users", { method: "POST", body: userBody(formData) });
  } catch (error) {
    return errorState(error, formData);
  }
  redirect(`/users/${user.data.id}/edit?created=1`);
}

// `id` is bound in the page: updateUser.bind(null, user.id)
export async function updateUser(id: number, _prev: FormState, formData: FormData): Promise<FormState> {
  try {
    await api(`/admin/users/${id}`, { method: "PUT", body: userBody(formData) });
  } catch (error) {
    return errorState(error, formData);
  }
  revalidatePath(`/users/${id}/edit`); // re-render the page with the saved data
  return successState("រក្សាទុករួចរាល់", formData);
}

export async function deleteUser(id: number): Promise<FormState> {
  try {
    await api(`/admin/users/${id}`, { method: "DELETE" });
  } catch (error) {
    return errorState(error); // e.g. 403 "You cannot delete your own account."
  }
  redirect("/users?deleted=1");
}
