"use server";

import { revalidatePath } from "next/cache";

import { requirePermission } from "@/lib/auth/session";
import {
  updateAgentStatus,
  updateRecruitStage,
  updateTaskStatus,
  updateTransactionStage,
} from "@/lib/data/mutations";
import type { Agent, Recruit, Task, Transaction } from "@/types/domain";

const agentStatuses: Agent["brokerageStatus"][] = ["active", "inactive", "recruit", "onboarding", "former"];
const recruitStages: Recruit["stage"][] = ["Identified", "Contacted", "Engaged", "Offer Pending", "Joined", "Lost"];
const transactionStages: Transaction["stage"][] = [
  "Lead",
  "Listing",
  "Under Contract",
  "Inspection",
  "Clear to Close",
  "Closed",
  "Cancelled",
];
const taskStatuses: Task["status"][] = ["open", "in_progress", "complete", "cancelled"];

function requiredFormValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    throw new Error(`Missing ${key}.`);
  }

  return value;
}

function assertAllowed<T extends string>(value: string, allowed: readonly T[], label: string): T {
  if (!allowed.includes(value as T)) {
    throw new Error(`Invalid ${label}.`);
  }

  return value as T;
}

export async function updateAgentStatusAction(formData: FormData) {
  const session = await requirePermission("edit_agents");
  const agentId = requiredFormValue(formData, "agentId");
  const status = assertAllowed(requiredFormValue(formData, "status"), agentStatuses, "agent status");

  await updateAgentStatus(session, agentId, status);
  revalidatePath("/app/agents");
  revalidatePath("/app/dashboard");
}

export async function updateRecruitStageAction(formData: FormData) {
  const session = await requirePermission("edit_recruits");
  const recruitId = requiredFormValue(formData, "recruitId");
  const stage = assertAllowed(requiredFormValue(formData, "stage"), recruitStages, "recruit stage");

  await updateRecruitStage(session, recruitId, stage);
  revalidatePath("/app/recruiting");
  revalidatePath("/app/dashboard");
}

export async function updateTransactionStageAction(formData: FormData) {
  const session = await requirePermission("edit_transactions");
  const transactionId = requiredFormValue(formData, "transactionId");
  const stage = assertAllowed(requiredFormValue(formData, "stage"), transactionStages, "transaction stage");

  await updateTransactionStage(session, transactionId, stage);
  revalidatePath("/app/transactions");
  revalidatePath("/app/dashboard");
  revalidatePath("/app/reports");
}

export async function updateTaskStatusAction(formData: FormData) {
  const session = await requirePermission("manage_tasks");
  const taskId = requiredFormValue(formData, "taskId");
  const status = assertAllowed(requiredFormValue(formData, "status"), taskStatuses, "task status");

  await updateTaskStatus(session, taskId, status);
  revalidatePath("/app/tasks");
  revalidatePath("/app/dashboard");
}
