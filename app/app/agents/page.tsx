import { AgentsTable } from "@/components/broker-portal/agents-table";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getAgents } from "@/lib/data/app-data";
import { isDatabaseConfigured } from "@/lib/data/database";
import { canAccess } from "@/lib/rbac/permissions";

export default async function AgentsPage() {
  const session = await requirePermission("view_agents");
  const agents = await getAgents(session);
  const canEdit = canAccess(session.permissions, "edit_agents");

  return (
    <>
      <PageHeader
        title="Agent roster"
        subtitle="Production, contact, status, and ownership view for brokerage agents."
        eyebrow="Brokerage"
      />
      <AgentsTable actionsEnabled={isDatabaseConfigured()} agents={agents} canEdit={canEdit} />
    </>
  );
}
