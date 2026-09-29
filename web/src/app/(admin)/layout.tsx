// Layout for every page except /login.
// The (admin) folder name is in parentheses, so it doesn't appear in URLs.

import type { ReactNode } from "react";
import { Sidebar } from "@/components/sidebar";
import { api } from "@/lib/api";
import type { User } from "@/lib/types";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // Also verifies the token: api() sends us to /login on 401.
  const me = await api<User>("/me");

  return (
    <div className="min-h-screen md:flex">
      <Sidebar adminName={me.name} />
      {/* flex-col: lets a page's table card grow to the bottom of the screen */}
      <main className="flex min-w-0 flex-1 flex-col p-4 md:ml-64 md:p-8">{children}</main>
    </div>
  );
}
