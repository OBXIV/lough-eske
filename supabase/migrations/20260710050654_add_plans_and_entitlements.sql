-- Sprint 8B: plans, subscribed seats, and plan-scoped feature access.
-- Fixed UUIDs keep the catalog repeatable across Dev, Stage, and Prod.
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  key text unique not null check (key in ('core', 'growth', 'scale')),
  name text not null,
  base_seat_limit integer not null check (base_seat_limit > 0),
  per_seat_price_cents integer not null check (per_seat_price_cents >= 0),
  base_price_cents integer not null check (base_price_cents >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.plan_features (
  plan_id uuid not null references public.plans(id) on delete cascade,
  feature_key text not null check (feature_key ~ '^[a-z][a-z0-9_]*$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (plan_id, feature_key)
);

insert into public.plans (id, key, name, base_seat_limit, per_seat_price_cents, base_price_cents)
values
  ('70000000-0000-4000-8000-000000000001', 'core', 'Core', 5, 2900, 19900),
  ('70000000-0000-4000-8000-000000000002', 'growth', 'Growth', 15, 2500, 49900),
  ('70000000-0000-4000-8000-000000000003', 'scale', 'Scale', 30, 1900, 89900)
on conflict (key) do update set
  name = excluded.name,
  base_seat_limit = excluded.base_seat_limit,
  per_seat_price_cents = excluded.per_seat_price_cents,
  base_price_cents = excluded.base_price_cents,
  updated_at = now();

insert into public.plan_features (plan_id, feature_key)
values
  ('70000000-0000-4000-8000-000000000001', 'reports'),
  ('70000000-0000-4000-8000-000000000001', 'agent_portal'),
  ('70000000-0000-4000-8000-000000000002', 'reports'),
  ('70000000-0000-4000-8000-000000000002', 'agent_portal'),
  ('70000000-0000-4000-8000-000000000002', 'mls_sync'),
  ('70000000-0000-4000-8000-000000000003', 'reports'),
  ('70000000-0000-4000-8000-000000000003', 'agent_portal'),
  ('70000000-0000-4000-8000-000000000003', 'mls_sync')
on conflict (plan_id, feature_key) do nothing;

alter table public.tenants
add column plan_id uuid references public.plans(id),
add column seat_count integer;

update public.tenants
set
  plan_id = '70000000-0000-4000-8000-000000000001',
  seat_count = greatest(
    5,
    (
      select count(*)::integer
      from public.tenant_memberships
      where tenant_memberships.tenant_id = tenants.id
        and tenant_memberships.status in ('active', 'invited')
    )
  );

alter table public.tenants
alter column plan_id set default '70000000-0000-4000-8000-000000000001',
alter column plan_id set not null,
alter column seat_count set default 5,
alter column seat_count set not null,
add constraint tenants_seat_count_positive check (seat_count > 0);

alter table public.plans enable row level security;
alter table public.plan_features enable row level security;

-- The catalog is shared, but only real tenant members (or Platform Admins)
-- can read it. Platform Admin is the only authenticated write path.
create policy "tenant members can read plans"
on public.plans for select
to authenticated
using (
  public.is_platform_admin()
  or exists (
    select 1
    from public.tenant_memberships tm
    join public.profiles p on p.id = tm.profile_id
    where p.auth_user_id = (select auth.uid())
      and tm.status = 'active'
  )
);

create policy "platform admins can insert plans"
on public.plans for insert
to authenticated
with check (public.is_platform_admin());

create policy "platform admins can update plans"
on public.plans for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "platform admins can delete plans"
on public.plans for delete
to authenticated
using (public.is_platform_admin());

create policy "tenant members can read plan features"
on public.plan_features for select
to authenticated
using (
  public.is_platform_admin()
  or exists (
    select 1
    from public.tenant_memberships tm
    join public.profiles p on p.id = tm.profile_id
    where p.auth_user_id = (select auth.uid())
      and tm.status = 'active'
  )
);

create policy "platform admins can insert plan features"
on public.plan_features for insert
to authenticated
with check (public.is_platform_admin());

create policy "platform admins can update plan features"
on public.plan_features for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

create policy "platform admins can delete plan features"
on public.plan_features for delete
to authenticated
using (public.is_platform_admin());

create policy "platform admins can update tenant entitlements"
on public.tenants for update
to authenticated
using (public.is_platform_admin())
with check (public.is_platform_admin());

grant select, insert, update, delete on table public.plans to authenticated, service_role;
grant select, insert, update, delete on table public.plan_features to authenticated, service_role;
grant select, update on table public.tenants to authenticated, service_role;
revoke all on table public.plans from anon;
revoke all on table public.plan_features from anon;

create or replace function public.tenant_has_feature(target_tenant_id uuid, target_feature_key text)
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select exists (
    select 1
    from public.tenants t
    join public.plan_features pf on pf.plan_id = t.plan_id
    where t.id = target_tenant_id
      and pf.feature_key = target_feature_key
      and (public.is_platform_admin() or public.is_tenant_member(t.id))
  );
$$;

revoke all on function public.tenant_has_feature(uuid, text) from public, anon;
grant execute on function public.tenant_has_feature(uuid, text) to authenticated, service_role;

-- Entitlement columns remain Platform Admin-only even if tenant profile editing
-- is opened to broker owners in a later sprint.
create or replace function public.guard_tenant_entitlement_changes()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
declare
  occupied_seats integer;
begin
  if new.seat_count is distinct from old.seat_count then
    select count(*)::integer
    into occupied_seats
    from public.tenant_memberships
    where tenant_memberships.tenant_id = new.id
      and tenant_memberships.status in ('active', 'invited');

    if new.seat_count < occupied_seats then
      raise exception 'Subscribed seats cannot be lower than % occupied seats.', occupied_seats
        using errcode = '23514';
    end if;
  end if;

  if (
    new.plan_id is distinct from old.plan_id
    or new.seat_count is distinct from old.seat_count
  ) and current_user not in ('postgres', 'service_role', 'supabase_admin')
    and not public.is_platform_admin()
  then
    raise exception 'Only Platform Admin can change tenant plans or subscribed seats.'
      using errcode = '42501';
  end if;

  return new;
end;
$$;

revoke all on function public.guard_tenant_entitlement_changes() from public, anon, authenticated;

create trigger guard_tenant_entitlement_changes
before update of plan_id, seat_count on public.tenants
for each row execute function public.guard_tenant_entitlement_changes();

-- Active and invited memberships both reserve a subscribed seat. Suspended and
-- inactive memberships release their seat.
create schema if not exists private;
revoke all on schema private from public;

create or replace function private.enforce_tenant_seat_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  subscribed_seats integer;
  occupied_seats integer;
begin
  if new.status not in ('active', 'invited') then
    return new;
  end if;

  select tenants.seat_count
  into subscribed_seats
  from public.tenants
  where tenants.id = new.tenant_id
  for share;

  if subscribed_seats is null then
    raise exception 'Tenant % does not have a seat allocation.', new.tenant_id
      using errcode = '23514';
  end if;

  select count(*)::integer
  into occupied_seats
  from public.tenant_memberships
  where tenant_memberships.tenant_id = new.tenant_id
    and tenant_memberships.status in ('active', 'invited')
    and tenant_memberships.id <> new.id;

  if occupied_seats >= subscribed_seats then
    raise exception 'Tenant seat limit reached (% subscribed seats).', subscribed_seats
      using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_tenant_seat_limit() from public, anon, authenticated;

create trigger enforce_tenant_seat_limit
before insert or update of tenant_id, status on public.tenant_memberships
for each row execute function private.enforce_tenant_seat_limit();
