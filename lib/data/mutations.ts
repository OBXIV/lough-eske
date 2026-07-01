import "server-only";

import { isDatabaseConfigured, withTenantRls } from "@/lib/data/database";
import { formatDateOnly } from "@/lib/utils";
import type { Agent, Recruit, Task, Transaction, UserSession } from "@/types/domain";

type UpdatedAgentRow = {
  first_name: string;
  last_name: string;
};

type CreatedAgentRow = {
  id: string;
  first_name: string;
  last_name: string;
};

type UpdatedRecruitRow = {
  name: string | null;
};

type UpdatedTransactionRow = {
  client_name: string | null;
  property_address: string | null;
  finalized_at: string | null;
};

type UpdatedTaskRow = {
  title: string;
};

type CreatedRecruitRow = {
  id: string;
  prospect_name: string | null;
};

type CreatedTaskRow = {
  id: string;
  title: string;
};

function actorId(session: UserSession) {
  return session.user.profileId;
}

export type CreateRecruitInput = {
  heatScore: Recruit["heatScore"];
  name: string;
  nextFollowUpDate: string | null;
  notesSummary: string | null;
  recruitScore: number;
  source: string | null;
  stage: Recruit["stage"];
};

export type CreateTaskInput = {
  assigneeId: string | null;
  description: string | null;
  dueDate: string | null;
  priority: Task["priority"];
  relatedLabel: string | null;
  title: string;
};

export type UpdateTaskDetailsInput = {
  assigneeId: string | null;
  dueDate: string | null;
};

export type CreateAgentInput = {
  email: string | null;
  firstName: string;
  lastName: string;
  licenseNumber: string | null;
  phone: string | null;
  source: string | null;
  status: Agent["brokerageStatus"];
};

export type UpdateAgentProfileInput = {
  email: string | null;
  licenseNumber: string | null;
  phone: string | null;
  source: string | null;
};

export type UpdateRecruitPipelineInput = {
  heatScore?: Recruit["heatScore"] | null;
  stage: Recruit["stage"];
};

type ArchivedAgentRow = UpdatedAgentRow & {
  archived_at: string;
};

function agentLabel(agent: Pick<UpdatedAgentRow, "first_name" | "last_name">) {
  return `${agent.first_name} ${agent.last_name}`.trim() || "Agent";
}

export async function createAgent(session: UserSession, input: CreateAgentInput) {
  if (!isDatabaseConfigured()) return null;

  return withTenantRls(session, async (sql) => {
    const rows = await sql<CreatedAgentRow[]>`
      insert into public.agents (
        tenant_id,
        first_name,
        last_name,
        email,
        phone,
        brokerage_status,
        license_number,
        source,
        assigned_owner_id
      )
      values (
        ${session.tenant.id},
        ${input.firstName},
        ${input.lastName},
        ${input.email},
        ${input.phone},
        ${input.status},
        ${input.licenseNumber},
        ${input.source},
        ${actorId(session)}
      )
      returning id, first_name, last_name
    `;

    const agent = rows[0];
    if (!agent) throw new Error("Agent could not be created.");

    await sql`
      insert into public.activity_logs (tenant_id, actor_id, action, entity_type, entity_id)
      values (
        ${session.tenant.id},
        ${actorId(session)},
        ${`Created agent ${agentLabel(agent)}`},
        'agent',
        ${agent.id}
      )
    `;

    return agent.id;
  });
}

export async function updateAgentProfile(
  session: UserSession,
  agentId: string,
  input: UpdateAgentProfileInput,
) {
  if (!isDatabaseConfigured()) return;

  await withTenantRls(session, async (sql) => {
    const rows = await sql<UpdatedAgentRow[]>`
      update public.agents
      set
        email = ${input.email},
        phone = ${input.phone},
        license_number = ${input.licenseNumber},
        source = ${input.source},
        updated_at = now()
      where id = ${agentId}
        and tenant_id = ${session.tenant.id}
      returning first_name, last_name
    `;

    const agent = rows[0];
    if (!agent) throw new Error("Agent was not found or is outside the current tenant.");

    await sql`
      insert into public.activity_logs (tenant_id, actor_id, action, entity_type, entity_id)
      values (
        ${session.tenant.id},
        ${actorId(session)},
        ${`Updated profile for ${agentLabel(agent)}`},
        'agent',
        ${agentId}
      )
    `;
  });
}

export async function updateAgentStatus(
  session: UserSession,
  agentId: string,
  status: Agent["brokerageStatus"],
) {
  if (!isDatabaseConfigured()) return;

  await withTenantRls(session, async (sql) => {
    const rows = await sql<UpdatedAgentRow[]>`
      update public.agents
      set brokerage_status = ${status}, updated_at = now()
      where id = ${agentId}
        and tenant_id = ${session.tenant.id}
      returning first_name, last_name
    `;

    const agent = rows[0];
    if (!agent) throw new Error("Agent was not found or is outside the current tenant.");

    await sql`
      insert into public.activity_logs (tenant_id, actor_id, action, entity_type, entity_id)
      values (
        ${session.tenant.id},
        ${actorId(session)},
        ${`Updated ${agentLabel(agent)} to ${status}`},
        'agent',
        ${agentId}
      )
    `;
  });
}

export async function archiveAgent(session: UserSession, agentId: string) {
  if (!isDatabaseConfigured()) return null;

  return withTenantRls(session, async (sql) => {
    const rows = await sql<ArchivedAgentRow[]>`
      update public.agents
      set
        brokerage_status = 'former',
        archived_at = now(),
        archived_by = ${actorId(session)},
        updated_at = now()
      where id = ${agentId}
        and tenant_id = ${session.tenant.id}
      returning first_name, last_name, archived_at::text as archived_at
    `;

    const agent = rows[0];
    if (!agent) throw new Error("Agent was not found or is outside the current tenant.");

    await sql`
      insert into public.activity_logs (tenant_id, actor_id, action, entity_type, entity_id, metadata)
      values (
        ${session.tenant.id},
        ${actorId(session)},
        ${`Archived ${agentLabel(agent)}`},
        'agent',
        ${agentId},
        jsonb_build_object(
          'archived_at', ${agent.archived_at},
          'archived_by', ${actorId(session)}
        )
      )
    `;

    return agent.archived_at;
  });
}

export async function updateRecruitStage(
  session: UserSession,
  recruitId: string,
  stage: Recruit["stage"],
) {
  return updateRecruitPipeline(session, recruitId, { stage });
}

export async function updateRecruitPipeline(
  session: UserSession,
  recruitId: string,
  input: UpdateRecruitPipelineInput,
) {
  if (!isDatabaseConfigured()) return;

  await withTenantRls(session, async (sql) => {
    const rows = await sql<UpdatedRecruitRow[]>`
      update public.recruits
      set
        stage = ${input.stage},
        heat_score = coalesce(${input.heatScore ?? null}, heat_score),
        updated_at = now()
      where id = ${recruitId}
        and tenant_id = ${session.tenant.id}
      returning coalesce(prospect_name, '') as name
    `;

    const recruit = rows[0];
    if (!recruit) throw new Error("Recruit was not found or is outside the current tenant.");

    const recruitName = recruit.name || "Recruit";

    await sql`
      insert into public.recruiting_activities (tenant_id, recruit_id, activity_type, notes, created_by)
      values (
        ${session.tenant.id},
        ${recruitId},
        'Stage Change',
        ${input.heatScore ? `Moved ${recruitName} to ${input.stage} and marked ${input.heatScore}` : `Moved ${recruitName} to ${input.stage}`},
        ${actorId(session)}
      )
    `;

    await sql`
      insert into public.activity_logs (tenant_id, actor_id, action, entity_type, entity_id)
      values (
        ${session.tenant.id},
        ${actorId(session)},
        ${input.heatScore ? `Moved ${recruitName} to ${input.stage} and marked ${input.heatScore}` : `Moved ${recruitName} to ${input.stage}`},
        'recruit',
        ${recruitId}
      )
    `;
  });
}

export async function updateTransactionStage(
  session: UserSession,
  transactionId: string,
  stage: Transaction["stage"],
) {
  if (!isDatabaseConfigured()) return;

  const status: Transaction["status"] = stage === "Closed" ? "closed" : stage === "Cancelled" ? "cancelled" : "active";
  const isFinal = status !== "active";

  await withTenantRls(session, async (sql) => {
    const rows = await sql<UpdatedTransactionRow[]>`
      update public.transactions
      set
        stage = ${stage},
        status = ${status},
        finalized_at = ${isFinal ? sql`now()` : sql`null`},
        finalized_by = ${isFinal ? actorId(session) : null},
        updated_at = now()
      where id = ${transactionId}
        and tenant_id = ${session.tenant.id}
      returning client_name, property_address, finalized_at::text as finalized_at
    `;

    const transaction = rows[0];
    if (!transaction) throw new Error("Transaction was not found or is outside the current tenant.");

    const label = transaction.client_name || transaction.property_address || "Transaction";

    await sql`
      insert into public.activity_logs (tenant_id, actor_id, action, entity_type, entity_id, metadata)
      values (
        ${session.tenant.id},
        ${actorId(session)},
        ${`Moved ${label} to ${stage}`},
        'transaction',
        ${transactionId},
        ${
          isFinal
            ? sql`jsonb_build_object('status', ${status}::text, 'finalized_at', ${transaction.finalized_at}::text, 'finalized_by', ${actorId(session)}::text)`
            : sql`jsonb_build_object('status', ${status}::text)`
        }
      )
    `;
  });
}

export async function updateTaskStatus(
  session: UserSession,
  taskId: string,
  status: Task["status"],
) {
  if (!isDatabaseConfigured()) return;

  await withTenantRls(session, async (sql) => {
    const rows = await sql<UpdatedTaskRow[]>`
      update public.tasks
      set status = ${status}, updated_at = now()
      where id = ${taskId}
        and tenant_id = ${session.tenant.id}
      returning title
    `;

    const task = rows[0];
    if (!task) throw new Error("Task was not found or is outside the current tenant.");

    await sql`
      insert into public.activity_logs (tenant_id, actor_id, action, entity_type, entity_id)
      values (
        ${session.tenant.id},
        ${actorId(session)},
        ${`Updated task "${task.title}" to ${status}`},
        'task',
        ${taskId}
      )
    `;
  });
}

export async function createRecruit(session: UserSession, input: CreateRecruitInput) {
  if (!isDatabaseConfigured()) return null;

  return withTenantRls(session, async (sql) => {
    const rows = await sql<CreatedRecruitRow[]>`
      insert into public.recruits (
        tenant_id,
        prospect_name,
        stage,
        heat_score,
        recruit_score,
        source,
        assigned_recruiter_id,
        next_follow_up_date,
        notes_summary
      )
      values (
        ${session.tenant.id},
        ${input.name},
        ${input.stage},
        ${input.heatScore},
        ${input.recruitScore},
        ${input.source},
        ${actorId(session)},
        ${input.nextFollowUpDate},
        ${input.notesSummary}
      )
      returning id, prospect_name
    `;

    const recruit = rows[0];
    if (!recruit) throw new Error("Recruit could not be created.");

    await sql`
      insert into public.recruiting_activities (tenant_id, recruit_id, activity_type, notes, created_by)
      values (
        ${session.tenant.id},
        ${recruit.id},
        'Note',
        ${`Created recruit ${recruit.prospect_name ?? input.name}`},
        ${actorId(session)}
      )
    `;

    await sql`
      insert into public.activity_logs (tenant_id, actor_id, action, entity_type, entity_id)
      values (
        ${session.tenant.id},
        ${actorId(session)},
        ${`Created recruit ${recruit.prospect_name ?? input.name}`},
        'recruit',
        ${recruit.id}
      )
    `;

    return recruit.id;
  });
}

type TenantMemberNameRow = {
  name: string | null;
};

async function requireActiveTenantMemberName(
  sql: Parameters<Parameters<typeof withTenantRls>[1]>[0],
  session: UserSession,
  profileId: string,
) {
  const rows = await sql<TenantMemberNameRow[]>`
    select nullif(concat_ws(' ', profiles.first_name, profiles.last_name), '') as name
    from public.tenant_memberships
    join public.profiles on profiles.id = tenant_memberships.profile_id
    where tenant_memberships.tenant_id = ${session.tenant.id}
      and tenant_memberships.profile_id = ${profileId}
      and tenant_memberships.status = 'active'
    limit 1
  `;

  const member = rows[0];
  if (!member) throw new Error("Assignee is not an active member of this workspace.");

  return member.name ?? "Unnamed member";
}

export async function createTask(session: UserSession, input: CreateTaskInput) {
  if (!isDatabaseConfigured()) return null;

  return withTenantRls(session, async (sql) => {
    if (input.assigneeId) {
      await requireActiveTenantMemberName(sql, session, input.assigneeId);
    }

    const rows = await sql<CreatedTaskRow[]>`
      insert into public.tasks (
        tenant_id,
        title,
        description,
        related_label,
        related_type,
        assigned_to,
        due_date,
        priority,
        status,
        created_by
      )
      values (
        ${session.tenant.id},
        ${input.title},
        ${input.description},
        ${input.relatedLabel},
        'manual',
        ${input.assigneeId},
        ${input.dueDate},
        ${input.priority},
        'open',
        ${actorId(session)}
      )
      returning id, title
    `;

    const task = rows[0];
    if (!task) throw new Error("Task could not be created.");

    await sql`
      insert into public.activity_logs (tenant_id, actor_id, action, entity_type, entity_id)
      values (
        ${session.tenant.id},
        ${actorId(session)},
        ${`Created task "${task.title}"`},
        'task',
        ${task.id}
      )
    `;

    return task.id;
  });
}

export async function updateTaskDetails(
  session: UserSession,
  taskId: string,
  input: UpdateTaskDetailsInput,
) {
  if (!isDatabaseConfigured()) return;

  await withTenantRls(session, async (sql) => {
    const assigneeName = input.assigneeId
      ? await requireActiveTenantMemberName(sql, session, input.assigneeId)
      : null;

    const rows = await sql<UpdatedTaskRow[]>`
      update public.tasks
      set assigned_to = ${input.assigneeId}, due_date = ${input.dueDate}, updated_at = now()
      where id = ${taskId}
        and tenant_id = ${session.tenant.id}
      returning title
    `;

    const task = rows[0];
    if (!task) throw new Error("Task was not found or is outside the current tenant.");

    const ownerLabel = assigneeName ?? "Unassigned";
    const dueLabel = input.dueDate ? formatDateOnly(input.dueDate) : "no due date";

    await sql`
      insert into public.activity_logs (tenant_id, actor_id, action, entity_type, entity_id, metadata)
      values (
        ${session.tenant.id},
        ${actorId(session)},
        ${`Updated task "${task.title}" (owner ${ownerLabel}, due ${dueLabel})`},
        'task',
        ${taskId},
        jsonb_build_object('assigned_to', ${input.assigneeId}::text, 'due_date', ${input.dueDate}::text)
      )
    `;
  });
}
