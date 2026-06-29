import { LogIn } from "lucide-react";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getCurrentSession } from "@/lib/auth/session";
import { signInDemoAction } from "@/lib/auth/actions";
import { demoUsers } from "@/lib/data/demo";
import { getDefaultRoute } from "@/lib/rbac/permissions";

export default async function LoginPage() {
  const session = await getCurrentSession();

  if (session) {
    redirect(getDefaultRoute(session.permissions));
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-10">
      <Card className="w-full max-w-2xl p-6">
        <div className="mb-6">
          <p className="text-sm font-semibold text-accent">Brokerage Operating System</p>
          <h1 className="mt-2 text-2xl font-bold text-text-primary">Staff login</h1>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {demoUsers.map((user) => (
            <form key={user.email} action={signInDemoAction}>
              <input name="email" type="hidden" value={user.email} />
              <button
                className="flex h-full w-full items-center justify-between gap-4 rounded-lg border border-border bg-background p-4 text-left transition hover:border-accent hover:bg-accent/5"
                type="submit"
              >
                <span>
                  <span className="block text-sm font-semibold text-text-primary">
                    {user.firstName} {user.lastName}
                  </span>
                  <span className="mt-1 block text-xs text-text-secondary">{user.email}</span>
                  <span className="mt-3 block">
                    <Badge variant={user.role === "Platform Admin" ? "accent" : "default"}>{user.role}</Badge>
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
                className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              />
            </div>
            <button
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white"
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
