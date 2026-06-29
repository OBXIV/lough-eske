import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const migrationPath = path.join(root, "supabase/migrations/20260628_init_core_schema.sql");
const seedPath = path.join(root, "supabase/seed.sql");

const migration = fs.readFileSync(migrationPath, "utf8");
const seed = fs.readFileSync(seedPath, "utf8");

const requiredTables = [
  "tenants",
  "profiles",
  "roles",
  "permissions",
  "role_permissions",
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

const tenantOwnedTables = [
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

const expectedSeedCounts = {
  tenants: 3,
  roles: 8,
  permissions: 21,
  profiles: 5,
  tenant_memberships: 5,
  agents: 10,
  recruits: 8,
  recruiting_activities: 6,
  transactions: 6,
  tasks: 12,
  notes: 4,
  agent_resources: 6,
  agent_referrals: 4,
  activity_logs: 10,
};

const expectedRolePermissionPairs = 71;

const failures = [];

for (const table of requiredTables) {
  if (!migration.includes(`create table if not exists public.${table}`)) {
    failures.push(`Missing table in migration: ${table}`);
  }
}

for (const table of tenantOwnedTables) {
  const tableBlock = migration.match(new RegExp(`create table if not exists public\\.${table} \\([\\s\\S]*?\\n\\);`));
  if (!tableBlock?.[0].includes("tenant_id")) {
    failures.push(`Missing tenant_id in tenant-owned table: ${table}`);
  }

  if (!migration.includes(`alter table public.${table} enable row level security`)) {
    failures.push(`Missing RLS enablement: ${table}`);
  }
}

for (const [table, expected] of Object.entries(expectedSeedCounts)) {
  const insertBlock = seed.match(new RegExp(`insert into (?:public\\.|auth\\.)?${table}[\\s\\S]*?on conflict`, "i"));
  if (!insertBlock) {
    failures.push(`Missing seed insert: ${table}`);
    continue;
  }

  const valuesBlock = insertBlock[0].match(/\bvalues\b([\s\S]*?)\bon conflict\b/i)?.[1];
  const count = valuesBlock ? [...valuesBlock.matchAll(/^\s*\(/gm)].length : 0;
  if (count < expected) {
    failures.push(`Seed count too low for ${table}: expected at least ${expected}, found ${count}`);
  }
}

const rolePermissionBlock = seed.match(/with role_permission_pairs[\s\S]*?\)\s*insert into public\.role_permissions/i);
const rolePermissionCount = rolePermissionBlock ? [...rolePermissionBlock[0].matchAll(/^\s*\('[^']+', '[^']+'\)/gm)].length : 0;
if (rolePermissionCount < expectedRolePermissionPairs) {
  failures.push(`Role permission seed count too low: expected at least ${expectedRolePermissionPairs}, found ${rolePermissionCount}`);
}

if (!seed.includes("encrypted_password") || !seed.includes("null")) {
  failures.push("Demo auth users should be seeded without committed passwords.");
}

if (failures.length > 0) {
  console.error("Sprint 2 verification failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("Sprint 2 verification passed:");
console.log(`- ${requiredTables.length} required tables present`);
console.log(`- ${tenantOwnedTables.length} tenant-owned tables include tenant_id and RLS`);
console.log("- Demo seed counts meet or exceed Sprint 2 requirements");
console.log(`- ${rolePermissionCount} role-permission pairs seeded`);
