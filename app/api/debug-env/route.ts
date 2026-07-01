import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export function GET() {
  const keys = Object.keys(process.env)
    .filter((key) => /DATABASE|POSTGRES|SUPABASE/i.test(key))
    .sort();

  return NextResponse.json({
    dbConfigured: Boolean(process.env.DATABASE_URL),
    dbUrlLength: (process.env.DATABASE_URL ?? "").length,
    keys,
  });
}
