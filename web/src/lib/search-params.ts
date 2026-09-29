// Helpers for the `searchParams` prop of pages (?page=2&search=...).

export type SearchParams = Record<string, string | string[] | undefined>;

/** Returns one query value as a string ("" if missing). */
export function getParam(params: SearchParams, key: string): string {
  const value = params[key];
  return (Array.isArray(value) ? value[0] : value) ?? "";
}

/** Builds "?a=1&b=2", skipping empty values. */
export function buildQuery(values: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `?${text}` : "";
}
