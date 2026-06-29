import { ArrowRight, Building2, ShieldCheck, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { signInDemoAction } from "@/lib/auth/actions";
import { demoTenant } from "@/lib/data/demo";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-sm font-medium text-text-secondary">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              SaaS-first brokerage foundation
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-normal text-text-primary sm:text-5xl">
              Brokerage Operating System
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-text-secondary">
              Executive visibility for recruiting, retention, agent performance, transactions, and staff accountability across multiple tenants.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <form action={signInDemoAction}>
                <input name="email" type="hidden" value="demo.owner@obliox.io" />
                <button
                  className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-card"
                  type="submit"
                >
                  Enter demo tenant
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
              <form action={signInDemoAction}>
                <input name="email" type="hidden" value="demo.agent@obliox.io" />
                <button
                  className="inline-flex items-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary shadow-card"
                  type="submit"
                >
                  Agent portal
                </button>
              </form>
            </div>
          </div>
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
              <div>
                <p className="text-sm font-medium text-text-secondary">Current demo tenant</p>
                <h2 className="mt-1 text-2xl font-semibold text-text-primary">{demoTenant.name}</h2>
              </div>
              <div className="rounded-md bg-accent/10 p-3 text-accent">
                <Building2 className="h-6 w-6" aria-hidden="true" />
              </div>
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-sm text-text-secondary">Agents</dt>
                <dd className="mt-1 text-2xl font-bold">{demoTenant.metrics.agents}</dd>
              </div>
              <div>
                <dt className="text-sm text-text-secondary">Recruits</dt>
                <dd className="mt-1 text-2xl font-bold">{demoTenant.metrics.recruits}</dd>
              </div>
              <div>
                <dt className="text-sm text-text-secondary">Transactions</dt>
                <dd className="mt-1 text-2xl font-bold">{demoTenant.metrics.transactions}</dd>
              </div>
            </dl>
            <div className="mt-6 rounded-md border border-border bg-background p-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-accent" aria-hidden="true" />
                <p className="text-sm font-medium">Demo users and Supabase auth are represented in the schema, with credentials kept out of code.</p>
              </div>
            </div>
          </Card>
        </div>
      </section>
    </main>
  );
}
