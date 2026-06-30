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
- Completed through Sprint 6C
- Original baseline Sprint 7-11 shell work has been consolidated into completed scope where the route/shell/table already exists
- Next implementation sprint is Sprint 7A - Transaction Workflow Control

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
