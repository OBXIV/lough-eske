"use client";

import { useActionState, useMemo, useState } from "react";
import { Eye, Plus, Save } from "lucide-react";

import { createRecruitAction, updateRecruitStageAction } from "@/app/app/actions";
import { ActionFeedback, SubmitButton } from "@/components/broker-portal/action-form";
import { ActivityList, DetailField, DrawerFormShell } from "@/components/broker-portal/detail-fields";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { initialActionFormState } from "@/lib/action-state";
import { formatDate } from "@/lib/utils";
import type { ActivityLog, Recruit } from "@/types/domain";

type RecruitingBoardProps = {
  actionsEnabled: boolean;
  activities: ActivityLog[];
  canCreate: boolean;
  canEdit: boolean;
  recruits: Recruit[];
};

const stages: Recruit["stage"][] = ["Identified", "Contacted", "Engaged", "Offer Pending", "Joined", "Lost"];
const heatScores: Recruit["heatScore"][] = ["Hot", "Warm", "Cold"];

function heatVariant(heatScore: Recruit["heatScore"]) {
  if (heatScore === "Hot") return "danger";
  if (heatScore === "Warm") return "warning";
  return "info";
}

function matchesRecruitActivity(activity: ActivityLog, recruit: Recruit) {
  return activity.entityId === recruit.id || activity.action.toLowerCase().includes(recruit.name.toLowerCase());
}

type RecruitStageFormProps = {
  actionsEnabled: boolean;
  recruit: Recruit;
};

function RecruitStageForm({ actionsEnabled, recruit }: RecruitStageFormProps) {
  const [state, formAction] = useActionState(updateRecruitStageAction, initialActionFormState);

  return (
    <DrawerFormShell
      description="Move the recruit to a new stage and log the stage change."
      title="Move stage"
    >
      <form action={formAction} className="flex flex-col gap-3 sm:flex-row">
        <input name="recruitId" type="hidden" value={recruit.id} />
        <label className="min-w-0 flex-1 text-sm font-medium text-text-primary">
          <span className="sr-only">Recruit stage</span>
          <select
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue={recruit.stage}
            disabled={!actionsEnabled}
            name="stage"
          >
            {stages.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </label>
        <SubmitButton disabled={!actionsEnabled} icon={Save} label="Save" pendingLabel="Saving" />
      </form>
      <ActionFeedback
        disabledMessage={!actionsEnabled ? "Writes are disabled in this environment." : undefined}
        state={state}
      />
    </DrawerFormShell>
  );
}

type CreateRecruitFormProps = {
  actionsEnabled: boolean;
};

function CreateRecruitForm({ actionsEnabled }: CreateRecruitFormProps) {
  const [state, formAction] = useActionState(createRecruitAction, initialActionFormState);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-text-primary">
          Name
          <input
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="name"
            required
            type="text"
          />
        </label>
        <label className="text-sm font-medium text-text-primary">
          Source
          <input
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="source"
            type="text"
          />
        </label>
        <label className="text-sm font-medium text-text-primary">
          Stage
          <select
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue="Identified"
            disabled={!actionsEnabled}
            name="stage"
          >
            {stages.map((stage) => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-text-primary">
          Heat
          <select
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue="Warm"
            disabled={!actionsEnabled}
            name="heatScore"
          >
            {heatScores.map((score) => (
              <option key={score} value={score}>{score}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-text-primary">
          Score
          <input
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue={50}
            disabled={!actionsEnabled}
            max={100}
            min={0}
            name="recruitScore"
            required
            type="number"
          />
        </label>
        <label className="text-sm font-medium text-text-primary">
          Next follow-up
          <input
            className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="nextFollowUpDate"
            type="date"
          />
        </label>
      </div>
      <label className="block text-sm font-medium text-text-primary">
        Notes
        <textarea
          className="mt-1 min-h-28 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
          disabled={!actionsEnabled}
          name="notesSummary"
        />
      </label>
      <SubmitButton disabled={!actionsEnabled} icon={Plus} label="Create recruit" pendingLabel="Creating" />
      <ActionFeedback
        disabledMessage={!actionsEnabled ? "Writes are disabled in this environment." : undefined}
        state={state}
      />
    </form>
  );
}

export function RecruitingBoard({ actionsEnabled, activities, canCreate, canEdit, recruits }: RecruitingBoardProps) {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRecruitId, setSelectedRecruitId] = useState<string | null>(null);
  const selectedRecruit = useMemo(
    () => recruits.find((recruit) => recruit.id === selectedRecruitId) ?? null,
    [recruits, selectedRecruitId],
  );
  const selectedActivities = useMemo(
    () => (selectedRecruit ? activities.filter((activity) => matchesRecruitActivity(activity, selectedRecruit)) : []),
    [activities, selectedRecruit],
  );

  return (
    <>
      {canCreate ? (
        <div className="mb-4 flex justify-end">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-accent/90"
            onClick={() => {
              setSelectedRecruitId(null);
              setIsCreateOpen(true);
            }}
            type="button"
          >
            <Plus className="h-4 w-4" aria-hidden />
            New recruit
          </button>
        </div>
      ) : null}
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
                        onClick={() => {
                          setIsCreateOpen(false);
                          setSelectedRecruitId(recruit.id);
                        }}
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
              <RecruitStageForm key={selectedRecruit.id} actionsEnabled={actionsEnabled} recruit={selectedRecruit} />
            ) : null}
            <ActivityList activities={selectedActivities} />
          </div>
        ) : null}
      </DetailDrawer>
      <DetailDrawer
        eyebrow="Recruiting"
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="New recruit"
      >
        <CreateRecruitForm actionsEnabled={actionsEnabled} />
      </DetailDrawer>
    </>
  );
}
