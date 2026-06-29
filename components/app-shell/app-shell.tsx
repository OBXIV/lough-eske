import { Sidebar } from "@/components/app-shell/sidebar";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { SessionProvider } from "@/components/app-shell/session-provider";
import { TopBar } from "@/components/app-shell/top-bar";
import { getDeploymentEnvironmentLabel } from "@/lib/deployment/environment";
import { getTenantAccentStyle } from "@/lib/tenant/tenant-context";
import type { Tenant, UserSession } from "@/types/domain";

type AppShellProps = {
  session: UserSession;
  visibleTenants: Tenant[];
  children: React.ReactNode;
};

export function AppShell({ session, visibleTenants, children }: AppShellProps) {
  const environmentLabel = getDeploymentEnvironmentLabel();

  return (
    <div className="min-h-screen bg-background" style={getTenantAccentStyle(session.tenant)}>
      <SessionProvider session={session}>
        <div className="flex min-h-screen">
          <Sidebar session={session} />
          <div className="min-w-0 flex-1 pb-24 lg:pb-0">
            <TopBar session={session} visibleTenants={visibleTenants} environmentLabel={environmentLabel} />
            <main className="mx-auto w-full max-w-[1480px] px-4 py-5 lg:px-6 lg:py-6">{children}</main>
          </div>
          <MobileNav session={session} />
        </div>
      </SessionProvider>
    </div>
  );
}
