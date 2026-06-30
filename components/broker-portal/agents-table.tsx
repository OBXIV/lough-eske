"use client";

import { useActionState, useMemo, useState } from "react";
import { Eye, FileText, FolderOpen, Plus, Save, Search } from "lucide-react";

import { createAgentAction, updateAgentProfileAction, updateAgentStatusAction } from "@/app/app/actions";
import { ActionFeedback, SubmitButton } from "@/components/broker-portal/action-form";
import { ActivityList, DetailField, DrawerFormShell } from "@/components/broker-portal/detail-fields";
import { Badge } from "@/components/ui/badge";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { DataTable, TableCell, TableHead } from "@/components/ui/table";
import { initialActionFormState } from "@/lib/action-state";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { ActivityLog, Agent } from "@/types/domain";

type AgentsTableProps = {
  actionsEnabled: boolean;
  agents: Agent[];
  activities: ActivityLog[];
  canCreate: boolean;
  canEdit: boolean;
};

const agentStatuses: Agent["brokerageStatus"][] = ["active", "inactive", "recruit", "onboarding", "former"];
type AgentFileStatus = "On file" | "Needs review" | "Missing";

function statusVariant(status: Agent["brokerageStatus"]) {
  if (status === "active") return "success";
  if (status === "onboarding") return "info";
  if (status === "recruit") return "warning";
  return "default";
}

function fileStatusVariant(status: AgentFileStatus) {
  if (status === "On file") return "success";
  if (status === "Needs review") return "warning";
  return "danger";
}

function matchesAgentActivity(activity: ActivityLog, agent: Agent) {
  const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase();

  return activity.entityId === agent.id || activity.action.toLowerCase().includes(fullName);
}

function matchesSearch(agent: Agent, searchTerm: string) {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return true;

  return [
    `${agent.firstName} ${agent.lastName}`,
    agent.email,
    agent.phone,
    agent.licenseNumber,
    agent.source,
    agent.assignedOwner,
  ].some((value) => value.toLowerCase().includes(query));
}

function agentFileRows(agent: Agent) {
  const hasLicense = Boolean(agent.licenseNumber.trim());
  const activeAgent = agent.brokerageStatus === "active" || agent.brokerageStatus === "onboarding";

  return [
    {
      category: "Insurance",
      name: "E&O insurance",
      status: activeAgent ? "On file" : "Needs review",
      updatedAt: agent.lastCloseDate,
    },
    {
      category: "Agreement",
      name: "Brokerage contract",
      status: activeAgent ? "On file" : "Needs review",
      updatedAt: agent.lastCloseDate,
    },
    {
      category: "Agreement",
      name: "Independent contractor agreement",
      status: agent.brokerageStatus === "former" ? "Needs review" : "On file",
      updatedAt: agent.lastCloseDate,
    },
    {
      category: "License",
      name: "License copy",
      status: hasLicense ? "On file" : "Missing",
      updatedAt: agent.lastCloseDate,
    },
  ] satisfies {
    category: string;
    name: string;
    status: AgentFileStatus;
    updatedAt: string;
  }[];
}

type AgentStatusFormProps = {
  actionsEnabled: boolean;
  agent: Agent;
};

function AgentStatusForm({ actionsEnabled, agent }: AgentStatusFormProps) {
  const [state, formAction] = useActionState(updateAgentStatusAction, initialActionFormState);

  return (
    <DrawerFormShell
      description="Change the brokerage status and record the update in recent activity."
      title="Update status"
    >
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
        <input name="agentId" type="hidden" value={agent.id} />
        <label className="min-w-0 flex-1 text-sm font-medium text-text-primary">
          <span className="sr-only">Agent status</span>
          <select
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue={agent.brokerageStatus}
            disabled={!actionsEnabled}
            name="status"
          >
            {agentStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <SubmitButton disabled={!actionsEnabled} icon={Save} label="Save" pendingLabel="Saving" />
      </form>
      <ActionFeedback
        disabledMessage={!actionsEnabled ? "Writes are disabled for this workspace." : undefined}
        state={state}
      />
    </DrawerFormShell>
  );
}

function AgentProfileForm({ actionsEnabled, agent }: AgentStatusFormProps) {
  const [state, formAction] = useActionState(updateAgentProfileAction, initialActionFormState);

  return (
    <DrawerFormShell
      description="Update contact, license, and source fields for this agent record."
      title="Edit profile"
    >
      <form action={formAction} className="space-y-3">
        <input name="agentId" type="hidden" value={agent.id} />
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium text-text-primary">
            Email
            <input
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              defaultValue={agent.email}
              disabled={!actionsEnabled}
              name="email"
              type="email"
            />
          </label>
          <label className="text-sm font-medium text-text-primary">
            Phone
            <input
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              defaultValue={agent.phone}
              disabled={!actionsEnabled}
              name="phone"
              type="tel"
            />
          </label>
          <label className="text-sm font-medium text-text-primary">
            License
            <input
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              defaultValue={agent.licenseNumber}
              disabled={!actionsEnabled}
              name="licenseNumber"
              type="text"
            />
          </label>
          <label className="text-sm font-medium text-text-primary">
            Source
            <input
              className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
              defaultValue={agent.source}
              disabled={!actionsEnabled}
              name="source"
              type="text"
            />
          </label>
        </div>
        <SubmitButton disabled={!actionsEnabled} icon={Save} label="Save profile" pendingLabel="Saving" />
      </form>
      <ActionFeedback
        disabledMessage={!actionsEnabled ? "Writes are disabled for this workspace." : undefined}
        state={state}
      />
    </DrawerFormShell>
  );
}

type AgentFilesSectionProps = {
  agent: Agent;
};

function AgentFilesSection({ agent }: AgentFilesSectionProps) {
  const files = agentFileRows(agent);
  const onFileCount = files.filter((file) => file.status === "On file").length;

  return (
    <section className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
            <FolderOpen className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary">Agent files</h3>
            <p className="mt-0.5 text-xs text-text-secondary">Compliance and brokerage documents</p>
          </div>
        </div>
        <Badge variant={onFileCount === files.length ? "success" : "warning"}>{onFileCount}/{files.length}</Badge>
      </div>
      <div className="divide-y divide-border">
        {files.map((file) => (
          <div key={file.name} className="grid gap-3 px-4 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex min-w-0 gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-surface-muted text-text-secondary">
                <FileText className="h-4 w-4" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{file.name}</p>
                <p className="mt-1 text-xs text-text-secondary">{file.category} - Updated {formatDate(file.updatedAt)}</p>
              </div>
            </div>
            <Badge className="w-fit" variant={fileStatusVariant(file.status)}>{file.status}</Badge>
          </div>
        ))}
      </div>
    </section>
  );
}

type CreateAgentFormProps = {
  actionsEnabled: boolean;
};

function CreateAgentForm({ actionsEnabled }: CreateAgentFormProps) {
  const [state, formAction] = useActionState(createAgentAction, initialActionFormState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-text-primary">
          First name
          <input
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="firstName"
            required
            type="text"
          />
        </label>
        <label className="text-sm font-medium text-text-primary">
          Last name
          <input
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="lastName"
            required
            type="text"
          />
        </label>
        <label className="text-sm font-medium text-text-primary">
          Email
          <input
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="email"
            type="email"
          />
        </label>
        <label className="text-sm font-medium text-text-primary">
          Phone
          <input
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="phone"
            type="tel"
          />
        </label>
        <label className="text-sm font-medium text-text-primary">
          Status
          <select
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue="active"
            disabled={!actionsEnabled}
            name="status"
          >
            {agentStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-text-primary">
          License
          <input
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="licenseNumber"
            type="text"
          />
        </label>
        <label className="text-sm font-medium text-text-primary sm:col-span-2">
          Source
          <input
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="source"
            type="text"
          />
        </label>
      </div>
      <SubmitButton disabled={!actionsEnabled} icon={Plus} label="Create agent" pendingLabel="Creating" />
      <ActionFeedback
        disabledMessage={!actionsEnabled ? "Writes are disabled for this workspace." : undefined}
        state={state}
      />
    </form>
  );
}

export function AgentsTable({ actionsEnabled, agents, activities, canCreate, canEdit }: AgentsTableProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | Agent["brokerageStatus"]>("all");
  const filteredAgents = useMemo(
    () => agents.filter((agent) => (
      (statusFilter === "all" || agent.brokerageStatus === statusFilter) && matchesSearch(agent, searchTerm)
    )),
    [agents, searchTerm, statusFilter],
  );
  const selectedAgent = useMemo(
    () => agents.find((agent) => agent.id === selectedAgentId) ?? null,
    [agents, selectedAgentId],
  );
  const selectedActivities = useMemo(
    () => (selectedAgent ? activities.filter((activity) => matchesAgentActivity(activity, selectedAgent)) : []),
    [activities, selectedAgent],
  );

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="relative min-w-0 sm:w-80">
            <span className="sr-only">Search agents</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" aria-hidden />
            <input
              className="w-full rounded-md border border-border bg-surface px-9 py-2 text-sm text-text-primary shadow-card"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search agents"
              type="search"
              value={searchTerm}
            />
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-card sm:w-48"
              onChange={(event) => setStatusFilter(event.target.value as "all" | Agent["brokerageStatus"])}
              value={statusFilter}
            >
              <option value="all">All statuses</option>
              {agentStatuses.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-text-secondary">{filteredAgents.length} of {agents.length} agents</p>
          {canCreate ? (
            <button
              className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-accent/90"
              onClick={() => {
                setSelectedAgentId(null);
                setIsCreateOpen(true);
              }}
              type="button"
            >
              <Plus className="h-4 w-4" aria-hidden />
              New agent
            </button>
          ) : null}
        </div>
      </div>
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
          {filteredAgents.map((agent) => (
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
                  onClick={() => {
                    setIsCreateOpen(false);
                    setSelectedAgentId(agent.id);
                  }}
                  type="button"
                >
                  <Eye className="h-4 w-4" aria-hidden />
                  View
                </button>
              </TableCell>
            </tr>
          ))}
          {filteredAgents.length === 0 ? (
            <tr>
              <TableCell className="py-10 text-center text-text-secondary" colSpan={9}>
                No agents match the current filters
              </TableCell>
            </tr>
          ) : null}
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
              <DetailField label="License" value={selectedAgent.licenseNumber} />
              <DetailField label="Source" value={selectedAgent.source} />
              <DetailField label="Owner" value={selectedAgent.assignedOwner} />
              <DetailField label="Production YTD" value={formatCurrency(selectedAgent.productionYtd)} />
              <DetailField label="GCI YTD" value={formatCurrency(selectedAgent.gciYtd)} />
              <DetailField label="Last close" value={formatDate(selectedAgent.lastCloseDate)} />
            </dl>
            <AgentFilesSection agent={selectedAgent} />
            {canEdit ? (
              <>
                <AgentProfileForm key={`${selectedAgent.id}-profile`} actionsEnabled={actionsEnabled} agent={selectedAgent} />
                <AgentStatusForm key={`${selectedAgent.id}-status`} actionsEnabled={actionsEnabled} agent={selectedAgent} />
              </>
            ) : null}
            <ActivityList activities={selectedActivities} />
          </div>
        ) : null}
      </DetailDrawer>
      <DetailDrawer
        eyebrow="Agent database"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New agent"
      >
        <CreateAgentForm actionsEnabled={actionsEnabled} />
      </DetailDrawer>
    </>
  );
}
