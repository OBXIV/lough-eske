# Lough Eske

Brokerage Operating System v0.1 foundation for a multi-tenant real estate brokerage SaaS product.

## Local Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run db:verify
npm run env:verify:dev
npm run env:verify:stage
npm run sprint3:verify
npm run sprint3b:verify
npm run sprint10a:verify
npm run supabase:verify
npm run typecheck
npm run lint
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
DATABASE_URL=
MIGRATION_DATABASE_URL=
```

`DATABASE_URL` is server-only and should use the Supabase pooler URL for the target environment. Leave it unset to fall back to local demo fixtures during scaffold work.
`NEXT_PUBLIC_SUPABASE_ANON_KEY` can also be set as a compatibility fallback, but `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is preferred.

Use `.env.dev.local` for `lough-eske-dev` and `.env.stage.local` for `lough-eske-stage`; both files are ignored. The committed templates are `.env.dev.example` and `.env.stage.example`.

## Specs

The build specs live in `docs/`:

- `docs/BUILD.md`
- `docs/DATABASE.md`
- `docs/ENVIRONMENTS.md`
- `docs/UI.md`
- `docs/BACKLOG.md`
