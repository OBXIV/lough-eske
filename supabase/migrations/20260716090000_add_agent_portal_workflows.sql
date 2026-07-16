-- Sprint 10A: agent portal data workflows.
-- Links workspace profiles to agent records so portal data can be scoped to
-- the signed-in agent, and turns agent_resources into a managed,
-- visibility-scoped library.

alter table public.agents
  add column if not exists profile_id uuid references public.profiles(id) on delete set null;

-- One agent record per profile within a tenant; the same person may still be
-- an agent in more than one tenant.
create unique index if not exists agents_tenant_profile_unique_idx
  on public.agents(tenant_id, profile_id)
  where profile_id is not null;

create index if not exists agents_profile_id_idx
  on public.agents(profile_id)
  where profile_id is not null;

create index if not exists transactions_tenant_agent_idx on public.transactions(tenant_id, agent_id);
create index if not exists transactions_agent_id_idx on public.transactions(agent_id);
create index if not exists agent_referrals_tenant_agent_idx on public.agent_referrals(tenant_id, agent_id);
create index if not exists agent_referrals_agent_id_idx on public.agent_referrals(agent_id);

alter table public.agent_resources
  add column if not exists created_by uuid references public.profiles(id);

create index if not exists agent_resources_tenant_created_idx
  on public.agent_resources(tenant_id, created_at desc);

create index if not exists agent_resources_created_by_idx
  on public.agent_resources(created_by)
  where created_by is not null;

update public.agent_resources set visibility = 'all_agents' where visibility is null;

alter table public.agent_resources
  alter column visibility set default 'all_agents',
  alter column visibility set not null;

alter table public.agent_resources
  drop constraint if exists agent_resources_visibility_check;

alter table public.agent_resources
  add constraint agent_resources_visibility_check check (visibility in ('all_agents', 'staff_only'));

-- Helper functions are required by authenticated RLS policies, but anonymous
-- callers do not need direct RPC access to them.
revoke execute on function public.current_profile_id() from public, anon;
revoke execute on function public.is_tenant_member(uuid) from public, anon;
revoke execute on function public.is_platform_admin() from public, anon;
revoke execute on function public.has_tenant_permission(uuid, text) from public, anon;
grant execute on function public.current_profile_id() to authenticated;
grant execute on function public.is_tenant_member(uuid) to authenticated;
grant execute on function public.is_platform_admin() to authenticated;
grant execute on function public.has_tenant_permission(uuid, text) to authenticated;

-- Staff retain their existing permission-scoped visibility. Agent Portal User
-- sessions can only read the agent record linked to their own profile and the
-- transactions, referrals, and tasks owned by that linked identity.
drop policy if exists "tenant members can read agents" on public.agents;
create policy "members can read permitted agents"
on public.agents for select
to authenticated
using (
  public.is_platform_admin()
  or public.has_tenant_permission(tenant_id, 'view_agents')
  or (
    public.has_tenant_permission(tenant_id, 'view_agent_portal')
    and profile_id = public.current_profile_id()
  )
);

drop policy if exists "tenant members can read transactions" on public.transactions;
create policy "members can read permitted transactions"
on public.transactions for select
to authenticated
using (
  public.is_platform_admin()
  or public.has_tenant_permission(tenant_id, 'view_transactions')
  or (
    public.has_tenant_permission(tenant_id, 'view_agent_portal')
    and exists (
      select 1
      from public.agents
      where agents.id = transactions.agent_id
        and agents.tenant_id = transactions.tenant_id
        and agents.profile_id = public.current_profile_id()
    )
  )
);

drop policy if exists "tenant members can read agent referrals" on public.agent_referrals;
create policy "members can read permitted agent referrals"
on public.agent_referrals for select
to authenticated
using (
  public.is_platform_admin()
  or public.has_tenant_permission(tenant_id, 'view_agents')
  or (
    public.has_tenant_permission(tenant_id, 'view_agent_portal')
    and exists (
      select 1
      from public.agents
      where agents.id = agent_referrals.agent_id
        and agents.tenant_id = agent_referrals.tenant_id
        and agents.profile_id = public.current_profile_id()
    )
  )
);

drop policy if exists "tenant members can read tasks" on public.tasks;
create policy "members can read permitted tasks"
on public.tasks for select
to authenticated
using (
  public.is_platform_admin()
  or public.has_tenant_permission(tenant_id, 'view_dashboard')
  or public.has_tenant_permission(tenant_id, 'manage_tasks')
  or (
    public.has_tenant_permission(tenant_id, 'view_agent_portal')
    and assigned_to = public.current_profile_id()
  )
);

-- Portal users only see published (all_agents) resources; staff holding
-- manage_agent_resources keep full visibility including staff_only drafts.
drop policy if exists "tenant members can read agent resources" on public.agent_resources;
create policy "tenant members can read visible agent resources"
on public.agent_resources for select
to authenticated
using (
  public.is_platform_admin()
  or public.has_tenant_permission(tenant_id, 'manage_agent_resources')
  or (public.is_tenant_member(tenant_id) and visibility = 'all_agents')
);

drop policy if exists "resource managers can insert agent resources" on public.agent_resources;
create policy "resource managers can insert agent resources"
on public.agent_resources for insert
to authenticated
with check (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'manage_agent_resources'));

drop policy if exists "resource managers can update agent resources" on public.agent_resources;
create policy "resource managers can update agent resources"
on public.agent_resources for update
to authenticated
using (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'manage_agent_resources'))
with check (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'manage_agent_resources'));
