"use client";

// Filters that update the list while you type / choose — no "search" button.
//
// How it works:
// 1. Every filter lives in the URL (?search=...&school_class_id=...), so the
//    page is still a Server Component that reads `searchParams`, and links
//    / refresh / back button all keep the filters.
// 2. When a filter changes we call router.replace() with the new URL inside
//    startTransition(). Next.js re-renders the page on the server, while
//    React keeps showing the current results (dimmed) until the new ones
//    are ready — no blank page or skeleton flash.
// 3. Typing is "debounced": we wait until the user stops typing for 300ms
//    before searching, instead of sending a request for every key.

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition, type ReactNode } from "react";
import { LuLoaderCircle, LuSearch, LuX } from "react-icons/lu";
import { inputClass } from "./ui";

const DEBOUNCE_MS = 300;

export type FilterField =
  | { type: "search"; name: string; placeholder?: string }
  | {
      type: "select";
      name: string;
      label?: string;
      options: { value: string; label: string }[];
      /** First option with value "" (e.g. "គ្រប់ថ្នាក់"). */
      emptyLabel?: string;
      /** Value used when the URL doesn't have this filter yet. */
      defaultValue?: string;
    }
  | { type: "date"; name: string; label?: string; defaultValue?: string };

export function LiveFilters({ fields, children }: { fields: FilterField[]; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // isPending = true while Next.js loads the page for the new URL
  const [isPending, startTransition] = useTransition();

  /** Put one filter in the URL (empty value = remove it). */
  function setParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(name, value);
    else params.delete(name);
    params.delete("page"); // new filter -> start again from page 1

    const query = params.toString();
    startTransition(() => {
      // replace (not push): typing shouldn't add 10 entries to the back button history
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-end gap-3">
        {fields.map((field) => {
          const fallback = field.type === "search" ? "" : field.defaultValue ?? "";
          const urlValue = searchParams.get(field.name) ?? fallback;
          const onChange = (value: string) => setParam(field.name, value);

          if (field.type === "search") {
            return (
              <SearchField
                key={field.name}
                placeholder={field.placeholder}
                urlValue={urlValue}
                isPending={isPending}
                onSearch={onChange}
              />
            );
          }
          return (
            <InstantField key={field.name} field={field} urlValue={urlValue} onChange={onChange} />
          );
        })}

        {isPending && (
          <span className="flex items-center gap-1 pb-2 text-sm text-slate-500">
            <LuLoaderCircle size={16} className="animate-spin" />
            កំពុងផ្ទុក...
          </span>
        )}
      </div>

      {/* The results: dimmed while the new ones load */}
      <div aria-busy={isPending} className={`flex flex-1 flex-col transition-opacity ${isPending ? "pointer-events-none opacity-50" : ""}`}>
        {children}
      </div>
    </>
  );
}

/**
 * Local state that starts from the URL and follows it when the URL changes
 * from elsewhere (back button, a tab link...). While typing, the local value
 * is ahead of the URL, which is fine.
 */
function useUrlSyncedState(urlValue: string, same: (local: string, url: string) => boolean = (a, b) => a === b) {
  const [value, setValue] = useState(urlValue);
  const [lastUrlValue, setLastUrlValue] = useState(urlValue);

  // "Adjusting state when a prop changes" (React docs pattern, no useEffect)
  if (urlValue !== lastUrlValue) {
    setLastUrlValue(urlValue);
    if (!same(value, urlValue)) setValue(urlValue);
  }
  return [value, setValue] as const;
}

/** Text search: waits until typing stops, Enter searches immediately. */
function SearchField({
  placeholder = "ស្វែងរក...",
  urlValue,
  isPending,
  onSearch,
}: {
  placeholder?: string;
  urlValue: string;
  isPending: boolean;
  onSearch: (value: string) => void;
}) {
  // Compare trimmed, so a trailing space the user is typing isn't removed
  const [value, setValue] = useUrlSyncedState(urlValue, (local, url) => local.trim() === url);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Cancel a waiting search if the page is left
  useEffect(() => () => clearTimeout(timer.current), []);

  function search(text: string, delay: number) {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => onSearch(text.trim()), delay);
  }

  return (
    // Icon, input and clear button side by side (flex, no absolute positioning)
    <div className="flex w-full max-w-sm items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20">
      {isPending ? (
        <LuLoaderCircle size={16} className="shrink-0 animate-spin text-brand" />
      ) : (
        <LuSearch size={16} className="shrink-0 text-slate-400" />
      )}
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        aria-label={placeholder}
        onChange={(e) => {
          setValue(e.target.value);
          search(e.target.value, DEBOUNCE_MS);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") search(value, 0); // don't wait
          if (e.key === "Escape" && value) {
            setValue("");
            search("", 0);
          }
        }}
        className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none"
      />
      {value && (
        <button
          type="button"
          aria-label="សម្អាត"
          onClick={() => {
            setValue("");
            search("", 0);
          }}
          className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
        >
          <LuX size={16} />
        </button>
      )}
    </div>
  );
}

/** <select> and date inputs apply as soon as they change. */
function InstantField({
  field,
  urlValue,
  onChange,
}: {
  field: Exclude<FilterField, { type: "search" }>;
  urlValue: string;
  onChange: (value: string) => void;
}) {
  const [value, setValue] = useUrlSyncedState(urlValue);

  const input =
    field.type === "select" ? (
      <select
        value={value}
        aria-label={field.label ?? field.emptyLabel}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        className={`${inputClass} w-auto min-w-44`}
      >
        {field.emptyLabel !== undefined && <option value="">{field.emptyLabel}</option>}
        {field.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    ) : (
      <input
        type="date"
        value={value}
        aria-label={field.label}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value);
        }}
        className={`${inputClass} w-auto`}
      />
    );

  if (!field.label) return input;
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{field.label}</span>
      {input}
    </label>
  );
}
