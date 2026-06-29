const DEV_PROJECT_REF = "ybzelcftszhhbotzcqzq";
const STAGE_PROJECT_REF = "gdwkhjoushqdrfmbzyit";

function getSupabaseProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!url) return null;

  try {
    return new URL(url).hostname.split(".")[0] || null;
  } catch {
    return null;
  }
}

export function getDeploymentEnvironmentLabel() {
  const projectRef = getSupabaseProjectRef();

  if (projectRef === DEV_PROJECT_REF) return "Dev";
  if (projectRef === STAGE_PROJECT_REF) return "Stage";
  if (process.env.VERCEL_ENV === "production") return "Prod";
  if (process.env.VERCEL_ENV === "preview") return "Preview";
  return "Local";
}
