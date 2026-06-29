# Lough Eske - BACKLOG.md

## Purpose
This document defines the v0.1 execution backlog for Nova.

Internal project codename: **Lough Eske**  
Product name: **TBD**  
Version: **v0.1**  
Last updated: **June 28, 2026**

## Delivery Strategy
Build the SaaS foundation first, then modules. Do not start with a single screen and wire data later. Multi-tenancy, auth, RBAC, and design tokens must come first.

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

## Sprint 5 - Agent Database
### Epic: Agent Records
Goal: Brokerage staff can view agent records.

Stories:
1. As staff, I can view all agents in my tenant.
2. As staff, I can click an agent and view detail.
3. As staff, I can see production and GCI fields.

Tasks:
- Build agents route
- Build agents table
- Add search placeholder
- Add status filters placeholder
- Build agent detail drawer/page
- Add create agent form if time allows
- Add edit agent form if time allows

Acceptance Criteria:
- Agents table loads tenant data
- Clicking row opens detail
- No cross-tenant data appears

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

## Sprint 7 - Transactions
### Epic: Transaction Visibility
Goal: Staff and ownership can see active transaction pipeline.

Stories:
1. As broker owner, I can see transaction pipeline.
2. As CFO, I can see estimated GCI and close dates.
3. As transaction coordinator, I can see transaction status.

Tasks:
- Build transactions route
- Build transaction table
- Add transaction stage badges
- Add estimated GCI formatting
- Add transaction detail drawer/page if time allows

Acceptance Criteria:
- Transactions table loads tenant data
- Estimated GCI is visible
- Stage/status are clear

## Sprint 8 - Tasks, Notes, and Activity Logs
### Epic: Accountability Layer
Goal: Track operational follow-up.

Stories:
1. As staff, I can view tasks.
2. As staff, I can see priority and due date.
3. As ownership, I can see recent activity.

Tasks:
- Build tasks route
- Build task list/table
- Add status badges
- Add priority badges
- Add overdue logic
- Display recent activity on dashboard
- Create note/activity display components

Acceptance Criteria:
- Tasks are visible by tenant
- Overdue tasks are visually distinct
- Activity log supports dashboard feed

## Sprint 9 - Reports Shell
### Epic: Executive Intelligence
Goal: Create first reporting surface.

Stories:
1. As broker owner, I can view recruiting funnel summary.
2. As CFO, I can view GCI forecast shell.
3. As leadership, I can view production snapshot.

Tasks:
- Build reports route
- Add recruiting funnel card
- Add agent production snapshot card
- Add transaction volume snapshot card
- Add GCI forecast card
- Use seeded/query-driven values

Acceptance Criteria:
- Reports route exists
- Cards are polished
- Data is tenant-scoped

## Sprint 10 - Agent Portal Shell
### Epic: Future Differentiator
Goal: Demonstrate future agent-facing platform.

Stories:
1. As an agent, I can see an agent portal shell.
2. As broker owner, I can understand future agent value.
3. As sales user, I can demo the differentiation.

Tasks:
- Build agent portal route
- Add dashboard card
- Add transaction status card
- Add resource library card
- Add referral tracking card
- Add coming soon AI assistant card
- Show seeded resources

Acceptance Criteria:
- Agent portal communicates future value
- Shell is visually polished
- Role can access view_agent_portal permission

## Sprint 11 - Settings Shell
### Epic: Tenant Administration
Goal: Provide basic tenant administration.

Stories:
1. As broker owner, I can see tenant settings.
2. As admin, I can see users and roles.
3. As tenant, I can see theme settings placeholder.

Tasks:
- Build settings route
- Show tenant name
- Show logo placeholder
- Show accent color field
- Show user list
- Show role list

Acceptance Criteria:
- Settings route exists
- Tenant details appear
- Role/user display works

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
- Seed data works
- Vercel deployment works
- No secrets committed
- No hardcoded Point Realty assumptions
- UI looks meeting-ready

## Deferred Backlog
After v0.1:
- Drag-and-drop Kanban
- Full CRUD for all modules
- MLS integration
- Email integration
- Twilio SMS
- AI assistant
- Billing/subscriptions
- Full agent login
- Data import tools
- Production reporting engine
- Mobile polish
