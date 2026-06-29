# Lough Eske - ENVIRONMENTS.md

## Purpose
Define the deployment and database environment strategy for Lough Eske.

## Environment Model
Lough Eske should run as three separate environments:

1. Dev
2. Stage
3. Prod

Each environment should have its own Vercel project environment variables and its own Supabase project. Do not share production data into Dev or Stage.

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

Expected Vercel environment:
- Preview or a dedicated dev deployment target

## Stage
Future Supabase project label:
- `lough-eske-stage`

Purpose:
- Release candidate validation
- Sales/demo QA before production promotion
- Production-like data volume with synthetic or approved demo data

Expected Vercel environment:
- Preview or dedicated staging domain

## Prod
Future Supabase project label:
- `lough-eske-prod`

Purpose:
- Customer-facing production application
- Production auth users
- Production tenant data

Expected Vercel environment:
- Production deployment and production domain

## Rules
- Never commit secrets.
- Never run destructive migration or seed commands against Prod without an explicit production confirmation.
- Dev can be reset during scaffold work.
- Stage should be reset only when validating a release candidate.
- Prod schema changes must come from committed Supabase migrations.
- Seed files should remain safe, repeatable, and demo-data only unless explicitly split by environment.

## Required Variables
Each Vercel environment should define:

```txt
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

For migration and seed execution, local ignored operator credentials may include one of:

```txt
SUPABASE_ACCESS_TOKEN
DATABASE_URL
POSTGRES_URL_NON_POOLING
POSTGRES_PASSWORD
```

Use the IPv4 session pooler connection string for migration and seed commands when the local network cannot reach Supabase direct Postgres over IPv6. Transaction pooler mode is useful for short-lived application queries, but it can fail during CLI migration work because prepared statements are not supported in transaction mode.

For server-side application reads, set `DATABASE_URL` in the target Vercel environment. The application disables prepared statements for this connection so it can use Supabase pooler URLs safely.
