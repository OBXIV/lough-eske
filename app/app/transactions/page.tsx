import { TransactionsTable } from "@/components/broker-portal/transactions-table";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getActivityLogs, getTransactions } from "@/lib/data/app-data";
import { areTenantWritesEnabled } from "@/lib/data/database";
import { canAccess } from "@/lib/rbac/permissions";

export default async function TransactionsPage() {
  const session = await requirePermission("view_transactions");
  const [transactions, activities] = await Promise.all([
    getTransactions(session),
    getActivityLogs(session),
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
        transactions={transactions}
      />
    </>
  );
}
