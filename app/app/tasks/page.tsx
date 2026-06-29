import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, TableCell, TableHead } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/session";
import { getTasks } from "@/lib/data/app-data";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types/domain";

function priorityVariant(priority: Task["priority"]) {
  if (priority === "urgent") return "danger";
  if (priority === "high") return "warning";
  return "default";
}

export default async function TasksPage() {
  const session = await requirePermission("manage_tasks");
  const tasks = await getTasks(session);

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Accountability queue for recruiting, retention, finance, and transaction follow-up."
        eyebrow="Operations"
      />
      <DataTable>
        <thead>
          <tr>
            <TableHead>Title</TableHead>
            <TableHead>Related Record</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {tasks.map((task) => (
            <tr key={task.id} className="transition hover:bg-surface-muted">
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell className="text-text-secondary">{task.relatedRecord}</TableCell>
              <TableCell className="text-text-secondary">{formatDate(task.dueDate)}</TableCell>
              <TableCell><Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge></TableCell>
              <TableCell><Badge variant={task.status === "complete" ? "success" : "info"}>{task.status}</Badge></TableCell>
            </tr>
          ))}
        </tbody>
      </DataTable>
    </>
  );
}
