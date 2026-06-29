import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), "utf8");
}

function expectContains(relativePath, expected, label) {
  const contents = read(relativePath);
  if (!contents.includes(expected)) {
    failures.push(`${label}: ${relativePath} is missing ${expected}`);
  }
}

function expectNotContains(relativePath, unexpected, label) {
  const contents = read(relativePath);
  if (contents.includes(unexpected)) {
    failures.push(`${label}: ${relativePath} still contains ${unexpected}`);
  }
}

const packageJson = JSON.parse(read("package.json"));
if (!packageJson.dependencies?.postgres) {
  failures.push("Missing postgres dependency for server-side DB reads.");
}

expectContains("lib/data/database.ts", "set local role authenticated", "RLS role setup");
expectContains("lib/data/database.ts", "request.jwt.claim.sub", "RLS auth user claim setup");
expectContains("lib/data/database.ts", "prepare: false", "Supabase pooler prepared-statement guard");
expectNotContains("lib/data/database.ts", "POSTGRES_URL", "App runtime requires explicit DATABASE_URL");

for (const table of ["agents", "recruits", "transactions", "tasks", "activity_logs"]) {
  expectContains("lib/data/app-data.ts", `where ${table}.tenant_id = $`, `Tenant scoped ${table} query`);
}

expectContains("lib/data/app-data.ts", "from public.tenants", "Visible tenant query");
expectContains("lib/data/app-data.ts", "withTenantRls", "DB reads use RLS wrapper");
expectContains("lib/auth/session.ts", "getTenantProfile", "Session tenant is hydrated from DB");
expectContains("supabase/migrations/20260629_add_recruit_prospect_name.sql", "prospect_name", "Recruit name migration");
expectContains("supabase/seed.sql", "prospect_name", "Recruit seed names");

const dbBackedRoutes = [
  "app/app/dashboard/page.tsx",
  "app/app/agents/page.tsx",
  "app/app/recruiting/page.tsx",
  "app/app/transactions/page.tsx",
  "app/app/tasks/page.tsx",
  "app/app/reports/page.tsx",
  "app/app/settings/page.tsx",
  "app/app/layout.tsx",
];

for (const route of dbBackedRoutes) {
  expectContains(route, "@/lib/data/app-data", "Route uses DB-backed data access");
  expectNotContains(route, "@/lib/data/demo", "Route no longer imports static demo arrays");
}

if (failures.length > 0) {
  console.error("Sprint 3B verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Sprint 3B verification passed:");
console.log("- Server-side DB client config is present");
console.log("- RLS session claim setup is present");
console.log("- Core routes use DB-backed data access");
console.log("- Recruit prospect names are represented in migration and seed");
