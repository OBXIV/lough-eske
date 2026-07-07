import { LogIn } from "lucide-react";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { signInDemoAction } from "@/lib/auth/actions";
import { getCurrentSession } from "@/lib/auth/session";
import { demoUsers, getDemoTenantById, isPilotDemoUser } from "@/lib/data/demo";
import { isProductionDeployment } from "@/lib/deployment/environment";
import { getDefaultRoute } from "@/lib/rbac/permissions";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect(getDefaultRoute(session.permissions));
  }

  const visibleUsers = demoUsers.filter((user) => !isPilotDemoUser(user) || !isProductionDeployment());

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-6">
      <Card className="w-full max-w-2xl p-6 shadow-card">
        <div className="mb-6">
          <p className="text-sm font-semibold text-accent">Brokerage Operating System</p>
          <h1 className="mt-2 text-2xl font-semibold text-text-primary">Staff login</h1>
          <p className="mt-2 text-sm text-text-secondary">Choose a workspace role or enter a demo email.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {visibleUsers.map((user) => (
            <form key={user.email} action={signInDemoAction}>
              <input name="email" type="hidden" value={user.email} />
              <button
                className="flex h-full w-full items-center justify-between gap-4 rounded-md border border-border bg-surface-muted p-4 text-left transition hover:border-accent hover:bg-accent/5"
                type="submit"
              >
                <span>
                  <span className="block text-sm font-semibold text-text-primary">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="mt-1 block text-xs text-text-secondary">{user.email}</span>
                  <span className="mt-3 flex items-center gap-2">
                    <Badge variant={user.role === "Platform Admin" ? "accent" : "default"}>{user.role}</Badge>
                    <span className="text-xs text-text-secondary">{getDemoTenantById(user.tenantId)?.name}</span>
                  </span>
                </span>
                <LogIn className="h-4 w-4 shrink-0 text-accent" aria-hidden="true" />
              </button>
            </form>
          ))}
        </div>
        <div className="mt-6 border-t border-border pt-6">
          <form className="space-y-4" action={signInDemoAction}>
            <div>
              <label className="block text-sm font-medium text-text-primary" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="demo.owner@obliox.io"
                className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-card"
              />
            </div>
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-card"
              type="submit"
            >
              Sign in
              <LogIn className="h-4 w-4" aria-hidden="true" />
            </button>
          </form>
        </div>
      </Card>
    </main>
  );
}
