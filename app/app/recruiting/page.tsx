import { RecruitingBoard } from "@/components/broker-portal/recruiting-board";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getActivityLogs, getRecruits } from "@/lib/data/app-data";
import { areTenantWritesEnabled } from "@/lib/data/database";
import { canAccess } from "@/lib/rbac/permissions";
import type { Recruit } from "@/types/domain";

type RecruitingPageProps = {
  searchParams?: Promise<{
    stage?: string;
    status?: string;
  }>;
};

const recruitStages: Recruit["stage"][] = ["Identified", "Contacted", "Engaged", "Offer Pending", "Joined", "Lost"];

function stageFilterFromQuery(stage?: string): "all" | Recruit["stage"] {
  return recruitStages.includes(stage as Recruit["stage"]) ? (stage as Recruit["stage"]) : "all";
}

function recruitFilterFromQuery(status?: string): "all" | "active" {
  return status === "active" ? "active" : "all";
}

export default async function RecruitingPage({ searchParams }: RecruitingPageProps) {
  const session = await requirePermission("view_recruiting");
  const params = await searchParams;
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
        initialRecruitFilter={recruitFilterFromQuery(params?.status)}
        initialStageFilter={stageFilterFromQuery(params?.stage)}
        recruits={recruits}
      />
    </>
  );
}
