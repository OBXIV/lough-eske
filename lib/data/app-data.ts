import "server-only";

import {
  activityLogs as fallbackActivityLogs,
  agents as fallbackAgents,
  recruits as fallbackRecruits,
  tasks as fallbackTasks,
  transactions as fallbackTransactions,
} from "@/lib/data/demo";
import { isDatabaseConfigured, withTenantRls } from "@/lib/data/database";
import { getVisibleTenants } from "@/lib/tenant/access";
import type { ActivityLog, Agent, Recruit, Task, Tenant, Transaction, UserSession } from "@/types/domain";

type TenantRow = {
  id: string;
  name: string;
  slug: string;
  status: Tenant["status"];
  primary_color: string | null;
};

type AgentRow = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  brokerage_status: Agent["brokerageStatus"];
  license_number: string | null;
  source: string | null;
  production_ytd: string | number | null;
  gci_ytd: string | number | null;
  last_close_date: string | null;
  assigned_owner: string | null;
};

type RecruitRow = {
  id: string;
  name: string | null;
  stage: Recruit["stage"];
  heat_score: Recruit["heatScore"] | null;
  recruit_score: number | null;
  source: string | null;
  next_follow_up_date: string | null;
  notes_summary: string | null;
};

type TransactionRow = {
  id: string;
  agent: string | null;
  client_name: string | null;
  property_address: string | null;
  transaction_type: Transaction["transactionType"] | null;
  stage: Transaction["stage"];
  list_price: string | number | null;
  estimated_gci: string | number | null;
  expected_close_date: string | null;
  status: Transaction["status"];
};

type TaskRow = {
  id: string;
  title: string;
  related_record: string | null;
  related_label: string | null;
  due_date: string | null;
  priority: Task["priority"];
  status: Task["status"];
};

type ActivityLogRow = {
  id: string;
  action: string;
  entity_id: string | null;
  entity_type: string | null;
  actor: string | null;
  created_at: string;
};

function toNumber(value: string | number | null) {
  return Number(value ?? 0);
}

function mapTenant(row: TenantRow): Tenant {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    primaryColor: row.primary_color ?? "#2563EB",
  };
}

export async function getTenantProfile(session: UserSession) {
  if (!isDatabaseConfigured()) {
    return session.tenant;
  }

  const rows = await withTenantRls(session, (sql) => sql<TenantRow[]>`
    select id, name, slug, status, primary_color
    from public.tenants
    where id = ${session.tenant.id}
    limit 1
  `);

  return rows[0] ? mapTenant(rows[0]) : session.tenant;
}

export async function getVisibleTenantsForSession(session: UserSession) {
  if (!isDatabaseConfigured()) {
    return getVisibleTenants(session);
  }

  const rows = await withTenantRls(session, (sql) => sql<TenantRow[]>`
    select id, name, slug, status, primary_color
    from public.tenants
    order by name
  `);

  return rows.map(mapTenant);
}

export async function getAgents(session: UserSession): Promise<Agent[]> {
  if (!isDatabaseConfigured()) {
    return fallbackAgents;
  }

  const rows = await withTenantRls(session, (sql) => sql<AgentRow[]>`
    select
      agents.id,
      agents.first_name,
      agents.last_name,
      agents.email,
      agents.phone,
      agents.brokerage_status,
      agents.license_number,
      agents.source,
      agents.production_ytd,
      agents.gci_ytd,
      agents.last_close_date::text as last_close_date,
      nullif(concat_ws(' ', owners.first_name, owners.last_name), '') as assigned_owner
    from public.agents
    left join public.profiles owners on owners.id = agents.assigned_owner_id
    where agents.tenant_id = ${session.tenant.id}
    order by agents.production_ytd desc, agents.last_name
  `);

  return rows.map((row) => ({
    id: row.id,
    firstName: row.first_name,
    lastName: row.last_name,
    email: row.email ?? "",
    phone: row.phone ?? "",
    brokerageStatus: row.brokerage_status,
    licenseNumber: row.license_number ?? "",
    source: row.source ?? "Unknown",
    productionYtd: toNumber(row.production_ytd),
    gciYtd: toNumber(row.gci_ytd),
    lastCloseDate: row.last_close_date ?? "",
    assignedOwner: row.assigned_owner ?? "Unassigned",
  }));
}

export async function getRecruits(session: UserSession): Promise<Recruit[]> {
  if (!isDatabaseConfigured()) {
    return fallbackRecruits;
  }

  const rows = await withTenantRls(session, (sql) => sql<RecruitRow[]>`
    select
      recruits.id,
      coalesce(recruits.prospect_name, nullif(concat_ws(' ', agents.first_name, agents.last_name), '')) as name,
      recruits.stage,
      recruits.heat_score,
      recruits.recruit_score,
      recruits.source,
      recruits.next_follow_up_date::text as next_follow_up_date,
      recruits.notes_summary
    from public.recruits
    left join public.agents on agents.id = recruits.agent_id
    where recruits.tenant_id = ${session.tenant.id}
    order by
      case recruits.stage
        when 'Identified' then 1
        when 'Contacted' then 2
        when 'Engaged' then 3
        when 'Offer Pending' then 4
        when 'Joined' then 5
        else 6
      end,
      recruits.recruit_score desc
  `);

  return rows.map((row) => ({
    id: row.id,
    name: row.name ?? "Unnamed recruit",
    stage: row.stage,
    heatScore: row.heat_score ?? "Warm",
    recruitScore: row.recruit_score ?? 0,
    source: row.source ?? "Unknown",
    nextFollowUpDate: row.next_follow_up_date ?? "",
    notesSummary: row.notes_summary ?? "",
  }));
}

export async function getTransactions(session: UserSession): Promise<Transaction[]> {
  if (!isDatabaseConfigured()) {
    return fallbackTransactions;
  }

  const rows = await withTenantRls(session, (sql) => sql<TransactionRow[]>`
    select
      transactions.id,
      nullif(concat_ws(' ', agents.first_name, agents.last_name), '') as agent,
      transactions.client_name,
      transactions.property_address,
      transactions.transaction_type,
      transactions.stage,
      transactions.list_price,
      transactions.estimated_gci,
      transactions.expected_close_date::text as expected_close_date,
      transactions.status
    from public.transactions
    left join public.agents on agents.id = transactions.agent_id
    where transactions.tenant_id = ${session.tenant.id}
    order by transactions.expected_close_date nulls last, transactions.created_at desc
  `);

  return rows.map((row) => ({
    id: row.id,
    agent: row.agent ?? "Unassigned",
    clientName: row.client_name ?? "",
    propertyAddress: row.property_address ?? "",
    transactionType: row.transaction_type ?? "Buyer",
    stage: row.stage,
    listPrice: toNumber(row.list_price),
    estimatedGci: toNumber(row.estimated_gci),
    expectedCloseDate: row.expected_close_date ?? "",
    status: row.status,
  }));
}

export async function getTasks(session: UserSession): Promise<Task[]> {
  if (!isDatabaseConfigured()) {
    return fallbackTasks;
  }

  const rows = await withTenantRls(session, (sql) => sql<TaskRow[]>`
    select
      tasks.id,
      tasks.title,
      tasks.related_label,
      case
        when tasks.related_type = 'agent' then nullif(concat_ws(' ', related_agents.first_name, related_agents.last_name), '')
        when tasks.related_type = 'recruit' then coalesce(related_recruits.prospect_name, nullif(concat_ws(' ', recruit_agents.first_name, recruit_agents.last_name), ''))
        when tasks.related_type = 'transaction' then coalesce(related_transactions.client_name, related_transactions.property_address)
        when tasks.related_type = 'report' then 'Reports'
        else tasks.related_type
      end as related_record,
      tasks.due_date::text as due_date,
      tasks.priority,
      tasks.status
    from public.tasks
    left join public.agents related_agents on tasks.related_type = 'agent' and related_agents.id = tasks.related_id
    left join public.recruits related_recruits on tasks.related_type = 'recruit' and related_recruits.id = tasks.related_id
    left join public.agents recruit_agents on recruit_agents.id = related_recruits.agent_id
    left join public.transactions related_transactions on tasks.related_type = 'transaction' and related_transactions.id = tasks.related_id
    where tasks.tenant_id = ${session.tenant.id}
    order by tasks.due_date nulls last, tasks.priority desc
  `);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    relatedRecord: row.related_label ?? row.related_record ?? "Unassigned",
    dueDate: row.due_date ?? "",
    priority: row.priority,
    status: row.status,
  }));
}

export async function getActivityLogs(session: UserSession): Promise<ActivityLog[]> {
  if (!isDatabaseConfigured()) {
    return fallbackActivityLogs;
  }

  const rows = await withTenantRls(session, (sql) => sql<ActivityLogRow[]>`
    select
      activity_logs.id,
      activity_logs.action,
      activity_logs.entity_id::text as entity_id,
      initcap(activity_logs.entity_type) as entity_type,
      nullif(concat_ws(' ', actors.first_name, actors.last_name), '') as actor,
      activity_logs.created_at::text as created_at
    from public.activity_logs
    left join public.profiles actors on actors.id = activity_logs.actor_id
    where activity_logs.tenant_id = ${session.tenant.id}
    order by activity_logs.created_at desc
    limit 10
  `);

  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    entityId: row.entity_id ?? undefined,
    entityType: row.entity_type ?? "Activity",
    actor: row.actor ?? "System",
    createdAt: row.created_at,
  }));
}
