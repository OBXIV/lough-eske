import { Activity, BriefcaseBusiness, ClipboardList, TrendingUp, UserPlus } from "lucide-react";

import { KpiCard } from "@/components/dashboard/kpi-card";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getActivityLogs, getRecruits, getTasks, getTransactions } from "@/lib/data/app-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function DashboardPage() {
  const session = await requirePermission("view_dashboard");
  const [activityLogs, recruits, tasks, transactions] = await Promise.all([
    getActivityLogs(session),
    getRecruits(session),
    getTasks(session),
    getTransactions(session),
  ]);

  const activeRecruits = recruits.filter((recruit) => recruit.stage !== "Joined" && recruit.stage !== "Lost").length;
  const joinedAgents = recruits.filter((recruit) => recruit.stage === "Joined").length;
  const activeTransactions = transactions.filter((transaction) => transaction.status === "active").length;
  const gciPipeline = transactions.reduce((total, transaction) => total + transaction.estimatedGci, 0);
  const overdueTasks = tasks.filter((task) => task.status !== "complete" && new Date(task.dueDate) < new Date()).length;
  const recruitingStages = ["Identified", "Contacted", "Engaged", "Offer Pending"] as const;

  return (
    <>
      <PageHeader
        title="Broker dashboard"
        subtitle="Executive view of recruiting motion, deal flow, GCI pipeline, staff accountability, and tenant activity."
        eyebrow="Command center"
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
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Recruiting momentum</h2>
              <p className="mt-1 text-sm text-text-secondary">Open candidates by stage, excluding joined and lost records.</p>
            </div>
            <Badge variant="accent">{activeRecruits} active</Badge>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {recruitingStages.map((stage) => {
              const count = recruits.filter((recruit) => recruit.stage === stage).length;
              const width = activeRecruits > 0 ? Math.max(12, Math.round((count / activeRecruits) * 100)) : 0;

              return (
                <div key={stage} className="rounded-md border border-border bg-surface-muted p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-text-primary">{stage}</p>
                    <p className="text-sm font-semibold text-text-primary">{count}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-border">
                    <div className="h-full rounded-full bg-accent" style={{ width: `${width}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Recent activity</h2>
              <p className="mt-1 text-sm text-text-secondary">Latest tenant-scoped changes and staff actions.</p>
            </div>
            <Badge variant="info">{activityLogs.length} logs</Badge>
          </div>
          <div className="mt-5 space-y-1">
            {activityLogs.map((log) => (
              <div key={log.id} className="flex gap-3 rounded-md px-2 py-3 transition hover:bg-surface-muted">
                <Badge variant="info" className="h-fit">{log.entityType}</Badge>
                <div className="min-w-0">
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
