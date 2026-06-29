import { Badge } from "@/components/ui/badge";
import { DataTable, TableCell, TableHead } from "@/components/ui/table";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getAgents } from "@/lib/data/app-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function AgentsPage() {
  const session = await requirePermission("view_agents");
  const agents = await getAgents(session);

  return (
    <>
      <PageHeader
        title="Agent roster"
        subtitle="Production, contact, status, and ownership view for brokerage agents."
        eyebrow="Brokerage"
      />
      <DataTable>
        <thead>
          <tr>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Production YTD</TableHead>
            <TableHead>GCI YTD</TableHead>
            <TableHead>Last Close</TableHead>
            <TableHead>Owner</TableHead>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {agents.map((agent) => (
            <tr key={agent.id} className="transition hover:bg-surface-muted">
              <TableCell className="font-medium">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-accent/10 text-xs font-semibold text-accent">
                    {agent.firstName[0]}{agent.lastName[0]}
                  </span>
                  <span>{agent.firstName} {agent.lastName}</span>
                </div>
              </TableCell>
              <TableCell className="text-text-secondary">{agent.email}</TableCell>
              <TableCell className="text-text-secondary">{agent.phone}</TableCell>
              <TableCell><Badge variant={agent.brokerageStatus === "active" ? "success" : "warning"}>{agent.brokerageStatus}</Badge></TableCell>
              <TableCell>{formatCurrency(agent.productionYtd)}</TableCell>
              <TableCell>{formatCurrency(agent.gciYtd)}</TableCell>
              <TableCell className="text-text-secondary">{formatDate(agent.lastCloseDate)}</TableCell>
              <TableCell className="text-text-secondary">{agent.assignedOwner}</TableCell>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
