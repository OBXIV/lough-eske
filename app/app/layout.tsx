import { AppShell } from "@/components/app-shell/app-shell";
import { requireSession } from "@/lib/auth/session";
import { getTenantEntitlements, getVisibleTenantsForSession } from "@/lib/data/app-data";

export default async function ProtectedAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();
  const [visibleTenants, entitlements] = await Promise.all([
    getVisibleTenantsForSession(session),
    getTenantEntitlements(session),
  ]);

  return <AppShell session={session} entitlements={entitlements} visibleTenants={visibleTenants}>{children}</AppShell>;
}
