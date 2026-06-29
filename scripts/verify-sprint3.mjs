import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

function read(filePath) {
  return fs.readFileSync(path.join(root, filePath), "utf8");
}

const checks = [];
const failures = [];

function expectFileContains(filePath, pattern, label) {
  const source = read(filePath);
  const passed = typeof pattern === "string" ? source.includes(pattern) : pattern.test(source);
  checks.push(label);

  if (!passed) {
    failures.push(`${label}: ${filePath}`);
  }
}

expectFileContains("lib/auth/session.ts", "const SESSION_COOKIE", "Session cookie is centralized");
expectFileContains("lib/auth/session.ts", "httpOnly: true", "Demo session cookie is HTTP-only");
expectFileContains("lib/auth/session.ts", "requireSession", "Protected session helper exists");
expectFileContains("lib/auth/session.ts", "requirePermission", "Permission guard helper exists");
expectFileContains("lib/auth/actions.ts", "signInDemoAction", "Demo sign-in server action exists");
expectFileContains("lib/auth/actions.ts", "signOutAction", "Sign-out server action exists");
expectFileContains("lib/supabase/server.ts", "createSupabaseServerClient", "Supabase server client utility exists");
expectFileContains("lib/tenant/access.ts", "session.role === \"Platform Admin\"", "Platform admin tenant access branch exists");
expectFileContains("components/app-shell/session-provider.tsx", "useTenantSession", "Tenant session provider hook exists");
expectFileContains("app/login/page.tsx", "signInDemoAction", "Login route uses demo sign-in");
expectFileContains("app/demo/page.tsx", "signInDemoAction", "Demo route creates a session");
expectFileContains("app/app/layout.tsx", "requireSession", "App layout requires a session");
expectFileContains("supabase/seed.sql", "platform.admin@obliox.io", "Platform admin demo user is seeded");

const guardedRoutes = {
  "app/app/dashboard/page.tsx": "requirePermission(\"view_dashboard\")",
  "app/app/agents/page.tsx": "requirePermission(\"view_agents\")",
  "app/app/recruiting/page.tsx": "requirePermission(\"view_recruiting\")",
  "app/app/transactions/page.tsx": "requirePermission(\"view_transactions\")",
  "app/app/tasks/page.tsx": "requirePermission(\"manage_tasks\")",
  "app/app/reports/page.tsx": "requirePermission(\"view_reports\")",
  "app/app/agent-portal/page.tsx": "requirePermission(\"view_agent_portal\")",
  "app/app/settings/page.tsx": "requirePermission(\"manage_settings\")",
};

for (const [filePath, guard] of Object.entries(guardedRoutes)) {
  expectFileContains(filePath, guard, `Route guard exists for ${filePath}`);
}

const migration = read("supabase/migrations/20260628_init_core_schema.sql");
const tenantTables = [
  "tenant_memberships",
  "agents",
  "recruits",
  "recruiting_activities",
  "transactions",
  "tasks",
  "notes",
  "activity_logs",
  "agent_resources",
  "agent_referrals",
];

for (const table of tenantTables) {
  checks.push(`RLS read policy exists for ${table}`);
  if (!migration.includes(`on public.${table} for select`) || !migration.includes("public.is_tenant_member(tenant_id)")) {
    failures.push(`RLS read policy missing for ${table}`);
  }
}

if (failures.length > 0) {
  console.error("Sprint 3 verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Sprint 3 verification passed:");
console.log(`- ${checks.length} auth, tenant, RBAC, route, and RLS checks passed`);
