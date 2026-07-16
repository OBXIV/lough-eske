import { CalendarDays, ClipboardList, DollarSign, TrendingUp } from "lucide-react";

import { PortalTransactions } from "@/components/agent-portal/portal-transactions";
import { ReferralPanel } from "@/components/agent-portal/referral-panel";
import { ResourceLibrary } from "@/components/agent-portal/resource-library";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { FeatureUnavailable } from "@/components/entitlements/feature-unavailable";
import { requirePermission } from "@/lib/auth/session";
import {
  getAgentResources,
  getLinkedAgent,
  getReferralsForAgent,
  getTasks,
  getTenantEntitlements,
  getTransactionsForAgent,
  tenantHasFeature,
} from "@/lib/data/app-data";
import { areTenantWritesEnabled } from "@/lib/data/database";
import { canAccess } from "@/lib/rbac/permissions";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Task } from "@/types/domain";

function taskPriorityVariant(priority: Task["priority"]) {
  if (priority === "urgent") return "danger";
  if (priority === "high") return "warning";
  return "default";
}

function SectionHeading({ subtitle, title }: { subtitle: string; title: string }) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
      <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>
    </div>
  );
}

function MyTasksCard({ tasks }: { tasks: Task[] }) {
  if (tasks.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm font-medium text-text-primary">No tasks assigned to you.</p>
        <p className="mt-1 text-sm text-text-secondary">Tasks your brokerage assigns to you will appear here with due dates.</p>
      </Card>
    );
  }

  return (
    <Card className="divide-y divide-border p-0">
      {tasks.map((task) => (
        <div key={task.id} className="flex items-center justify-between gap-4 px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
              <ClipboardList className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">{task.title}</p>
              <p className="mt-0.5 truncate text-xs text-text-secondary">
                {task.relatedRecord} - due {formatDate(task.dueDate)}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Badge variant={taskPriorityVariant(task.priority)}>{task.priority}</Badge>
            <Badge variant={task.status === "complete" ? "success" : "default"}>{task.status.replace("_", " ")}</Badge>
          </div>
        </div>
      ))}
    </Card>
  );
}

export default async function AgentPortalPage() {
  const session = await requirePermission("view_agent_portal");
  const [entitlements, hasAgentPortal] = await Promise.all([
    getTenantEntitlements(session),
    tenantHasFeature(session, "agent_portal"),
  ]);

  if (!hasAgentPortal) {
    return <FeatureUnavailable feature="agent_portal" entitlements={entitlements} />;
  }

  const canManageResources = canAccess(session.permissions, "manage_agent_resources");
  const isPortalOnlyUser = session.role === "Agent Portal User";
  const linkedAgent = await getLinkedAgent(session);
  const [resources, referrals, transactions, allTasks] = await Promise.all([
    getAgentResources(session),
    linkedAgent ? getReferralsForAgent(session, linkedAgent.id) : Promise.resolve([]),
    linkedAgent ? getTransactionsForAgent(session, linkedAgent) : Promise.resolve([]),
    getTasks(session),
  ]);
  const myTasks = allTasks.filter((task) => task.assigneeId === session.user.profileId);
  const activeDeals = transactions.filter((transaction) => transaction.status === "active");

  return (
    <>
      <PageHeader
        title={linkedAgent ? `Welcome back, ${linkedAgent.firstName}` : "Agent services"}
        subtitle="Your production, deals, referrals, tasks, and brokerage resources in one place."
        eyebrow="Agent portal"
      />
      {linkedAgent ? (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-normal text-text-secondary">Production YTD</p>
                <TrendingUp className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <p className="mt-3 text-2xl font-semibold text-text-primary">{formatCurrency(linkedAgent.productionYtd)}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-normal text-text-secondary">GCI YTD</p>
                <DollarSign className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <p className="mt-3 text-2xl font-semibold text-text-primary">{formatCurrency(linkedAgent.gciYtd)}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-normal text-text-secondary">Last close</p>
                <CalendarDays className="h-4 w-4 text-accent" aria-hidden />
              </div>
              <p className="mt-3 text-2xl font-semibold text-text-primary">{formatDate(linkedAgent.lastCloseDate)}</p>
            </Card>
            <Card className="p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-normal text-text-secondary">Active deals</p>
                <Badge variant="accent">{linkedAgent.brokerageStatus}</Badge>
              </div>
              <p className="mt-3 text-2xl font-semibold text-text-primary">{activeDeals.length}</p>
            </Card>
          </section>
          <section className="mt-8">
            <SectionHeading
              subtitle="Live status for the deals you are representing, with next actions and progress."
              title="Your transactions"
            />
            <PortalTransactions tasks={myTasks} transactions={transactions} />
          </section>
          <section className="mt-8 grid gap-8 xl:grid-cols-2 xl:gap-6">
            <div>
              <SectionHeading
                subtitle="Referrals captured for you, with source status and contact details."
                title="Referral tracking"
              />
              <ReferralPanel referrals={referrals} />
            </div>
            <div>
              <SectionHeading
                subtitle="Follow-up assigned to you across deals and onboarding."
                title="Your tasks"
              />
              <MyTasksCard tasks={myTasks} />
            </div>
          </section>
        </>
      ) : (
        <Card className="p-8">
          <h2 className="text-base font-semibold text-text-primary">
            {isPortalOnlyUser ? "Your agent profile is not linked yet" : "Staff preview"}
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">
            {isPortalOnlyUser
              ? "Your workspace login is not linked to an agent record, so production, transactions, and referrals cannot be shown yet. Ask your broker to link your profile from the agent database."
              : "You are viewing the portal as staff. Production, transaction, and referral panels are scoped to the signed-in agent's own records, so they stay hidden for staff accounts. The resource library below is what you publish for agents."}
          </p>
        </Card>
      )}
      <section className="mt-8">
        <SectionHeading
          subtitle={
            canManageResources
              ? "Training, templates, and policies agents can access. Staff-only drafts are hidden from the portal."
              : "Training, templates, and policies published by your brokerage."
          }
          title="Resource library"
        />
        <ResourceLibrary
          actionsEnabled={areTenantWritesEnabled(session)}
          canManage={canManageResources}
          resources={resources}
        />
      </section>
    </>
  );
}
