import { redirect } from "next/navigation";

import { requireSession } from "@/lib/auth/session";
import { getDefaultRoute } from "@/lib/rbac/permissions";

export default async function AppIndexPage() {
  const session = await requireSession();

  redirect(getDefaultRoute(session.permissions));
}
