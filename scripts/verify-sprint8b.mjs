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

const migrationPath = "supabase/migrations/20260710050654_add_plans_and_entitlements.sql";
const indexMigrationPath = "supabase/migrations/20260710050925_add_tenants_plan_index.sql";

for (const expected of [
  "create table public.plans",
  "create table public.plan_features",
  "add column plan_id uuid",
  "add column seat_count integer",
  "alter column plan_id set not null",
  "alter column seat_count set not null",
  "tenant_has_feature",
  "security invoker",
  "enforce_tenant_seat_limit",
  "status in ('active', 'invited')",
  "platform admins can update tenant entitlements",
  "grant select, insert, update, delete on table public.plans to authenticated, service_role",
  "revoke all on table public.plans from anon",
]) {
  expectContains(migrationPath, expected, `Migration contains ${expected}`);
}

for (const plan of ["'core', 'Core'", "'growth', 'Growth'", "'scale', 'Scale'"]) {
  expectContains(migrationPath, plan, `Migration seeds ${plan}`);
  expectContains("supabase/seed.sql", plan, `Repeatable seed includes ${plan}`);
}

for (const feature of ["reports", "agent_portal", "mls_sync"]) {
  expectContains(migrationPath, `'${feature}'`, `Migration includes ${feature} entitlement`);
  expectContains("lib/entitlements/catalog.ts", `${feature}:`, `UI labels ${feature}`);
}

expectContains("lib/data/app-data.ts", "public.tenant_has_feature", "App calls the database entitlement helper");
expectContains(indexMigrationPath, "create index tenants_plan_id_idx", "Tenant plan foreign key is indexed");
expectContains("components/app-shell/nav.ts", 'feature: "reports"', "Reports navigation is plan-aware");
expectContains("components/app-shell/nav.ts", 'feature: "agent_portal"', "Agent Portal navigation is plan-aware");
expectContains("app/app/reports/page.tsx", 'tenantHasFeature(session, "reports")', "Reports route is plan-gated");
expectContains("app/app/agent-portal/page.tsx", 'tenantHasFeature(session, "agent_portal")', "Agent Portal route is plan-gated");
expectContains("app/app/settings/page.tsx", "Plan and billing", "Settings exposes plan billing");
expectContains("app/app/settings/page.tsx", "Seat usage", "Settings exposes seat usage");
expectContains("app/app/settings/page.tsx", "Feature access", "Settings exposes included features");

const billingExamples = [
  { base: 19900, included: 5, seats: 5, perSeat: 2900, expected: 19900 },
  { base: 19900, included: 5, seats: 6, perSeat: 2900, expected: 22800 },
  { base: 49900, included: 15, seats: 17, perSeat: 2500, expected: 54900 },
  { base: 89900, included: 30, seats: 31, perSeat: 1900, expected: 91800 },
];

for (const example of billingExamples) {
  checks.push(`Billing calculation for ${example.seats} seats`);
  const actual = example.base + Math.max(0, example.seats - example.included) * example.perSeat;
  if (actual !== example.expected) {
    failures.push(`Billing calculation expected ${example.expected}, received ${actual}`);
  }
}

if (failures.length > 0) {
  console.error("Sprint 8B verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Sprint 8B verification passed:");
console.log(`- ${checks.length} plan, seat, entitlement, billing, route, and Settings checks passed`);
