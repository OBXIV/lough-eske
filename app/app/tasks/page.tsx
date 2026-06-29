import { TasksTable } from "@/components/broker-portal/tasks-table";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getActivityLogs, getTasks } from "@/lib/data/app-data";
import { isDatabaseConfigured } from "@/lib/data/database";

export default async function TasksPage() {
  const session = await requirePermission("manage_tasks");
  const [tasks, activities] = await Promise.all([
    getTasks(session),
    getActivityLogs(session),
  ]);

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Accountability queue for recruiting, retention, finance, and transaction follow-up."
        eyebrow="Operations"
      />
      <TasksTable actionsEnabled={isDatabaseConfigured()} activities={activities} canCreate tasks={tasks} />
    </>
  );
}
