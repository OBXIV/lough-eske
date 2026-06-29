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
      <PageHeader
        title="Recruiting pipeline"
        subtitle="Stage-by-stage view of candidate heat, ownership signals, score, and next follow-up timing."
        eyebrow="Growth"
      />
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[88rem] grid-cols-6 gap-3">
          {stages.map((stage) => {
            const stageRecruits = recruits.filter((recruit) => recruit.stage === stage);

            return (
              <section key={stage} className="rounded-lg border border-border bg-surface-muted p-3">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-text-primary">{stage}</h2>
                  <Badge>{stageRecruits.length}</Badge>
                </div>
                <div className="space-y-3">
                  {stageRecruits.map((recruit) => (
                    <Card key={recruit.id} className="p-3 shadow-none">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold">{recruit.name}</h3>
                          <p className="mt-1 text-xs text-text-secondary">{recruit.source}</p>
                        </div>
                        <Badge variant={heatVariant(recruit.heatScore)}>{recruit.heatScore}</Badge>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-3 text-xs text-text-secondary">
                        <span className="font-medium text-text-primary">Score {recruit.recruitScore}</span>
                        <span>{formatDate(recruit.nextFollowUpDate)}</span>
                      </div>
                      <p className="mt-3 line-clamp-3 text-xs leading-5 text-text-secondary">{recruit.notesSummary}</p>
                    </Card>
                  ))}
                  {stageRecruits.length === 0 ? (
                    <div className="rounded-md border border-dashed border-border bg-surface px-3 py-8 text-center text-sm text-text-secondary">
                      No records
                    </div>
                  ) : null}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}
