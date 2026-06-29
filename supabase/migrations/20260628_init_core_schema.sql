create extension if not exists "pgcrypto";

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  status text not null default 'active' check (status in ('active', 'demo', 'prospect', 'inactive')),
  logo_url text,
  primary_color text default '#2563EB',
  secondary_color text,
  domain text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  email text not null,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  name text unique not null,
  description text,
  scope text not null default 'tenant',
  created_at timestamptz default now()
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,
  description text,
  created_at timestamptz default now()
);

create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz default now(),
  unique(role_id, permission_id)
);

create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id),
  status text not null default 'active' check (status in ('active', 'invited', 'suspended', 'inactive')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(tenant_id, profile_id)
);

create table if not exists public.agents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text,
  phone text,
  brokerage_status text not null default 'active' check (brokerage_status in ('active', 'inactive', 'recruit', 'onboarding', 'former')),
  license_number text,
  source text,
  production_ytd numeric default 0,
  gci_ytd numeric default 0,
  last_close_date date,
  assigned_owner_id uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.recruits (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  stage text not null default 'Identified' check (stage in ('Identified', 'Contacted', 'Engaged', 'Offer Pending', 'Joined', 'Lost')),
  heat_score text default 'Warm' check (heat_score in ('Hot', 'Warm', 'Cold')),
  recruit_score integer default 50,
  source text,
  assigned_recruiter_id uuid references public.profiles(id),
  next_follow_up_date date,
  notes_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.recruiting_activities (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  recruit_id uuid not null references public.recruits(id) on delete cascade,
  activity_type text not null check (activity_type in ('Call', 'Email', 'Text', 'Meeting', 'Note', 'Stage Change')),
  activity_date timestamptz default now(),
  notes text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  client_name text,
  property_address text,
  transaction_type text check (transaction_type in ('Buyer', 'Seller', 'Dual', 'Referral')),
  stage text not null default 'Lead' check (stage in ('Lead', 'Listing', 'Under Contract', 'Inspection', 'Clear to Close', 'Closed', 'Cancelled')),
  list_price numeric default 0,
  estimated_gci numeric default 0,
  expected_close_date date,
  status text not null default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  assigned_to uuid references public.profiles(id),
  related_type text,
  related_id uuid,
  title text not null,
  description text,
  due_date timestamptz,
  status text not null default 'open' check (status in ('open', 'in_progress', 'complete', 'cancelled')),
  priority text not null default 'normal' check (priority in ('low', 'normal', 'high', 'urgent')),
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  related_type text not null,
  related_id uuid not null,
  body text not null,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  actor_id uuid references public.profiles(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists public.agent_resources (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  description text,
  resource_type text check (resource_type in ('Link', 'PDF', 'Video', 'Training', 'Policy', 'Template')),
  url text,
  visibility text default 'all_agents',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.agent_referrals (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  agent_id uuid references public.agents(id) on delete set null,
  referral_name text not null,
  referral_email text,
  referral_phone text,
  referral_status text default 'new' check (referral_status in ('new', 'contacted', 'active', 'closed', 'lost')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists tenant_memberships_tenant_id_idx on public.tenant_memberships(tenant_id);
create index if not exists tenant_memberships_profile_id_idx on public.tenant_memberships(profile_id);
create index if not exists agents_tenant_id_idx on public.agents(tenant_id);
create index if not exists agents_tenant_status_idx on public.agents(tenant_id, brokerage_status);
create index if not exists recruits_tenant_id_idx on public.recruits(tenant_id);
create index if not exists recruits_tenant_stage_idx on public.recruits(tenant_id, stage);
create index if not exists transactions_tenant_id_idx on public.transactions(tenant_id);
create index if not exists transactions_tenant_stage_idx on public.transactions(tenant_id, stage);
create index if not exists tasks_tenant_id_idx on public.tasks(tenant_id);
create index if not exists tasks_assigned_to_idx on public.tasks(assigned_to);
create index if not exists tasks_tenant_status_idx on public.tasks(tenant_id, status);
create index if not exists notes_related_idx on public.notes(tenant_id, related_type, related_id);
create index if not exists activity_logs_tenant_created_idx on public.activity_logs(tenant_id, created_at);

create or replace function public.current_profile_id()
returns uuid
language sql
security definer
set search_path = public
as $$
  select id from public.profiles where auth_user_id = auth.uid();
$$;

create or replace function public.is_tenant_member(target_tenant_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    join public.profiles p on p.id = tm.profile_id
    where p.auth_user_id = auth.uid()
      and tm.tenant_id = target_tenant_id
      and tm.status = 'active'
  );
$$;

create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    join public.profiles p on p.id = tm.profile_id
    join public.roles r on r.id = tm.role_id
    where p.auth_user_id = auth.uid()
      and r.name = 'Platform Admin'
      and tm.status = 'active'
  );
$$;

alter table public.tenants enable row level security;
alter table public.tenant_memberships enable row level security;
alter table public.agents enable row level security;
alter table public.recruits enable row level security;
alter table public.recruiting_activities enable row level security;
alter table public.transactions enable row level security;
alter table public.tasks enable row level security;
alter table public.notes enable row level security;
alter table public.activity_logs enable row level security;
alter table public.agent_resources enable row level security;
alter table public.agent_referrals enable row level security;

create policy "platform admins can read tenants"
on public.tenants for select
using (public.is_platform_admin() or public.is_tenant_member(id));

create policy "members can read their memberships"
on public.tenant_memberships for select
using (public.is_platform_admin() or public.is_tenant_member(tenant_id));

create policy "tenant members can read agents"
on public.agents for select
using (public.is_platform_admin() or public.is_tenant_member(tenant_id));

create policy "tenant members can read recruits"
on public.recruits for select
using (public.is_platform_admin() or public.is_tenant_member(tenant_id));

create policy "tenant members can read recruiting activities"
on public.recruiting_activities for select
using (public.is_platform_admin() or public.is_tenant_member(tenant_id));

create policy "tenant members can read transactions"
on public.transactions for select
using (public.is_platform_admin() or public.is_tenant_member(tenant_id));

create policy "tenant members can read tasks"
on public.tasks for select
using (public.is_platform_admin() or public.is_tenant_member(tenant_id));

create policy "tenant members can read notes"
on public.notes for select
using (public.is_platform_admin() or public.is_tenant_member(tenant_id));

create policy "tenant members can read activity logs"
on public.activity_logs for select
using (public.is_platform_admin() or (tenant_id is not null and public.is_tenant_member(tenant_id)));

create policy "tenant members can read agent resources"
on public.agent_resources for select
using (public.is_platform_admin() or public.is_tenant_member(tenant_id));

create policy "tenant members can read agent referrals"
on public.agent_referrals for select
using (public.is_platform_admin() or public.is_tenant_member(tenant_id));
