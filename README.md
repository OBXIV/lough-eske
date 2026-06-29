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
npm run typecheck
npm run lint
npm run build
```

## Environment

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

## Specs

The build specs live in `docs/`:

- `docs/BUILD.md`
- `docs/DATABASE.md`
- `docs/UI.md`
- `docs/BACKLOG.md`
