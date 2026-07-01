-- Profiles joins (task owners, activity actors, agent owners, transaction
-- finalizers) return null under RLS because profiles has row security enabled
-- in the live database with no select policy. Enable it in the schema too and
-- allow members to read profiles of people in their own tenants.
alter table public.profiles enable row level security;

drop policy if exists "members can read profiles in shared tenants" on public.profiles;
create policy "members can read profiles in shared tenants"
on public.profiles for select
using (
  public.is_platform_admin()
  or auth_user_id = auth.uid()
  or exists (
    select 1
    from public.tenant_memberships tm
    where tm.profile_id = profiles.id
      and tm.status = 'active'
      and public.is_tenant_member(tm.tenant_id)
  )
);
