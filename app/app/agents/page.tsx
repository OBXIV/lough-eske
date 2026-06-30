import { AgentsTable } from "@/components/broker-portal/agents-table";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getActivityLogs, getAgents } from "@/lib/data/app-data";
import { areTenantWritesEnabled } from "@/lib/data/database";
import { canAccess } from "@/lib/rbac/permissions";

type AgentsPageProps = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function AgentsPage({ searchParams }: AgentsPageProps) {
  const session = await requirePermission("view_agents");
  const params = await searchParams;
  const [agents, activities] = await Promise.all([
    getAgents(session),
    getActivityLogs(session),
  ]);
  const canCreate = canAccess(session.permissions, "create_agents");
  const canEdit = canAccess(session.permissions, "edit_agents");

  return (
    <>
      <PageHeader
        title="Agent roster"
        subtitle="Production, contact, status, and ownership view for brokerage agents."
        eyebrow="Brokerage"
      />
      <AgentsTable
        actionsEnabled={areTenantWritesEnabled(session)}
        activities={activities}
        agents={agents}
        canCreate={canCreate}
        canEdit={canEdit}
        initialSearchTerm={params?.q ?? ""}
      />
    </>
  );
}
