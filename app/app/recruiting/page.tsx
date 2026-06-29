import { RecruitingBoard } from "@/components/broker-portal/recruiting-board";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getRecruits } from "@/lib/data/app-data";
import { isDatabaseConfigured } from "@/lib/data/database";
import { canAccess } from "@/lib/rbac/permissions";

export default async function RecruitingPage() {
  const session = await requirePermission("view_recruiting");
  const recruits = await getRecruits(session);
  const canEdit = canAccess(session.permissions, "edit_recruits");

  return (
    <>
      <PageHeader
        title="Recruiting pipeline"
        subtitle="Stage-by-stage view of candidate heat, ownership signals, score, and next follow-up timing."
        eyebrow="Growth"
      />
      <RecruitingBoard actionsEnabled={isDatabaseConfigured()} canEdit={canEdit} recruits={recruits} />
    </>
  );
}
