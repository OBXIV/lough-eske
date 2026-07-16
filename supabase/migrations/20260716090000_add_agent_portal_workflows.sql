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

create index if not exists transactions_tenant_agent_idx on public.transactions(tenant_id, agent_id);
create index if not exists agent_referrals_tenant_agent_idx on public.agent_referrals(tenant_id, agent_id);

alter table public.agent_resources
  add column if not exists created_by uuid references public.profiles(id);

update public.agent_resources set visibility = 'all_agents' where visibility is null;

alter table public.agent_resources
  alter column visibility set default 'all_agents',
  alter column visibility set not null;

alter table public.agent_resources
  drop constraint if exists agent_resources_visibility_check;

alter table public.agent_resources
  add constraint agent_resources_visibility_check check (visibility in ('all_agents', 'staff_only'));

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
