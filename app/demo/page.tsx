import { ArrowRight, Building2, ShieldCheck, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { signInDemoAction } from "@/lib/auth/actions";
import { demoTenant } from "@/lib/data/demo";

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-background px-4 py-6">
      <section className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <Card className="flex flex-col justify-between p-6 lg:p-8">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-md border border-border bg-surface-muted px-3 py-1 text-sm font-medium text-text-secondary">
              <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
              SaaS-first brokerage foundation
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-normal text-text-primary sm:text-4xl">
              Brokerage Operating System
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary">
              Executive visibility for recruiting, retention, agent performance, transactions, and staff accountability across multiple tenants.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <form action={signInDemoAction}>
                <input name="email" type="hidden" value="demo.owner@obliox.io" />
                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-semibold text-white shadow-card"
                  type="submit"
                >
                  Broker workspace
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
              </form>
              <form action={signInDemoAction}>
                <input name="email" type="hidden" value="demo.agent@obliox.io" />
                <button
                  className="inline-flex w-full items-center justify-center rounded-md border border-border bg-surface px-4 py-2.5 text-sm font-semibold text-text-primary shadow-card"
                  type="submit"
                >
                  Agent portal
                </button>
              </form>
            </div>
          </div>
          <div className="mt-8 rounded-md border border-border bg-surface-muted p-4">
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-accent" aria-hidden="true" />
              <p className="text-sm font-medium">Demo users are represented in Supabase-backed tenant data.</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 lg:p-6">
          <div className="flex items-start justify-between gap-4 border-b border-border pb-5">
            <div>
              <p className="text-sm font-medium text-text-secondary">Demo workspace</p>
              <h2 className="mt-1 text-2xl font-semibold text-text-primary">{demoTenant.name}</h2>
            </div>
            <div className="rounded-md bg-accent/10 p-3 text-accent">
              <Building2 className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>
          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              ["Agents", demoTenant.metrics.agents],
              ["Recruits", demoTenant.metrics.recruits],
              ["Transactions", demoTenant.metrics.transactions],
            ].map(([label, value]) => (
              <div key={label} className="rounded-md border border-border bg-surface-muted p-4">
                <dt className="text-sm text-text-secondary">{label}</dt>
                <dd className="mt-1 text-2xl font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 space-y-3">
            {[
              ["Recruiting", "Offer Pending", demoTenant.metrics.recruits],
              ["Transactions", "Active", demoTenant.metrics.transactions],
              ["Agent roster", "Monitored", demoTenant.metrics.agents],
            ].map(([label, status, value]) => (
              <div key={label} className="flex items-center justify-between rounded-md border border-border px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-text-primary">{label}</p>
                  <p className="mt-1 text-xs text-text-secondary">{value} tenant records</p>
                </div>
                <Badge variant={label === "Recruiting" ? "warning" : "accent"}>{status}</Badge>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </main>
  );
}
