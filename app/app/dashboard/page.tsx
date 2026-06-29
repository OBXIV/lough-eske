import { Activity, BriefcaseBusiness, ClipboardList, TrendingUp, UserPlus } from "lucide-react";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { activityLogs, recruits, tasks, transactions } from "@/lib/data/demo";
import { requirePermission } from "@/lib/auth/session";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  await requirePermission("view_dashboard");

  const activeRecruits = recruits.filter((recruit) => recruit.stage !== "Joined" && recruit.stage !== "Lost").length;
  const joinedAgents = recruits.filter((recruit) => recruit.stage === "Joined").length;
  const activeTransactions = transactions.filter((transaction) => transaction.status === "active").length;
  const gciPipeline = transactions.reduce((total, transaction) => total + transaction.estimatedGci, 0);
  const overdueTasks = tasks.filter((task) => task.status !== "complete" && new Date(task.dueDate) < new Date("2026-06-28")).length;

  return (
    <>
      <PageHeader
        title="Broker dashboard"
        subtitle="Tenant-specific executive snapshot for recruiting, transactions, GCI pipeline, tasks, and recent activity."
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Active Recruits" value={String(activeRecruits)} delta="2 hot prospects need follow-up" icon={UserPlus} />
        <KpiCard label="Agents Joined" value={String(joinedAgents)} delta="This month from recruiting" icon={TrendingUp} />
        <KpiCard label="Transactions" value={String(activeTransactions)} delta="Active pipeline records" icon={BriefcaseBusiness} />
        <KpiCard label="GCI Pipeline" value={formatCurrency(gciPipeline)} delta="Estimated from active deals" icon={Activity} />
        <KpiCard label="Overdue Tasks" value={String(overdueTasks)} delta="Tenant-scoped task queue" icon={ClipboardList} />
      </section>
      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_0.8fr]">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-text-primary">Recruiting momentum</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {["Identified", "Engaged", "Offer Pending"].map((stage) => (
              <div key={stage} className="rounded-lg border border-border bg-background p-4">
                <p className="text-sm text-text-secondary">{stage}</p>
                <p className="mt-2 text-2xl font-bold">{recruits.filter((recruit) => recruit.stage === stage).length}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card className="p-5">
          <h2 className="text-base font-semibold text-text-primary">Recent activity</h2>
          <div className="mt-4 space-y-4">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex gap-3 border-b border-border pb-4 last:border-0 last:pb-0">
                <Badge variant="info">{log.entityType}</Badge>
                <div>
                  <p className="text-sm font-medium text-text-primary">{log.action}</p>
                  <p className="mt-1 text-xs text-text-secondary">
                    {log.actor} - {formatDate(log.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>
    </>
  );
}
