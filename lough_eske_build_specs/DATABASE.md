# Lough Eske - DATABASE.md

## Purpose
This document defines the v0.1 PostgreSQL/Supabase data model for Lough Eske.

Internal project codename: **Lough Eske**  
Product name: **TBD**  
Version: **v0.1**  
Last updated: **June 28, 2026**

## Database Philosophy
This is a multi-tenant SaaS database. Tenant isolation is the foundation. Every tenant-owned business table must include `tenant_id` and must be protected by Row Level Security.

## Core Principles
1. `auth.users` is the authentication source of truth.
2. `profiles` extends auth users with app-level profile data.
3. `tenants` represent brokerages.
4. `tenant_memberships` connects users to brokerages and roles.
5. Business data belongs to tenants.
6. RLS must prevent cross-tenant leakage.
7. Use UUID primary keys.
8. Use `created_at` and `updated_at` on all core tables.
9. Prefer soft statuses over hard deletes where business history matters.
10. Activity history should be preserved.

## Required Extensions
Enable:
```sql
create extension if not exists "pgcrypto";
```

## Tables

### tenants
Represents brokerages or demo/prospect organizations.

Columns:
- id uuid primary key default gen_random_uuid()
- name text not null
- slug text unique not null
- status text not null default 'active'
- logo_url text
- primary_color text default '#2563EB'
- secondary_color text
- domain text
- created_at timestamptz default now()
- updated_at timestamptz default now()

Status values:
- active
- demo
- prospect
- inactive

### profiles
App profile for Supabase auth users.

Columns:
- id uuid primary key default gen_random_uuid()
- auth_user_id uuid unique not null references auth.users(id) on delete cascade
- first_name text
- last_name text
- email text not null
- avatar_url text
- created_at timestamptz default now()
- updated_at timestamptz default now()

### roles
Defines app roles.

Columns:
- id uuid primary key default gen_random_uuid()
- name text unique not null
- description text
- scope text not null default 'tenant'
- created_at timestamptz default now()

Role seed values:
- Platform Admin
- Broker Owner
- CFO / Finance
- Office Admin
- Recruiter
- Transaction Coordinator
- Read Only
- Agent Portal User

### permissions
Defines individual permission keys.

Columns:
- id uuid primary key default gen_random_uuid()
- key text unique not null
- description text
- created_at timestamptz default now()

Seed permissions:
- view_dashboard
- view_agents
- create_agents
- edit_agents
- delete_agents
- view_recruiting
- create_recruits
- edit_recruits
- delete_recruits
- view_transactions
- create_transactions
- edit_transactions
- delete_transactions
- view_reports
- view_financials
- manage_tasks
- manage_notes
- manage_users
- manage_settings
- view_agent_portal
- manage_agent_resources

### role_permissions
Join table.

Columns:
- id uuid primary key default gen_random_uuid()
- role_id uuid not null references roles(id) on delete cascade
- permission_id uuid not null references permissions(id) on delete cascade
- created_at timestamptz default now()

Constraint:
- unique(role_id, permission_id)

### tenant_memberships
Connects users to tenants and roles.

Columns:
- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- profile_id uuid not null references profiles(id) on delete cascade
- role_id uuid not null references roles(id)
- status text not null default 'active'
- created_at timestamptz default now()
- updated_at timestamptz default now()

Constraint:
- unique(tenant_id, profile_id)

Status values:
- active
- invited
- suspended
- inactive

### agents
Brokerage agents as business records. In v0.1, most agents are records, not login users.

Columns:
- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- first_name text not null
- last_name text not null
- email text
- phone text
- brokerage_status text not null default 'active'
- license_number text
- source text
- production_ytd numeric default 0
- gci_ytd numeric default 0
- last_close_date date
- assigned_owner_id uuid references profiles(id)
- created_at timestamptz default now()
- updated_at timestamptz default now()

Status values:
- active
- inactive
- recruit
- onboarding
- former

### recruits
Recruiting pipeline record. May link to an agent record.

Columns:
- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- agent_id uuid references agents(id) on delete set null
- stage text not null default 'Identified'
- heat_score text default 'Warm'
- recruit_score integer default 50
- source text
- assigned_recruiter_id uuid references profiles(id)
- next_follow_up_date date
- notes_summary text
- created_at timestamptz default now()
- updated_at timestamptz default now()

Stages:
- Identified
- Contacted
- Engaged
- Offer Pending
- Joined
- Lost

Heat score values:
- Hot
- Warm
- Cold

### recruiting_activities
Activity timeline for a recruit.

Columns:
- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- recruit_id uuid not null references recruits(id) on delete cascade
- activity_type text not null
- activity_date timestamptz default now()
- notes text
- created_by uuid references profiles(id)
- created_at timestamptz default now()

Activity types:
- Call
- Email
- Text
- Meeting
- Note
- Stage Change

### transactions
Brokerage transaction pipeline.

Columns:
- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- agent_id uuid references agents(id) on delete set null
- client_name text
- property_address text
- transaction_type text
- stage text not null default 'Lead'
- list_price numeric default 0
- estimated_gci numeric default 0
- expected_close_date date
- status text not null default 'active'
- created_at timestamptz default now()
- updated_at timestamptz default now()

Stages:
- Lead
- Listing
- Under Contract
- Inspection
- Clear to Close
- Closed
- Cancelled

Transaction types:
- Buyer
- Seller
- Dual
- Referral

### tasks
Generic task engine.

Columns:
- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- assigned_to uuid references profiles(id)
- related_type text
- related_id uuid
- title text not null
- description text
- due_date timestamptz
- status text not null default 'open'
- priority text not null default 'normal'
- created_by uuid references profiles(id)
- created_at timestamptz default now()
- updated_at timestamptz default now()

Status values:
- open
- in_progress
- complete
- cancelled

Priority values:
- low
- normal
- high
- urgent

### notes
Generic notes attached to records.

Columns:
- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- related_type text not null
- related_id uuid not null
- body text not null
- created_by uuid references profiles(id)
- created_at timestamptz default now()

### activity_logs
System and user activity log.

Columns:
- id uuid primary key default gen_random_uuid()
- tenant_id uuid references tenants(id) on delete cascade
- actor_id uuid references profiles(id)
- action text not null
- entity_type text
- entity_id uuid
- metadata jsonb default '{}'::jsonb
- created_at timestamptz default now()

### agent_resources
Agent portal resource library.

Columns:
- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- title text not null
- description text
- resource_type text
- url text
- visibility text default 'all_agents'
- created_at timestamptz default now()
- updated_at timestamptz default now()

Resource types:
- Link
- PDF
- Video
- Training
- Policy
- Template

### agent_referrals
Agent portal referral tracking.

Columns:
- id uuid primary key default gen_random_uuid()
- tenant_id uuid not null references tenants(id) on delete cascade
- agent_id uuid references agents(id) on delete set null
- referral_name text not null
- referral_email text
- referral_phone text
- referral_status text default 'new'
- notes text
- created_at timestamptz default now()
- updated_at timestamptz default now()

Referral status values:
- new
- contacted
- active
- closed
- lost

## Indexes
Create indexes on:
- tenant_memberships(tenant_id)
- tenant_memberships(profile_id)
- agents(tenant_id)
- agents(tenant_id, brokerage_status)
- recruits(tenant_id)
- recruits(tenant_id, stage)
- transactions(tenant_id)
- transactions(tenant_id, stage)
- tasks(tenant_id)
- tasks(assigned_to)
- tasks(tenant_id, status)
- notes(tenant_id, related_type, related_id)
- activity_logs(tenant_id, created_at)

## RLS Principle
Users can access tenant-owned data only when they have active membership in that tenant.

Recommended helper function:
```sql
create or replace function public.current_profile_id()
returns uuid
language sql
security definer
as $$
  select id from public.profiles where auth_user_id = auth.uid();
$$;
```

Recommended membership helper:
```sql
create or replace function public.is_tenant_member(target_tenant_id uuid)
returns boolean
language sql
security definer
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
```

Recommended platform admin helper:
```sql
create or replace function public.is_platform_admin()
returns boolean
language sql
security definer
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
```

Base RLS policy pattern:
```sql
create policy "tenant members can read"
on public.agents
for select
using (
  public.is_platform_admin() or public.is_tenant_member(tenant_id)
);
```

Add stricter insert/update/delete policies by permission in later iterations. For v0.1, implement tenant isolation first, then refine permission checks.

## Seed Data Requirements
Create:
- Demo Brokerage tenant
- Point Realty tenant placeholder
- California Brokerage placeholder

Demo Brokerage should include:
- 10 agents
- 8 recruits
- 6 transactions
- 12 tasks
- 6 resources
- 10 activity logs

Demo users:
- demo.owner@obliox.io
- demo.cfo@obliox.io
- demo.recruiter@obliox.io
- demo.tc@obliox.io
- demo.agent@obliox.io

Do not commit real production passwords.

## Migration Standards
- Every schema change must be a Supabase migration.
- No manual dashboard-only schema edits.
- Seed data should be repeatable.
- Do not destroy data in migrations unless explicitly intended.
- Use clear migration names, e.g. `20260628_init_core_schema.sql`.

## Database Definition of Done
Database v0.1 is complete when:
1. All core tables exist.
2. All tenant-owned tables contain `tenant_id`.
3. RLS is enabled on tenant-owned tables.
4. Demo tenant seed data exists.
5. Point Realty and California placeholders exist.
6. Basic tenant isolation is verified.
7. Migrations are committed.
8. Seed script is committed.
