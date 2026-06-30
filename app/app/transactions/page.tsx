import { TransactionsTable } from "@/components/broker-portal/transactions-table";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getActivityLogs, getTasks, getTransactions } from "@/lib/data/app-data";
import { areTenantWritesEnabled } from "@/lib/data/database";
import { canAccess } from "@/lib/rbac/permissions";
import type { Transaction } from "@/types/domain";

type TransactionsPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

const transactionStatuses: Transaction["status"][] = ["active", "closed", "cancelled"];

function transactionStatusFilterFromQuery(status?: string): "all" | Transaction["status"] {
  return transactionStatuses.includes(status as Transaction["status"]) ? (status as Transaction["status"]) : "all";
}

export default async function TransactionsPage({ searchParams }: TransactionsPageProps) {
  const session = await requirePermission("view_transactions");
  const params = await searchParams;
  const [transactions, activities, tasks] = await Promise.all([
    getTransactions(session),
    getActivityLogs(session),
    getTasks(session),
  ]);
  const canEdit = canAccess(session.permissions, "edit_transactions");

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Deal pipeline with stage, close timing, list price, and estimated GCI."
        eyebrow="Revenue"
      />
      <TransactionsTable
        actionsEnabled={areTenantWritesEnabled(session)}
        activities={activities}
        canEdit={canEdit}
        initialStatusFilter={transactionStatusFilterFromQuery(params?.status)}
        tasks={tasks}
        transactions={transactions}
      />
    </>
  );
}
