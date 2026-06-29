import { BarChart3, CircleDollarSign, Funnel, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getAgents, getRecruits, getTransactions } from "@/lib/data/app-data";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage() {
  const session = await requirePermission("view_reports");
  const [agents, recruits, transactions] = await Promise.all([
    getAgents(session),
    getRecruits(session),
    getTransactions(session),
  ]);

  const totalGci = transactions.reduce((total, transaction) => total + transaction.estimatedGci, 0);
  const totalProduction = agents.reduce((total, agent) => total + agent.productionYtd, 0);
  const reportCards = [
    { title: "Recruiting funnel", value: `${recruits.length} records`, cadence: "Live pipeline", icon: Funnel },
    { title: "Agent production", value: formatCurrency(totalProduction), cadence: "Year to date", icon: Users },
    { title: "Transaction volume", value: `${transactions.length} active`, cadence: "Open deals", icon: BarChart3 },
    { title: "GCI forecast", value: formatCurrency(totalGci), cadence: "Estimated", icon: CircleDollarSign },
  ];

  return (
    <>
      <PageHeader
        title="Reports"
        subtitle="Executive reporting for recruiting, production, transaction volume, and GCI forecast."
        eyebrow="Intelligence"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="w-fit rounded-md bg-surface-muted p-2 text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <Badge>{card.cadence}</Badge>
              </div>
              <h2 className="text-base font-semibold text-text-primary">{card.title}</h2>
              <p className="mt-3 text-2xl font-semibold">{card.value}</p>
              <p className="mt-2 text-sm text-text-secondary">Pulled from tenant-scoped operating data.</p>
            </Card>
          );
        })}
      </section>
    </>
  );
}
