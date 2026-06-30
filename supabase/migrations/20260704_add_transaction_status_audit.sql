alter table public.transactions
  add column if not exists finalized_at timestamptz,
  add column if not exists finalized_by uuid references public.profiles(id);

create index if not exists transactions_tenant_finalized_idx
on public.transactions(tenant_id, finalized_at);
