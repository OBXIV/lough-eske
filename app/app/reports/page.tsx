import { BarChart3, CircleDollarSign, Funnel, Users } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { agents, recruits, transactions } from "@/lib/data/demo";
import { formatCurrency } from "@/lib/utils";

export default async function ReportsPage() {
  await requirePermission("view_reports");

  const totalGci = transactions.reduce((total, transaction) => total + transaction.estimatedGci, 0);
  const totalProduction = agents.reduce((total, agent) => total + agent.productionYtd, 0);
  const reportCards = [
    { title: "Recruiting funnel", value: `${recruits.length} records`, icon: Funnel },
    { title: "Agent production snapshot", value: formatCurrency(totalProduction), icon: Users },
    { title: "Transaction volume snapshot", value: `${transactions.length} active`, icon: BarChart3 },
    { title: "GCI forecast", value: formatCurrency(totalGci), icon: CircleDollarSign },
  ];

  return (
    <>
      <PageHeader title="Reports" subtitle="Executive reporting shell for recruiting, production, transaction volume, and GCI forecast." />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {reportCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="p-5">
              <div className="mb-5 rounded-md bg-accent/10 p-2 text-accent w-fit">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h2 className="text-base font-semibold text-text-primary">{card.title}</h2>
              <p className="mt-3 text-2xl font-bold">{card.value}</p>
              <p className="mt-2 text-sm text-text-secondary">Query-driven report area for v0.1 demo.</p>
            </Card>
          );
        })}
      </section>
    </>
  );
}
