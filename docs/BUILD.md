# Lough Eske - BUILD.md

## Document Purpose
This document gives Nova the immediate engineering direction required to start building the first deployed SaaS version of the brokerage operating platform.

Internal project codename: **Lough Eske**  
Product name: **TBD**  
Current working product label: **Brokerage Operating System**  
Version: **v0.1**  
Last updated: **June 30, 2026**

## North Star
Build a multi-tenant SaaS platform for independent real estate brokerages. Do not build a single-brokerage CRM. The system must support Demo Brokerage, Point Realty, and future brokerages as separate tenants inside the same application.

The CRM is one module. The product is the operating system layer that gives brokerage leadership visibility into recruiting, retention, agent performance, transaction activity, staff accountability, and future agent-facing services.

## First Build Objective
Create a deployed v0.1 that can be used in sales and discovery meetings. It must look polished, support a demo account, support multiple tenants, and have a secure foundation.

v0.1 must include:
- Multi-tenant auth foundation
- Role-based access control
- Tenant-aware dashboard shell
- Broker/staff portal
- Agent database
- Recruiting pipeline
- Transaction table
- Task list
- Activity log foundation
- Reports shell
- Agent portal shell
- Demo Brokerage tenant with seeded data
- Point Realty tenant placeholder
- California Brokerage placeholder

## Technology Stack
Frontend:
- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- shadcn/ui if useful
- Lucide Icons

Backend/Data:
- Supabase
- PostgreSQL
- Supabase Auth
- Supabase Row Level Security
- Supabase Storage later

Hosting:
- Vercel

Recommended add-ons:
- Sentry for error tracking
- Resend for transactional email later
- Twilio for SMS later

Do not add MLS, Twilio, AI, billing, or complex integrations in v0.1 unless explicitly requested later. Build the foundation first.

## Product Scope v0.1
### In Scope
1. Authentication
2. Tenant membership
3. Role-aware navigation
4. Demo tenant
5. Broker dashboard
6. Agent database
7. Recruiting Kanban
8. Transaction table
9. Task list
10. Reports shell
11. Agent portal shell
12. Settings shell
13. Design token system
14. Tenant theme support
15. Repeatable Supabase migrations and seed data

### Out of Scope for v0.1
- Payments/billing
- MLS sync
- Gmail/Outlook sync
- Twilio SMS
- AI assistant
- Full agent login workflow beyond shell role support
- Native mobile app
- Deep reporting engine
- Production customer data import

## Core Architecture Rules
1. This is SaaS-first.
2. Every brokerage is a tenant.
3. Every tenant-owned table must include `tenant_id`.
4. Do not hardcode Point Realty.
5. Do not hardcode colors into components.
6. Use design tokens.
7. Use role-aware navigation.
8. Use RLS on tenant-owned tables.
9. Supabase migrations must be committed.
10. Seed data must be repeatable.

## Required Tenant Model
The system must support:
- One user belonging to one tenant
- One user belonging to many tenants later
- Platform admins seeing all tenants
- Tenant users seeing only their tenant data

The key join table is `tenant_memberships`.

## Required Roles
Seed these roles:
- Platform Admin
- Broker Owner
- CFO / Finance
- Office Admin
- Recruiter
- Transaction Coordinator
- Read Only
- Agent Portal User

Agents are mostly business records in v0.1. Agent Portal User exists to support future login-enabled agent access.

## Application Routes
Use these routes as the initial application structure:

- `/login`
- `/demo`
- `/app`
- `/app/dashboard`
- `/app/agents`
- `/app/recruiting`
- `/app/transactions`
- `/app/tasks`
- `/app/reports`
- `/app/agent-portal`
- `/app/settings`

## App Shell Requirements
The application shell should include:
- Left sidebar navigation
- Top bar with current tenant name
- User menu
- Tenant switcher placeholder
- Role-aware nav items
- Card-based content area
- Clean responsive layout

## Build Order
### Sprint 0 - Foundation
- Create repo
- Install Next.js, TypeScript, Tailwind
- Add shadcn/ui if used
- Create Supabase project connection
- Create migration structure
- Add environment config
- Deploy empty app to Vercel
- Add design token CSS variables
- Add app shell

### Sprint 1 - Auth + Tenant + RBAC
- Supabase Auth login
- Profiles table
- Tenants table
- Tenant memberships table
- Roles and permissions tables
- Seed demo users and demo tenant
- Implement role-aware navigation
- Implement tenant context provider

### Sprint 2 - Brokerage Core
- Agents table and UI
- Agent detail drawer/page
- Recruiting pipeline table and Kanban UI
- Recruiting activities
- Tasks table and UI
- Notes and activity log foundation

### Sprint 3 - Executive Layer
- Dashboard KPI cards
- Transaction table
- Reports shell
- GCI forecast placeholder
- Recruiting funnel snapshot

### Sprint 4 - Agent Portal Shell
- Agent dashboard card
- Transaction status card
- Resources card
- Referral tracking card
- Coming soon AI assistant card

### Sprint 4A - Broker Portal UX Pass
- Refresh shared design tokens toward a restrained enterprise SaaS palette
- Move the app shell to a lighter, sharper navigation system
- Add functional mobile primary navigation
- Tighten card, badge, table, page header, and KPI primitives
- Polish dashboard, recruiting, agents, transactions, tasks, reports, agent services, settings, login, and demo entry copy/layout
- Surface Dev/Stage/Prod/Preview context in the app top bar without exposing secrets
- Keep data access and database behavior unchanged

### Sprint 4B - Broker Portal Action Layer
- Add right-side detail drawers for agents, recruits, transactions, and tasks
- Add server actions for agent status, recruit stage, transaction stage, and task status updates
- Log successful changes to activity logs, and recruiting stage moves to recruiting activities
- Add RLS write policies for the first action layer
- Keep action controls permission-aware and tenant-scoped
- Require migration `20260629_add_broker_action_policies.sql` before deployed write actions are enabled

### Sprint 4C - Broker Portal Workflow Hardening
- Add pending, success, disabled, and error feedback to drawer action forms
- Show record-scoped recent activity in agent, recruit, transaction, and task drawers
- Add create drawers for recruits and tasks
- Add tenant-scoped mutation helpers for recruit and task creation
- Add RLS insert policies and `tasks.related_label` for create flows
- Require migration `20260701_add_create_flow_support.sql` before deployed create actions are expected to succeed

### Sprint 5 - Agent Database Workflows
- Add agent search and status filters
- Add create agent drawer and server action
- Add edit agent profile form for contact, license, and source fields
- Carry license and source through the agent domain model
- Add RLS insert policy for `create_agents`
- Work on feature branches and validate Stage Preview before Production promotion

### Sprint 6A - Recruiting Pipeline Operations
- Make recruit cards clickable and draggable
- Allow drag-and-drop movement between Kanban stages
- Add stage and heat dropdown controls for recruiting workflow edits
- Add stage and heat filters on the recruiting board
- Link dashboard KPI and recruiting momentum tiles to the relevant data routes
- Keep Stage Preview validation ahead of Production promotion

### Sprint 6B - Agent Document Dossier
- Add a read-only agent files section inside the agent detail drawer
- Show E&O insurance, brokerage contract, independent contractor agreement, and license copy coverage
- Surface file category, status, and updated-date metadata without claiming storage-backed uploads yet
- Defer Supabase Storage buckets, document tables, and upload/download actions to the storage sprint

### Sprint 6C - Agent Archive and Portal Clickthrough
- Remove visible Agent Owner fields until the product meaning is clear
- Add archive audit columns on agents: `archived_at` and `archived_by`
- Add an Archive agent action that sets status to `former` and records actor/timestamp
- Keep `former` out of normal create/status dropdown workflows
- Make Agent Portal tiles clickable into populated demo sections
- Require migration `20260703_add_agent_archive_audit.sql` before deployed archive flows are validated

### Current Position
- Completed through Sprint 10A
- Original baseline Sprint 7-11 shell work has been consolidated into completed scope where the route/shell/table already exists
- Sprint 8B - Plans, Seats, and Entitlements shipped July 10, 2026: committed as `c67d1ae`, rolled out to Stage and Prod, validated on a Stage Preview, and deployed to Production
- All three databases carry the same ledger through `20260716090000`; migrations `20260710050654` and `20260710050925` add the plan schema, `20260710120000` fixes the seat-limit trigger, and `20260716090000` adds the agent portal workflows and permission-scoped RLS policies
- A pre-rollout adversarial review confirmed one critical and three major defects, all fixed before commit: the seat-limit trigger aborted every seed re-run on a tenant at exact capacity (BEFORE INSERT fires ahead of ON CONFLICT resolution; proven and fixed against Prod data in rolled-back transactions), the seed reverted Platform Admin plan and seat changes (plan_id reset dropped, seat_count now only ratchets upward), the seed deleted and reinserted plan_features wiping admin grants (now an upsert by plan key), and the entitlements loader threw a 500 through the layout where the app contract degrades to read-only (now falls back to Core defaults)
- The seat-limit trigger also moved from FOR SHARE to FOR UPDATE on the tenants row so concurrent membership admissions serialize instead of racing past the limit
- Known gap: `scripts/verify-sprint8b.mjs` only greps local files and recomputes billing math; database-level rollout verification is manual
- Local operator env files were scrubbed of secrets on July 9: `.env.stage.local` is empty and `.env.local` has blank Postgres credentials, so CLI migration work against Stage or dev needs the files refilled or the Supabase connector scoped to the OblioX Stage org
- Sprint 8A required no new migration; task assignment uses existing columns and the column-agnostic manage_tasks update policy
- Migration `20260705` adds the profiles read policy; the live table had RLS enabled with no policy, which blanked every owner/actor name in database mode
- Migration `20260709` enables RLS on roles, permissions, and role_permissions; anonymous reads are blocked while authenticated reference-data reads remain available
- Stage wired on July 6, 2026: seed verified current, Preview `DATABASE_URL` points at the Stage transaction pooler, verified end to end with a temporary tenant-name marker on a Preview deployment
- Prod wired on July 9, 2026: `lough-eske-prod` created in the `OblioX P1` Pro organization, migrations and seed applied, Vercel Production public variables and `DATABASE_URL` point at Prod, and deployment `83b41a2` verified live with no runtime errors
- Setting sensitive Vercel env values reliably: interactive `vercel env add` corrupts pasted values too easily (clipboard overwrites, dropped characters, prompt redraw artifacts); use the REST API `POST /v10/projects/{id}/env?upsert=true` with the value read from the local env file
- Branch pushes do not trigger Preview deployments (only main triggers Production builds); check the Vercel dashboard Git settings to enable them, or cut Preview builds with `vercel deploy`
- Point Realty is now the writable pilot workspace (July 6, 2026): status `active`, one seeded Broker Owner login (Devon Pierce, point.owner@obliox.io) with agents, recruits, transactions, tasks, and activity; verified on Stage with RLS write and cross-tenant isolation tests
- Write gating tightened: `areTenantWritesEnabled` now requires tenant status `active` (demo, prospect, and inactive tenants are read-only); a tenant row invisible under RLS resolves as `inactive` so an unseeded database degrades to read-only instead of surfacing RLS errors
- Pilot logins are hidden and rejected on Prod deployments (login tile filter plus session-layer checks in `setDemoSession` and `getCurrentSession`); pilot write testing happens on Stage Preview and local only
- All environments carry the repeatable demo seed; Production exposes only the read-only demo workspace and rejects the writable pilot login
- Sprint 8B Dev verification passed for plan backfill, billing math, feature allow/deny checks, anonymous catalog denial, Platform Admin-only plan changes, over-limit membership denial, and seat-reduction denial
- Sprint 8B Stage validation passed July 10, 2026 on a Preview deployment: Devon Pierce login renders the Core plan badge, Settings shows plan pricing, seat usage, and feature access from live Stage data, and plan controls stay Platform Admin-only
- The local production build, Settings surface, Reports, and Agent Portal pass visual/runtime verification with no browser errors; local secret files intentionally do not carry a usable explicit `DATABASE_URL`, so live gate behavior was verified at the Dev database layer
- Sprint 9A shipped July 14, 2026 with report drilldowns, shared date-range controls, top-agent and at-risk lists, and print/CSV exports; no migration was required
- Sprint 10A shipped July 16, 2026 with signed-in-agent data scoping, transaction and referral detail drawers, assigned-task visibility, a filterable resource library, staff publishing, and database-enforced portal isolation; Dev, Stage, and Prod carry the migration and repeatable seed
- Any new migration must sort after `20260716090000`

### Sprint 7A - Transaction Workflow Control
- Make transaction rows clickable, not only the View button
- Add transaction search and filters by stage, status, close timing, agent, and client
- Add transaction drawer sections for key dates, contingencies, related tasks, and document placeholders
- Add cancel/close audit metadata where needed
- Tighten dashboard transaction and GCI drilldowns

### Sprint 8A - Task and Activity Command Center
- Add richer task filters by owner, priority, due date, related type, and status
- Add task assignment and due-date editing
- Add task detail context for notes and related records
- Add activity log filtering by entity type and actor
- Improve dashboard task drilldowns

### Sprint 8B - Plans, Seats, and Entitlements
- Add the Core, Growth, and Scale plan catalog with repeatable pricing and feature seeds
- Backfill every tenant to Core with subscribed capacity no lower than included or occupied seats
- Treat active and invited memberships as occupied seats and enforce capacity in the database
- Gate Reports and Agent Portal through plan features in addition to role permissions
- Show plan, monthly billing, occupied/available seats, and included features in Settings
- Restrict plan catalog writes and tenant plan/seat changes to Platform Admin
- Require migrations `20260710050654_add_plans_and_entitlements.sql` and `20260710050925_add_tenants_plan_index.sql` before deployed Sprint 8B flows are validated
- Dev, Stage, and Production rollout completed July 10, 2026

### Sprint 9A - Reports Drilldowns and Exports
- Add report drilldown panels for recruiting, production, transactions, and GCI
- Add date-range controls
- Add top-agent and at-risk pipeline lists
- Add print/export-friendly report layout

### Sprint 10A - Agent Portal Data Workflows
- Scope portal data to the signed-in agent user
- Add resource library list and filters
- Add referral tracking details
- Add transaction status detail panel
- Keep broker-only data out of portal views

### Sprint 11A - Settings Administration Workflows
- Add edit flow for tenant name and accent color
- Add user/member list from tenant memberships
- Add role detail drawer
- Add environment and feature-flag display
- Defer destructive admin actions until audit and permissions are stronger

## Folder Structure
Recommended structure:

```txt
/app
  /(auth)
  /(app)
  /login
  /demo
/components
  /app-shell
  /dashboard
  /agents
  /recruiting
  /transactions
  /tasks
  /reports
  /agent-portal
  /settings
  /ui
/lib
  /supabase
  /auth
  /rbac
  /tenant
  /data
  /utils
/types
/supabase
  /migrations
  /seed.sql
/docs
  BUILD.md
  DATABASE.md
  UI.md
  BACKLOG.md
```

## Naming Conventions
- Tables: snake_case plural, e.g. `tenant_memberships`
- Columns: snake_case
- React components: PascalCase
- Hooks: `useSomething`
- Permission keys: lowercase snake_case, e.g. `view_dashboard`
- Routes: lowercase kebab case where needed

## Coding Standards
- TypeScript strict mode where practical
- No `any` unless justified
- Centralize Supabase client creation
- Centralize tenant context
- Centralize RBAC checks
- Prefer server components for data where practical
- Use client components for interactive Kanban, drawers, filters, forms
- Keep UI components reusable
- Avoid business logic inside presentational components

## Security Standards
- All tenant-owned tables must have RLS enabled
- All queries must be scoped to tenant context
- No cross-tenant data exposure
- No service role key in frontend
- Demo passwords must not be committed in public code
- Platform Admin logic must be explicit and auditable

## UI Direction
The UI should feel like a neutral, premium enterprise SaaS platform. It should not feel like a local brokerage-branded app.

Reference feel:
- Linear
- Vercel
- Stripe Dashboard
- Notion
- Figma
- Retool

Use neutral colors, clean spacing, sharp typography, white cards, light navigation, and one controlled accent color.

## Design Tokens
Use tokens from UI.md. Do not hardcode hex colors in components.

## Definition of Done for v0.1
v0.1 is complete when:
1. A user can log in.
2. A user lands inside the correct tenant context.
3. Demo Brokerage tenant works.
4. Point Realty tenant placeholder exists.
5. California Brokerage placeholder exists.
6. Sidebar navigation changes by role.
7. Dashboard displays tenant-specific data.
8. Agent database displays seeded agents.
9. Recruiting pipeline displays seeded recruits in Kanban stages.
10. Transactions table displays tenant-specific transactions.
11. Tasks page displays tenant-specific tasks.
12. Reports shell exists.
13. Agent portal shell exists.
14. RLS blocks cross-tenant access.
15. App is deployed to Vercel.
16. Supabase migrations and seed files are committed.

## Strategic Reminder
Do not present this product as a CRM. The CRM is the base layer. The product is a Brokerage Operating System for executive visibility, recruiting, retention, transaction oversight, and future agent engagement.
