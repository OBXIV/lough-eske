-- Consolidate tenant UPDATE authorization into one permissive policy (Dev ledger 20260717181113). The
-- Sprint 11A trigger still restricts non-platform users to safe branding
-- fields, while Platform Admin retains plan and seat administration.
drop policy if exists "platform admins can update tenant entitlements" on public.tenants;
drop policy if exists "settings managers can update tenant branding" on public.tenants;

create policy "authorized users can update tenant settings"
on public.tenants for update
to authenticated
using (
  public.is_platform_admin()
  or public.has_tenant_permission(id, 'manage_settings')
)
with check (
  public.is_platform_admin()
  or public.has_tenant_permission(id, 'manage_settings')
);
