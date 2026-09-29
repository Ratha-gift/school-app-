import "server-only"; // helpers for Server Actions only

import { ApiError } from "./api";

import type { FormState } from "./form-state";

export type { FormState } from "./form-state";

/**
 * Converts an error thrown inside a Server Action into a FormState.
 *
 * Only ApiError is converted. Anything else is re-thrown — this matters
 * because Next.js `redirect()` works by throwing a special error that must
 * reach Next.js.
 */
export function errorState(error: unknown, formData?: FormData): FormState {
  if (!(error instanceof ApiError)) throw error;
  const values = formValues(formData);

  if (error.status === 422) {
    const errors: Record<string, string> = {};
    for (const [field, messages] of Object.entries(error.errors)) {
      errors[field] = messages[0];
    }
    return { status: "error", message: "សូមពិនិត្យព័ត៌មានដែលបានបញ្ចូល", errors, values };
  }

  if (error.status === 0) {
    return { status: "error", message: error.message, values }; // can't reach server
  }

  // 403 / 404 / 409: Laravel's message explains why (e.g. class still has students)
  if ([403, 404, 409].includes(error.status)) {
    return { status: "error", message: error.message, values };
  }

  return { status: "error", message: "មានបញ្ហាកើតឡើង សូមព្យាយាមម្ដងទៀត", values };
}

/** Success message + the saved values. */
export function successState(message: string, formData?: FormData): FormState {
  return { status: "success", message, values: formValues(formData) };
}

/**
 * FormData -> plain object of strings. Skips passwords (never send them
 * back to the browser) and Next.js internal fields (they start with "$").
 */
function formValues(formData?: FormData): Record<string, string> | undefined {
  if (!formData) return undefined;
  const values: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (typeof value === "string" && !key.startsWith("$") && !key.includes("password")) {
      values[key] = value;
    }
  }
  return values;
}

/** Reads a text field; empty -> null (Laravel "nullable" fields). */
export function textOrNull(formData: FormData, name: string): string | null {
  const value = String(formData.get(name) ?? "").trim();
  return value === "" ? null : value;
}

/** Reads a number field (e.g. a <select> of ids); empty -> null. */
export function numberOrNull(formData: FormData, name: string): number | null {
  const value = textOrNull(formData, name);
  return value === null ? null : Number(value);
}
