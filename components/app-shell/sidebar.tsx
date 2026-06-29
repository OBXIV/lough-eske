"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";

import { navItems } from "@/components/app-shell/nav";
import { Badge } from "@/components/ui/badge";
import { canAccess } from "@/lib/rbac/permissions";
import { cn } from "@/lib/utils";
import type { UserSession } from "@/types/domain";

type SidebarProps = {
  session: UserSession;
};

export function Sidebar({ session }: SidebarProps) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => canAccess(session.permissions, item.permission));
  const groups = Array.from(new Set(visibleItems.map((item) => item.group)));

  return (
    <aside className="flex min-h-screen w-72 shrink-0 flex-col bg-sidebar px-4 py-5 text-white max-lg:hidden">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="rounded-lg bg-white/10 p-2">
          <Building2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold">Brokerage OS</p>
          <p className="text-xs text-white/60">Lough Eske v0.1</p>
        </div>
      </div>
      <nav className="space-y-6" aria-label="Primary navigation">
        {groups.map((group) => (
          <div key={group}>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-normal text-white/40">{group}</p>
            <div className="space-y-1">
              {visibleItems
                .filter((item) => item.group === group)
                .map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-white/72 transition hover:bg-sidebar-hover hover:text-white",
                        isActive && "bg-white/10 text-white",
                      )}
                    >
                      <Icon className={cn("h-4 w-4", isActive && "text-accent")} aria-hidden />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto rounded-lg border border-white/10 bg-white/5 p-3">
        <p className="text-xs text-white/50">Signed in as</p>
        <p className="mt-1 text-sm font-semibold">{session.user.name}</p>
        <div className="mt-3">
          <Badge className="border-white/10 bg-white/10 text-white">{session.role}</Badge>
        </div>
      </div>
    </aside>
  );
}
