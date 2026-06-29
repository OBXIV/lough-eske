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
      <PageHeader title="Agent database" subtitle="Business records for brokerage agents. Agent login support remains a future layer." />
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
            <tr key={agent.id} className="hover:bg-background">
              <TableCell className="font-medium">{agent.firstName} {agent.lastName}</TableCell>
              <TableCell>{agent.email}</TableCell>
              <TableCell>{agent.phone}</TableCell>
              <TableCell><Badge variant={agent.brokerageStatus === "active" ? "success" : "warning"}>{agent.brokerageStatus}</Badge></TableCell>
              <TableCell>{formatCurrency(agent.productionYtd)}</TableCell>
              <TableCell>{formatCurrency(agent.gciYtd)}</TableCell>
              <TableCell>{formatDate(agent.lastCloseDate)}</TableCell>
              <TableCell>{agent.assignedOwner}</TableCell>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
