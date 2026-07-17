-- Sprint 11A: controlled tenant administration (Dev ledger 20260717180736).
-- Broker owners and office admins with manage_settings may update only the
-- current tenant's safe branding fields. Database guards prevent the broader
-- tenants UPDATE grant from becoming an entitlement, status, or routing bypass.

alter table public.tenants
  drop constraint if exists tenants_name_length_check;

alter table public.tenants
  add constraint tenants_name_length_check
  check (char_length(btrim(name)) between 2 and 80) not valid;

alter table public.tenants
  validate constraint tenants_name_length_check;

alter table public.tenants
  drop constraint if exists tenants_primary_color_format_check;

alter table public.tenants
  add constraint tenants_primary_color_format_check
  check (primary_color is null or primary_color ~ '^#[0-9A-Fa-f]{6}$') not valid;

alter table public.tenants
  validate constraint tenants_primary_color_format_check;

drop policy if exists "settings managers can update tenant branding" on public.tenants;
create policy "settings managers can update tenant branding"
on public.tenants for update
to authenticated
using (public.has_tenant_permission(id, 'manage_settings'))
with check (public.has_tenant_permission(id, 'manage_settings'));

create or replace function public.guard_tenant_branding_changes()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if current_user in ('postgres', 'service_role', 'supabase_admin') or public.is_platform_admin() then
    return new;
  end if;

  if not public.has_tenant_permission(old.id, 'manage_settings') then
    raise exception 'Manage settings permission is required to update tenant branding.'
      using errcode = '42501';
  end if;

  if (
    to_jsonb(new) - array['name', 'primary_color', 'updated_at']
  ) is distinct from (
    to_jsonb(old) - array['name', 'primary_color', 'updated_at']
  ) then
    raise exception 'Tenant settings managers may only change name and primary color.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.guard_tenant_branding_changes() from public, anon, authenticated;

drop trigger if exists guard_tenant_branding_changes on public.tenants;
create trigger guard_tenant_branding_changes
before update on public.tenants
for each row execute function public.guard_tenant_branding_changes();

create or replace function public.audit_tenant_branding_changes()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if new.name is distinct from old.name or new.primary_color is distinct from old.primary_color then
    insert into public.activity_logs (
      tenant_id,
      actor_id,
      action,
      entity_type,
      entity_id,
      metadata
    )
    values (
      new.id,
      public.current_profile_id(),
      'Updated tenant branding',
      'tenant',
      new.id,
      jsonb_build_object(
        'before', jsonb_build_object('name', old.name, 'primary_color', old.primary_color),
        'after', jsonb_build_object('name', new.name, 'primary_color', new.primary_color)
      )
    );
  end if;

  return new;
end;
$$;

revoke all on function public.audit_tenant_branding_changes() from public, anon, authenticated;

drop trigger if exists audit_tenant_branding_changes on public.tenants;
create trigger audit_tenant_branding_changes
after update of name, primary_color on public.tenants
for each row execute function public.audit_tenant_branding_changes();
