import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, TableCell, TableHead } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/session";
import { getTransactions } from "@/lib/data/app-data";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function TransactionsPage() {
  const session = await requirePermission("view_transactions");
  const transactions = await getTransactions(session);

  return (
    <>
      <PageHeader title="Transactions" subtitle="Tenant-specific transaction pipeline with estimated GCI and expected close dates." />
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
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="hover:bg-background">
              <TableCell className="font-medium">{transaction.agent}</TableCell>
              <TableCell>{transaction.clientName}</TableCell>
              <TableCell>{transaction.propertyAddress}</TableCell>
              <TableCell><Badge variant="accent">{transaction.stage}</Badge></TableCell>
              <TableCell>{formatCurrency(transaction.listPrice)}</TableCell>
              <TableCell>{formatCurrency(transaction.estimatedGci)}</TableCell>
              <TableCell>{formatDate(transaction.expectedCloseDate)}</TableCell>
              <TableCell><Badge variant="success">{transaction.status}</Badge></TableCell>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
