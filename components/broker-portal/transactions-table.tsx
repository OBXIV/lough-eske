"use client";

import { useMemo, useState } from "react";
import { Eye, Save } from "lucide-react";

import { updateTransactionStageAction } from "@/app/app/actions";
import { DetailField, DrawerFormShell } from "@/components/broker-portal/detail-fields";
import { Badge } from "@/components/ui/badge";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { DataTable, TableCell, TableHead } from "@/components/ui/table";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Transaction } from "@/types/domain";

type TransactionsTableProps = {
  actionsEnabled: boolean;
  canEdit: boolean;
  transactions: Transaction[];
};

const transactionStages: Transaction["stage"][] = [
  "Lead",
  "Listing",
  "Under Contract",
  "Inspection",
  "Clear to Close",
  "Closed",
  "Cancelled",
];

function statusVariant(status: Transaction["status"]) {
  if (status === "active") return "success";
  if (status === "cancelled") return "danger";
  return "default";
}

export function TransactionsTable({ actionsEnabled, canEdit, transactions }: TransactionsTableProps) {
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const selectedTransaction = useMemo(
    () => transactions.find((transaction) => transaction.id === selectedTransactionId) ?? null,
    [selectedTransactionId, transactions],
  );

  return (
    <>
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
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="transition hover:bg-surface-muted">
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
                  onClick={() => setSelectedTransactionId(transaction.id)}
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
            </dl>
            {canEdit ? (
              <DrawerFormShell
                description="Move the transaction to the next operational stage and update the pipeline status."
                title="Update stage"
              >
                <form action={updateTransactionStageAction} className="flex flex-col gap-3 sm:flex-row">
                  <input name="transactionId" type="hidden" value={selectedTransaction.id} />
                  <label className="min-w-0 flex-1 text-sm font-medium text-text-primary">
                    <span className="sr-only">Transaction stage</span>
                    <select
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                      defaultValue={selectedTransaction.stage}
                      disabled={!actionsEnabled}
                      name="stage"
                    >
                      {transactionStages.map((stage) => (
                        <option key={stage} value={stage}>{stage}</option>
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
