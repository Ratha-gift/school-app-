"use client";

// Client Component only because it needs the current URL (usePathname)
// to highlight the active menu item.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LuBookOpen,
  LuChartColumn,
  LuGraduationCap,
  LuLayoutDashboard,
  LuSchool,
  LuUsers,
} from "react-icons/lu";

// icon = the icon component itself (rendered below as <link.icon />)
const links = [
  { href: "/", label: "ផ្ទាំងគ្រប់គ្រង", icon: LuLayoutDashboard },
  { href: "/users", label: "អ្នកប្រើ", icon: LuUsers },
  { href: "/classes", label: "ថ្នាក់", icon: LuSchool },
  { href: "/students", label: "សិស្ស", icon: LuGraduationCap },
  { href: "/subjects", label: "មុខវិជ្ជា", icon: LuBookOpen },
  { href: "/reports", label: "របាយការណ៍", icon: LuChartColumn },
];

export function NavLinks() {
  const pathname = usePathname();

  // "/" must match exactly; the others also match their sub-pages.
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    // Mobile: one horizontal scrolling row. Desktop (md+): vertical list.
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:overflow-visible md:pb-0">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm ${
            isActive(link.href)
              ? "bg-brand text-white"
              : "text-slate-300 hover:bg-white/10 hover:text-white"
          }`}
        >
          <link.icon size={18} aria-hidden className="shrink-0" />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
