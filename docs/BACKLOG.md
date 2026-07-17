# Lough Eske - BACKLOG.md

## Purpose
This document defines the v0.1 execution backlog for Nova.

Internal project codename: **Lough Eske**  
Product name: **TBD**  
Version: **v0.1**  
Last updated: **July 16, 2026**

## Delivery Strategy
Build the SaaS foundation first, then modules. Do not start with a single screen and wire data later. Multi-tenancy, auth, RBAC, and design tokens must come first.

## Execution Status Snapshot
Current position: **completed through Sprint 10A; Sprint 11A implementation is Dev-validated and awaiting Stage/Prod rollout**.

Completed baseline:
- Sprint 0 - Project Foundation
- Sprint 1 - Design System and App Shell
- Sprint 2 - Supabase Schema and Seed Data
- Sprint 3 - Authentication, Tenant Context, and RBAC
- Sprint 4 - Dashboard
- Sprint 4A - Broker Portal UX Pass
- Sprint 4B - Broker Portal Action Layer
- Sprint 4C - Broker Portal Workflow Hardening
- Sprint 5 - Agent Database
- Sprint 6 - Recruiting Pipeline
- Sprint 6A - Recruiting Pipeline Operations
- Sprint 6B - Agent Document Dossier
- Sprint 6C - Agent Archive and Portal Clickthrough
- Sprint 7A - Transaction Workflow Control
- Sprint 8A - Task and Activity Command Center
- Sprint 8B - Plans, Seats, and Entitlements
- Sprint 9A - Reports Drilldowns and Exports
- Sprint 10A - Agent Portal Data Workflows

Consolidated original backlog:
- Original Sprint 7 transaction visibility is already covered by the transactions route, table, badges, GCI fields, drawer, stage update action, and dashboard drilldowns.
- Original Sprint 8 task/activity foundation is already covered by the tasks route, status and overdue filters, task create/update flows, and activity logs.
- Original Sprint 9 reports shell is already covered by the tenant-scoped reports route with recruiting, production, transaction volume, and GCI cards.
- Original Sprint 10 agent portal shell is already covered by the agent portal route and clickable demo sections.
- Original Sprint 11 settings shell is already covered by the tenant profile, role visibility, and environment/admin shell.

Next implementation sprint: **Sprint 11A - Settings Administration Workflows** (Sprint 10A shipped July 16, 2026).

Sprint 7A shipped clickable transaction rows, search plus stage/status/close-timing filters, drawer sections for contingencies, related tasks, and document readiness, close/cancel audit metadata, and active-only dashboard GCI. Dev, Stage, and Prod all carry migration ledger entries `20260628` through `20260710120000`. Vercel Preview points at `lough-eske-stage`; Vercel Production points at `lough-eske-prod`. The demo tenant remains read-only in every environment.

Sprint 8A shipped task search plus owner/priority/related-type/status/due-timing filters, clickable task rows, drawer sections for notes, related record context, and assignment/due-date editing, a filterable activity log panel, and dashboard task accountability drilldowns. No new migration; assignment edits ride the existing manage_tasks update policy with tenant-membership validation on assignees.

Launch-blocking addition: **Sprint 8B - Plans, Seats, and Entitlements** must be working at v0.1 go-live. Every tenant resolves to a plan on day one and feature access follows the plan. Sequence it before Sprint 9A and Sprint 10A, which gate on plan features.

Sprint 8B shipped July 10, 2026 as `c67d1ae`: schema, app gating, Settings UI, repeatable seed, and seat enforcement rolled out to Stage and Prod after an adversarial review fixed a seed-reseed abort in the seat-limit trigger, seed clobbering of admin plan changes, a destructive plan_features reseed, and a layout-level 500 on RLS-invisible tenants.

Sprint 9A shipped July 14, 2026: the Reports summary cards became clickable panel switches (recruiting, production, transactions, GCI) backed by a shared date-range control, a new `getRecruitingActivities` read against the existing `recruiting_activities` table, top-agent and at-risk (cold/overdue recruits, past-due active deals) lists, and a print/CSV export layout that hides app chrome via `print:` utilities. No migration was required. In fixing the drilldowns, the transaction-volume and GCI-forecast summary cards were corrected to count active deals only, matching the Dashboard's existing active-deal filter instead of summing every transaction regardless of status.

Sprint 10A shipped July 16, 2026 as `32eef03` plus the isolation hardening in `bb50cdf`: the agent portal's demo sections became role-scoped workflows. `agents.profile_id` links a workspace login to its agent record, and the portal scopes production stats, transactions (with a status detail drawer, derived next action, and stage progress), referrals, and tasks to the signed-in agent. The resource library is query-driven with search and type filters; staff holding `manage_agent_resources` publish resources (with `staff_only` drafts hidden from the portal at both the RLS and app layers) via an activity-logged flow. Portal-only users with no linked agent record, and staff previewing the portal, get explicit empty states. Migration `20260716090000` and the updated repeatable seed were applied and verified in Dev, Stage, and Prod. The final RLS policies preserve staff permissions while limiting portal-only users to their linked agent, transactions, referrals, assigned tasks, and `all_agents` resources. Production commit `bb50cdf` built successfully on Vercel with no build or runtime errors.

Sprint 11A implementation was completed and Dev-validated July 17, 2026: Settings now provides audited tenant name/accent editing with a live preview, complete active/invited/suspended/inactive membership visibility, database-backed role detail drawers, and environment plus plan-feature status. Migrations `20260717180736` and `20260717181113` add strict branding constraints, a `manage_settings` update path, protected-column and audit triggers, and one consolidated tenant UPDATE policy. A rolled-back Dev test proved Broker Owner branding writes and audit metadata while rejecting protected-field and cross-tenant updates. Stage and Prod rollout remain pending.

## Sprint 0 - Project Foundation
### Epic: Repository and Framework Setup
Goal: Create deployable app shell.

Stories:
1. As a developer, I can clone the repo and run the app locally.
2. As a developer, I can deploy the app to Vercel.
3. As a developer, I can connect the app to Supabase.
4. As a developer, I can manage environment variables cleanly.

Tasks:
- Initialize Next.js App Router project
- Add TypeScript
- Add Tailwind CSS
- Add shadcn/ui if useful
- Add Lucide Icons
- Add Supabase client utilities
- Add `.env.example`
- Add basic Vercel deployment
- Add docs folder with BUILD.md, DATABASE.md, UI.md, BACKLOG.md

Acceptance Criteria:
- App runs locally
- App deploys to Vercel
- Environment config is documented
- No secrets committed

## Sprint 1 - Design System and App Shell
### Epic: Neutral SaaS UI Foundation
Goal: Implement the base UI system.

Stories:
1. As a user, I see a premium app shell.
2. As a tenant, my accent color can change without rewriting components.
3. As a developer, components use design tokens.

Tasks:
- Implement design tokens from UI.md
- Create app shell layout
- Create sidebar
- Create top bar
- Create page header component
- Create card component patterns
- Create badge variants
- Create table pattern
- Create empty state pattern
- Create loading state pattern

Acceptance Criteria:
- Sidebar uses slate theme
- Cards use neutral surface
- Accent color is tokenized
- No hard-coded tenant colors in components

## Sprint 2 - Supabase Schema and Seed Data
### Epic: Multi-Tenant Database Foundation
Goal: Build the v0.1 database.

Stories:
1. As a platform, I can support multiple tenants.
2. As a user, I can belong to a tenant.
3. As a developer, I can seed demo data.

Tasks:
- Create initial migration
- Create tenants table
- Create profiles table
- Create roles table
- Create permissions table
- Create role_permissions table
- Create tenant_memberships table
- Create agents table
- Create recruits table
- Create recruiting_activities table
- Create transactions table
- Create tasks table
- Create notes table
- Create activity_logs table
- Create agent_resources table
- Create agent_referrals table
- Add indexes
- Add seed script
- Seed Demo Brokerage
- Seed Point Realty placeholder
- Seed California Brokerage placeholder

Acceptance Criteria:
- Migration runs cleanly
- Seed data is repeatable
- Demo tenant has enough data to show in a meeting

## Sprint 3 - Authentication, Tenant Context, and RBAC
### Epic: Secure Access Foundation
Goal: Users log in and see only tenant-appropriate data.

Stories:
1. As a user, I can log in.
2. As a user, I land in my tenant context.
3. As a user, I see navigation based on my role.
4. As a platform admin, I can access all tenants.

Tasks:
- Implement login route
- Implement demo entry route
- Create auth utilities
- Create tenant context provider
- Create role/permission utilities
- Create role-aware sidebar
- Add protected app routes
- Enable RLS on tenant-owned tables
- Add basic RLS policies
- Test cross-tenant data isolation

Acceptance Criteria:
- Demo users can log in
- User lands in correct tenant
- Role-aware navigation works
- RLS blocks tenant leakage

## Sprint 4 - Dashboard
### Epic: Broker Dashboard
Goal: Show executive snapshot for a tenant.

Stories:
1. As a broker owner, I can see key brokerage metrics.
2. As a CFO, I can see transaction and GCI snapshot.
3. As a recruiter, I can see recruiting activity.

Tasks:
- Build dashboard route
- Add KPI cards
- Query active recruits
- Query joined agents
- Query active transactions
- Query GCI pipeline
- Query overdue tasks
- Add recent activity panel
- Add recruiting momentum placeholder
- Add transaction volume snapshot

Acceptance Criteria:
- Dashboard shows tenant-specific data
- Cards are visually polished
- Demo tenant dashboard looks credible

## Sprint 4A - Broker Portal UX Pass
### Epic: Meeting-Ready Broker Portal
Goal: Raise the existing broker/staff portal from scaffold UI to a credible SaaS operating surface.

Stories:
1. As a broker owner, I can scan the portal without it feeling like a template.
2. As staff, I can navigate core app areas on smaller screens.
3. As a deployer, I can see the current app environment in the UI without exposing secrets.

Tasks:
- Refresh shared tokens and shell styling
- Add mobile primary navigation
- Tighten card, badge, table, page header, and KPI primitives
- Polish dashboard, recruiting, agents, transactions, tasks, reports, agent services, settings, login, and demo entry layout/copy
- Add environment label helper for Dev, Stage, Preview, Prod, and Local

Acceptance Criteria:
- Lint, typecheck, and production build pass
- Public demo/login routes render
- Protected app routes continue to redirect without a session
- No database behavior or RLS behavior changes

## Sprint 4B - Broker Portal Action Layer
### Epic: Real Record Workflows
Goal: Convert read-only broker screens into first-pass operational workflows.

Stories:
1. As staff, I can open record details without leaving the page.
2. As authorized staff, I can update agent, recruit, transaction, and task state.
3. As ownership, I can see action history reflected in recent activity.

Tasks:
- Add shared right-side detail drawer
- Add agent detail drawer and status update
- Add recruit detail drawer and stage update
- Add transaction detail drawer and stage/status update
- Add task detail drawer and status/complete actions
- Add server actions and tenant-scoped mutation helpers
- Add RLS policies for permitted writes and activity inserts
- Smoke-test protected pages with demo owner session

Acceptance Criteria:
- Lint, typecheck, and production build pass
- Agents, recruiting, transactions, and tasks render for demo owner
- Actions are hidden or disabled when unavailable
- Supabase migration is required before deployed writes are expected to succeed

## Sprint 4C - Broker Portal Workflow Hardening
### Epic: First Usable Operations Loop
Goal: Make the broker portal actions resilient enough for Stage demos and daily staff workflows.

Stories:
1. As staff, I get immediate feedback when I save, create, or complete work.
2. As staff, I can create recruits and tasks without leaving the portal.
3. As ownership, I can inspect recent record-level activity from the drawer.

Tasks:
- Add shared action feedback and pending submit controls
- Add activity context to agent, recruit, transaction, and task drawers
- Add create recruit drawer and server action
- Add create task drawer and server action
- Add RLS insert policy support for recruit and task create flows
- Add `tasks.related_label` for manual task context

Acceptance Criteria:
- Lint, typecheck, and production build pass
- Create/update forms return useful success or error states
- Record drawers show relevant recent activity
- Stage Supabase has the Sprint 4C migration applied before Preview writes are validated

## Sprint 5 - Agent Database
### Epic: Agent Records
Goal: Brokerage staff can find, inspect, create, and maintain agent records.

Stories:
1. As staff, I can view all agents in my tenant.
2. As staff, I can click an agent and view detail.
3. As staff, I can see production and GCI fields.
4. As authorized staff, I can create a new agent record.
5. As authorized staff, I can update agent contact, license, source, and status fields.

Tasks:
- Build agents route
- Build agents table
- Add search
- Add status filters
- Build agent detail drawer/page
- Add create agent form
- Add edit agent profile form
- Add `create_agents` RLS insert policy

Acceptance Criteria:
- Agents table loads tenant data
- Clicking row opens detail
- No cross-tenant data appears
- Search and status filters work without leaving the page
- Create and edit actions return useful form feedback
- Agent creation is protected by `create_agents`

## Sprint 6 - Recruiting Pipeline
### Epic: Recruiting Kanban
Goal: Staff can manage recruits through pipeline stages.

Stories:
1. As a recruiter, I can view recruits by stage.
2. As a recruiter, I can see heat and score.
3. As a broker, I can see recruiting traction.
4. As staff, I can open recruit detail.

Tasks:
- Build recruiting route
- Build Kanban columns
- Build recruit cards
- Query recruits by tenant and stage
- Build recruit detail drawer
- Show recruiting activities
- Add stage update action if time allows
- Log stage changes if time allows

Acceptance Criteria:
- Kanban displays seeded recruits
- Cards show key details
- Recruit detail is accessible
- Tenant isolation holds

## Sprint 6A - Recruiting Pipeline Operations
### Epic: Kanban Workflow Control
Goal: Make recruiting movement and dashboard drill-downs behave like an operations board.

Stories:
1. As staff, I can click a recruit tile to open the recruit record.
2. As authorized staff, I can drag a recruit tile between stages.
3. As authorized staff, I can update stage and heat from dropdown controls.
4. As ownership, I can click dashboard KPI tiles and land on the related module.

Tasks:
- Make recruit cards clickable
- Add drag-and-drop stage changes to the Kanban
- Add stage and heat filters to the recruiting board
- Add heat dropdown to recruit pipeline updates
- Link dashboard KPI cards to filtered recruiting, transactions, and tasks views
- Link dashboard recruiting momentum tiles to filtered recruiting stages

Acceptance Criteria:
- Recruit tile clicks open the drawer
- Dragging a recruit between columns uses the same permissioned server action as form edits
- Stage and heat can be adjusted through dropdowns
- Dashboard KPI and recruiting momentum tiles route to the relevant data area

## Sprint 6B - Agent Document Dossier
### Epic: Agent Compliance Readiness
Goal: Let staff see required agent file coverage from the agent record drawer.

Stories:
1. As staff, I can see whether key agent documents are on file.
2. As ownership, I can spot missing or review-needed compliance files.
3. As a developer, I have a UI target for the later storage-backed document model.

Tasks:
- Add an agent files section to the agent detail drawer
- Show E&O insurance, brokerage contract, independent contractor agreement, and license copy rows
- Add file category, status, and updated-date metadata
- Keep the first pass read-only until Supabase Storage and document tables are designed

Acceptance Criteria:
- Clicking View on an agent shows agent files in the drawer
- File rows match the existing drawer visual system
- The UI does not imply uploads are persisted before storage exists

## Sprint 6C - Agent Archive and Portal Clickthrough
### Epic: Agent Lifecycle and Portal Usability
Goal: Replace ambiguous agent ownership UI with an auditable archive action and make Agent Portal demo tiles interactive.

Stories:
1. As a broker owner, I can archive an agent when they leave.
2. As leadership, I can see who archived an agent and when.
3. As an agent portal user, I can click tiles and land on populated demo sections.

Tasks:
- Remove the visible Owner column and drawer field from Agents
- Add archive audit fields to agents
- Add a dedicated Archive agent action in the agent drawer
- Prevent normal status edits from setting an agent to former without audit
- Make Agent Portal tiles clickable
- Add populated in-page demo panels for portal tile destinations

Acceptance Criteria:
- Agent archive sets status to former and records archived timestamp plus user
- Archive activity appears in the record activity trail
- Agent Portal tiles navigate to visible demo content
- Existing lint, typecheck, build, and route smoke checks pass

## Sprint 7A - Transaction Workflow Control
### Epic: Deal Operations
Goal: Make transactions operate like a real deal control surface instead of a basic visibility table.

Stories:
1. As staff, I can click a transaction row to open the transaction drawer.
2. As staff, I can search and filter transactions by stage, status, agent, client, and close timing.
3. As a transaction coordinator, I can see key dates, contingency status, related tasks, and file placeholders in the drawer.
4. As leadership, I can audit cancelled and closed transaction status changes.

Tasks:
- Make transaction rows clickable
- Add transaction search
- Add stage and close-date filters
- Add drawer sections for key dates, contingencies, related tasks, and document placeholders
- Add cancel/close audit metadata where needed
- Tighten dashboard transaction and GCI drilldowns

Acceptance Criteria:
- Transaction row clicks open the drawer
- Filters work without leaving the page
- Drawer shows operational context beyond the base record fields
- Cancelled/closed transitions are auditable

## Sprint 8A - Task and Activity Command Center
### Epic: Accountability Operations
Goal: Turn the task table and activity log into a stronger daily work queue.

Stories:
1. As staff, I can work tasks from a focused queue.
2. As staff, I can attach tasks to agents, recruits, transactions, or reports.
3. As ownership, I can scan overdue, upcoming, completed, and blocked work.

Tasks:
- Add richer task filters by owner, priority, due date, related type, and status
- Add task detail drawer sections for notes and related record context
- Add task assignment and due-date editing
- Add activity log filtering by entity type and actor
- Add dashboard task drilldowns for overdue and upcoming work

Acceptance Criteria:
- Staff can move through task work without leaving the page
- Related-record context is visible from each task
- Task edits preserve tenant isolation and activity history

## Sprint 8B - Plans, Seats, and Entitlements
### Epic: Billing Foundation and Feature Gating
Launch-blocking: this must be working at v0.1 go-live. Every tenant resolves to a plan on day one, and feature access follows the plan. Sequence it before Sprint 9A (Reports) and Sprint 10A (Agent Portal), since both gate on plan features (`reports`, `agent_portal`).

Goal: Introduce plan tiers, per-seat pricing, and plan-scoped feature flags so tenant entitlements drive what each brokerage can access.

Stories:
1. As the platform, I assign every tenant a plan and seat count so billing and access are defined from day one.
2. As a broker owner, I can see my plan, seat usage, and included features.
3. As the app, I gate feature areas (reports, agent portal, MLS sync) by the tenant's plan.

Schema:
```sql
-- plans catalog (global, not tenant-owned)
create table plans (
  id uuid primary key default gen_random_uuid(),
  key text unique not null,            -- 'core', 'growth', 'scale'
  name text not null,
  base_seat_limit int not null,
  per_seat_price_cents int not null,
  base_price_cents int not null
);

-- feature flags per plan
create table plan_features (
  plan_id uuid references plans(id),
  feature_key text not null,           -- 'reports', 'agent_portal', 'mls_sync'
  primary key (plan_id, feature_key)
);

-- tenants get a plan reference
alter table tenants add column plan_id uuid references plans(id);
alter table tenants add column seat_count int default 5;
```

Tasks:
- Add migrations `20260710050654_add_plans_and_entitlements.sql` and `20260710050925_add_tenants_plan_index.sql` for the plan catalog, tenant plan/seat columns, enforcement functions, RLS, and covering index
- Seed the three plans (core, growth, scale) with base seat limit, per-seat price, and base price, plus their `plan_features` rows; keep the seed repeatable
- Backfill existing tenants (demo, Point Realty, California placeholders) to the core plan, then set `tenants.plan_id` not null so no tenant is planless at launch
- Add RLS: any authenticated tenant member can read `plans` and `plan_features` (the catalog is shared), and only Platform Admin can write those tables or change a tenant's `plan_id` / `seat_count`
- Add a `tenant_has_feature(target_tenant_id uuid, feature_key text)` helper and gate reports, agent_portal, and mls_sync in the app on it
- Enforce seat limits on member add and invite against `base_seat_limit` and `seat_count`, and expose the billing math `base_price_cents + max(0, seat_count - base_seat_limit) * per_seat_price_cents`
- Surface plan, seat usage, and included features in Settings for broker owners
- Update docs/DATABASE.md with the `plans` and `plan_features` tables and the `tenants` column additions

Implementation decisions:
- `seat_count` means subscribed capacity; active and invited memberships occupy seats
- Core includes 5 seats at $199/month with $29 additional seats; Growth includes 15 at $499 with $25 additional seats; Scale includes 30 at $899 with $19 additional seats
- Core includes Reports and Agent Portal so the existing demo experience remains intact; Growth and Scale also include MLS Sync

Acceptance Criteria:
- Every tenant, including demo and placeholder tenants, resolves to a plan at launch
- Feature-gated areas are hidden or blocked when the plan lacks the feature key
- Plan and seat changes are Platform Admin only and cannot be self-served by tenant members
- `plans` and `plan_features` are readable by members but not writable by them
- Billing math and seat counts are correct for core, growth, and scale

## Sprint 9A - Reports Drilldowns and Exports
### Epic: Executive Intelligence Depth
Goal: Move reports from summary cards to actionable drilldowns and meeting-ready exports.

Stories:
1. As broker owner, I can drill into recruiting funnel details.
2. As CFO, I can inspect GCI forecast components.
3. As leadership, I can export or print a clean snapshot for meetings.

Tasks:
- Add report drilldown panels for recruiting, production, transactions, and GCI
- Add date-range controls
- Add top-agent and at-risk pipeline lists
- Add print/export-friendly report layout
- Add report empty/loading states

Acceptance Criteria:
- Reports are tenant-scoped and query-driven
- Drilldowns explain the summary numbers
- Meeting snapshot is usable without manual cleanup

## Sprint 10A - Agent Portal Data Workflows
### Epic: Agent-Facing Value
Goal: Convert the clickable agent portal demo sections into role-scoped workflows.

Stories:
1. As an agent, I can see my production, tasks, resources, referrals, and transactions.
2. As a broker owner, I can control what agents can see.
3. As staff, I can publish resources for agent consumption.

Tasks:
- Scope portal data to the signed-in agent user
- Add resource library list and filters
- Add referral tracking details
- Add transaction status detail panel
- Add portal-specific empty states and permission checks

Acceptance Criteria:
- Agent portal shows user-relevant data
- Portal views do not expose broker-only data
- Tiles navigate to populated, role-appropriate workflows

## Sprint 11A - Settings Administration Workflows
### Epic: Tenant Administration
Goal: Move settings from read-only admin shell to controlled tenant administration.

Stories:
1. As broker owner, I can edit safe tenant profile fields.
2. As admin, I can inspect users and roles clearly.
3. As tenant, I can preview theme and branding settings without breaking the app.

Tasks:
- Add edit flow for tenant name and accent color
- Add user/member list from tenant memberships
- Add role detail drawer
- Add environment and feature-flag display
- Keep destructive admin actions deferred until audit and permission model are stronger

Acceptance Criteria:
- Settings updates are permission-gated
- Tenant profile edits are auditable
- User and role visibility is clearer than the current shell

## Final v0.1 QA Checklist
- Auth works
- Demo login works
- Tenant context works
- RLS works
- Role-aware nav works
- Dashboard works
- Agents works
- Recruiting works
- Transactions works
- Tasks works
- Reports shell works
- Agent portal shell works
- Settings shell works
- Plans and entitlements work
- Feature gating by plan works
- Every tenant has a plan and seat count
- Seed data works
- Vercel deployment works
- No secrets committed
- No hardcoded Point Realty assumptions
- UI looks meeting-ready

## Deferred Backlog
After v0.1:
- Full CRUD for all modules
- Storage-backed agent and transaction documents
- MLS integration
- Email integration
- Twilio SMS
- AI assistant
- Billing/subscriptions
- Full agent login
- Data import tools
- Production reporting engine
- Mobile polish
