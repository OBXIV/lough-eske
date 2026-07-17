# Lough Eske - ENVIRONMENTS.md

## Purpose
Define the deployment and database environment strategy for Lough Eske.

## Environment Model
Lough Eske should run as three separate environments:

1. Dev
2. Stage
3. Prod

QA is a future formal environment. Until then, QA work happens in Dev/local and feature Preview deployments before Stage validation.

Each environment should have its own Vercel project environment variables and its own Supabase project. Do not share production data into Dev or Stage.

## Vercel Mapping

Use this deployment mapping:

| Product environment | Supabase project | Vercel target | Purpose |
| --- | --- | --- | --- |
| Dev | `lough-eske-dev` | Vercel Development, local `.env.dev.local`, or feature previews explicitly marked as Dev | Active engineering and seed iteration |
| Stage | `lough-eske-stage` | Vercel Preview behind Vercel SSO | Release candidate and demo validation |
| Prod | `lough-eske-prod` | Vercel Production | Customer-facing production with a dedicated Prod Supabase project |

Do not point Stage at the Dev Supabase project just to make a deployment pass. If Stage does not have its own Supabase credentials yet, Stage is not wired.

## Dev
Current Supabase project label:
- `lough-eske-dev`

Current Supabase project ref:
- `ybzelcftszhhbotzcqzq`

Purpose:
- Active scaffold and feature development
- Migration testing
- Seed data testing
- Demo data iteration

Current state:
- Migration ledger current through `20260717181113`
- Repeatable demo seed applied and verified July 16, 2026
- Sprint 10A portal data, permission-scoped RLS policies, and anonymous helper-function denial verified
- Sprint 11A branding authorization, audit logging, protected-field denial, cross-tenant denial, and settings read models verified in a rolled-back transaction July 17, 2026

Expected Vercel environment:
- Development or explicit Dev preview target

## Stage
Current Supabase project label:
- `lough-eske-stage`

Current Supabase project ref:
- `gdwkhjoushqdrfmbzyit`

Current Supabase project URL:
- `https://gdwkhjoushqdrfmbzyit.supabase.co`

Purpose:
- Release candidate validation
- Sales/demo QA before production promotion
- Production-like data volume with synthetic or approved demo data
- Schema current with the repo as of July 16, 2026: migration ledger records `20260628` through `20260716090000`
- Repeatable demo seed and Sprint 10A portal/RLS verification applied successfully July 16, 2026
- Pending rollout: Sprint 11A migrations `20260717180736` and `20260717181113`
- Vercel Preview `DATABASE_URL` points at the Stage transaction pooler; wiring verified end to end on July 6, 2026

Expected Vercel environment:
- Preview or dedicated staging domain

Current Vercel Preview variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
- `DATABASE_URL`

Access rule:
- Stage Preview should stay behind Vercel SSO.

## Prod
Current Supabase organization:
- `OblioX P1` (Pro)

Current Supabase project label:
- `lough-eske-prod`

Current Supabase project ref:
- `tvomxkspgkbaukyzzbpz`

Current Supabase project URL:
- `https://tvomxkspgkbaukyzzbpz.supabase.co`

Current state:
- Created in `us-west-1` on July 9, 2026
- Migration ledger records `20260628` through `20260716090000`
- Repeatable demo seed and Sprint 10A portal/RLS verification applied successfully July 16, 2026
- Pending rollout: Sprint 11A migrations `20260717180736` and `20260717181113`
- Vercel Production public Supabase variables and `DATABASE_URL` point at this project
- Production deployment for commit `bb50cdf` reached READY on July 16, 2026 with no build or runtime errors; the read-only demo workspace, Prod badge, and pilot-login rejection were last browser-verified July 9, 2026

Purpose:
- Customer-facing production application
- Production auth users
- Production tenant data

Expected Vercel environment:
- Production deployment and production domain

Access rule:
- Demo Brokerage remains a read-only demo workspace even when `DATABASE_URL` is configured.
- The Point Realty pilot login is hidden and rejected in Prod.

## Rules
- Never commit secrets.
- Never run destructive migration or seed commands against Prod without an explicit production confirmation.
- Dev can be reset during scaffold work.
- Stage should be reset only when validating a release candidate.
- Prod schema changes must come from committed Supabase migrations.
- Seed files should remain safe, repeatable, and demo-data only unless explicitly split by environment.
- Demo tenants are read-only application workspaces. Do not use `tenant.status = 'demo'` for editable customer workspaces.
- Only tenants with status `active` accept writes. Point Realty is the seeded writable pilot workspace for write-path testing; its login is hidden and rejected on Prod deployments.
- Work should happen on feature branches first. Validate against Stage Preview before merging or pushing release work to Production.
- If Stage fails, the fix goes back to Dev/local or the future QA environment before returning to Stage.
- If Stage passes, the same commit can be promoted to Production.

## Required Variables
Each Vercel environment should define:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
DATABASE_URL
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` may also be set for compatibility, but the app prefers `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

For migration and seed execution, local ignored operator credentials may include one of:

```txt
SUPABASE_ACCESS_TOKEN
MIGRATION_DATABASE_URL
```

Use the IPv4 session pooler connection string for migration and seed commands when the local network cannot reach Supabase direct Postgres over IPv6. Transaction pooler mode is useful for short-lived application queries, but it can fail during CLI migration work because prepared statements are not supported in transaction mode.

For server-side application reads, set `DATABASE_URL` in the target Vercel environment. The application disables prepared statements for this connection so it can use Supabase pooler URLs safely.

The app intentionally does not use Vercel integration-created `POSTGRES_*` variables. Each environment must opt in through `DATABASE_URL` so Dev, Stage, and Prod cannot accidentally share a database.

When writing sensitive values into Vercel, avoid the interactive `vercel env add` prompt and dashboard saves; both have corrupted values on this project. Use the REST API with the value read from the local env file: `POST https://api.vercel.com/v10/projects/{projectId}/env?teamId={orgId}&upsert=true` with `{ key, value, type: "sensitive", target: [...] }`. Deploy from git or `vercel deploy` afterward; `vercel redeploy` reuses the source deployment's env snapshot.

## Local Files

Use ignored local files for real secrets:

```txt
.env.dev.local
.env.stage.local
```

Templates are committed:

```txt
.env.dev.example
.env.stage.example
```

Verify local environment files with:

```bash
npm run env:verify:dev
npm run env:verify:stage
```

The verifier fails if Stage points at the documented Dev Supabase project ref.

## Connection Rules

- `DATABASE_URL`: server runtime connection. Use the Supabase Transaction pooler for the matching environment.
- `MIGRATION_DATABASE_URL`: operator-only migration/seed connection. Use the Supabase Session pooler for the matching environment.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public browser-safe Supabase values for the matching environment.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: optional compatibility fallback.

Migration flow for Dev or Stage:

```bash
npx supabase db push --include-seed --db-url "$MIGRATION_DATABASE_URL"
```
