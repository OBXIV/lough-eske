import { AppShell } from "@/components/app-shell/app-shell";
import { requireSession } from "@/lib/auth/session";

export default async function ProtectedAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await requireSession();

  return <AppShell session={session}>{children}</AppShell>;
}
