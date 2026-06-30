"use client";

import { useActionState, useMemo, useState } from "react";
import { CheckCircle2, Eye, Plus, Save } from "lucide-react";

import { createTaskAction, updateTaskStatusAction } from "@/app/app/actions";
import { ActionFeedback, SubmitButton } from "@/components/broker-portal/action-form";
import { ActivityList, DetailField, DrawerFormShell } from "@/components/broker-portal/detail-fields";
import { Badge } from "@/components/ui/badge";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { DataTable, TableCell, TableHead } from "@/components/ui/table";
import { initialActionFormState } from "@/lib/action-state";
import { formatDate } from "@/lib/utils";
import type { ActivityLog, Task } from "@/types/domain";

type TasksTableProps = {
  actionsEnabled: boolean;
  activities: ActivityLog[];
  canCreate: boolean;
  initialStatusFilter?: TaskStatusFilter;
  tasks: Task[];
};

const taskStatuses: Task["status"][] = ["open", "in_progress", "complete", "cancelled"];
const taskPriorities: Task["priority"][] = ["low", "normal", "high", "urgent"];
type TaskStatusFilter = "all" | "overdue" | Task["status"];
const taskStatusFilters: TaskStatusFilter[] = ["all", "overdue", ...taskStatuses];

function taskStatusLabel(status: TaskStatusFilter) {
  if (status === "all") return "All tasks";
  if (status === "overdue") return "Overdue tasks";
  return status;
}

function priorityVariant(priority: Task["priority"]) {
  if (priority === "urgent") return "danger";
  if (priority === "high") return "warning";
  return "default";
}

function statusVariant(status: Task["status"]) {
  if (status === "complete") return "success";
  if (status === "cancelled") return "default";
  if (status === "in_progress") return "info";
  return "warning";
}

function matchesTaskActivity(activity: ActivityLog, task: Task) {
  const action = activity.action.toLowerCase();
  const terms = [task.title, task.relatedRecord].map((term) => term.toLowerCase().trim()).filter(Boolean);

  return activity.entityId === task.id || terms.some((term) => action.includes(term));
}

type CompleteTaskFormProps = {
  actionsEnabled: boolean;
  task: Task;
};

function CompleteTaskForm({ actionsEnabled, task }: CompleteTaskFormProps) {
  const [state, formAction] = useActionState(updateTaskStatusAction, initialActionFormState);

  return (
    <form action={formAction}>
      <input name="taskId" type="hidden" value={task.id} />
      <input name="status" type="hidden" value="complete" />
      <SubmitButton
        disabled={!actionsEnabled}
        icon={CheckCircle2}
        label="Complete"
        pendingLabel="Completing"
        variant="success"
      />
      <ActionFeedback className="mt-2 max-w-48 text-xs" state={state} />
    </form>
  );
}

type TaskStatusFormProps = {
  actionsEnabled: boolean;
  task: Task;
};

function TaskStatusForm({ actionsEnabled, task }: TaskStatusFormProps) {
  const [state, formAction] = useActionState(updateTaskStatusAction, initialActionFormState);

  return (
    <DrawerFormShell
      description="Update the task status and record the change in recent activity."
      title="Update status"
    >
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
        <input name="taskId" type="hidden" value={task.id} />
        <label className="min-w-0 flex-1 text-sm font-medium text-text-primary">
          <span className="sr-only">Task status</span>
          <select
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue={task.status}
            disabled={!actionsEnabled}
            name="status"
          >
            {taskStatuses.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </label>
        <SubmitButton disabled={!actionsEnabled} icon={Save} label="Save" pendingLabel="Saving" />
      </form>
      <ActionFeedback
        disabledMessage={!actionsEnabled ? "Writes are disabled in this environment." : undefined}
        state={state}
      />
    </DrawerFormShell>
  );
}

type CreateTaskFormProps = {
  actionsEnabled: boolean;
};

function CreateTaskForm({ actionsEnabled }: CreateTaskFormProps) {
  const [state, formAction] = useActionState(createTaskAction, initialActionFormState);

  return (
    <form action={formAction} className="space-y-4">
      <label className="block text-sm font-medium text-text-primary">
        Title
        <input
          className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
          disabled={!actionsEnabled}
          name="title"
          required
          type="text"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-text-primary">
          Related record
          <input
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="relatedLabel"
            type="text"
          />
        </label>
        <label className="text-sm font-medium text-text-primary">
          Due date
          <input
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="dueDate"
            type="date"
          />
        </label>
        <label className="text-sm font-medium text-text-primary sm:col-span-2">
          Priority
          <select
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue="normal"
            disabled={!actionsEnabled}
            name="priority"
          >
            {taskPriorities.map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </select>
        </label>
      </div>
      <SubmitButton disabled={!actionsEnabled} icon={Plus} label="Create task" pendingLabel="Creating" />
      <ActionFeedback
        disabledMessage={!actionsEnabled ? "Writes are disabled in this environment." : undefined}
        state={state}
      />
    </form>
  );
}

function isOverdue(task: Task) {
  return task.status !== "complete" && new Date(task.dueDate) < new Date();
}

export function TasksTable({ actionsEnabled, activities, canCreate, initialStatusFilter = "all", tasks }: TasksTableProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>(initialStatusFilter);
  const filteredTasks = useMemo(
    () => tasks.filter((task) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "overdue") return isOverdue(task);
      return task.status === statusFilter;
    }),
    [statusFilter, tasks],
  );
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  );
  const selectedActivities = useMemo(
    () => (selectedTask ? activities.filter((activity) => matchesTaskActivity(activity, selectedTask)) : []),
    [activities, selectedTask],
  );

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label>
            <span className="sr-only">Filter tasks by status</span>
            <select
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-card sm:w-52"
              onChange={(event) => setStatusFilter(event.target.value as TaskStatusFilter)}
              value={statusFilter}
            >
              {taskStatusFilters.map((status) => (
                <option key={status} value={status}>{taskStatusLabel(status)}</option>
              ))}
            </select>
          </label>
          <p className="text-sm font-medium text-text-secondary">{filteredTasks.length} of {tasks.length} tasks</p>
        </div>
        {canCreate ? (
          <button
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-accent/90"
            onClick={() => {
              setSelectedTaskId(null);
              setIsCreateOpen(true);
            }}
            type="button"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New task
          </button>
        ) : null}
      </div>
      <DataTable>
        <thead>
          <tr>
            <TableHead>Title</TableHead>
            <TableHead>Related Record</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredTasks.map((task) => (
            <tr key={task.id} className="transition hover:bg-surface-muted">
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell className="text-text-secondary">{task.relatedRecord}</TableCell>
              <TableCell className="text-text-secondary">{formatDate(task.dueDate)}</TableCell>
              <TableCell><Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge></TableCell>
              <TableCell><Badge variant={statusVariant(task.status)}>{task.status}</Badge></TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary shadow-card transition hover:bg-surface-muted"
                    onClick={() => {
                      setIsCreateOpen(false);
                      setSelectedTaskId(task.id);
                    }}
                    type="button"
                  >
                    <Eye className="h-4 w-4" aria-hidden />
                    View
                  </button>
                  {task.status !== "complete" ? (
                    <CompleteTaskForm actionsEnabled={actionsEnabled} task={task} />
                  ) : null}
                </div>
              </TableCell>
            </tr>
          ))}
          {filteredTasks.length === 0 ? (
            <tr>
              <TableCell className="py-10 text-center text-text-secondary" colSpan={6}>
                No tasks match this filter.
              </TableCell>
            </tr>
          ) : null}
        </tbody>
      </DataTable>
      <DetailDrawer
        eyebrow="Task record"
        isOpen={Boolean(selectedTask)}
        onClose={() => setSelectedTaskId(null)}
        title={selectedTask?.title ?? "Task"}
      >
        {selectedTask ? (
          <div className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Related record" value={selectedTask.relatedRecord} />
              <DetailField label="Due date" value={formatDate(selectedTask.dueDate)} />
              <DetailField label="Priority" value={<Badge variant={priorityVariant(selectedTask.priority)}>{selectedTask.priority}</Badge>} />
              <DetailField label="Status" value={<Badge variant={statusVariant(selectedTask.status)}>{selectedTask.status}</Badge>} />
            </dl>
            <TaskStatusForm key={selectedTask.id} actionsEnabled={actionsEnabled} task={selectedTask} />
            <ActivityList activities={selectedActivities} />
          </div>
        ) : null}
      </DetailDrawer>
      <DetailDrawer
        eyebrow="Operations"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New task"
      >
        <CreateTaskForm actionsEnabled={actionsEnabled} />
      </DetailDrawer>
    </>
  );
}
