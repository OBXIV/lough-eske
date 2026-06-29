import fs from "node:fs";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const env = {};
  const text = fs.readFileSync(filePath, "utf8");

  for (const line of text.split(/\r?\n/)) {
    const index = line.indexOf("=");
    if (index < 0) continue;

    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }

  return env;
}

const fileEnv = loadEnvFile(".env.local");
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || fileEnv.NEXT_PUBLIC_SUPABASE_URL;
const publicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  fileEnv.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  fileEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !publicKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL and public Supabase key.");
  process.exit(1);
}

const response = await fetch(`${supabaseUrl}/rest/v1/tenants?select=id,name&limit=1`, {
  headers: {
    apikey: publicKey,
    Authorization: `Bearer ${publicKey}`,
  },
});

if (!response.ok) {
  const body = await response.text();
  console.error(`Supabase public REST check failed with HTTP ${response.status}.`);
  console.error(body.slice(0, 500));
  process.exit(1);
}

console.log("Supabase public REST check passed:");
console.log("- tenants endpoint returned HTTP 200");
