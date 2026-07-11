"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";

import { navItems } from "@/components/app-shell/nav";
import { Badge } from "@/components/ui/badge";
import { hasFeature } from "@/lib/entitlements/catalog";
import { canAccess } from "@/lib/rbac/permissions";
import { cn } from "@/lib/utils";
import type { TenantEntitlements, UserSession } from "@/types/domain";

type SidebarProps = {
  session: UserSession;
  entitlements: TenantEntitlements;
};

export function Sidebar({ session, entitlements }: SidebarProps) {
  const pathname = usePathname();
  const visibleItems = navItems.filter(
    (item) => canAccess(session.permissions, item.permission) && (!item.feature || hasFeature(entitlements, item.feature)),
  );
  const groups = Array.from(new Set(visibleItems.map((item) => item.group)));

  return (
    <aside className="flex min-h-screen w-72 shrink-0 flex-col border-r border-border bg-sidebar px-3 py-4 text-text-primary max-lg:hidden">
      <div className="mb-7 flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-3 shadow-card">
        <div className="rounded-md bg-accent p-2 text-white">
          <Building2 className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold">Brokerage OS</p>
          <p className="text-xs text-text-secondary">Lough Eske</p>
        </div>
      </div>
      <nav className="space-y-6" aria-label="Primary navigation">
        {groups.map((group) => (
          <div key={group}>
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-normal text-text-secondary">{group}</p>
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
                        "flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-text-secondary transition hover:bg-sidebar-hover hover:text-text-primary",
                        isActive && "bg-accent/10 text-accent",
                      )}
                    >
                      <Icon className="h-4 w-4" aria-hidden />
                      {item.label}
                    </Link>
                  );
                })}
            </div>
          </div>
        ))}
      </nav>
      <div className="mt-auto rounded-lg border border-border bg-surface p-3 shadow-card">
        <p className="text-xs text-text-secondary">Signed in as</p>
        <p className="mt-1 truncate text-sm font-semibold">{session.user.name}</p>
        <div className="mt-3">
          <Badge variant="accent">{session.role}</Badge>
        </div>
      </div>
    </aside>
  );
}
