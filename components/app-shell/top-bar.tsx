import { ChevronDown, LogOut, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { signOutAction } from "@/lib/auth/actions";
import type { Tenant, UserSession } from "@/types/domain";

type TopBarProps = {
  session: UserSession;
  visibleTenants: Tenant[];
  environmentLabel: string;
};

export function TopBar({ session, visibleTenants, environmentLabel }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-surface/95 px-4 py-3 backdrop-blur lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-text-secondary">Workspace</p>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-text-primary">{session.tenant.name}</h2>
            <Badge variant={session.tenant.status === "demo" ? "accent" : "default"}>{session.tenant.status}</Badge>
            <Badge variant={environmentLabel === "Stage" ? "info" : "default"}>{environmentLabel}</Badge>
          </div>
        </div>
        <div className="hidden min-w-80 items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-2 text-sm text-text-secondary lg:flex">
          <Search className="h-4 w-4" aria-hidden="true" />
          Search agents, recruits, transactions
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary shadow-card">
            <span>{visibleTenants.length > 1 ? `${visibleTenants.length} tenants` : "Tenant"}</span>
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
          <form action={signOutAction}>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary shadow-card"
              type="submit"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Sign out</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
