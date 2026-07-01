import { NextResponse } from "next/server";

import { getDatabaseClient, isDatabaseConfigured, withTenantRls } from "@/lib/data/database";
import { getDemoSession } from "@/lib/data/demo";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = {
    dbConfigured: isDatabaseConfigured(),
    dbUrlLength: (process.env.DATABASE_URL ?? "").length,
  };

  if (!base.dbConfigured) {
    return NextResponse.json(base);
  }

  try {
    const sql = getDatabaseClient();
    const [raw] = await sql`
      select
        (select count(*)::int from public.tasks where assigned_to is not null) as tasks_with_assignee,
        (select count(*)::int from public.tasks) as tasks_total,
        (select count(*)::int from public.profiles) as profiles_total
    `;

    const rls = await withTenantRls(getDemoSession(), async (tx) => {
      const [row] = await tx`
        select
          (select count(*)::int from public.profiles) as profiles_visible,
          (select count(*)::int from public.tasks join public.profiles pr on pr.id = tasks.assigned_to) as join_matches,
          (select count(*)::int from public.tasks) as tasks_visible
      `;
      return row;
    });

    return NextResponse.json({ ...base, raw, rls });
  } catch (caught) {
    return NextResponse.json({
      ...base,
      error: caught instanceof Error ? caught.message.slice(0, 300) : "unknown",
    });
  }
}
