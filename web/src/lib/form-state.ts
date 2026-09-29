// The FormState type is shared by Server Actions and client forms.
// Kept in its own file so client components don't import server code.

/** What a Server Action returns to its form (via useActionState). */
export type FormState = {
  status: "idle" | "success" | "error";
  message?: string;
  /** Field name -> first error message (from a Laravel 422 response). */
  errors?: Record<string, string>;
  /**
   * The submitted values. React 19 resets a form after its action runs, so
   * forms use these as `defaultValue` to keep what the user typed.
   */
  values?: Record<string, string>;
};

export const initialFormState: FormState = { status: "idle" };
