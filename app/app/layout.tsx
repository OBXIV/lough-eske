import { AppShell } from "@/components/app-shell/app-shell";
import { requireSession } from "@/lib/auth/session";
import { getVisibleTenantsForSession } from "@/lib/data/app-data";

export default async function ProtectedAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();
  const visibleTenants = await getVisibleTenantsForSession(session);

  return <AppShell session={session} visibleTenants={visibleTenants}>{children}</AppShell>;
}
