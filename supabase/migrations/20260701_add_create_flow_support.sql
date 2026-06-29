-- Sprint 4C create flow support.
alter table public.tasks
add column if not exists related_label text;

drop policy if exists "tenant creators can insert recruits" on public.recruits;
create policy "tenant creators can insert recruits"
on public.recruits for insert
with check (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'create_recruits'));

drop policy if exists "tenant recruit creators can insert recruiting activities" on public.recruiting_activities;
create policy "tenant recruit creators can insert recruiting activities"
on public.recruiting_activities for insert
with check (
  public.is_platform_admin()
  or public.has_tenant_permission(tenant_id, 'create_recruits')
  or public.has_tenant_permission(tenant_id, 'edit_recruits')
);

drop policy if exists "task managers can insert tasks" on public.tasks;
create policy "task managers can insert tasks"
on public.tasks for insert
with check (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'manage_tasks'));
