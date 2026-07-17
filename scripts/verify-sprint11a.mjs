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

const migrationPath = "supabase/migrations/20260717180736_settings_administration_workflows.sql";
const policyMigrationPath = "supabase/migrations/20260717181113_consolidate_tenant_update_policy.sql";

for (const expected of [
  "tenants_name_length_check",
  "tenants_primary_color_format_check",
  "settings managers can update tenant branding",
  "has_tenant_permission(id, 'manage_settings')",
  "guard_tenant_branding_changes",
  "to_jsonb(new) - array['name', 'primary_color', 'updated_at']",
  "Tenant settings managers may only change name and primary color.",
  "audit_tenant_branding_changes",
  "Updated tenant branding",
  "public.current_profile_id()",
  "'before', jsonb_build_object",
  "'after', jsonb_build_object",
  "revoke all on function public.guard_tenant_branding_changes() from public, anon, authenticated",
]) {
  expectContains(migrationPath, expected, `Migration contains ${expected}`);
}

for (const expected of [
  'drop policy if exists "platform admins can update tenant entitlements"',
  'drop policy if exists "settings managers can update tenant branding"',
  'create policy "authorized users can update tenant settings"',
  "public.is_platform_admin()",
  "public.has_tenant_permission(id, 'manage_settings')",
]) {
  expectContains(policyMigrationPath, expected, `Consolidated policy migration contains ${expected}`);
}

expectContains("app/app/settings/page.tsx", 'requirePermission("manage_settings")', "Settings route is permission-gated");
expectContains("app/app/settings/page.tsx", "getTenantMembers(session)", "Settings loads tenant memberships");
expectContains("app/app/settings/page.tsx", "getRoleDetails(session)", "Settings loads role details");
expectContains("app/app/settings/page.tsx", "getDeploymentEnvironmentLabel()", "Settings exposes deployment context");
expectContains("app/app/actions.ts", 'requirePermission("manage_settings")', "Branding action is permission-gated");
expectContains("app/app/actions.ts", "tenantColorValue", "Branding action validates the accent color");
expectContains("lib/data/mutations.ts", "updateTenantProfile", "Tenant branding mutation exists");
expectContains("lib/data/mutations.ts", "or branding changes are not permitted", "Tenant mutation rejects invisible rows");
expectContains("lib/data/app-data.ts", "tenant_memberships.status", "Member loader includes membership state");
expectContains("lib/data/app-data.ts", "getRoleDetails", "Role loader exists");
expectContains("components/settings/settings-administration.tsx", "Live preview only until saved", "Branding form includes a live preview");
expectContains("components/settings/settings-administration.tsx", "Every saved change is written to the activity log", "UI explains audit behavior");
expectContains("components/settings/settings-administration.tsx", "Invitations, role reassignment, suspension, and removal remain intentionally deferred", "Destructive member actions stay deferred");
expectContains("components/settings/settings-administration.tsx", "Granted permissions", "Role drawer exposes permissions");
expectContains("components/settings/settings-administration.tsx", "Environment and features", "Runtime and feature state are visible");

if (failures.length > 0) {
  console.error("Sprint 11A verification failed:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Sprint 11A verification passed:");
console.log(`- ${checks.length} settings authorization, audit, member, role, environment, and feature checks passed`);
