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
npm run sprint3:verify
npm run sprint3b:verify
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
NEXT_PUBLIC_SUPABASE_ANON_KEY=
DATABASE_URL=
```

`DATABASE_URL` is server-only and should use the Supabase pooler URL for the target environment. Leave it unset to fall back to local demo fixtures during scaffold work.

## Specs

The build specs live in `docs/`:

- `docs/BUILD.md`
- `docs/DATABASE.md`
- `docs/ENVIRONMENTS.md`
- `docs/UI.md`
- `docs/BACKLOG.md`
