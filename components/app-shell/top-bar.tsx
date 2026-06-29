import { ChevronDown, LogOut, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { signOutAction } from "@/lib/auth/actions";
import type { Tenant, UserSession } from "@/types/domain";

type TopBarProps = {
  session: UserSession;
  visibleTenants: Tenant[];
};

export function TopBar({ session, visibleTenants }: TopBarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:px-8">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-normal text-text-secondary">Current tenant</p>
          <div className="mt-1 flex items-center gap-2">
            <h2 className="text-sm font-semibold text-text-primary">{session.tenant.name}</h2>
            <Badge variant={session.tenant.status === "demo" ? "accent" : "default"}>{session.tenant.status}</Badge>
          </div>
        </div>
        <div className="hidden min-w-80 items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-secondary md:flex">
          <Search className="h-4 w-4" aria-hidden="true" />
          Search agents, recruits, transactions
        </div>
        <div className="flex items-center gap-2">
          <button className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary">
            {visibleTenants.length > 1 ? `${visibleTenants.length} tenants` : "Tenant switcher"}
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          </button>
          <form action={signOutAction}>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary"
              type="submit"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
