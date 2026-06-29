# Lough Eske - UI.md

## Purpose
This document defines the v0.1 user interface, design system, and tenant theming standards for Lough Eske.

Internal project codename: **Lough Eske**  
Product name: **TBD**  
Version: **v0.1**  
Last updated: **June 29, 2026**

## UI Philosophy
The product must feel like a neutral, premium, executive-grade SaaS platform. It should not look like a single brokerage's internal app.

The system should feel:
- Calm
- Modern
- Trustworthy
- Information dense
- Executive-ready
- Fast
- Easy for brokerage staff
- Credible to CFOs

Reference products:
- Linear
- Vercel
- Stripe Dashboard
- Figma
- Notion
- Retool

Avoid:
- Loud real estate colors
- Cartoon icons
- Heavy gradients
- Overly saturated color palettes
- Template-looking dashboards
- Emoji icons in production UI

## Brand Strategy
The base product must be visually neutral. Tenants can override logo, accent color, favicon, company name, and domain, but the core UI should remain consistent.

Point Realty colors must not be the default application identity. Point Realty is one tenant theme.

## Typography
Primary font:
- Inter

Fallback:
- system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif

Weights:
- 400 normal
- 500 medium
- 600 semibold
- 700 bold
- 800 extra bold for key numbers/headings

## Core Design Tokens
Use CSS variables or Tailwind theme tokens. Components should consume tokens, not hard-coded hex values.

```css
:root {
  --background: #F3F5F7;
  --surface: #FFFFFF;
  --surface-muted: #F8FAFC;
  --sidebar: #FBFCFE;
  --sidebar-hover: #EEF3F8;
  --text-primary: #172033;
  --text-secondary: #667085;
  --border: #D7DEE8;
  --accent: #2755D8;
  --success: #16844A;
  --warning: #B76E00;
  --danger: #C2412D;
  --info: #0369A1;
}
```

## Color Usage
### Background
Use `--background` for the main app background.

### Cards
Use `--surface` for cards, panels, drawers, and modal interiors.

### Sidebar
Use `--sidebar` for the primary left navigation surface.

### Accent
Use `--accent` sparingly for:
- Primary buttons
- Active navigation state
- Links
- Chart highlight
- Focus rings
- Progress indicators

Do not overuse accent color.

### Status Colors
Use:
- Success: positive outcomes, joined agents, completed tasks
- Warning: pending, stale, at-risk
- Danger: overdue, lost, urgent
- Info: neutral informative states

## Recruiting Heat Colors
Hot: `#DC2626`  
Warm: `#F59E0B`  
Cold: `#3B82F6`  
Joined: `#16A34A`

Use these consistently on recruiting cards, badges, filters, and charts.

## Tenant Theme Engine
Every tenant may define:
- Logo URL
- Primary accent color
- Secondary accent color
- Company name
- Domain
- Dark mode preference later

Example tenant accents:
- Point Realty: `#0F766E`
- California Brokerage: `#B45309`
- Luxury Brokerage: `#4338CA`

The tenant accent should replace `--accent` only. It should not rewrite the entire interface.

## Layout
### App Shell
- Fixed left sidebar
- Top bar
- Main content area
- Responsive card grid
- Page header with title, subtitle, and actions

### Sidebar
- Light neutral background
- Product/codename or tenant logo at top
- Role-aware navigation
- Active item uses accent color
- Clear grouping by function

Navigation groups:
- Overview
- Brokerage
- Recruiting
- Transactions
- Operations
- Intelligence
- Admin

### Top Bar
Should include:
- Tenant name
- Optional global search placeholder
- User menu
- Tenant switcher placeholder

## Components
### Cards
- White surface
- 1px border
- 8px radius
- Subtle shadow or no shadow
- Header optional

### KPI Cards
Display:
- Label
- Value
- Delta
- Optional icon

Use sparing color. The number should dominate.

### Tables
Tables should be clean and dense.

Required table features later:
- Search
- Filter
- Sort
- Row click to detail drawer
- Pagination

v0.1 can be static or basic query-driven.

### Kanban
Recruiting pipeline uses Kanban.

Stages:
- Identified
- Contacted
- Engaged
- Offer Pending
- Joined
- Lost

Recruit cards show:
- Name
- Source/current brokerage
- Heat badge
- Recruit score
- Last activity
- Next follow-up

Drag-and-drop can be deferred if needed. Stage movement can be implemented through action controls first.

### Drawers
Use right-side drawers for:
- Agent details
- Recruit details
- Transaction details
- Task details

Do not overuse modals for core workflows.

Drawer standards:
- Use the shared right-side drawer pattern
- Keep the record summary at the top
- Keep the primary state-changing action in a compact form
- Close with the icon button or Escape
- Preserve table and Kanban context behind the drawer

### Modals
Use modals for:
- Confirm delete
- Create simple item
- Settings confirmations

### Forms
Form standards:
- Label above field
- Clear validation
- No cramped inputs
- Required fields indicated
- Save and Cancel actions bottom-right

### Badges
Use badges for:
- Role
- Status
- Heat
- Stage
- Priority

Badges should be small and readable.

### Charts
Use minimal charts.

Recommended chart colors:
- Accent blue
- Slate
- Green
- Amber
- Red

Avoid rainbow palettes.

## Required v0.1 Screens
### Login
- Product label: Product Name TBD or temporary Brokerage OS
- Demo login button
- Clean, centered layout

### Demo Entry
Route `/demo` should make it easy to enter demo context.

### Dashboard
KPI cards:
- Active Recruits
- Agents Joined
- Active Transactions
- GCI Pipeline
- Overdue Tasks

Sections:
- Recruiting momentum
- Transaction volume snapshot
- Today's tasks
- Recent activity

### Agent Database
Table columns:
- Name
- Email
- Phone
- Status
- Production YTD
- GCI YTD
- Last Close Date
- Assigned Owner

Click row to open detail drawer/page.

### Recruiting Pipeline
Kanban layout with stage columns.

### Transactions
Table columns:
- Agent
- Client
- Property
- Stage
- List Price
- Estimated GCI
- Expected Close Date
- Status

### Tasks
Task list columns:
- Title
- Related Record
- Due Date
- Priority
- Status

### Reports
v0.1 reports shell:
- Recruiting funnel
- Agent production snapshot
- Transaction volume snapshot
- GCI forecast

### Agent Portal Shell
Cards:
- Agent Dashboard
- Transaction Status
- Resource Library
- Referral Tracking
- AI Assistant

### Settings
Basic settings:
- Tenant name
- Logo placeholder
- Accent color
- User list
- Role list

## Responsive Rules
v0.1 should prioritize desktop/tablet. Mobile can be functional but does not need final polish.

Minimum:
- Sidebar hides behind a mobile primary navigation on smaller screens
- Tables remain usable with horizontal scroll
- Cards stack on small widths

## Accessibility
- Use semantic HTML
- Maintain contrast
- Visible focus states
- Buttons must be buttons
- Inputs must have labels
- Icons need accessible labels when they carry meaning

## UI Definition of Done
UI v0.1 is complete when:
1. App shell is polished.
2. Sidebar and top bar are consistent.
3. Role-aware nav works.
4. Design tokens are implemented.
5. Tenant accent override works.
6. Dashboard looks meeting-ready.
7. Agent database is readable and clickable.
8. Recruiting Kanban looks credible.
9. Agent portal shell visually communicates future value.
10. No Point Realty-specific styling exists in the base app.
