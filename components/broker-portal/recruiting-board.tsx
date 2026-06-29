"use client";

import { useMemo, useState } from "react";
import { Eye, Save } from "lucide-react";

import { updateRecruitStageAction } from "@/app/app/actions";
import { DetailField, DrawerFormShell } from "@/components/broker-portal/detail-fields";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { formatDate } from "@/lib/utils";
import type { Recruit } from "@/types/domain";

type RecruitingBoardProps = {
  actionsEnabled: boolean;
  canEdit: boolean;
  recruits: Recruit[];
};

const stages: Recruit["stage"][] = ["Identified", "Contacted", "Engaged", "Offer Pending", "Joined", "Lost"];

function heatVariant(heatScore: Recruit["heatScore"]) {
  if (heatScore === "Hot") return "danger";
  if (heatScore === "Warm") return "warning";
  return "info";
}

export function RecruitingBoard({ actionsEnabled, canEdit, recruits }: RecruitingBoardProps) {
  const [selectedRecruitId, setSelectedRecruitId] = useState<string | null>(null);
  const selectedRecruit = useMemo(
    () => recruits.find((recruit) => recruit.id === selectedRecruitId) ?? null,
    [recruits, selectedRecruitId],
  );

  return (
    <>
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
                      <button
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary shadow-card transition hover:bg-surface-muted"
                        onClick={() => setSelectedRecruitId(recruit.id)}
                        type="button"
                      >
                        <Eye className="h-4 w-4" aria-hidden />
                        View
                      </button>
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
      <DetailDrawer
        eyebrow="Recruit record"
        isOpen={Boolean(selectedRecruit)}
        onClose={() => setSelectedRecruitId(null)}
        title={selectedRecruit?.name ?? "Recruit"}
      >
        {selectedRecruit ? (
          <div className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailField label="Source" value={selectedRecruit.source} />
              <DetailField label="Heat" value={<Badge variant={heatVariant(selectedRecruit.heatScore)}>{selectedRecruit.heatScore}</Badge>} />
              <DetailField label="Stage" value={<Badge variant="accent">{selectedRecruit.stage}</Badge>} />
              <DetailField label="Score" value={selectedRecruit.recruitScore} />
              <DetailField label="Next follow-up" value={formatDate(selectedRecruit.nextFollowUpDate)} />
              <DetailField label="Notes" value={selectedRecruit.notesSummary} />
            </dl>
            {canEdit ? (
              <DrawerFormShell
                description="Move the recruit to a new stage and log the stage change."
                title="Move stage"
              >
                <form action={updateRecruitStageAction} className="flex flex-col gap-3 sm:flex-row">
                  <input name="recruitId" type="hidden" value={selectedRecruit.id} />
                  <label className="min-w-0 flex-1 text-sm font-medium text-text-primary">
                    <span className="sr-only">Recruit stage</span>
                    <select
                      className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
                      defaultValue={selectedRecruit.stage}
                      disabled={!actionsEnabled}
                      name="stage"
                    >
                      {stages.map((stage) => (
                        <option key={stage} value={stage}>{stage}</option>
                      ))}
                    </select>
                  </label>
                  <button
                    className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-card disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={!actionsEnabled}
                    type="submit"
                  >
                    <Save className="h-4 w-4" aria-hidden />
                    Save
                  </button>
                </form>
              </DrawerFormShell>
            ) : null}
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
