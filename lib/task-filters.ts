import { localDateKey, shiftDateKey } from "@/lib/utils";
import type { Task } from "@/types/domain";

export type TaskDueFilter = "any" | "overdue" | "today" | "next_7" | "next_30";

export const taskDueFilters: TaskDueFilter[] = ["any", "overdue", "today", "next_7", "next_30"];

export function taskDueFilterLabel(filter: TaskDueFilter) {
  if (filter === "any") return "Any due date";
  if (filter === "overdue") return "Overdue";
  if (filter === "today") return "Due today";
  if (filter === "next_7") return "Due next 7 days";
  return "Due next 30 days";
}

export function isOpenTaskWork(task: Task) {
  return task.status === "open" || task.status === "in_progress";
}

export function taskDueKey(task: Task) {
  return task.dueDate ? task.dueDate.slice(0, 10) : "";
}

export function currentDateKey() {
  return localDateKey(new Date());
}

// todayKey is threaded explicitly so a render computes "today" exactly once:
// the server anchors dashboard counts and the tasks page passes the same key
// to the client table, keeping SSR, hydration, and drilldown counts aligned.
// Overdue means past due AND still open; the window filters are pure timing
// (inclusive of today) so they compose with the independent status filter.
export function matchesTaskDueFilter(task: Task, filter: TaskDueFilter, todayKey: string) {
  if (filter === "any") return true;

  const dueKey = taskDueKey(task);
  if (!dueKey) return false;

  if (filter === "overdue") return isOpenTaskWork(task) && dueKey < todayKey;
  if (filter === "today") return dueKey === todayKey;
  if (filter === "next_7") return dueKey >= todayKey && dueKey <= shiftDateKey(todayKey, 7);
  return dueKey >= todayKey && dueKey <= shiftDateKey(todayKey, 30);
}

export function isTaskOverdue(task: Task, todayKey: string) {
  return matchesTaskDueFilter(task, "overdue", todayKey);
}
