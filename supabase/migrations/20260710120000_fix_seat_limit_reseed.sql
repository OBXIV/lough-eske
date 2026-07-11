-- The seat-limit trigger fires BEFORE INSERT ahead of ON CONFLICT resolution,
-- so a seed re-run that re-asserts existing memberships raised a seat-limit
-- error on any tenant at exact capacity (Demo Brokerage seeds at 6 of 6).
-- An insert that targets an existing (tenant_id, profile_id) pair resolves to
-- the upsert's update path and occupies no new seat; skip it here. Status
-- flips on existing rows still enforce through the update branch, and new
-- memberships still enforce at the limit.
-- The tenants row lock also moves from FOR SHARE to FOR UPDATE: share locks
-- do not conflict with each other, so two concurrent inserts could both pass
-- the count check and overshoot the limit. The exclusive lock serializes
-- membership admissions per tenant and orders them against seat changes.
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

  if tg_op = 'INSERT' and exists (
    select 1
    from public.tenant_memberships existing
    where existing.tenant_id = new.tenant_id
      and existing.profile_id = new.profile_id
  ) then
    return new;
  end if;

  select tenants.seat_count
  into subscribed_seats
  from public.tenants
  where tenants.id = new.tenant_id
  for update;

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
