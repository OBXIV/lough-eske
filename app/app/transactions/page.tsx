import { TransactionsTable } from "@/components/broker-portal/transactions-table";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getTransactions } from "@/lib/data/app-data";
import { isDatabaseConfigured } from "@/lib/data/database";
import { canAccess } from "@/lib/rbac/permissions";

export default async function TransactionsPage() {
  const session = await requirePermission("view_transactions");
  const transactions = await getTransactions(session);
  const canEdit = canAccess(session.permissions, "edit_transactions");

  return (
    <>
      <PageHeader
        title="Transactions"
        subtitle="Deal pipeline with stage, close timing, list price, and estimated GCI."
        eyebrow="Revenue"
      />
      <TransactionsTable actionsEnabled={isDatabaseConfigured()} canEdit={canEdit} transactions={transactions} />
    </>
  );
}
