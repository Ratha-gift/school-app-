// Small presentational building blocks shared by all pages.
// Plain Tailwind classes, no UI library.

import Link from "next/link";
import type { ReactNode } from "react";
import type { IconType } from "react-icons";
import { LuArrowLeft, LuCircleAlert, LuCircleCheck, LuInbox } from "react-icons/lu";

// Reusable class strings
export const btnPrimary =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-60";
export const btnSecondary =
  "inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60";
export const btnDanger =
  "inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60";
export const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand focus:ring-2 focus:ring-brand/20";
export const linkClass = "font-medium text-brand hover:underline";

export function PageHeader({
  title,
  subtitle,
  actions,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** A react-icons component, e.g. LuUsers (pass the component, not <LuUsers />) */
  icon?: IconType;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        {Icon && (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand/10 text-brand">
            <Icon size={22} />
          </span>
        )}
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function CardTitle({ children, icon: Icon }: { children: ReactNode; icon?: IconType }) {
  return (
    <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
      {Icon && <Icon className="text-brand" size={20} />}
      {children}
    </h2>
  );
}

/** Colored message box. */
export function Alert({ type, children }: { type: "success" | "error"; children: ReactNode }) {
  const styles =
    type === "success"
      ? "border-green-200 bg-green-50 text-green-800"
      : "border-red-200 bg-red-50 text-red-700";
  const Icon = type === "success" ? LuCircleCheck : LuCircleAlert;
  return (
    <div
      role={type === "error" ? "alert" : "status"}
      className={`flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${styles}`}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

/**
 * Table inside a white card.
 * - The table scrolls horizontally on small screens.
 * - `footer` (e.g. <Pagination />) is shown at the bottom of the card. With a
 *   footer, the card grows to fill the page height, and the footer is
 *   "sticky": on long lists it stays visible at the bottom of the screen.
 */
export function Table({
  head,
  children,
  footer,
}: {
  head: ReactNode[];
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    // No overflow-hidden here: it would stop the footer from being sticky
    <div
      className={`rounded-lg border border-slate-200 bg-white shadow-sm ${footer ? "flex flex-1 flex-col" : ""}`}
    >
      <div className="flex-1 overflow-x-auto rounded-t-lg">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-100 text-left text-slate-600">
            <tr>
              {head.map((cell, i) => (
                <th key={i} className="whitespace-nowrap px-4 py-3 font-medium">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">{children}</tbody>
        </table>
      </div>
      {footer && (
        <div className="sticky bottom-0 rounded-b-lg border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
          {footer}
        </div>
      )}
    </div>
  );
}

export function Td({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <td className={`whitespace-nowrap px-4 py-3 ${className}`}>{children}</td>;
}

/** A single table row saying "nothing here". */
export function EmptyRow({ colSpan, text = "មិនមានទិន្នន័យ" }: { colSpan: number; text?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-slate-400">
        <LuInbox size={28} className="mx-auto mb-2" />
        {text}
      </td>
    </tr>
  );
}

export function Badge({ children, className = "bg-slate-100 text-slate-700" }: { children: ReactNode; className?: string }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{children}</span>;
}

export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800">
      <LuArrowLeft size={16} />
      {children}
    </Link>
  );
}

/** Label + input + error message under it. */
export function Field({
  label,
  error,
  children,
  hint,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-500">{hint}</span>}
      {error && <span className="mt-1 block text-sm text-red-600">{error}</span>}
    </label>
  );
}
