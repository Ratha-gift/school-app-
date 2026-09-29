import "server-only"; // this file must never be bundled for the browser

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { TOKEN_COOKIE } from "./session";

/** Thrown when Laravel answers with an error status (except 401). */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    /** Laravel 422 validation errors: { field: ["message", ...] } */
    public errors: Record<string, string[]> = {},
  ) {
    super(message);
  }
}

type Options = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** Query string values; empty ones are skipped. */
  query?: Record<string, string | number | undefined | null>;
  /** Use this token instead of the cookie (only needed right after login). */
  token?: string;
};

function apiUrl(path: string, query?: Options["query"]): string {
  const base = process.env.API_URL;
  if (!base) throw new Error("API_URL is not set. Copy .env.example to .env.local.");

  const url = new URL(base.replace(/\/$/, "") + path);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

/**
 * Calls the Laravel API from the server (Server Components and Server Actions).
 *
 * - Adds `Authorization: Bearer <token from the httpOnly cookie>`.
 * - Returns the parsed JSON (or null for 204 No Content).
 * - 401 (token expired/revoked): clears the cookie and redirects to /login.
 * - Other errors: throws ApiError with the status, message and 422 errors.
 */
export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const token = options.token ?? (await cookies()).get(TOKEN_COOKIE)?.value;

  let response: Response;
  try {
    response = await fetch(apiUrl(path, options.query), {
      method: options.method ?? "GET",
      headers: {
        Accept: "application/json",
        ...(options.body !== undefined && { "Content-Type": "application/json" }),
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      cache: "no-store", // admin data must always be fresh
    });
  } catch {
    // Laravel is not running / wrong API_URL
    throw new ApiError(0, "មិនអាចភ្ជាប់ទៅ server បានទេ");
  }

  if (response.status === 401 && options.token === undefined) {
    await handleUnauthorized(); // never returns
  }

  if (response.status === 204) return null as T;

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      response.status,
      data?.message ?? `Request failed (${response.status})`,
      data?.errors ?? {},
    );
  }

  return data as T;
}

/**
 * Token no longer valid: remove the cookie and go to /login.
 *
 * Cookies can only be changed in Server Actions and Route Handlers. When we
 * are rendering a Server Component, `delete` throws, so we send the browser
 * to the /session-expired route handler, which deletes the cookie there.
 */
async function handleUnauthorized(): Promise<never> {
  try {
    (await cookies()).delete(TOKEN_COOKIE);
  } catch {
    redirect("/session-expired");
  }
  redirect("/login");
}

/** Loads every page of a paginated list (for <select> options). */
export async function apiAll<T>(path: string, query: Options["query"] = {}): Promise<T[]> {
  const items: T[] = [];
  for (let page = 1; ; page++) {
    const result = await api<{ data: T[]; meta: { last_page: number } }>(path, {
      query: { ...query, per_page: 100, page },
    });
    items.push(...result.data);
    if (page >= result.meta.last_page) return items;
  }
}
