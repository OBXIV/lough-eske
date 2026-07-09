-- Security advisor flagged the RBAC reference tables: RLS was never enabled,
-- so Supabase's default grants exposed reads and writes to anyone holding the
-- public API key. Roles, permissions, and their mapping are read-only
-- reference data. Signed-in users can read them; nothing writes them through
-- the API.
alter table public.roles enable row level security;
alter table public.permissions enable row level security;
alter table public.role_permissions enable row level security;

drop policy if exists "authenticated users can read roles" on public.roles;
create policy "authenticated users can read roles"
on public.roles for select
to authenticated
using (true);

drop policy if exists "authenticated users can read permissions" on public.permissions;
create policy "authenticated users can read permissions"
on public.permissions for select
to authenticated
using (true);

drop policy if exists "authenticated users can read role permissions" on public.role_permissions;
create policy "authenticated users can read role permissions"
on public.role_permissions for select
to authenticated
using (true);
