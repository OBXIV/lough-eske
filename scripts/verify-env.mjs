import fs from "node:fs";
import path from "node:path";

const DEV_PROJECT_REF = "ybzelcftszhhbotzcqzq";

function getArg(name) {
  const prefix = `${name}=`;
  const inline = process.argv.find((arg) => arg.startsWith(prefix));
  if (inline) {
    return inline.slice(prefix.length);
  }

  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function loadEnvFile(filePath) {
  if (!filePath) {
    return {};
  }

  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Environment file not found: ${filePath}`);
  }

  const env = {};
  const lines = fs.readFileSync(absolutePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separator = trimmed.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = trimmed.slice(0, separator);
    const value = trimmed.slice(separator + 1).replace(/^["']|["']$/g, "");
    env[key] = value;
  }

  return env;
}

function valueFor(env, key) {
  return process.env[key] || env[key] || "";
}

function parseUrl(value, label, failures) {
  try {
    return new URL(value);
  } catch {
    failures.push(`${label} is not a valid URL.`);
    return null;
  }
}

function projectRefFromPublicUrl(value) {
  try {
    return new URL(value).hostname.replace(".supabase.co", "");
  } catch {
    return "";
  }
}

function projectRefFromDatabaseUrl(value) {
  try {
    const url = new URL(value);
    if (url.username.startsWith("postgres.")) {
      return url.username.replace("postgres.", "");
    }

    const directMatch = url.hostname.match(/^db\.([^.]+)\.supabase\.co$/);
    return directMatch?.[1] ?? "";
  } catch {
    return "";
  }
}

const filePath = getArg("--file");
const environmentName = getArg("--name") ?? "local";
const fileEnv = loadEnvFile(filePath);
const failures = [];
const warnings = [];

const supabaseUrl = valueFor(fileEnv, "NEXT_PUBLIC_SUPABASE_URL");
const publishableKey = valueFor(fileEnv, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
const anonKey = valueFor(fileEnv, "NEXT_PUBLIC_SUPABASE_ANON_KEY");
const databaseUrl = valueFor(fileEnv, "DATABASE_URL");
const migrationDatabaseUrl = valueFor(fileEnv, "MIGRATION_DATABASE_URL");

if (!supabaseUrl) failures.push("Missing NEXT_PUBLIC_SUPABASE_URL.");
if (!publishableKey && !anonKey) failures.push("Missing NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.");
if (!databaseUrl) failures.push("Missing DATABASE_URL.");
if (!migrationDatabaseUrl) failures.push("Missing MIGRATION_DATABASE_URL.");

const publicUrl = supabaseUrl ? parseUrl(supabaseUrl, "NEXT_PUBLIC_SUPABASE_URL", failures) : null;
const runtimeUrl = databaseUrl ? parseUrl(databaseUrl, "DATABASE_URL", failures) : null;
const migrationUrl = migrationDatabaseUrl ? parseUrl(migrationDatabaseUrl, "MIGRATION_DATABASE_URL", failures) : null;

if (publicUrl && !publicUrl.hostname.endsWith(".supabase.co")) {
  failures.push("NEXT_PUBLIC_SUPABASE_URL should be a Supabase project URL.");
}

if (runtimeUrl && runtimeUrl.protocol !== "postgresql:") {
  failures.push("DATABASE_URL should use the postgresql:// protocol.");
}

if (migrationUrl && migrationUrl.protocol !== "postgresql:") {
  failures.push("MIGRATION_DATABASE_URL should use the postgresql:// protocol.");
}

if (runtimeUrl && !runtimeUrl.hostname.includes("pooler.supabase.com")) {
  warnings.push("DATABASE_URL is not a Supabase pooler host; Vercel runtime should normally use the Transaction pooler.");
}

if (migrationUrl?.port === "6543") {
  failures.push("MIGRATION_DATABASE_URL appears to use Transaction pooler port 6543; migrations need Session pooler mode.");
}

if (databaseUrl && migrationDatabaseUrl && databaseUrl === migrationDatabaseUrl) {
  warnings.push("DATABASE_URL and MIGRATION_DATABASE_URL are identical; runtime and migration URLs usually use different pooler modes.");
}

const publicRef = projectRefFromPublicUrl(supabaseUrl);
const runtimeRef = projectRefFromDatabaseUrl(databaseUrl);
const migrationRef = projectRefFromDatabaseUrl(migrationDatabaseUrl);

const refs = [publicRef, runtimeRef, migrationRef].filter(Boolean);
if (new Set(refs).size > 1) {
  failures.push("Supabase project refs do not match across public, runtime, and migration URLs.");
}

if (environmentName === "stage" && refs.includes(DEV_PROJECT_REF)) {
  failures.push("Stage is pointing at the Dev Supabase project ref.");
}

if (environmentName === "dev" && publicRef && publicRef !== DEV_PROJECT_REF) {
  warnings.push("Dev public URL does not match the currently documented Dev Supabase project ref.");
}

if (failures.length > 0) {
  console.error(`Environment verification failed for ${environmentName}:`);
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log(`Environment verification passed for ${environmentName}:`);
console.log(`- Supabase project ref: ${publicRef || "not detected"}`);
console.log("- Public Supabase URL/key shape is present");
console.log("- Runtime and migration database URL shape is present");

if (warnings.length > 0) {
  console.log("Warnings:");
  for (const warning of warnings) {
    console.log(`- ${warning}`);
  }
}
