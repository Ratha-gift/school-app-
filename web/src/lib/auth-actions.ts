"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, ApiError } from "./api";
import { errorState, type FormState } from "./form";
import { TOKEN_COOKIE, tokenCookieOptions } from "./session";
import type { User } from "./types";

type LoginResponse = { token: string; user: Pick<User, "id" | "name" | "email" | "role"> };

/** Login form action: POST /login, admins only, token -> httpOnly cookie. */
export async function login(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  let result: LoginResponse;
  try {
    result = await api<LoginResponse>("/login", {
      method: "POST",
      body: { email, password, device_name: "web-admin" },
      token: "", // no cookie yet; also makes api() not treat 401 as "session expired"
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      return { status: "error", message: "អ៊ីមែល ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ", values: { email } };
    }
    return errorState(error, formData);
  }

  if (result.user.role !== "admin") {
    // Don't leave an unused token behind in Laravel.
    await api("/logout", { method: "POST", token: result.token }).catch(() => {});
    return { status: "error", message: "គណនីនេះមិនមែនជា admin ទេ", values: { email } };
  }

  (await cookies()).set(TOKEN_COOKIE, result.token, tokenCookieOptions);
  redirect("/"); // outside try/catch: redirect() works by throwing
}

/** Logout: revoke the token in Laravel, then always delete the cookie. */
export async function logout() {
  try {
    await api("/logout", { method: "POST" });
  } catch {
    // Ignore: we log out locally even if Laravel is unreachable.
  }
  (await cookies()).delete(TOKEN_COOKIE);
  redirect("/login");
}
