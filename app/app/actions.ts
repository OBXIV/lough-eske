"use server";

import { revalidatePath } from "next/cache";

import { requirePermission, requireSession } from "@/lib/auth/session";
import { initialActionFormState, type ActionFormState } from "@/lib/action-state";
import { searchWorkspace } from "@/lib/data/app-data";
import { areTenantWritesEnabled } from "@/lib/data/database";
import {
  archiveAgent,
  createAgent,
  createAgentResource,
  createRecruit,
  createTask,
  updateAgentProfile,
  updateAgentStatus,
  updateRecruitPipeline,
  updateTaskDetails,
  updateTaskStatus,
  updateTenantProfile,
  updateTransactionStage,
} from "@/lib/data/mutations";
import type { Agent, AgentResource, Recruit, Task, Transaction, UserSession } from "@/types/domain";

const editableAgentStatuses: Agent["brokerageStatus"][] = ["active", "inactive", "recruit", "onboarding"];
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
const recruitHeatScores: Recruit["heatScore"][] = ["Hot", "Warm", "Cold"];
const taskPriorities: Task["priority"][] = ["low", "normal", "high", "urgent"];
const resourceTypes: AgentResource["resourceType"][] = ["Link", "PDF", "Video", "Training", "Policy", "Template"];
const resourceVisibilities: AgentResource["visibility"][] = ["all_agents", "staff_only"];

function formDataFromArgs(previousStateOrFormData: ActionFormState | FormData, formData?: FormData) {
  return formData ?? (previousStateOrFormData instanceof FormData ? previousStateOrFormData : new FormData());
}

function success(message: string): ActionFormState {
  return { message, status: "success", submittedAt: Date.now() };
}

function error(message: string): ActionFormState {
  return { message, status: "error", submittedAt: Date.now() };
}

function writesDisabled() {
  return error("Writes are disabled for this workspace.");
}

function requiredFormValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();

  if (!value) {
    throw new Error(`Missing ${key}.`);
  }

  return value;
}

function optionalFormValue(formData: FormData, key: string) {
  const value = String(formData.get(key) ?? "").trim();
  return value || null;
}

function optionalDateValue(formData: FormData, key: string) {
  const value = optionalFormValue(formData, key);

  if (value && !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error("Due date must be a valid date.");
  }

  return value;
}

function optionalEmailValue(formData: FormData, key: string) {
  const value = optionalFormValue(formData, key);

  if (value && !value.includes("@")) {
    throw new Error("Email must include @.");
  }

  return value;
}

function assertAllowed<T extends string>(value: string, allowed: readonly T[], label: string): T {
  if (!allowed.includes(value as T)) {
    throw new Error(`Invalid ${label}.`);
  }

  return value as T;
}

function optionalAllowed<T extends string>(formData: FormData, key: string, allowed: readonly T[], label: string): T | null {
  const value = optionalFormValue(formData, key);
  return value ? assertAllowed(value, allowed, label) : null;
}

function recruitScoreValue(formData: FormData) {
  const parsed = Number(requiredFormValue(formData, "recruitScore"));

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error("Recruit score must be between 0 and 100.");
  }

  return Math.round(parsed);
}

function tenantNameValue(formData: FormData) {
  const value = requiredFormValue(formData, "name");

  if (value.length < 2 || value.length > 80) {
    throw new Error("Tenant name must be between 2 and 80 characters.");
  }

  return value;
}

function tenantColorValue(formData: FormData) {
  const value = requiredFormValue(formData, "primaryColor").toUpperCase();

  if (!/^#[0-9A-F]{6}$/.test(value)) {
    throw new Error("Accent color must be a six-digit hex value.");
  }

  return value;
}

async function runAction(session: UserSession, work: () => Promise<void | string | null> | void | string | null) {
  if (!areTenantWritesEnabled(session)) {
    return writesDisabled();
  }

  try {
    const message = await work();
    return success(message || "Saved.");
  } catch (caught) {
    return error(caught instanceof Error ? caught.message : "Action failed.");
  }
}

export async function updateAgentStatusAction(
  previousStateOrFormData: ActionFormState | FormData = initialActionFormState,
  maybeFormData?: FormData,
) {
  const session = await requirePermission("edit_agents");
  const formData = formDataFromArgs(previousStateOrFormData, maybeFormData);

  return runAction(session, async () => {
    const agentId = requiredFormValue(formData, "agentId");
    const status = assertAllowed(requiredFormValue(formData, "status"), editableAgentStatuses, "agent status");

    await updateAgentStatus(session, agentId, status);
    revalidatePath("/app/agents");
    revalidatePath("/app/dashboard");
    return `Agent status updated to ${status}.`;
  });
}

export async function createAgentAction(
  previousStateOrFormData: ActionFormState | FormData = initialActionFormState,
  maybeFormData?: FormData,
) {
  const session = await requirePermission("create_agents");
  const formData = formDataFromArgs(previousStateOrFormData, maybeFormData);

  return runAction(session, async () => {
    const input = {
      email: optionalEmailValue(formData, "email"),
      firstName: requiredFormValue(formData, "firstName"),
      lastName: requiredFormValue(formData, "lastName"),
      licenseNumber: optionalFormValue(formData, "licenseNumber"),
      phone: optionalFormValue(formData, "phone"),
      source: optionalFormValue(formData, "source"),
      status: assertAllowed(requiredFormValue(formData, "status"), editableAgentStatuses, "agent status"),
    };

    await createAgent(session, input);
    revalidatePath("/app/agents");
    revalidatePath("/app/dashboard");
    return `Agent ${input.firstName} ${input.lastName} created.`;
  });
}

export async function updateAgentProfileAction(
  previousStateOrFormData: ActionFormState | FormData = initialActionFormState,
  maybeFormData?: FormData,
) {
  const session = await requirePermission("edit_agents");
  const formData = formDataFromArgs(previousStateOrFormData, maybeFormData);

  return runAction(session, async () => {
    const agentId = requiredFormValue(formData, "agentId");

    await updateAgentProfile(session, agentId, {
      email: optionalEmailValue(formData, "email"),
      licenseNumber: optionalFormValue(formData, "licenseNumber"),
      phone: optionalFormValue(formData, "phone"),
      source: optionalFormValue(formData, "source"),
    });
    revalidatePath("/app/agents");
    revalidatePath("/app/dashboard");
    return "Agent profile updated.";
  });
}

export async function archiveAgentAction(
  previousStateOrFormData: ActionFormState | FormData = initialActionFormState,
  maybeFormData?: FormData,
) {
  const session = await requirePermission("edit_agents");
  const formData = formDataFromArgs(previousStateOrFormData, maybeFormData);

  return runAction(session, async () => {
    const agentId = requiredFormValue(formData, "agentId");

    await archiveAgent(session, agentId);
    revalidatePath("/app/agents");
    revalidatePath("/app/dashboard");
    return "Agent archived and audit timestamp recorded.";
  });
}

export async function updateRecruitStageAction(
  previousStateOrFormData: ActionFormState | FormData = initialActionFormState,
  maybeFormData?: FormData,
) {
  const session = await requirePermission("edit_recruits");
  const formData = formDataFromArgs(previousStateOrFormData, maybeFormData);

  return runAction(session, async () => {
    const recruitId = requiredFormValue(formData, "recruitId");
    const stage = assertAllowed(requiredFormValue(formData, "stage"), recruitStages, "recruit stage");
    const heatScore = optionalAllowed(formData, "heatScore", recruitHeatScores, "heat score");

    await updateRecruitPipeline(session, recruitId, { heatScore, stage });
    revalidatePath("/app/recruiting");
    revalidatePath("/app/dashboard");
    return heatScore ? `Recruit moved to ${stage} and marked ${heatScore}.` : `Recruit moved to ${stage}.`;
  });
}

export async function updateTransactionStageAction(
  previousStateOrFormData: ActionFormState | FormData = initialActionFormState,
  maybeFormData?: FormData,
) {
  const session = await requirePermission("edit_transactions");
  const formData = formDataFromArgs(previousStateOrFormData, maybeFormData);

  return runAction(session, async () => {
    const transactionId = requiredFormValue(formData, "transactionId");
    const stage = assertAllowed(requiredFormValue(formData, "stage"), transactionStages, "transaction stage");

    await updateTransactionStage(session, transactionId, stage);
    revalidatePath("/app/transactions");
    revalidatePath("/app/dashboard");
    revalidatePath("/app/reports");
    return `Transaction moved to ${stage}.`;
  });
}

export async function updateTaskStatusAction(
  previousStateOrFormData: ActionFormState | FormData = initialActionFormState,
  maybeFormData?: FormData,
) {
  const session = await requirePermission("manage_tasks");
  const formData = formDataFromArgs(previousStateOrFormData, maybeFormData);

  return runAction(session, async () => {
    const taskId = requiredFormValue(formData, "taskId");
    const status = assertAllowed(requiredFormValue(formData, "status"), taskStatuses, "task status");

    await updateTaskStatus(session, taskId, status);
    revalidatePath("/app/tasks");
    revalidatePath("/app/dashboard");
    return `Task updated to ${status}.`;
  });
}

export async function createRecruitAction(
  previousStateOrFormData: ActionFormState | FormData = initialActionFormState,
  maybeFormData?: FormData,
) {
  const session = await requirePermission("create_recruits");
  const formData = formDataFromArgs(previousStateOrFormData, maybeFormData);

  return runAction(session, async () => {
    const input = {
      heatScore: assertAllowed(requiredFormValue(formData, "heatScore"), recruitHeatScores, "heat score"),
      name: requiredFormValue(formData, "name"),
      nextFollowUpDate: optionalFormValue(formData, "nextFollowUpDate"),
      notesSummary: optionalFormValue(formData, "notesSummary"),
      recruitScore: recruitScoreValue(formData),
      source: optionalFormValue(formData, "source"),
      stage: assertAllowed(requiredFormValue(formData, "stage"), recruitStages, "recruit stage"),
    };

    await createRecruit(session, input);
    revalidatePath("/app/recruiting");
    revalidatePath("/app/dashboard");
    return `Recruit ${input.name} created.`;
  });
}

export async function createTaskAction(
  previousStateOrFormData: ActionFormState | FormData = initialActionFormState,
  maybeFormData?: FormData,
) {
  const session = await requirePermission("manage_tasks");
  const formData = formDataFromArgs(previousStateOrFormData, maybeFormData);

  return runAction(session, async () => {
    const input = {
      assigneeId: optionalFormValue(formData, "assigneeId"),
      description: optionalFormValue(formData, "description"),
      dueDate: optionalDateValue(formData, "dueDate"),
      priority: assertAllowed(requiredFormValue(formData, "priority"), taskPriorities, "task priority"),
      relatedLabel: optionalFormValue(formData, "relatedLabel"),
      title: requiredFormValue(formData, "title"),
    };

    await createTask(session, input);
    revalidatePath("/app/tasks");
    revalidatePath("/app/dashboard");
    return `Task "${input.title}" created.`;
  });
}

export async function updateTaskDetailsAction(
  previousStateOrFormData: ActionFormState | FormData = initialActionFormState,
  maybeFormData?: FormData,
) {
  const session = await requirePermission("manage_tasks");
  const formData = formDataFromArgs(previousStateOrFormData, maybeFormData);

  return runAction(session, async () => {
    const taskId = requiredFormValue(formData, "taskId");
    const input = {
      assigneeId: optionalFormValue(formData, "assigneeId"),
      dueDate: optionalDateValue(formData, "dueDate"),
    };

    await updateTaskDetails(session, taskId, input);
    revalidatePath("/app/tasks");
    revalidatePath("/app/dashboard");
    return "Task assignment and schedule updated.";
  });
}

export async function publishAgentResourceAction(
  previousStateOrFormData: ActionFormState | FormData = initialActionFormState,
  maybeFormData?: FormData,
) {
  const session = await requirePermission("manage_agent_resources");
  const formData = formDataFromArgs(previousStateOrFormData, maybeFormData);

  return runAction(session, async () => {
    const url = optionalFormValue(formData, "url");

    if (url && !/^https?:\/\//.test(url)) {
      throw new Error("Resource URL must start with http:// or https://.");
    }

    const input = {
      description: optionalFormValue(formData, "description"),
      resourceType: assertAllowed(requiredFormValue(formData, "resourceType"), resourceTypes, "resource type"),
      title: requiredFormValue(formData, "title"),
      url,
      visibility: assertAllowed(requiredFormValue(formData, "visibility"), resourceVisibilities, "resource visibility"),
    };

    await createAgentResource(session, input);
    revalidatePath("/app/agent-portal");
    return input.visibility === "all_agents"
      ? `Resource "${input.title}" published to agents.`
      : `Resource "${input.title}" saved as staff-only.`;
  });
}

export async function updateTenantProfileAction(
  previousStateOrFormData: ActionFormState | FormData = initialActionFormState,
  maybeFormData?: FormData,
) {
  const session = await requirePermission("manage_settings");
  const formData = formDataFromArgs(previousStateOrFormData, maybeFormData);

  return runAction(session, async () => {
    const name = tenantNameValue(formData);
    const primaryColor = tenantColorValue(formData);

    await updateTenantProfile(session, { name, primaryColor });
    revalidatePath("/app", "layout");
    revalidatePath("/app/settings");
    return `Branding updated for ${name}.`;
  });
}

export async function searchWorkspaceAction(query: string) {
  const session = await requireSession();
  return searchWorkspace(session, query);
}
