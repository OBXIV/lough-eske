"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Eye, Plus, Save, Search, X } from "lucide-react";

import { createTaskAction, updateTaskDetailsAction, updateTaskStatusAction } from "@/app/app/actions";
import { ActionFeedback, SubmitButton } from "@/components/broker-portal/action-form";
import { ActivityList, DetailField, DrawerFormShell } from "@/components/broker-portal/detail-fields";
import { Badge } from "@/components/ui/badge";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { DataTable, TableCell, TableHead } from "@/components/ui/table";
import { initialActionFormState } from "@/lib/action-state";
import {
  isTaskOverdue,
  matchesTaskDueFilter,
  taskDueFilterLabel,
  taskDueFilters,
  taskDueKey,
  type TaskDueFilter,
} from "@/lib/task-filters";
import { formatDate, formatDateOnly } from "@/lib/utils";
import type { ActivityLog, Task, TenantMember } from "@/types/domain";

type TaskStatusFilter = "all" | Task["status"];
type TaskOwnerFilter = "all" | "unassigned" | string;
type TaskPriorityFilter = "all" | Task["priority"];
type TaskRelatedTypeFilter = "all" | string;

type TasksTableProps = {
  actionsEnabled: boolean;
  activities: ActivityLog[];
  canCreate: boolean;
  initialDueFilter?: TaskDueFilter;
  initialStatusFilter?: TaskStatusFilter;
  members: TenantMember[];
  tasks: Task[];
  todayKey: string;
};

const taskStatuses: Task["status"][] = ["open", "in_progress", "complete", "cancelled"];
const taskPriorities: Task["priority"][] = ["low", "normal", "high", "urgent"];
const taskStatusFilters: TaskStatusFilter[] = ["all", ...taskStatuses];

function taskStatusLabel(status: TaskStatusFilter) {
  if (status === "all") return "All statuses";
  return status.replace("_", " ");
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

function relatedTypeLabel(type: string) {
  return type ? type.charAt(0).toUpperCase() + type.slice(1) : "Manual";
}

function relatedModuleLink(task: Task): { href: string; label: string } | null {
  if (task.relatedType === "agent") {
    return { href: `/app/agents?q=${encodeURIComponent(task.relatedRecord)}`, label: "Open in Agents" };
  }
  if (task.relatedType === "recruit") return { href: "/app/recruiting", label: "Open in Recruiting" };
  if (task.relatedType === "transaction") return { href: "/app/transactions", label: "Open in Transactions" };
  if (task.relatedType === "report") return { href: "/app/reports", label: "Open in Reports" };
  return null;
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

type TaskDetailsFormProps = {
  actionsEnabled: boolean;
  members: TenantMember[];
  task: Task;
};

function TaskDetailsForm({ actionsEnabled, members, task }: TaskDetailsFormProps) {
  const [state, formAction] = useActionState(updateTaskDetailsAction, initialActionFormState);
  const assigneeMissing = Boolean(task.assigneeId) && !members.some((member) => member.profileId === task.assigneeId);

  return (
    <DrawerFormShell
      description="Reassign the task or move its due date. Changes are recorded in recent activity."
      title="Assignment and schedule"
    >
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <input name="taskId" type="hidden" value={task.id} />
        <label className="min-w-0 flex-1 text-sm font-medium text-text-primary">
          Owner
          <select
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue={task.assigneeId ?? ""}
            disabled={!actionsEnabled}
            name="assigneeId"
          >
            <option value="">Unassigned</option>
            {assigneeMissing ? (
              <option value={task.assigneeId ?? ""}>{`${task.assignee ?? "Current owner"} (inactive)`}</option>
            ) : null}
            {members.map((member) => (
              <option key={member.profileId} value={member.profileId}>{member.name}</option>
            ))}
          </select>
        </label>
        <label className="min-w-0 flex-1 text-sm font-medium text-text-primary">
          Due date
          <input
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue={taskDueKey(task)}
            disabled={!actionsEnabled}
            name="dueDate"
            type="date"
          />
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
  members: TenantMember[];
};

function CreateTaskForm({ actionsEnabled, members }: CreateTaskFormProps) {
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
        <label className="text-sm font-medium text-text-primary">
          Owner
          <select
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue=""
            disabled={!actionsEnabled}
            name="assigneeId"
          >
            <option value="">Unassigned</option>
            {members.map((member) => (
              <option key={member.profileId} value={member.profileId}>{member.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-text-primary">
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
        <label className="text-sm font-medium text-text-primary sm:col-span-2">
          Notes
          <textarea
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="description"
            rows={3}
          />
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

export function TasksTable({
  actionsEnabled,
  activities,
  canCreate,
  initialDueFilter = "any",
  initialStatusFilter = "all",
  members,
  tasks,
  todayKey,
}: TasksTableProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [ownerFilter, setOwnerFilter] = useState<TaskOwnerFilter>("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>("all");
  const [relatedTypeFilter, setRelatedTypeFilter] = useState<TaskRelatedTypeFilter>("all");
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>(initialStatusFilter);
  const [dueFilter, setDueFilter] = useState<TaskDueFilter>(initialDueFilter);

  const relatedTypes = useMemo(
    () => Array.from(new Set(tasks.map((task) => task.relatedType))).sort(),
    [tasks],
  );
  const filteredTasks = useMemo(() => {
    const query = search.trim().toLowerCase();

    return tasks.filter((task) => {
      if (query) {
        const haystack = [task.title, task.relatedRecord, task.assignee ?? ""].join(" ").toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (ownerFilter === "unassigned" && task.assigneeId) return false;
      if (ownerFilter !== "all" && ownerFilter !== "unassigned" && task.assigneeId !== ownerFilter) return false;
      if (priorityFilter !== "all" && task.priority !== priorityFilter) return false;
      if (relatedTypeFilter !== "all" && task.relatedType !== relatedTypeFilter) return false;
      if (statusFilter !== "all" && task.status !== statusFilter) return false;
      return matchesTaskDueFilter(task, dueFilter, todayKey);
    });
  }, [dueFilter, ownerFilter, priorityFilter, relatedTypeFilter, search, statusFilter, tasks, todayKey]);
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  );
  const selectedActivities = useMemo(
    () => (selectedTask ? activities.filter((activity) => matchesTaskActivity(activity, selectedTask)) : []),
    [activities, selectedTask],
  );
  const selectedModuleLink = selectedTask ? relatedModuleLink(selectedTask) : null;

  const filterSelectClass = "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-card sm:w-44";

  return (
    <>
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" aria-hidden />
            <input
              className="w-full rounded-md border border-border bg-surface py-2 pl-9 pr-9 text-sm text-text-primary shadow-card"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search title, record, or owner"
              type="search"
              value={search}
            />
            {search ? (
              <button
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-secondary transition hover:text-text-primary"
                onClick={() => setSearch("")}
                type="button"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
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
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <label>
            <span className="sr-only">Filter tasks by owner</span>
            <select
              className={filterSelectClass}
              onChange={(event) => setOwnerFilter(event.target.value)}
              value={ownerFilter}
            >
              <option value="all">All owners</option>
              <option value="unassigned">Unassigned</option>
              {members.map((member) => (
                <option key={member.profileId} value={member.profileId}>{member.name}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter tasks by priority</span>
            <select
              className={filterSelectClass}
              onChange={(event) => setPriorityFilter(event.target.value as TaskPriorityFilter)}
              value={priorityFilter}
            >
              <option value="all">All priorities</option>
              {taskPriorities.map((priority) => (
                <option key={priority} value={priority}>{priority}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter tasks by related type</span>
            <select
              className={filterSelectClass}
              onChange={(event) => setRelatedTypeFilter(event.target.value)}
              value={relatedTypeFilter}
            >
              <option value="all">All record types</option>
              {relatedTypes.map((type) => (
                <option key={type} value={type}>{relatedTypeLabel(type)}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter tasks by status</span>
            <select
              className={filterSelectClass}
              onChange={(event) => setStatusFilter(event.target.value as TaskStatusFilter)}
              value={statusFilter}
            >
              {taskStatusFilters.map((status) => (
                <option key={status} value={status}>{taskStatusLabel(status)}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter tasks by due date</span>
            <select
              className={filterSelectClass}
              onChange={(event) => setDueFilter(event.target.value as TaskDueFilter)}
              value={dueFilter}
            >
              {taskDueFilters.map((filter) => (
                <option key={filter} value={filter}>{taskDueFilterLabel(filter)}</option>
              ))}
            </select>
          </label>
          <p className="text-sm font-medium text-text-secondary">{filteredTasks.length} of {tasks.length} tasks</p>
        </div>
      </div>
      <DataTable>
        <thead>
          <tr>
            <TableHead>Title</TableHead>
            <TableHead>Related Record</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {filteredTasks.map((task) => (
            <tr
              key={task.id}
              className="cursor-pointer transition hover:bg-surface-muted"
              onClick={() => {
                setIsCreateOpen(false);
                setSelectedTaskId(task.id);
              }}
            >
              <TableCell className="font-medium">{task.title}</TableCell>
              <TableCell className="text-text-secondary">{task.relatedRecord}</TableCell>
              <TableCell className="text-text-secondary">{task.assignee ?? "Unassigned"}</TableCell>
              <TableCell className="text-text-secondary">
                <span className="inline-flex items-center gap-2">
                  {formatDateOnly(task.dueDate)}
                  {isTaskOverdue(task, todayKey) ? <Badge variant="danger">Overdue</Badge> : null}
                </span>
              </TableCell>
              <TableCell><Badge variant={priorityVariant(task.priority)}>{task.priority}</Badge></TableCell>
              <TableCell><Badge variant={statusVariant(task.status)}>{task.status}</Badge></TableCell>
              <TableCell>
                <div
                  className="flex flex-wrap gap-2"
                  onClick={(event) => event.stopPropagation()}
                >
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
              <TableCell className="py-10 text-center text-text-secondary" colSpan={7}>
                No tasks match these filters.
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
              <DetailField label="Owner" value={selectedTask.assignee ?? "Unassigned"} />
              <DetailField
                label="Due date"
                value={
                  <span className="inline-flex items-center gap-2">
                    {formatDateOnly(selectedTask.dueDate)}
                    {isTaskOverdue(selectedTask, todayKey) ? <Badge variant="danger">Overdue</Badge> : null}
                  </span>
                }
              />
              <DetailField label="Created" value={formatDate(selectedTask.createdAt)} />
              <DetailField label="Priority" value={<Badge variant={priorityVariant(selectedTask.priority)}>{selectedTask.priority}</Badge>} />
              <DetailField label="Status" value={<Badge variant={statusVariant(selectedTask.status)}>{selectedTask.status}</Badge>} />
            </dl>
            <TaskDetailsForm key={`details-${selectedTask.id}`} actionsEnabled={actionsEnabled} members={members} task={selectedTask} />
            <TaskStatusForm key={`status-${selectedTask.id}`} actionsEnabled={actionsEnabled} task={selectedTask} />
            <div className="rounded-lg border border-border bg-surface p-4">
              <h3 className="text-sm font-semibold text-text-primary">Notes</h3>
              {selectedTask.description ? (
                <p className="mt-2 text-sm leading-6 text-text-secondary">{selectedTask.description}</p>
              ) : (
                <p className="mt-2 rounded-md border border-dashed border-border bg-surface-muted px-3 py-4 text-center text-sm text-text-secondary">
                  No notes on this task. Notes are captured when the task is created.
                </p>
              )}
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-text-primary">Related record</h3>
                <Badge variant="info">{relatedTypeLabel(selectedTask.relatedType)}</Badge>
              </div>
              <p className="mt-2 text-sm font-medium text-text-primary">{selectedTask.relatedRecord}</p>
              {selectedModuleLink ? (
                <Link
                  className="mt-2 inline-flex items-center text-sm font-medium text-accent hover:underline"
                  href={selectedModuleLink.href}
                >
                  {selectedModuleLink.label}
                </Link>
              ) : (
                <p className="mt-1 text-xs text-text-secondary">No linked module for this record.</p>
              )}
            </div>
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
        <CreateTaskForm actionsEnabled={actionsEnabled} members={members} />
      </DetailDrawer>
    </>
  );
}
