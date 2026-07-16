"use client";

import { useMemo, useState } from "react";
import { Check, ChevronRight, ClipboardList, FileText } from "lucide-react";

import { DetailField } from "@/components/broker-portal/detail-fields";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import type { Task, Transaction } from "@/types/domain";

type PortalTransactionsProps = {
  tasks: Task[];
  transactions: Transaction[];
};

// Linear stage path used to render read-only progress. Cancelled sits outside the path.
const transactionStageOrder: Transaction["stage"][] = [
  "Lead",
  "Listing",
  "Under Contract",
  "Inspection",
  "Clear to Close",
  "Closed",
];

const nextActionByStage: Record<Transaction["stage"], string> = {
  Lead: "Confirm representation agreement with your client.",
  Listing: "Prepare the property for offers and review showing feedback.",
  "Under Contract": "Track contingency deadlines and keep your client informed.",
  Inspection: "Review inspection results and negotiate any repair requests.",
  "Clear to Close": "Confirm closing logistics and final walkthrough.",
  Closed: "Deal is closed. Follow up with your client for reviews and referrals.",
  Cancelled: "This deal was cancelled. Ask your transaction coordinator if you have questions.",
};

function statusVariant(status: Transaction["status"]) {
  if (status === "active") return "success";
  if (status === "cancelled") return "danger";
  return "default";
}

function matchesTransactionTask(task: Task, transaction: Transaction) {
  const related = task.relatedRecord.toLowerCase();

  return [transaction.clientName, transaction.propertyAddress]
    .map((term) => term.toLowerCase().trim())
    .filter(Boolean)
    .some((term) => related.includes(term));
}

type StageProgressProps = {
  transaction: Transaction;
};

function StageProgress({ transaction }: StageProgressProps) {
  const currentIndex = transactionStageOrder.indexOf(transaction.stage);
  const cancelled = transaction.status === "cancelled";

  return (
    <section className="rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h3 className="text-sm font-semibold text-text-primary">Deal progress</h3>
        <p className="mt-0.5 text-xs text-text-secondary">
          {cancelled ? "This transaction was cancelled." : "Where this deal sits on the path to close."}
        </p>
      </div>
      <div className="divide-y divide-border">
        {transactionStageOrder.map((stage, index) => {
          const reached = !cancelled && currentIndex >= index;
          const isCurrent = !cancelled && currentIndex === index;

          return (
            <div key={stage} className="flex items-center gap-3 px-4 py-2.5">
              <span
                className={
                  reached
                    ? "flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent text-white"
                    : "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface-muted text-text-secondary"
                }
              >
                {reached ? <Check className="h-3.5 w-3.5" aria-hidden /> : <span className="text-xs font-semibold">{index + 1}</span>}
              </span>
              <p className={reached ? "text-sm font-medium text-text-primary" : "text-sm text-text-secondary"}>{stage}</p>
              {isCurrent ? <Badge variant="accent">Current</Badge> : null}
            </div>
          );
        })}
      </div>
    </section>
  );
}

export function PortalTransactions({ tasks, transactions }: PortalTransactionsProps) {
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const selectedTransaction = useMemo(
    () => transactions.find((transaction) => transaction.id === selectedTransactionId) ?? null,
    [selectedTransactionId, transactions],
  );
  const selectedTasks = useMemo(
    () => (selectedTransaction ? tasks.filter((task) => matchesTransactionTask(task, selectedTransaction)) : []),
    [selectedTransaction, tasks],
  );

  if (transactions.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm font-medium text-text-primary">No transactions yet.</p>
        <p className="mt-1 text-sm text-text-secondary">Deals assigned to you by your brokerage will appear here with live status.</p>
      </Card>
    );
  }

  return (
    <>
      <div className="grid gap-4 xl:grid-cols-2">
        {transactions.map((transaction) => (
          <Card key={transaction.id} className="p-0">
            <button
              className="flex w-full items-center justify-between gap-4 p-5 text-left transition hover:bg-surface-muted"
              onClick={() => setSelectedTransactionId(transaction.id)}
              type="button"
            >
              <span className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <FileText className="h-5 w-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-text-primary">
                    {transaction.clientName || transaction.propertyAddress}
                  </span>
                  <span className="mt-0.5 block truncate text-sm text-text-secondary">{transaction.propertyAddress}</span>
                  <span className="mt-2 flex flex-wrap items-center gap-2">
                    <Badge variant="accent">{transaction.stage}</Badge>
                    <Badge variant={statusVariant(transaction.status)}>{transaction.status}</Badge>
                    <span className="text-xs text-text-secondary">Close {formatDate(transaction.expectedCloseDate)}</span>
                  </span>
                </span>
              </span>
              <ChevronRight className="h-5 w-5 shrink-0 text-text-secondary" aria-hidden />
            </button>
          </Card>
        ))}
      </div>
      <DetailDrawer
        eyebrow="Transaction status"
        isOpen={Boolean(selectedTransaction)}
        onClose={() => setSelectedTransactionId(null)}
        title={selectedTransaction?.clientName || selectedTransaction?.propertyAddress || "Transaction"}
      >
        {selectedTransaction ? (
          <div className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Client" value={selectedTransaction.clientName || "Not recorded"} />
              <DetailField label="Property" value={selectedTransaction.propertyAddress || "Not recorded"} />
              <DetailField label="Type" value={selectedTransaction.transactionType} />
              <DetailField label="Stage" value={<Badge variant="accent">{selectedTransaction.stage}</Badge>} />
              <DetailField label="List price" value={formatCurrency(selectedTransaction.listPrice)} />
              <DetailField label="Your estimated GCI" value={formatCurrency(selectedTransaction.estimatedGci)} />
              <DetailField label="Expected close" value={formatDate(selectedTransaction.expectedCloseDate)} />
              {selectedTransaction.finalizedAt ? (
                <DetailField
                  label={selectedTransaction.status === "cancelled" ? "Cancelled" : "Closed"}
                  value={formatDateTime(selectedTransaction.finalizedAt)}
                />
              ) : null}
            </dl>
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
              <h3 className="text-sm font-semibold text-text-primary">Next action</h3>
              <p className="mt-1 text-sm leading-6 text-text-secondary">{nextActionByStage[selectedTransaction.stage]}</p>
            </div>
            <StageProgress transaction={selectedTransaction} />
            <section className="rounded-lg border border-border bg-surface">
              <div className="flex items-center justify-between gap-4 border-b border-border px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                    <ClipboardList className="h-4 w-4" aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-text-primary">Your related tasks</h3>
                    <p className="mt-0.5 text-xs text-text-secondary">Follow-up assigned to you on this deal</p>
                  </div>
                </div>
                <Badge>{selectedTasks.length}</Badge>
              </div>
              <div className="divide-y divide-border">
                {selectedTasks.length > 0 ? (
                  selectedTasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-text-primary">{task.title}</p>
                        <p className="mt-0.5 text-xs text-text-secondary">Due {formatDate(task.dueDate)}</p>
                      </div>
                      <Badge variant={task.status === "complete" ? "success" : "default"}>{task.status}</Badge>
                    </div>
                  ))
                ) : (
                  <p className="px-4 py-6 text-center text-sm text-text-secondary">No tasks assigned to you on this deal</p>
                )}
              </div>
            </section>
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
