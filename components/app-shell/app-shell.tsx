import { Sidebar } from "@/components/app-shell/sidebar";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { SessionProvider } from "@/components/app-shell/session-provider";
import { TopBar } from "@/components/app-shell/top-bar";
import { getDeploymentEnvironmentLabel } from "@/lib/deployment/environment";
import { getTenantAccentStyle } from "@/lib/tenant/tenant-context";
import type { Tenant, TenantEntitlements, UserSession } from "@/types/domain";

type AppShellProps = {
  session: UserSession;
  entitlements: TenantEntitlements;
  visibleTenants: Tenant[];
  children: React.ReactNode;
};

export function AppShell({ session, entitlements, visibleTenants, children }: AppShellProps) {
  const environmentLabel = getDeploymentEnvironmentLabel();

  return (
    <div className="min-h-screen bg-background" style={getTenantAccentStyle(session.tenant)}>
      <SessionProvider session={session}>
        <div className="flex min-h-screen">
          <div className="print:hidden">
            <Sidebar session={session} entitlements={entitlements} />
          </div>
          <div className="min-w-0 flex-1 pb-24 lg:pb-0 print:pb-0">
            <div className="print:hidden">
              <TopBar session={session} entitlements={entitlements} visibleTenants={visibleTenants} environmentLabel={environmentLabel} />
            </div>
            <main className="mx-auto w-full max-w-[1480px] px-4 py-5 lg:px-6 lg:py-6 print:max-w-none print:p-0">{children}</main>
          </div>
          <div className="print:hidden">
            <MobileNav session={session} entitlements={entitlements} />
          </div>
        </div>
      </SessionProvider>
    </div>
  );
}
