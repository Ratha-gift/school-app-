"use client";

// Client-only pieces for forms that use Server Actions.

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import type { IconType } from "react-icons";
import { LuLoaderCircle, LuTrash2 } from "react-icons/lu";
import { initialFormState, type FormState } from "@/lib/form-state";
import { Alert, btnDanger, btnPrimary } from "./ui";

/**
 * Submit button that disables itself (and shows a spinner) while the
 * form's Server Action is running. Must be rendered inside a <form>.
 */
export function SubmitButton({
  children,
  className = btnPrimary,
  icon: Icon,
}: {
  children: React.ReactNode;
  className?: string;
  /** Icon shown before the text (replaced by a spinner while pending). */
  icon?: IconType;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? <LuLoaderCircle size={16} className="animate-spin" /> : Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

/** Green or red message from a FormState (nothing when idle). */
export function FormMessage({ state }: { state: FormState }) {
  if (state.status === "idle" || !state.message) return null;
  return <Alert type={state.status === "success" ? "success" : "error"}>{state.message}</Alert>;
}

type Action = (prev: FormState, formData: FormData) => Promise<FormState>;

/**
 * Delete button with a browser confirm() dialog.
 * Errors from Laravel (e.g. 409 "class still has students") are shown in
 * a red alert next to the button.
 */
export function DeleteButton({
  action,
  confirmText,
  label = "លុប",
  icon = LuTrash2,
}: {
  action: Action;
  confirmText: string;
  label?: string;
  icon?: IconType;
}) {
  const [state, formAction] = useActionState(action, initialFormState);

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!confirm(confirmText)) event.preventDefault();
      }}
      className="space-y-3"
    >
      <FormMessage state={state} />
      <SubmitButton className={btnDanger} icon={icon}>
        {label}
      </SubmitButton>
    </form>
  );
}
