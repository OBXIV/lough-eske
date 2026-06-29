"use client";

import { useMemo, useState } from "react";
import { Eye, Save } from "lucide-react";

import { updateAgentStatusAction } from "@/app/app/actions";
import { DetailField, DrawerFormShell } from "@/components/broker-portal/detail-fields";
import { Badge } from "@/components/ui/badge";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { DataTable, TableCell, TableHead } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Agent } from "@/types/domain";

type AgentsTableProps = {
  actionsEnabled: boolean;
  agents: Agent[];
  canEdit: boolean;
};

const agentStatuses: Agent["brokerageStatus"][] = ["active", "inactive", "recruit", "onboarding", "former"];

function statusVariant(status: Agent["brokerageStatus"]) {
  if (status === "active") return "success";
  if (status === "onboarding") return "info";
  if (status === "recruit") return "warning";
  return "default";
}

export function AgentsTable({ actionsEnabled, agents, canEdit }: AgentsTableProps) {
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId],
  );

  return (
    <>
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
            <TableHead>Action</TableHead>
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
              <TableCell><Badge variant={statusVariant(agent.brokerageStatus)}>{agent.brokerageStatus}</Badge></TableCell>
              <TableCell>{formatCurrency(agent.productionYtd)}</TableCell>
              <TableCell>{formatCurrency(agent.gciYtd)}</TableCell>
              <TableCell className="text-text-secondary">{formatDate(agent.lastCloseDate)}</TableCell>
              <TableCell className="text-text-secondary">{agent.assignedOwner}</TableCell>
              <TableCell>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary shadow-card transition hover:bg-surface-muted"
                  onClick={() => setSelectedAgentId(agent.id)}
                  type="button"
                >
                  <Eye className="h-4 w-4" aria-hidden />
                  View
                </button>
              </TableCell>
            </tr>
          ))}
        </tbody>
      </DataTable>
      <DetailDrawer
        eyebrow="Agent record"
        isOpen={Boolean(selectedAgent)}
        onClose={() => setSelectedAgentId(null)}
        title={selectedAgent ? `${selectedAgent.firstName} ${selectedAgent.lastName}` : "Agent"}
      >
        {selectedAgent ? (
          <div className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Email" value={selectedAgent.email} />
              <DetailField label="Phone" value={selectedAgent.phone} />
              <DetailField label="Status" value={<Badge variant={statusVariant(selectedAgent.brokerageStatus)}>{selectedAgent.brokerageStatus}</Badge>} />
              <DetailField label="Owner" value={selectedAgent.assignedOwner} />
              <DetailField label="Production YTD" value={formatCurrency(selectedAgent.productionYtd)} />
              <DetailField label="GCI YTD" value={formatCurrency(selectedAgent.gciYtd)} />
              <DetailField label="Last close" value={formatDate(selectedAgent.lastCloseDate)} />
            </dl>
            {canEdit ? (
              <DrawerFormShell
                description="Change the brokerage status and record the update in recent activity."
                title="Update status"
              >
                <form action={updateAgentStatusAction} className="flex flex-col gap-3 sm:flex-row">
                  <input name="agentId" type="hidden" value={selectedAgent.id} />
                  <label className="min-w-0 flex-1 text-sm font-medium text-text-primary">
                    <span className="sr-only">Agent status</span>
                    <select
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                      defaultValue={selectedAgent.brokerageStatus}
                      disabled={!actionsEnabled}
                      name="status"
                    >
                      {agentStatuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-card disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!actionsEnabled}
                    type="submit"
                  >
                    <Save className="h-4 w-4" aria-hidden />
                    Save
                  </button>
                </form>
              </DrawerFormShell>
            ) : null}
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
