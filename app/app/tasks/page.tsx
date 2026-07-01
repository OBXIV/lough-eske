import { ActivityLogPanel } from "@/components/broker-portal/activity-log-panel";
import { TasksTable } from "@/components/broker-portal/tasks-table";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getActivityLogs, getTasks, getTenantMembers } from "@/lib/data/app-data";
import { areTenantWritesEnabled } from "@/lib/data/database";
import { currentDateKey, taskDueFilters, type TaskDueFilter } from "@/lib/task-filters";
import type { Task } from "@/types/domain";

type TasksPageProps = {
  searchParams?: Promise<{
    due?: string;
    status?: string;
  }>;
};

type TaskStatusFilter = "all" | Task["status"];

const taskStatusFilters: TaskStatusFilter[] = ["all", "open", "in_progress", "complete", "cancelled"];

const ACTIVITY_LOG_LIMIT = 50;

function taskStatusFilterFromQuery(status?: string): TaskStatusFilter {
  return taskStatusFilters.includes(status as TaskStatusFilter) ? (status as TaskStatusFilter) : "all";
}

function taskDueFilterFromQuery(due?: string, status?: string): TaskDueFilter {
  if (status === "overdue") return "overdue";
  return taskDueFilters.includes(due as TaskDueFilter) ? (due as TaskDueFilter) : "any";
}

export default async function TasksPage({ searchParams }: TasksPageProps) {
  const session = await requirePermission("manage_tasks");
  const params = await searchParams;
  const [tasks, activities, members] = await Promise.all([
    getTasks(session),
    getActivityLogs(session, ACTIVITY_LOG_LIMIT),
    getTenantMembers(session),
  ]);
  const initialDueFilter = taskDueFilterFromQuery(params?.due, params?.status);
  const initialStatusFilter = taskStatusFilterFromQuery(params?.status);

  return (
    <>
      <PageHeader
        title="Tasks"
        subtitle="Accountability queue for recruiting, retention, finance, and transaction follow-up."
        eyebrow="Operations"
      />
      <TasksTable
        key={`${initialStatusFilter}-${initialDueFilter}`}
        actionsEnabled={areTenantWritesEnabled(session)}
        activities={activities}
        canCreate
        initialDueFilter={initialDueFilter}
        initialStatusFilter={initialStatusFilter}
        members={members}
        tasks={tasks}
        todayKey={currentDateKey()}
      />
      <section className="mt-6">
        <ActivityLogPanel activities={activities} />
      </section>
    </>
  );
}
