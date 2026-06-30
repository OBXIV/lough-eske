drop policy if exists "tenant creators can insert agents" on public.agents;
create policy "tenant creators can insert agents"
on public.agents for insert
with check (public.is_platform_admin() or public.has_tenant_permission(tenant_id, 'create_agents'));
