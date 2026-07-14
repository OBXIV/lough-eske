import "server-only";

import { cache } from "react";

import {
  activityLogs as fallbackActivityLogs,
  agents as fallbackAgents,
  demoUsers,
  recruitingActivities as fallbackRecruitingActivities,
  recruits as fallbackRecruits,
  tasks as fallbackTasks,
  tenantMembers as fallbackTenantMembers,
  transactions as fallbackTransactions,
} from "@/lib/data/demo";
import { isDatabaseConfigured, withAuthenticatedRls, withTenantRls } from "@/lib/data/database";
import { calculateMonthlyPriceCents, createFallbackEntitlements, FEATURE_KEYS } from "@/lib/entitlements/catalog";
import { canAccess } from "@/lib/rbac/permissions";
import { getVisibleTenants } from "@/lib/tenant/access";
import type {
  ActivityLog,
  Agent,
  FeatureKey,
  PlanKey,
  Recruit,
  RecruitingActivity,
  Task,
  Tenant,
  TenantEntitlements,
  TenantMember,
  Transaction,
  UserSession,
} from "@/types/domain";

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
  archived_at: string | null;
  archived_by: string | null;
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

type RecruitingActivityRow = {
  id: string;
  recruit_id: string;
  recruit_name: string | null;
  activity_type: RecruitingActivity["activityType"];
  activity_date: string | null;
  notes: string | null;
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
  finalized_at: string | null;
  finalized_by: string | null;
};

type TaskRow = {
  id: string;
  title: string;
  description: string | null;
  related_record: string | null;
  related_label: string | null;
  related_type: string | null;
  assigned_to: string | null;
  assignee: string | null;
  due_date: string | null;
  priority: Task["priority"];
  status: Task["status"];
  created_at: string | null;
};

type TenantMemberRow = {
  profile_id: string;
  name: string | null;
  role: string;
};

type ActivityLogRow = {
  id: string;
  action: string;
  entity_id: string | null;
  entity_type: string | null;
  actor: string | null;
  created_at: string;
};

type TenantEntitlementsRow = {
  plan_id: string;
  plan_key: PlanKey;
  plan_name: string;
  base_seat_limit: number;
  seat_count: number;
  active_seats: number;
  invited_seats: number;
  base_price_cents: number;
  per_seat_price_cents: number;
  features: string[];
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

  // No visible row means the tenant is not provisioned for this user in this
  // database; mark it inactive so writes stay disabled instead of failing RLS.
  return rows[0] ? mapTenant(rows[0]) : { ...session.tenant, status: "inactive" as const };
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

const loadTenantEntitlements = cache(async (authUserId: string, tenantId: string): Promise<TenantEntitlements> => {
  if (!isDatabaseConfigured()) {
    const occupiedSeats = demoUsers.filter((user) => user.tenantId === tenantId).length;
    return createFallbackEntitlements(occupiedSeats);
  }

  const rows = await withAuthenticatedRls(authUserId, (sql) => sql<TenantEntitlementsRow[]>`
    select
      plans.id::text as plan_id,
      plans.key as plan_key,
      plans.name as plan_name,
      plans.base_seat_limit,
      tenants.seat_count,
      (
        select count(*)::integer
        from public.tenant_memberships active_memberships
        where active_memberships.tenant_id = tenants.id
          and active_memberships.status = 'active'
      ) as active_seats,
      (
        select count(*)::integer
        from public.tenant_memberships invited_memberships
        where invited_memberships.tenant_id = tenants.id
          and invited_memberships.status = 'invited'
      ) as invited_seats,
      plans.base_price_cents,
      plans.per_seat_price_cents,
      coalesce(
        array_agg(plan_features.feature_key order by plan_features.feature_key)
          filter (where plan_features.feature_key is not null),
        '{}'::text[]
      ) as features
    from public.tenants
    join public.plans on plans.id = tenants.plan_id
    left join public.plan_features
      on plan_features.plan_id = plans.id
      and public.tenant_has_feature(tenants.id, plan_features.feature_key)
    where tenants.id = ${tenantId}
    group by tenants.id, plans.id
    limit 1
  `);

  const row = rows[0];
  // No visible row means the tenant or its plan is not provisioned for this
  // user in this database; fall back to Core defaults so pages render
  // read-only instead of failing every route through the layout.
  if (!row) {
    return createFallbackEntitlements(0);
  }

  const activeSeats = Number(row.active_seats);
  const invitedSeats = Number(row.invited_seats);
  const occupiedSeats = activeSeats + invitedSeats;
  const subscribedSeats = Number(row.seat_count);
  const baseSeatLimit = Number(row.base_seat_limit);
  const basePriceCents = Number(row.base_price_cents);
  const perSeatPriceCents = Number(row.per_seat_price_cents);

  return {
    planId: row.plan_id,
    planKey: row.plan_key,
    planName: row.plan_name,
    baseSeatLimit,
    subscribedSeats,
    activeSeats,
    invitedSeats,
    occupiedSeats,
    availableSeats: Math.max(0, subscribedSeats - occupiedSeats),
    basePriceCents,
    perSeatPriceCents,
    monthlyPriceCents: calculateMonthlyPriceCents(
      basePriceCents,
      perSeatPriceCents,
      baseSeatLimit,
      subscribedSeats,
    ),
    features: row.features.filter((feature): feature is FeatureKey => FEATURE_KEYS.includes(feature as FeatureKey)),
  };
});

export function getTenantEntitlements(session: UserSession) {
  return loadTenantEntitlements(session.user.id, session.tenant.id);
}

export async function tenantHasFeature(session: UserSession, feature: FeatureKey) {
  const entitlements = await getTenantEntitlements(session);
  return entitlements.features.includes(feature);
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
      agents.archived_at::text as archived_at,
      nullif(concat_ws(' ', archived_by.first_name, archived_by.last_name), '') as archived_by,
      nullif(concat_ws(' ', owners.first_name, owners.last_name), '') as assigned_owner
    from public.agents
    left join public.profiles owners on owners.id = agents.assigned_owner_id
    left join public.profiles archived_by on archived_by.id = agents.archived_by
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
    archivedAt: row.archived_at,
    archivedBy: row.archived_by,
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

export async function getRecruitingActivities(session: UserSession, limit = 100): Promise<RecruitingActivity[]> {
  if (!isDatabaseConfigured()) {
    return fallbackRecruitingActivities.slice(0, limit);
  }

  const rows = await withTenantRls(session, (sql) => sql<RecruitingActivityRow[]>`
    select
      recruiting_activities.id,
      recruiting_activities.recruit_id,
      coalesce(recruits.prospect_name, nullif(concat_ws(' ', agents.first_name, agents.last_name), '')) as recruit_name,
      recruiting_activities.activity_type,
      recruiting_activities.activity_date::text as activity_date,
      recruiting_activities.notes
    from public.recruiting_activities
    left join public.recruits on recruits.id = recruiting_activities.recruit_id
    left join public.agents on agents.id = recruits.agent_id
    where recruiting_activities.tenant_id = ${session.tenant.id}
    order by recruiting_activities.activity_date desc
    limit ${limit}
  `);

  return rows.map((row) => ({
    id: row.id,
    recruitId: row.recruit_id,
    recruitName: row.recruit_name ?? "Unnamed recruit",
    activityType: row.activity_type,
    activityDate: row.activity_date ?? "",
    notes: row.notes ?? "",
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
      transactions.status,
      transactions.finalized_at::text as finalized_at,
      nullif(concat_ws(' ', finalized_by.first_name, finalized_by.last_name), '') as finalized_by
    from public.transactions
    left join public.agents on agents.id = transactions.agent_id
    left join public.profiles finalized_by on finalized_by.id = transactions.finalized_by
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
    finalizedAt: row.finalized_at,
    finalizedBy: row.finalized_by,
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
      tasks.description,
      tasks.related_label,
      case
        when tasks.related_type = 'agent' then nullif(concat_ws(' ', related_agents.first_name, related_agents.last_name), '')
        when tasks.related_type = 'recruit' then coalesce(related_recruits.prospect_name, nullif(concat_ws(' ', recruit_agents.first_name, recruit_agents.last_name), ''))
        when tasks.related_type = 'transaction' then coalesce(related_transactions.client_name, related_transactions.property_address)
        when tasks.related_type = 'report' then 'Reports'
        else tasks.related_type
      end as related_record,
      tasks.related_type,
      tasks.assigned_to::text as assigned_to,
      nullif(concat_ws(' ', assignees.first_name, assignees.last_name), '') as assignee,
      tasks.due_date::text as due_date,
      tasks.priority,
      tasks.status,
      tasks.created_at::text as created_at
    from public.tasks
    left join public.agents related_agents on tasks.related_type = 'agent' and related_agents.id = tasks.related_id
    left join public.recruits related_recruits on tasks.related_type = 'recruit' and related_recruits.id = tasks.related_id
    left join public.agents recruit_agents on recruit_agents.id = related_recruits.agent_id
    left join public.transactions related_transactions on tasks.related_type = 'transaction' and related_transactions.id = tasks.related_id
    left join public.profiles assignees on assignees.id = tasks.assigned_to
    where tasks.tenant_id = ${session.tenant.id}
    order by tasks.due_date nulls last, tasks.priority desc
  `);

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    relatedRecord: row.related_label ?? row.related_record ?? "Unassigned",
    relatedType: row.related_type ?? "manual",
    assignee: row.assignee,
    assigneeId: row.assigned_to,
    dueDate: row.due_date ?? "",
    priority: row.priority,
    status: row.status,
    createdAt: row.created_at ?? "",
  }));
}

export async function getActivityLogs(session: UserSession, limit = 10): Promise<ActivityLog[]> {
  if (!isDatabaseConfigured()) {
    return fallbackActivityLogs.slice(0, limit);
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
    limit ${limit}
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

export async function getTenantMembers(session: UserSession): Promise<TenantMember[]> {
  if (!isDatabaseConfigured()) {
    return fallbackTenantMembers;
  }

  const rows = await withTenantRls(session, (sql) => sql<TenantMemberRow[]>`
    select
      profiles.id::text as profile_id,
      nullif(concat_ws(' ', profiles.first_name, profiles.last_name), '') as name,
      roles.name as role
    from public.tenant_memberships
    join public.profiles on profiles.id = tenant_memberships.profile_id
    join public.roles on roles.id = tenant_memberships.role_id
    where tenant_memberships.tenant_id = ${session.tenant.id}
      and tenant_memberships.status = 'active'
    order by name
  `);

  return rows.map((row) => ({
    profileId: row.profile_id,
    name: row.name ?? "Unnamed member",
    role: row.role,
  }));
}

export type WorkspaceSearchResult = {
  id: string;
  type: "agent" | "recruit" | "transaction";
  label: string;
  subtitle: string;
  href: string;
};

const SEARCH_RESULTS_PER_TYPE = 5;

export async function searchWorkspace(session: UserSession, query: string): Promise<WorkspaceSearchResult[]> {
  const term = query.trim().toLowerCase();
  if (!term) return [];

  const results: WorkspaceSearchResult[] = [];

  if (canAccess(session.permissions, "view_agents")) {
    const agents = await getAgents(session);
    agents
      .filter((agent) => [`${agent.firstName} ${agent.lastName}`, agent.email, agent.phone, agent.licenseNumber]
        .some((value) => value.toLowerCase().includes(term)))
      .slice(0, SEARCH_RESULTS_PER_TYPE)
      .forEach((agent) => {
        const name = `${agent.firstName} ${agent.lastName}`;
        results.push({
          id: agent.id,
          type: "agent",
          label: name,
          subtitle: agent.email || agent.brokerageStatus,
          href: `/app/agents?q=${encodeURIComponent(name)}`,
        });
      });
  }

  if (canAccess(session.permissions, "view_recruiting")) {
    const recruits = await getRecruits(session);
    recruits
      .filter((recruit) => [recruit.name, recruit.source].some((value) => value.toLowerCase().includes(term)))
      .slice(0, SEARCH_RESULTS_PER_TYPE)
      .forEach((recruit) => {
        results.push({
          id: recruit.id,
          type: "recruit",
          label: recruit.name,
          subtitle: `${recruit.stage} - ${recruit.heatScore}`,
          href: `/app/recruiting?stage=${encodeURIComponent(recruit.stage)}`,
        });
      });
  }

  if (canAccess(session.permissions, "view_transactions")) {
    const transactions = await getTransactions(session);
    transactions
      .filter((transaction) => [transaction.clientName, transaction.propertyAddress, transaction.agent]
        .some((value) => value.toLowerCase().includes(term)))
      .slice(0, SEARCH_RESULTS_PER_TYPE)
      .forEach((transaction) => {
        results.push({
          id: transaction.id,
          type: "transaction",
          label: transaction.clientName || transaction.propertyAddress,
          subtitle: `${transaction.stage} - ${transaction.propertyAddress}`,
          href: "/app/transactions",
        });
      });
  }

  return results;
}
