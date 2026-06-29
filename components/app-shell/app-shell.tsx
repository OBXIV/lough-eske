import { Sidebar } from "@/components/app-shell/sidebar";
import { SessionProvider } from "@/components/app-shell/session-provider";
import { TopBar } from "@/components/app-shell/top-bar";
import { getTenantAccentStyle } from "@/lib/tenant/tenant-context";
import type { Tenant, UserSession } from "@/types/domain";

type AppShellProps = {
  session: UserSession;
  visibleTenants: Tenant[];
  children: React.ReactNode;
};

export function AppShell({ session, visibleTenants, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-background" style={getTenantAccentStyle(session.tenant)}>
      <SessionProvider session={session}>
        <Sidebar session={session} />
        <div className="min-w-0 flex-1">
          <TopBar session={session} visibleTenants={visibleTenants} />
          <main className="px-4 py-6 lg:px-8">{children}</main>
        </div>
      </SessionProvider>
    </div>
  );
}
