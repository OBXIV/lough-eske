-- Cover the Sprint 8B tenant plan foreign key for plan update/delete checks and
-- tenant-to-plan joins. Added from the post-migration performance advisor.
create index tenants_plan_id_idx on public.tenants(plan_id);
