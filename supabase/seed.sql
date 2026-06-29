insert into public.tenants (id, name, slug, status, primary_color)
values
  ('11111111-1111-4111-8111-111111111111', 'Demo Brokerage', 'demo-brokerage', 'demo', '#2563EB'),
  ('22222222-2222-4222-8222-222222222222', 'Point Realty', 'point-realty', 'prospect', '#0F766E'),
  ('33333333-3333-4333-8333-333333333333', 'California Brokerage', 'california-brokerage', 'prospect', '#B45309')
on conflict (slug) do update set
  name = excluded.name,
  status = excluded.status,
  primary_color = excluded.primary_color,
  updated_at = now();

insert into public.roles (name, description, scope)
values
  ('Platform Admin', 'Can administer the SaaS platform across tenants.', 'platform'),
  ('Broker Owner', 'Brokerage owner with full tenant visibility.', 'tenant'),
  ('CFO / Finance', 'Finance leader focused on transactions and reports.', 'tenant'),
  ('Office Admin', 'Administrative operator for brokerage settings and tasks.', 'tenant'),
  ('Recruiter', 'Recruiting team member.', 'tenant'),
  ('Transaction Coordinator', 'Transaction pipeline operator.', 'tenant'),
  ('Read Only', 'Read-only tenant user.', 'tenant'),
  ('Agent Portal User', 'Agent-facing portal user.', 'tenant')
on conflict (name) do update set
  description = excluded.description,
  scope = excluded.scope;

insert into public.permissions (key, description)
values
  ('view_dashboard', 'View dashboard'),
  ('view_agents', 'View agents'),
  ('create_agents', 'Create agents'),
  ('edit_agents', 'Edit agents'),
  ('delete_agents', 'Delete agents'),
  ('view_recruiting', 'View recruiting'),
  ('create_recruits', 'Create recruits'),
  ('edit_recruits', 'Edit recruits'),
  ('delete_recruits', 'Delete recruits'),
  ('view_transactions', 'View transactions'),
  ('create_transactions', 'Create transactions'),
  ('edit_transactions', 'Edit transactions'),
  ('delete_transactions', 'Delete transactions'),
  ('view_reports', 'View reports'),
  ('view_financials', 'View financials'),
  ('manage_tasks', 'Manage tasks'),
  ('manage_notes', 'Manage notes'),
  ('manage_users', 'Manage users'),
  ('manage_settings', 'Manage settings'),
  ('view_agent_portal', 'View agent portal'),
  ('manage_agent_resources', 'Manage agent resources')
on conflict (key) do update set
  description = excluded.description;

with role_permission_pairs(role_name, permission_key) as (
  values
    ('Platform Admin', 'view_dashboard'),
    ('Platform Admin', 'view_agents'),
    ('Platform Admin', 'create_agents'),
    ('Platform Admin', 'edit_agents'),
    ('Platform Admin', 'delete_agents'),
    ('Platform Admin', 'view_recruiting'),
    ('Platform Admin', 'create_recruits'),
    ('Platform Admin', 'edit_recruits'),
    ('Platform Admin', 'delete_recruits'),
    ('Platform Admin', 'view_transactions'),
    ('Platform Admin', 'create_transactions'),
    ('Platform Admin', 'edit_transactions'),
    ('Platform Admin', 'delete_transactions'),
    ('Platform Admin', 'view_reports'),
    ('Platform Admin', 'view_financials'),
    ('Platform Admin', 'manage_tasks'),
    ('Platform Admin', 'manage_notes'),
    ('Platform Admin', 'manage_users'),
    ('Platform Admin', 'manage_settings'),
    ('Platform Admin', 'view_agent_portal'),
    ('Platform Admin', 'manage_agent_resources'),
    ('Broker Owner', 'view_dashboard'),
    ('Broker Owner', 'view_agents'),
    ('Broker Owner', 'create_agents'),
    ('Broker Owner', 'edit_agents'),
    ('Broker Owner', 'view_recruiting'),
    ('Broker Owner', 'create_recruits'),
    ('Broker Owner', 'edit_recruits'),
    ('Broker Owner', 'view_transactions'),
    ('Broker Owner', 'create_transactions'),
    ('Broker Owner', 'edit_transactions'),
    ('Broker Owner', 'view_reports'),
    ('Broker Owner', 'view_financials'),
    ('Broker Owner', 'manage_tasks'),
    ('Broker Owner', 'manage_notes'),
    ('Broker Owner', 'manage_users'),
    ('Broker Owner', 'manage_settings'),
    ('Broker Owner', 'view_agent_portal'),
    ('Broker Owner', 'manage_agent_resources'),
    ('CFO / Finance', 'view_dashboard'),
    ('CFO / Finance', 'view_agents'),
    ('CFO / Finance', 'view_transactions'),
    ('CFO / Finance', 'view_reports'),
    ('CFO / Finance', 'view_financials'),
    ('Office Admin', 'view_dashboard'),
    ('Office Admin', 'view_agents'),
    ('Office Admin', 'edit_agents'),
    ('Office Admin', 'view_transactions'),
    ('Office Admin', 'manage_tasks'),
    ('Office Admin', 'manage_notes'),
    ('Office Admin', 'manage_users'),
    ('Office Admin', 'manage_settings'),
    ('Recruiter', 'view_dashboard'),
    ('Recruiter', 'view_agents'),
    ('Recruiter', 'view_recruiting'),
    ('Recruiter', 'create_recruits'),
    ('Recruiter', 'edit_recruits'),
    ('Recruiter', 'manage_tasks'),
    ('Recruiter', 'manage_notes'),
    ('Transaction Coordinator', 'view_dashboard'),
    ('Transaction Coordinator', 'view_agents'),
    ('Transaction Coordinator', 'view_transactions'),
    ('Transaction Coordinator', 'edit_transactions'),
    ('Transaction Coordinator', 'manage_tasks'),
    ('Transaction Coordinator', 'manage_notes'),
    ('Read Only', 'view_dashboard'),
    ('Read Only', 'view_agents'),
    ('Read Only', 'view_recruiting'),
    ('Read Only', 'view_transactions'),
    ('Read Only', 'view_reports'),
    ('Agent Portal User', 'view_agent_portal')
)
insert into public.role_permissions (role_id, permission_id)
select roles.id, permissions.id
from role_permission_pairs
join public.roles on roles.name = role_permission_pairs.role_name
join public.permissions on permissions.key = role_permission_pairs.permission_key
on conflict (role_id, permission_id) do nothing;

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('90000000-0000-4000-8000-000000000000', 'authenticated', 'authenticated', 'platform.admin@obliox.io', null, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"first_name":"Alex","last_name":"Reyes"}'::jsonb, now(), now()),
  ('90000000-0000-4000-8000-000000000001', 'authenticated', 'authenticated', 'demo.owner@obliox.io', null, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"first_name":"Morgan","last_name":"Hale"}'::jsonb, now(), now()),
  ('90000000-0000-4000-8000-000000000002', 'authenticated', 'authenticated', 'demo.cfo@obliox.io', null, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"first_name":"Parker","last_name":"Vale"}'::jsonb, now(), now()),
  ('90000000-0000-4000-8000-000000000003', 'authenticated', 'authenticated', 'demo.recruiter@obliox.io', null, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"first_name":"Riley","last_name":"Moss"}'::jsonb, now(), now()),
  ('90000000-0000-4000-8000-000000000004', 'authenticated', 'authenticated', 'demo.tc@obliox.io', null, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"first_name":"Sam","last_name":"Ortiz"}'::jsonb, now(), now()),
  ('90000000-0000-4000-8000-000000000005', 'authenticated', 'authenticated', 'demo.agent@obliox.io', null, now(), '{"provider":"email","providers":["email"]}'::jsonb, '{"first_name":"Elena","last_name":"Park"}'::jsonb, now(), now())
on conflict (id) do update set
  email = excluded.email,
  raw_app_meta_data = excluded.raw_app_meta_data,
  raw_user_meta_data = excluded.raw_user_meta_data,
  updated_at = now();

insert into public.profiles (id, auth_user_id, first_name, last_name, email)
values
  ('91000000-0000-4000-8000-000000000000', '90000000-0000-4000-8000-000000000000', 'Alex', 'Reyes', 'platform.admin@obliox.io'),
  ('91000000-0000-4000-8000-000000000001', '90000000-0000-4000-8000-000000000001', 'Morgan', 'Hale', 'demo.owner@obliox.io'),
  ('91000000-0000-4000-8000-000000000002', '90000000-0000-4000-8000-000000000002', 'Parker', 'Vale', 'demo.cfo@obliox.io'),
  ('91000000-0000-4000-8000-000000000003', '90000000-0000-4000-8000-000000000003', 'Riley', 'Moss', 'demo.recruiter@obliox.io'),
  ('91000000-0000-4000-8000-000000000004', '90000000-0000-4000-8000-000000000004', 'Sam', 'Ortiz', 'demo.tc@obliox.io'),
  ('91000000-0000-4000-8000-000000000005', '90000000-0000-4000-8000-000000000005', 'Elena', 'Park', 'demo.agent@obliox.io')
on conflict (auth_user_id) do update set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  email = excluded.email,
  updated_at = now();

insert into public.tenant_memberships (tenant_id, profile_id, role_id, status)
select '11111111-1111-4111-8111-111111111111', profiles.id, roles.id, 'active'
from (
  values
    ('91000000-0000-4000-8000-000000000000'::uuid, 'Platform Admin'),
    ('91000000-0000-4000-8000-000000000001'::uuid, 'Broker Owner'),
    ('91000000-0000-4000-8000-000000000002'::uuid, 'CFO / Finance'),
    ('91000000-0000-4000-8000-000000000003'::uuid, 'Recruiter'),
    ('91000000-0000-4000-8000-000000000004'::uuid, 'Transaction Coordinator'),
    ('91000000-0000-4000-8000-000000000005'::uuid, 'Agent Portal User')
) as demo_members(profile_id, role_name)
join public.profiles on profiles.id = demo_members.profile_id
join public.roles on roles.name = demo_members.role_name
on conflict (tenant_id, profile_id) do update set
  role_id = excluded.role_id,
  status = excluded.status,
  updated_at = now();

insert into public.agents (id, tenant_id, first_name, last_name, email, phone, brokerage_status, license_number, source, production_ytd, gci_ytd, last_close_date, assigned_owner_id)
values
  ('aaaaaaaa-0001-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Avery', 'Stone', 'avery@example.com', '(415) 555-0130', 'active', 'CA-010001', 'Internal', 12800000, 358400, '2026-06-11', '91000000-0000-4000-8000-000000000001'),
  ('aaaaaaaa-0002-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'Jordan', 'Reed', 'jordan@example.com', '(415) 555-0178', 'active', 'CA-010002', 'Internal', 9650000, 270200, '2026-05-29', '91000000-0000-4000-8000-000000000001'),
  ('aaaaaaaa-0003-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'Casey', 'Lin', 'casey@example.com', '(415) 555-0199', 'onboarding', 'CA-010003', 'Recruiting', 4200000, 117600, '2026-04-18', '91000000-0000-4000-8000-000000000003'),
  ('aaaaaaaa-0004-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'Taylor', 'Brooks', 'taylor@example.com', '(415) 555-0144', 'active', 'CA-010004', 'Internal', 15100000, 422800, '2026-06-20', '91000000-0000-4000-8000-000000000001'),
  ('aaaaaaaa-0005-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'Jamie', 'Quinn', 'jamie@example.com', '(415) 555-0186', 'active', 'CA-010005', 'Internal', 7350000, 205800, '2026-05-08', '91000000-0000-4000-8000-000000000003'),
  ('aaaaaaaa-0006-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 'Mina', 'Foster', 'mina@example.com', '(415) 555-0121', 'active', 'CA-010006', 'Recruiting', 6100000, 170800, '2026-06-02', '91000000-0000-4000-8000-000000000003'),
  ('aaaaaaaa-0007-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', 'Noah', 'Patel', 'noah@example.com', '(415) 555-0163', 'active', 'CA-010007', 'Referral', 11200000, 313600, '2026-06-18', '91000000-0000-4000-8000-000000000001'),
  ('aaaaaaaa-0008-4000-8000-000000000008', '11111111-1111-4111-8111-111111111111', 'Sofia', 'Mercer', 'sofia@example.com', '(415) 555-0157', 'inactive', 'CA-010008', 'Internal', 2800000, 78400, '2026-03-21', '91000000-0000-4000-8000-000000000001'),
  ('aaaaaaaa-0009-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111', 'Owen', 'Clarke', 'owen@example.com', '(415) 555-0172', 'recruit', 'CA-010009', 'Recruiting', 5100000, 142800, '2026-02-12', '91000000-0000-4000-8000-000000000003'),
  ('aaaaaaaa-0010-4000-8000-000000000010', '11111111-1111-4111-8111-111111111111', 'Elena', 'Park', 'elena@example.com', '(415) 555-0191', 'onboarding', 'CA-010010', 'Independent', 3200000, 89600, '2026-05-17', '91000000-0000-4000-8000-000000000003')
on conflict (id) do update set
  first_name = excluded.first_name,
  last_name = excluded.last_name,
  email = excluded.email,
  phone = excluded.phone,
  brokerage_status = excluded.brokerage_status,
  license_number = excluded.license_number,
  source = excluded.source,
  production_ytd = excluded.production_ytd,
  gci_ytd = excluded.gci_ytd,
  last_close_date = excluded.last_close_date,
  assigned_owner_id = excluded.assigned_owner_id,
  updated_at = now();

insert into public.recruits (id, tenant_id, agent_id, prospect_name, stage, heat_score, recruit_score, source, assigned_recruiter_id, next_follow_up_date, notes_summary)
values
  ('bbbbbbbb-0001-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', null, 'Sofia Mercer', 'Identified', 'Warm', 61, 'Compass', '91000000-0000-4000-8000-000000000003', '2026-07-02', 'High-volume neighborhood specialist.'),
  ('bbbbbbbb-0002-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', null, 'Noah Patel', 'Contacted', 'Hot', 82, 'Coldwell Banker', '91000000-0000-4000-8000-000000000003', '2026-06-30', 'Wants stronger marketing support.'),
  ('bbbbbbbb-0003-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0006-4000-8000-000000000006', 'Mina Foster', 'Engaged', 'Hot', 88, 'Sotheby''s', '91000000-0000-4000-8000-000000000003', '2026-07-01', 'Team fit looks strong.'),
  ('bbbbbbbb-0004-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0009-4000-8000-000000000009', 'Owen Clarke', 'Offer Pending', 'Warm', 74, 'Referral', '91000000-0000-4000-8000-000000000003', '2026-07-05', 'Reviewing split model.'),
  ('bbbbbbbb-0005-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0010-4000-8000-000000000010', 'Elena Park', 'Joined', 'Hot', 91, 'Independent', '91000000-0000-4000-8000-000000000003', '2026-07-10', 'Onboarding package sent.'),
  ('bbbbbbbb-0006-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', null, 'Miles Grant', 'Lost', 'Cold', 38, 'Zillow Premier', '91000000-0000-4000-8000-000000000003', '2026-08-01', 'Staying put this quarter.'),
  ('bbbbbbbb-0007-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', null, 'Harper Lane', 'Contacted', 'Warm', 67, 'Local team lead', '91000000-0000-4000-8000-000000000003', '2026-07-08', 'Interested in transaction support.'),
  ('bbbbbbbb-0008-4000-8000-000000000008', '11111111-1111-4111-8111-111111111111', null, 'Theo Hayes', 'Identified', 'Cold', 44, 'Open house visit', '91000000-0000-4000-8000-000000000003', '2026-07-15', 'Early relationship only.')
on conflict (id) do update set
  agent_id = excluded.agent_id,
  prospect_name = excluded.prospect_name,
  stage = excluded.stage,
  heat_score = excluded.heat_score,
  recruit_score = excluded.recruit_score,
  source = excluded.source,
  assigned_recruiter_id = excluded.assigned_recruiter_id,
  next_follow_up_date = excluded.next_follow_up_date,
  notes_summary = excluded.notes_summary,
  updated_at = now();

insert into public.recruiting_activities (id, tenant_id, recruit_id, activity_type, activity_date, notes, created_by)
values
  ('bca00000-0001-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'bbbbbbbb-0002-4000-8000-000000000002', 'Call', '2026-06-24 15:00:00+00', 'Initial recruiting call completed.', '91000000-0000-4000-8000-000000000003'),
  ('bca00000-0002-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'bbbbbbbb-0003-4000-8000-000000000003', 'Meeting', '2026-06-26 18:30:00+00', 'Broker owner meeting scheduled.', '91000000-0000-4000-8000-000000000003'),
  ('bca00000-0003-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'bbbbbbbb-0004-4000-8000-000000000004', 'Email', '2026-06-27 13:10:00+00', 'Offer package sent.', '91000000-0000-4000-8000-000000000003'),
  ('bca00000-0004-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'bbbbbbbb-0005-4000-8000-000000000005', 'Stage Change', '2026-06-28 16:20:00+00', 'Moved to Joined.', '91000000-0000-4000-8000-000000000003'),
  ('bca00000-0005-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'bbbbbbbb-0001-4000-8000-000000000001', 'Note', '2026-06-25 11:45:00+00', 'Research production history.', '91000000-0000-4000-8000-000000000003'),
  ('bca00000-0006-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 'bbbbbbbb-0007-4000-8000-000000000007', 'Text', '2026-06-28 19:15:00+00', 'Shared brokerage overview.', '91000000-0000-4000-8000-000000000003')
on conflict (id) do update set
  activity_type = excluded.activity_type,
  activity_date = excluded.activity_date,
  notes = excluded.notes,
  created_by = excluded.created_by;

insert into public.transactions (id, tenant_id, agent_id, client_name, property_address, transaction_type, stage, list_price, estimated_gci, expected_close_date, status)
values
  ('cccccccc-0001-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0001-4000-8000-000000000001', 'K. Monroe', '1840 Pacific Ave', 'Seller', 'Under Contract', 1850000, 51800, '2026-07-12', 'active'),
  ('cccccccc-0002-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0004-4000-8000-000000000004', 'L. Vega', '220 Harbor View', 'Buyer', 'Inspection', 1325000, 37100, '2026-07-19', 'active'),
  ('cccccccc-0003-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0002-4000-8000-000000000002', 'A. Nguyen', '77 Laurel Street', 'Seller', 'Listing', 975000, 27300, '2026-08-03', 'active'),
  ('cccccccc-0004-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0005-4000-8000-000000000005', 'R. Ellis', '510 Mission Bay', 'Dual', 'Clear to Close', 2140000, 59900, '2026-07-02', 'active'),
  ('cccccccc-0005-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0007-4000-8000-000000000007', 'M. Torres', '912 Valley Ridge', 'Buyer', 'Lead', 1185000, 33180, '2026-08-14', 'active'),
  ('cccccccc-0006-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0006-4000-8000-000000000006', 'D. Shaw', '46 Lake Street', 'Referral', 'Closed', 740000, 10360, '2026-06-24', 'closed')
on conflict (id) do update set
  agent_id = excluded.agent_id,
  client_name = excluded.client_name,
  property_address = excluded.property_address,
  transaction_type = excluded.transaction_type,
  stage = excluded.stage,
  list_price = excluded.list_price,
  estimated_gci = excluded.estimated_gci,
  expected_close_date = excluded.expected_close_date,
  status = excluded.status,
  updated_at = now();

insert into public.tasks (id, tenant_id, assigned_to, related_type, related_id, title, description, due_date, status, priority, created_by)
values
  ('dddddddd-0001-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000001', 'agent', 'aaaaaaaa-0001-4000-8000-000000000001', 'Prepare owner retention packet', 'Quarterly retention review for top producer.', '2026-06-29 16:00:00+00', 'open', 'high', '91000000-0000-4000-8000-000000000001'),
  ('dddddddd-0002-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000003', 'recruit', 'bbbbbbbb-0004-4000-8000-000000000004', 'Follow up on offer package', 'Confirm split questions and next step.', '2026-07-01 17:00:00+00', 'in_progress', 'urgent', '91000000-0000-4000-8000-000000000003'),
  ('dddddddd-0003-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000002', 'report', null, 'Review commission forecast', 'Validate July pipeline assumptions.', '2026-07-03 12:00:00+00', 'open', 'normal', '91000000-0000-4000-8000-000000000002'),
  ('dddddddd-0004-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000003', 'recruit', 'bbbbbbbb-0005-4000-8000-000000000005', 'Send onboarding resources', 'Make sure agent portal access is ready.', '2026-07-05 18:00:00+00', 'complete', 'normal', '91000000-0000-4000-8000-000000000003'),
  ('dddddddd-0005-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000004', 'transaction', 'cccccccc-0002-4000-8000-000000000002', 'Confirm inspection contingency date', 'Coordinate with transaction parties.', '2026-06-30 14:00:00+00', 'open', 'high', '91000000-0000-4000-8000-000000000004'),
  ('dddddddd-0006-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000004', 'transaction', 'cccccccc-0004-4000-8000-000000000004', 'Upload clear to close package', 'Collect final close documentation.', '2026-07-02 10:00:00+00', 'in_progress', 'urgent', '91000000-0000-4000-8000-000000000004'),
  ('dddddddd-0007-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000003', 'recruit', 'bbbbbbbb-0007-4000-8000-000000000007', 'Invite prospect to broker call', 'Schedule leadership introduction.', '2026-07-08 19:00:00+00', 'open', 'normal', '91000000-0000-4000-8000-000000000003'),
  ('dddddddd-0008-4000-8000-000000000008', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000001', 'agent', 'aaaaaaaa-0008-4000-8000-000000000008', 'Review inactive agent status', 'Decide retention or former classification.', '2026-07-10 15:00:00+00', 'open', 'low', '91000000-0000-4000-8000-000000000001'),
  ('dddddddd-0009-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000002', 'report', null, 'Prepare month-end GCI snapshot', 'Summarize closed and expected GCI.', '2026-07-15 13:00:00+00', 'open', 'normal', '91000000-0000-4000-8000-000000000002'),
  ('dddddddd-0010-4000-8000-000000000010', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000004', 'transaction', 'cccccccc-0005-4000-8000-000000000005', 'Verify buyer agency agreement', 'Confirm signed paperwork.', '2026-07-06 17:00:00+00', 'open', 'normal', '91000000-0000-4000-8000-000000000004'),
  ('dddddddd-0011-4000-8000-000000000011', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000003', 'recruit', 'bbbbbbbb-0008-4000-8000-000000000008', 'Research early-stage prospect', 'Collect public production indicators.', '2026-07-12 12:00:00+00', 'open', 'low', '91000000-0000-4000-8000-000000000003'),
  ('dddddddd-0012-4000-8000-000000000012', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000001', 'agent', 'aaaaaaaa-0004-4000-8000-000000000004', 'Schedule top agent check-in', 'Discuss support needs and retention risk.', '2026-07-09 16:00:00+00', 'open', 'high', '91000000-0000-4000-8000-000000000001')
on conflict (id) do update set
  assigned_to = excluded.assigned_to,
  related_type = excluded.related_type,
  related_id = excluded.related_id,
  title = excluded.title,
  description = excluded.description,
  due_date = excluded.due_date,
  status = excluded.status,
  priority = excluded.priority,
  created_by = excluded.created_by,
  updated_at = now();

insert into public.notes (id, tenant_id, related_type, related_id, body, created_by)
values
  ('e1000000-0001-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'agent', 'aaaaaaaa-0001-4000-8000-000000000001', 'Retention conversation should focus on support team leverage.', '91000000-0000-4000-8000-000000000001'),
  ('e1000000-0002-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'recruit', 'bbbbbbbb-0002-4000-8000-000000000002', 'Prospect cares most about marketing velocity.', '91000000-0000-4000-8000-000000000003'),
  ('e1000000-0003-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'transaction', 'cccccccc-0004-4000-8000-000000000004', 'Clear to close package expected before noon.', '91000000-0000-4000-8000-000000000004'),
  ('e1000000-0004-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'report', 'cccccccc-0001-4000-8000-000000000001', 'July forecast should separate closed referral GCI from active pipeline.', '91000000-0000-4000-8000-000000000002')
on conflict (id) do update set
  body = excluded.body,
  created_by = excluded.created_by;

insert into public.agent_resources (id, tenant_id, title, description, resource_type, url, visibility)
values
  ('eeeeeeee-0001-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'Listing launch checklist', 'Standard launch steps for new listings.', 'Template', null, 'all_agents'),
  ('eeeeeeee-0002-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'Buyer consultation playbook', 'Talk track and discovery prompts.', 'Training', null, 'all_agents'),
  ('eeeeeeee-0003-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'Commission policy overview', 'Current internal commission policy summary.', 'Policy', null, 'all_agents'),
  ('eeeeeeee-0004-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'Open house follow-up template', 'Email and text follow-up copy.', 'Template', null, 'all_agents'),
  ('eeeeeeee-0005-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', 'New agent onboarding path', 'First 30 days onboarding resource.', 'Training', null, 'all_agents'),
  ('eeeeeeee-0006-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', 'Referral intake form', 'Standard referral capture workflow.', 'Link', null, 'all_agents')
on conflict (id) do update set
  title = excluded.title,
  description = excluded.description,
  resource_type = excluded.resource_type,
  url = excluded.url,
  visibility = excluded.visibility,
  updated_at = now();

insert into public.agent_referrals (id, tenant_id, agent_id, referral_name, referral_email, referral_phone, referral_status, notes)
values
  ('f1000000-0001-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0001-4000-8000-000000000001', 'Priya Shah', 'priya@example.com', '(415) 555-0101', 'contacted', 'Buyer lead from past client.'),
  ('f1000000-0002-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0004-4000-8000-000000000004', 'Victor Chen', 'victor@example.com', '(415) 555-0102', 'active', 'Seller consultation scheduled.'),
  ('f1000000-0003-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0005-4000-8000-000000000005', 'Amara Wells', 'amara@example.com', '(415) 555-0103', 'new', 'Needs first outreach.'),
  ('f1000000-0004-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', 'aaaaaaaa-0010-4000-8000-000000000010', 'Leo Martin', 'leo@example.com', '(415) 555-0104', 'closed', 'Referral closed in June.')
on conflict (id) do update set
  referral_status = excluded.referral_status,
  notes = excluded.notes,
  updated_at = now();

insert into public.activity_logs (id, tenant_id, actor_id, action, entity_type, entity_id, metadata, created_at)
values
  ('f2000000-0001-4000-8000-000000000001', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000003', 'Moved Mina Foster to Engaged', 'recruit', 'bbbbbbbb-0003-4000-8000-000000000003', '{"stage":"Engaged"}'::jsonb, '2026-06-28 14:20:00+00'),
  ('f2000000-0002-4000-8000-000000000002', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000001', 'Updated GCI forecast for July closings', 'report', null, '{"period":"2026-07"}'::jsonb, '2026-06-28 12:05:00+00'),
  ('f2000000-0003-4000-8000-000000000003', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000003', 'Created task for Owen Clarke offer follow-up', 'task', 'dddddddd-0002-4000-8000-000000000002', '{}'::jsonb, '2026-06-27 18:10:00+00'),
  ('f2000000-0004-4000-8000-000000000004', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000004', 'Marked inspection contingency review open', 'transaction', 'cccccccc-0002-4000-8000-000000000002', '{}'::jsonb, '2026-06-27 16:25:00+00'),
  ('f2000000-0005-4000-8000-000000000005', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000002', 'Reviewed month-end GCI forecast', 'report', null, '{"forecast_gci":219640}'::jsonb, '2026-06-27 11:40:00+00'),
  ('f2000000-0006-4000-8000-000000000006', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000001', 'Added retention task for Taylor Brooks', 'agent', 'aaaaaaaa-0004-4000-8000-000000000004', '{}'::jsonb, '2026-06-26 20:05:00+00'),
  ('f2000000-0007-4000-8000-000000000007', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000003', 'Logged recruiting call with Noah Patel', 'recruit', 'bbbbbbbb-0002-4000-8000-000000000002', '{}'::jsonb, '2026-06-26 15:30:00+00'),
  ('f2000000-0008-4000-8000-000000000008', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000004', 'Closed referral transaction for D. Shaw', 'transaction', 'cccccccc-0006-4000-8000-000000000006', '{"status":"closed"}'::jsonb, '2026-06-24 22:15:00+00'),
  ('f2000000-0009-4000-8000-000000000009', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000003', 'Created onboarding activity for Elena Park', 'recruit', 'bbbbbbbb-0005-4000-8000-000000000005', '{}'::jsonb, '2026-06-24 18:45:00+00'),
  ('f2000000-0010-4000-8000-000000000010', '11111111-1111-4111-8111-111111111111', '91000000-0000-4000-8000-000000000001', 'Reviewed inactive agent status', 'agent', 'aaaaaaaa-0008-4000-8000-000000000008', '{}'::jsonb, '2026-06-23 19:00:00+00')
on conflict (id) do update set
  actor_id = excluded.actor_id,
  action = excluded.action,
  entity_type = excluded.entity_type,
  entity_id = excluded.entity_id,
  metadata = excluded.metadata,
  created_at = excluded.created_at;
