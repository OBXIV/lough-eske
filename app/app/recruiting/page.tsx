import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import { getRecruits } from "@/lib/data/app-data";
import { formatDate } from "@/lib/utils";
import type { Recruit } from "@/types/domain";

const stages: Recruit["stage"][] = ["Identified", "Contacted", "Engaged", "Offer Pending", "Joined", "Lost"];

function heatVariant(heatScore: Recruit["heatScore"]) {
  if (heatScore === "Hot") return "danger";
  if (heatScore === "Warm") return "warning";
  return "info";
}

export default async function RecruitingPage() {
  const session = await requirePermission("view_recruiting");
  const recruits = await getRecruits(session);

  return (
    <>
      <PageHeader title="Recruiting pipeline" subtitle="Kanban view of tenant-scoped recruiting records by stage, heat, score, and next follow-up." />
      <div className="grid gap-4 overflow-x-auto xl:grid-cols-6">
        {stages.map((stage) => (
          <section key={stage} className="min-w-64 rounded-xl border border-border bg-surface p-3 shadow-card">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-text-primary">{stage}</h2>
              <Badge>{recruits.filter((recruit) => recruit.stage === stage).length}</Badge>
            </div>
            <div className="space-y-3">
              {recruits
                .filter((recruit) => recruit.stage === stage)
                .map((recruit) => (
                  <Card key={recruit.id} className="p-3 shadow-none">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-sm font-semibold">{recruit.name}</h3>
                        <p className="mt-1 text-xs text-text-secondary">{recruit.source}</p>
                      </div>
                      <Badge variant={heatVariant(recruit.heatScore)}>{recruit.heatScore}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-xs text-text-secondary">
                      <span>Score {recruit.recruitScore}</span>
                      <span>{formatDate(recruit.nextFollowUpDate)}</span>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-text-secondary">{recruit.notesSummary}</p>
                  </Card>
                ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
