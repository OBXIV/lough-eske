"use client";

import { useActionState, useMemo, useState } from "react";
import { ClipboardList, Eye, FileText, FolderOpen, Save, Search, ShieldCheck, X } from "lucide-react";

import { updateTransactionStageAction } from "@/app/app/actions";
import { ActionFeedback, SubmitButton } from "@/components/broker-portal/action-form";
import { ActivityList, DetailField, DrawerFormShell } from "@/components/broker-portal/detail-fields";
import { Badge } from "@/components/ui/badge";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { DataTable, TableCell, TableHead } from "@/components/ui/table";
import { initialActionFormState } from "@/lib/action-state";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { ActivityLog, Task, Transaction } from "@/types/domain";

type TransactionsTableProps = {
  actionsEnabled: boolean;
  activities: ActivityLog[];
  canEdit: boolean;
  initialStatusFilter?: "all" | Transaction["status"];
  tasks: Task[];
  transactions: Transaction[];
};

type TimingFilter = "all" | "overdue" | "this_month" | "next_30";
type DerivedStatus = "Cleared" | "Active" | "Pending" | "Closed out";

const transactionStages: Transaction["stage"][] = [
  "Lead",
  "Listing",
  "Under Contract",
  "Inspection",
  "Clear to Close",
  "Closed",
  "Cancelled",
];

// Linear progression used to derive contingency and document readiness. Cancelled sits outside the path.
const transactionStageOrder: Transaction["stage"][] = [
  "Lead",
  "Listing",
  "Under Contract",
  "Inspection",
  "Clear to Close",
  "Closed",
];

const timingFilters: { value: TimingFilter; label: string }[] = [
  { value: "all", label: "Any close timing" },
  { value: "overdue", label: "Past expected close" },
  { value: "this_month", label: "Closing this month" },
  { value: "next_30", label: "Closing next 30 days" },
];

function statusVariant(status: Transaction["status"]) {
  if (status === "active") return "success";
  if (status === "cancelled") return "danger";
  return "default";
}

function transactionStatusLabel(status: "all" | Transaction["status"]) {
  if (status === "all") return "All transactions";
  return status;
}

function derivedStatusVariant(status: DerivedStatus) {
  if (status === "Cleared") return "success";
  if (status === "Active") return "warning";
  if (status === "Closed out") return "danger";
  return "default";
}

function stageProgress(stage: Transaction["stage"]) {
  return transactionStageOrder.indexOf(stage);
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function matchesSearch(transaction: Transaction, searchTerm: string) {
  const query = searchTerm.trim().toLowerCase();
  if (!query) return true;

  return [transaction.clientName, transaction.propertyAddress, transaction.agent]
    .some((value) => value.toLowerCase().includes(query));
}

function matchesTiming(transaction: Transaction, timing: TimingFilter, today: Date) {
  if (timing === "all") return true;
  // Close-timing filters are forward-looking pipeline views; closed/cancelled deals never qualify.
  if (transaction.status !== "active") return false;
  if (!transaction.expectedCloseDate) return false;

  const close = new Date(transaction.expectedCloseDate);
  if (Number.isNaN(close.getTime())) return false;

  const closeDay = startOfDay(close);

  if (timing === "overdue") {
    return closeDay < today;
  }

  if (timing === "this_month") {
    return close.getFullYear() === today.getFullYear() && close.getMonth() === today.getMonth();
  }

  const next30 = new Date(today);
  next30.setDate(next30.getDate() + 30);
  return closeDay >= today && closeDay <= next30;
}

function matchesTransactionActivity(activity: ActivityLog, transaction: Transaction) {
  const action = activity.action.toLowerCase();
  const terms = [transaction.clientName, transaction.propertyAddress]
    .map((term) => term.toLowerCase().trim())
    .filter(Boolean);

  return activity.entityId === transaction.id || terms.some((term) => action.includes(term));
}

function matchesTransactionTask(task: Task, transaction: Transaction) {
  const related = task.relatedRecord.toLowerCase();
  return [transaction.clientName, transaction.propertyAddress]
    .map((term) => term.toLowerCase().trim())
    .filter(Boolean)
    .some((term) => related.includes(term));
}

function contingencyRows(transaction: Transaction): { name: string; status: DerivedStatus }[] {
  const progress = stageProgress(transaction.stage);

  if (transaction.status === "cancelled") {
    return [
      { name: "Inspection", status: "Closed out" },
      { name: "Appraisal", status: "Closed out" },
      { name: "Financing", status: "Closed out" },
    ];
  }

  const atOrPast = (stage: Transaction["stage"]) => progress >= stageProgress(stage);

  return [
    {
      name: "Inspection",
      status: atOrPast("Clear to Close") ? "Cleared" : atOrPast("Inspection") ? "Active" : "Pending",
    },
    {
      name: "Appraisal",
      status: atOrPast("Clear to Close") ? "Cleared" : atOrPast("Under Contract") ? "Active" : "Pending",
    },
    {
      name: "Financing",
      status: atOrPast("Closed") ? "Cleared" : atOrPast("Under Contract") ? "Active" : "Pending",
    },
  ];
}

function documentRows(transaction: Transaction): { name: string; status: DerivedStatus }[] {
  const progress = stageProgress(transaction.stage);
  const cancelled = transaction.status === "cancelled";

  const rowFor = (name: string, requiredStage: Transaction["stage"]): { name: string; status: DerivedStatus } => {
    if (cancelled) return { name, status: "Closed out" };
    return { name, status: progress >= stageProgress(requiredStage) ? "Cleared" : "Pending" };
  };

  return [
    rowFor("Listing agreement", "Listing"),
    rowFor("Purchase agreement", "Under Contract"),
    rowFor("Inspection report", "Inspection"),
    rowFor("Closing disclosure", "Clear to Close"),
  ];
}

type DerivedSectionProps = {
  icon: typeof FileText;
  rows: { name: string; status: DerivedStatus }[];
  subtitle: string;
  title: string;
};

function DerivedSection({ icon: Icon, rows, subtitle, title }: DerivedSectionProps) {
  const clearedCount = rows.filter((row) => row.status === "Cleared").length;

  return (
    <section className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
            <Icon className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
            <p className="mt-0.5 text-xs text-text-secondary">{subtitle}</p>
          </div>
        </div>
        <Badge variant={clearedCount === rows.length ? "success" : "warning"}>{clearedCount}/{rows.length}</Badge>
      </div>
      <div className="divide-y divide-border">
        {rows.map((row) => (
          <div key={row.name} className="flex items-center justify-between gap-3 px-4 py-3">
            <p className="truncate text-sm font-medium text-text-primary">{row.name}</p>
            <Badge variant={derivedStatusVariant(row.status)}>{row.status}</Badge>
          </div>
        ))}
      </div>
    </section>
  );
}

type RelatedTasksSectionProps = {
  tasks: Task[];
};

function RelatedTasksSection({ tasks }: RelatedTasksSectionProps) {
  return (
    <section className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
            <ClipboardList className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-text-primary">Related tasks</h3>
            <p className="mt-0.5 text-xs text-text-secondary">Follow-up tied to this deal</p>
          </div>
        </div>
        <Badge>{tasks.length}</Badge>
      </div>
      <div className="divide-y divide-border">
        {tasks.length > 0 ? (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center justify-between gap-3 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-text-primary">{task.title}</p>
                <p className="mt-0.5 text-xs text-text-secondary">Due {formatDate(task.dueDate)}</p>
              </div>
              <Badge variant={task.status === "complete" ? "success" : "default"}>{task.status}</Badge>
            </div>
          ))
        ) : (
          <p className="px-4 py-6 text-center text-sm text-text-secondary">No related tasks</p>
        )}
      </div>
    </section>
  );
}

type TransactionStageFormProps = {
  actionsEnabled: boolean;
  transaction: Transaction;
};

function TransactionStageForm({ actionsEnabled, transaction }: TransactionStageFormProps) {
  const [state, formAction] = useActionState(updateTransactionStageAction, initialActionFormState);

  return (
    <DrawerFormShell
      description="Move the transaction to the next operational stage. Closing or cancelling records who made the change and when."
      title="Update stage"
    >
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
        <input name="transactionId" type="hidden" value={transaction.id} />
        <label className="min-w-0 flex-1 text-sm font-medium text-text-primary">
          <span className="sr-only">Transaction stage</span>
          <select
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue={transaction.stage}
            disabled={!actionsEnabled}
            name="stage"
          >
            {transactionStages.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </label>
        <SubmitButton disabled={!actionsEnabled} icon={Save} label="Save" pendingLabel="Saving" />
      </form>
      <ActionFeedback
        disabledMessage={!actionsEnabled ? "Writes are disabled in this environment." : undefined}
        state={state}
      />
    </DrawerFormShell>
  );
}

export function TransactionsTable({
  actionsEnabled,
  activities,
  canEdit,
  initialStatusFilter = "all",
  tasks,
  transactions,
}: TransactionsTableProps) {
  const [statusFilter, setStatusFilter] = useState<"all" | Transaction["status"]>(initialStatusFilter);
  const [stageFilter, setStageFilter] = useState<"all" | Transaction["stage"]>("all");
  const [timingFilter, setTimingFilter] = useState<TimingFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const today = useMemo(() => startOfDay(new Date()), []);
  const filteredTransactions = useMemo(
    () => transactions.filter((transaction) => (
      (statusFilter === "all" || transaction.status === statusFilter) &&
      (stageFilter === "all" || transaction.stage === stageFilter) &&
      matchesTiming(transaction, timingFilter, today) &&
      matchesSearch(transaction, searchTerm)
    )),
    [searchTerm, stageFilter, statusFilter, timingFilter, today, transactions],
  );
  const selectedTransaction = useMemo(
    () => transactions.find((transaction) => transaction.id === selectedTransactionId) ?? null,
    [selectedTransactionId, transactions],
  );
  const selectedActivities = useMemo(
    () => (selectedTransaction ? activities.filter((activity) => matchesTransactionActivity(activity, selectedTransaction)) : []),
    [activities, selectedTransaction],
  );
  const selectedTasks = useMemo(
    () => (selectedTransaction ? tasks.filter((task) => matchesTransactionTask(task, selectedTransaction)) : []),
    [selectedTransaction, tasks],
  );

  function openTransaction(transactionId: string) {
    setSelectedTransactionId(transactionId);
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="relative min-w-0 sm:w-72">
            <span className="sr-only">Search transactions</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" aria-hidden />
            <input
              className="w-full rounded-md border border-border bg-surface px-9 py-2 text-sm text-text-primary shadow-card"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search client, property, or agent"
              type="search"
              value={searchTerm}
            />
            {searchTerm ? (
              <button
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-secondary transition hover:text-text-primary"
                onClick={() => setSearchTerm("")}
                type="button"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </label>
          <label>
            <span className="sr-only">Filter transactions by status</span>
            <select
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-card sm:w-44"
              onChange={(event) => setStatusFilter(event.target.value as "all" | Transaction["status"])}
              value={statusFilter}
            >
              {(["all", "active", "closed", "cancelled"] as const).map((status) => (
                <option key={status} value={status}>{transactionStatusLabel(status)}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter transactions by stage</span>
            <select
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-card sm:w-44"
              onChange={(event) => setStageFilter(event.target.value as "all" | Transaction["stage"])}
              value={stageFilter}
            >
              <option value="all">All stages</option>
              {transactionStages.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter transactions by close timing</span>
            <select
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-card sm:w-52"
              onChange={(event) => setTimingFilter(event.target.value as TimingFilter)}
              value={timingFilter}
            >
              {timingFilters.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
        </div>
        <p className="shrink-0 text-sm font-medium text-text-secondary">{filteredTransactions.length} of {transactions.length} transactions</p>
      </div>
      <DataTable>
        <thead>
          <tr>
            <TableHead>Agent</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Property</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>List Price</TableHead>
            <TableHead>Estimated GCI</TableHead>
            <TableHead>Expected Close</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredTransactions.map((transaction) => (
            <tr
              key={transaction.id}
              className="cursor-pointer transition hover:bg-surface-muted"
              onClick={() => openTransaction(transaction.id)}
            >
              <TableCell className="font-medium">{transaction.agent}</TableCell>
              <TableCell>{transaction.clientName}</TableCell>
              <TableCell className="min-w-64 text-text-secondary">{transaction.propertyAddress}</TableCell>
              <TableCell><Badge variant="accent">{transaction.stage}</Badge></TableCell>
              <TableCell>{formatCurrency(transaction.listPrice)}</TableCell>
              <TableCell>{formatCurrency(transaction.estimatedGci)}</TableCell>
              <TableCell className="text-text-secondary">{formatDate(transaction.expectedCloseDate)}</TableCell>
              <TableCell><Badge variant={statusVariant(transaction.status)}>{transaction.status}</Badge></TableCell>
              <TableCell>
                <button
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary shadow-card transition hover:bg-surface-muted"
                  onClick={(event) => {
                    event.stopPropagation();
                    openTransaction(transaction.id);
                  }}
                  type="button"
                >
                  <Eye className="h-4 w-4" aria-hidden />
                  View
                </button>
              </TableCell>
            </tr>
          ))}
          {filteredTransactions.length === 0 ? (
            <tr>
              <TableCell className="py-10 text-center text-text-secondary" colSpan={9}>
                No transactions match this filter.
              </TableCell>
            </tr>
          ) : null}
        </tbody>
      </DataTable>
      <DetailDrawer
        eyebrow="Transaction record"
        isOpen={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransactionId(null)}
        title={selectedTransaction?.clientName || "Transaction"}
      >
        {selectedTransaction ? (
          <div className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Agent" value={selectedTransaction.agent} />
              <DetailField label="Client" value={selectedTransaction.clientName} />
              <DetailField label="Property" value={selectedTransaction.propertyAddress} />
              <DetailField label="Type" value={selectedTransaction.transactionType} />
              <DetailField label="Stage" value={<Badge variant="accent">{selectedTransaction.stage}</Badge>} />
              <DetailField label="Status" value={<Badge variant={statusVariant(selectedTransaction.status)}>{selectedTransaction.status}</Badge>} />
              <DetailField label="List price" value={formatCurrency(selectedTransaction.listPrice)} />
              <DetailField label="Estimated GCI" value={formatCurrency(selectedTransaction.estimatedGci)} />
              <DetailField label="Expected close" value={formatDate(selectedTransaction.expectedCloseDate)} />
              {selectedTransaction.finalizedAt ? (
                <DetailField
                  label={selectedTransaction.status === "cancelled" ? "Cancelled" : "Closed"}
                  value={
                    <span>
                      {formatDateTime(selectedTransaction.finalizedAt)}
                      <span className="mt-1 block text-xs font-normal text-text-secondary">
                        by {selectedTransaction.finalizedBy ?? "Unknown user"}
                      </span>
                    </span>
                  }
                />
              ) : null}
            </dl>
            <DerivedSection
              icon={ShieldCheck}
              rows={contingencyRows(selectedTransaction)}
              subtitle="Status inferred from deal stage"
              title="Contingencies"
            />
            <RelatedTasksSection tasks={selectedTasks} />
            <DerivedSection
              icon={FolderOpen}
              rows={documentRows(selectedTransaction)}
              subtitle="Readiness inferred from deal stage"
              title="Transaction documents"
            />
            {canEdit ? (
              <TransactionStageForm key={selectedTransaction.id} actionsEnabled={actionsEnabled} transaction={selectedTransaction} />
            ) : null}
            <ActivityList activities={selectedActivities} />
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
