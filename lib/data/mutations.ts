import "server-only";

import { isDatabaseConfigured, withTenantRls } from "@/lib/data/database";
import type { Agent, Recruit, Task, Transaction, UserSession } from "@/types/domain";

type UpdatedAgentRow = {
  first_name: string;
  last_name: string;
};

type UpdatedRecruitRow = {
  name: string | null;
};

type UpdatedTransactionRow = {
  client_name: string | null;
  property_address: string | null;
};

type UpdatedTaskRow = {
  title: string;
};

function actorId(session: UserSession) {
  return session.user.profileId;
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
        ${`Updated ${agent.first_name} ${agent.last_name} to ${status}`},
        'agent',
        ${agentId}
      )
    `;
  });
}

export async function updateRecruitStage(
  session: UserSession,
  recruitId: string,
  stage: Recruit["stage"],
) {
  if (!isDatabaseConfigured()) return;

  await withTenantRls(session, async (sql) => {
    const rows = await sql<UpdatedRecruitRow[]>`
      update public.recruits
      set stage = ${stage}, updated_at = now()
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
        ${`Moved ${recruitName} to ${stage}`},
        ${actorId(session)}
      )
    `;

    await sql`
      insert into public.activity_logs (tenant_id, actor_id, action, entity_type, entity_id)
      values (
        ${session.tenant.id},
        ${actorId(session)},
        ${`Moved ${recruitName} to ${stage}`},
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

  await withTenantRls(session, async (sql) => {
    const rows = await sql<UpdatedTransactionRow[]>`
      update public.transactions
      set stage = ${stage}, status = ${status}, updated_at = now()
      where id = ${transactionId}
        and tenant_id = ${session.tenant.id}
      returning client_name, property_address
    `;

    const transaction = rows[0];
    if (!transaction) throw new Error("Transaction was not found or is outside the current tenant.");

    const label = transaction.client_name || transaction.property_address || "Transaction";

    await sql`
      insert into public.activity_logs (tenant_id, actor_id, action, entity_type, entity_id)
      values (
        ${session.tenant.id},
        ${actorId(session)},
        ${`Moved ${label} to ${stage}`},
        'transaction',
        ${transactionId}
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
