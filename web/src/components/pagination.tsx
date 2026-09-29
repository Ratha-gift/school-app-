import Link from "next/link";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import { buildQuery } from "@/lib/search-params";
import type { Paginated } from "@/lib/types";
import { btnSecondary } from "./ui";

/**
 * "បង្ហាញ 1–15 នៃ 40" + previous/next links.
 * Used as the `footer` of a <Table>.
 * `params` are the current filters, kept when changing page.
 */
export function Pagination({
  meta,
  path,
  params,
}: {
  meta: Paginated<unknown>["meta"];
  path: string;
  params: Record<string, string>;
}) {
  const link = (page: number) => path + buildQuery({ ...params, page: page > 1 ? page : undefined });
  const disabled = "pointer-events-none opacity-40";

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
      <span>
        បង្ហាញ {meta.from ?? 0}–{meta.to ?? 0} នៃ {meta.total}
      </span>
      <div className="flex items-center gap-2">
        <Link
          href={link(meta.current_page - 1)}
          className={`${btnSecondary} ${meta.current_page <= 1 ? disabled : ""}`}
          aria-disabled={meta.current_page <= 1}
        >
          <LuChevronLeft size={16} />
          មុន
        </Link>
        <span>
          {meta.current_page} / {meta.last_page}
        </span>
        <Link
          href={link(meta.current_page + 1)}
          className={`${btnSecondary} ${meta.current_page >= meta.last_page ? disabled : ""}`}
          aria-disabled={meta.current_page >= meta.last_page}
        >
          បន្ទាប់
          <LuChevronRight size={16} />
        </Link>
      </div>
    </div>
  );
}
