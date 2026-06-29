"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { navItems } from "@/components/app-shell/nav";
import { canAccess } from "@/lib/rbac/permissions";
import { cn } from "@/lib/utils";
import type { UserSession } from "@/types/domain";

type MobileNavProps = {
  session: UserSession;
};

export function MobileNav({ session }: MobileNavProps) {
  const pathname = usePathname();
  const visibleItems = navItems.filter((item) => canAccess(session.permissions, item.permission));

  return (
    <nav
      aria-label="Mobile primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/95 px-2 py-2 shadow-card backdrop-blur lg:hidden"
    >
      <div className="flex gap-1 overflow-x-auto">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex min-w-[4.75rem] flex-col items-center gap-1 rounded-md px-2 py-2 text-[11px] font-semibold text-text-secondary transition hover:bg-sidebar-hover hover:text-text-primary",
                isActive && "bg-accent/10 text-accent",
              )}
            >
              <Icon className="h-4 w-4" aria-hidden />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
