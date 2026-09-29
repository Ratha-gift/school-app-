import { LuLogOut, LuSchool, LuUserCog } from "react-icons/lu";
import { logout } from "@/lib/auth-actions";
import { NavLinks } from "./nav-links";

/**
 * Navy sidebar on desktop; on mobile it becomes a top bar with the menu
 * as a horizontally scrolling row.
 */
export function Sidebar({ adminName }: { adminName: string }) {
  return (
    <aside className="bg-slate-950 text-white md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col">
      <div className="flex items-center justify-between px-5 py-4 md:py-6">
        <div className="flex items-center gap-2 text-lg font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
            <LuSchool size={18} />
          </span>
          School Admin
        </div>
        {/* Mobile only: logout in the top bar */}
        <form action={logout} className="md:hidden">
          <button className="flex items-center gap-1 text-sm text-slate-300 hover:text-white">
            <LuLogOut size={16} />
            ចាកចេញ
          </button>
        </form>
      </div>

      <NavLinks />

      {/* Desktop only: admin name + logout at the bottom */}
      <div className="mt-auto hidden border-t border-white/10 p-4 md:block">
        <div className="mb-3 flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10">
            <LuUserCog size={18} />
          </span>
          <div className="min-w-0">
            <p className="text-xs text-slate-400">ចូលជា</p>
            <p className="truncate font-medium">{adminName}</p>
          </div>
        </div>
        <form action={logout}>
          <button className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 px-3 py-2 text-sm text-slate-200 hover:bg-white/10">
            <LuLogOut size={16} />
            ចាកចេញ
          </button>
        </form>
      </div>
    </aside>
  );
}
