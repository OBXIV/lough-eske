"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Eye, Save } from "lucide-react";

import { updateTaskStatusAction } from "@/app/app/actions";
import { DetailField, DrawerFormShell } from "@/components/broker-portal/detail-fields";
import { Badge } from "@/components/ui/badge";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { DataTable, TableCell, TableHead } from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { Task } from "@/types/domain";

type TasksTableProps = {
  actionsEnabled: boolean;
  tasks: Task[];
};

const taskStatuses: Task["status"][] = ["open", "in_progress", "complete", "cancelled"];

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

export function TasksTable({ actionsEnabled, tasks }: TasksTableProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const selectedTask = useMemo(
    () => tasks.find((task) => task.id === selectedTaskId) ?? null,
    [selectedTaskId, tasks],
  );

  return (
    <>
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
          {tasks.map((task) => (
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
                    onClick={() => setSelectedTaskId(task.id)}
                    type="button"
                  >
                    <Eye className="h-4 w-4" aria-hidden />
                    View
                  </button>
                  {task.status !== "complete" ? (
                    <form action={updateTaskStatusAction}>
                      <input name="taskId" type="hidden" value={task.id} />
                      <input name="status" type="hidden" value="complete" />
                      <button
                        className="inline-flex items-center gap-2 rounded-md border border-success/20 bg-success/10 px-3 py-2 text-sm font-semibold text-success shadow-card transition hover:bg-success/15 disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!actionsEnabled}
                        type="submit"
                      >
                        <CheckCircle2 className="h-4 w-4" aria-hidden />
                        Complete
                      </button>
                    </form>
                  ) : null}
                </div>
              </TableCell>
            </tr>
          ))}
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
            <DrawerFormShell
              description="Update the task status and record the change in recent activity."
              title="Update status"
            >
              <form action={updateTaskStatusAction} className="flex flex-col gap-3 sm:flex-row">
                <input name="taskId" type="hidden" value={selectedTask.id} />
                <label className="min-w-0 flex-1 text-sm font-medium text-text-primary">
                  <span className="sr-only">Task status</span>
                  <select
                    className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                    defaultValue={selectedTask.status}
                    disabled={!actionsEnabled}
                    name="status"
                  >
                    {taskStatuses.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </label>
                <button
                  className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-card disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!actionsEnabled}
                  type="submit"
                >
                  <Save className="h-4 w-4" aria-hidden />
                  Save
                </button>
              </form>
            </DrawerFormShell>
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
