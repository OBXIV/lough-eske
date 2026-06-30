import { RecruitingBoard } from "@/components/broker-portal/recruiting-board";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getActivityLogs, getRecruits } from "@/lib/data/app-data";
import { areTenantWritesEnabled } from "@/lib/data/database";
import { canAccess } from "@/lib/rbac/permissions";

export default async function RecruitingPage() {
  const session = await requirePermission("view_recruiting");
  const [recruits, activities] = await Promise.all([
    getRecruits(session),
    getActivityLogs(session),
  ]);
  const canCreate = canAccess(session.permissions, "create_recruits");
  const canEdit = canAccess(session.permissions, "edit_recruits");

  return (
    <>
      <PageHeader
        title="Recruiting pipeline"
        subtitle="Stage-by-stage view of candidate heat, ownership signals, score, and next follow-up timing."
        eyebrow="Growth"
      />
      <RecruitingBoard
        actionsEnabled={areTenantWritesEnabled(session)}
        activities={activities}
        canCreate={canCreate}
        canEdit={canEdit}
        recruits={recruits}
      />
    </>
  );
}
