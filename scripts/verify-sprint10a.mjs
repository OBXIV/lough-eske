import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];
const checks = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function expectContains(relativePath, expected, label) {
  checks.push(label);
  if (!read(relativePath).includes(expected)) {
    failures.push(`${label}: ${relativePath} is missing ${expected}`);
  }
}

const migrationPath = "supabase/migrations/20260716090000_add_agent_portal_workflows.sql";

for (const expected of [
  "add column if not exists profile_id uuid references public.profiles(id)",
  "agents_tenant_profile_unique_idx",
  "agents_profile_id_idx",
  "add column if not exists created_by uuid references public.profiles(id)",
  "visibility in ('all_agents', 'staff_only')",
  "members can read permitted agents",
  "members can read permitted transactions",
  "members can read permitted agent referrals",
  "members can read permitted tasks",
  "and profile_id = public.current_profile_id()",
  "and assigned_to = public.current_profile_id()",
  "tenant members can read visible agent resources",
  "resource managers can insert agent resources",
  "resource managers can update agent resources",
  "has_tenant_permission(tenant_id, 'manage_agent_resources')",
  "to authenticated",
  "revoke execute on function public.current_profile_id() from public, anon",
  "transactions_tenant_agent_idx",
  "agent_referrals_tenant_agent_idx",
]) {
  expectContains(migrationPath, expected, `Migration contains ${expected}`);
}

for (const expected of [
  "'91000000-0000-4000-8000-000000000005'", // Elena Park's profile linked to her agent row
  "profile_id = excluded.profile_id",
  "'staff_only'",
  "created_by = excluded.created_by",
  "cccccccc-0007-4000-8000-000000000007", // portal agent transaction
  "dddddddd-0013-4000-8000-000000000013", // portal agent task
  "f1000000-0005-4000-8000-000000000005", // portal agent referral
]) {
  expectContains("supabase/seed.sql", expected, `Repeatable seed includes ${expected}`);
}

expectContains("lib/data/app-data.ts", "getLinkedAgent", "Data layer resolves the signed-in agent");
expectContains("lib/data/app-data.ts", "and agents.profile_id = ${session.user.profileId}", "Linked agent lookup is profile-scoped");
expectContains("lib/data/app-data.ts", "and transactions.agent_id = ${agent.id}", "Portal transactions are agent-scoped");
expectContains("lib/data/app-data.ts", "and agent_referrals.agent_id = ${agentId}", "Portal referrals are agent-scoped");
expectContains("lib/data/app-data.ts", "or agent_resources.visibility = 'all_agents'", "Resource reads are visibility-scoped");
expectContains("lib/data/mutations.ts", "createAgentResource", "Resource publish mutation exists");
expectContains("lib/data/mutations.ts", "'agent_resource'", "Resource publishes are activity-logged");
expectContains("app/app/actions.ts", 'requirePermission("manage_agent_resources")', "Publish action is permission-gated");
expectContains("app/app/agent-portal/page.tsx", 'requirePermission("view_agent_portal")', "Portal route stays permission-gated");
expectContains("app/app/agent-portal/page.tsx", 'tenantHasFeature(session, "agent_portal")', "Portal route stays plan-gated");
expectContains("app/app/agent-portal/page.tsx", "getLinkedAgent(session)", "Portal page scopes data to the signed-in agent");
expectContains("app/app/agent-portal/page.tsx", "task.assigneeId === session.user.profileId", "Portal tasks are scoped to the signed-in user");
expectContains("components/agent-portal/resource-library.tsx", "publishAgentResourceAction", "Resource library wires the publish flow");
expectContains("components/agent-portal/portal-transactions.tsx", "DetailDrawer", "Transactions expose a status detail panel");
expectContains("components/agent-portal/referral-panel.tsx", "DetailDrawer", "Referrals expose tracking details");

if (failures.length > 0) {
  console.error("Sprint 10A verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Sprint 10A verification passed:");
console.log(`- ${checks.length} portal scoping, resource visibility, publish flow, and seed checks passed`);
