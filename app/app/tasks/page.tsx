import { TasksTable } from "@/components/broker-portal/tasks-table";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getActivityLogs, getTasks } from "@/lib/data/app-data";
import { areTenantWritesEnabled } from "@/lib/data/database";
import type { Task } from "@/types/domain";

type TasksPageProps = {
  searchParams?: Promise<{
    status?: string;
  }>;
};

type TaskStatusFilter = "all" | "overdue" | Task["status"];

const taskStatusFilters: TaskStatusFilter[] = ["all", "overdue", "open", "in_progress", "complete", "cancelled"];

function taskStatusFilterFromQuery(status?: string): TaskStatusFilter {
  return taskStatusFilters.includes(status as TaskStatusFilter) ? (status as TaskStatusFilter) : "all";
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const session = await requirePermission("manage_tasks");
  const params = await searchParams;
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
      <TasksTable
        actionsEnabled={areTenantWritesEnabled(session)}
        activities={activities}
        canCreate
        initialStatusFilter={taskStatusFilterFromQuery(params?.status)}
        tasks={tasks}
      />
    </>
  );
}
