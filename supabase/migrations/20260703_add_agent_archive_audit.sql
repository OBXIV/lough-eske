alter table public.agents
  add column if not exists archived_at timestamptz,
  add column if not exists archived_by uuid references public.profiles(id);

create index if not exists agents_tenant_archived_idx
on public.agents(tenant_id, archived_at);
