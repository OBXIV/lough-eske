create or replace function public.has_tenant_permission(target_tenant_id uuid, permission_key text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    join public.profiles p on p.id = tm.profile_id
    join public.role_permissions rp on rp.role_id = tm.role_id
    join public.permissions perms on perms.id = rp.permission_id
    where p.auth_user_id = auth.uid()
      and tm.tenant_id = target_tenant_id
      and tm.status = 'active'
      and perms.key = permission_key
  );
$$;

drop policy if exists "tenant editors can update agents" on public.agents;
create policy "tenant editors can update agents"
on public.agents for update
using (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'edit_agents'))
with check (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'edit_agents'));

drop policy if exists "tenant editors can update recruits" on public.recruits;
create policy "tenant editors can update recruits"
on public.recruits for update
using (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'edit_recruits'))
with check (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'edit_recruits'));

drop policy if exists "tenant editors can update transactions" on public.transactions;
create policy "tenant editors can update transactions"
on public.transactions for update
using (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'edit_transactions'))
with check (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'edit_transactions'));

drop policy if exists "task managers can update tasks" on public.tasks;
create policy "task managers can update tasks"
on public.tasks for update
using (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'manage_tasks'))
with check (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'manage_tasks'));

drop policy if exists "tenant members can insert activity logs" on public.activity_logs;
create policy "tenant members can insert activity logs"
on public.activity_logs for insert
with check (tenant_id is not null and (public.is_platform_admin() or public.is_tenant_member(tenant_id)));

drop policy if exists "tenant recruit editors can insert recruiting activities" on public.recruiting_activities;
create policy "tenant recruit editors can insert recruiting activities"
on public.recruiting_activities for insert
with check (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'edit_recruits'));
