"use client";

import { useActionState, useMemo, useState, useTransition } from "react";
import { Plus, Save } from "lucide-react";
import { useRouter } from "next/navigation";

import { createRecruitAction, updateRecruitStageAction } from "@/app/app/actions";
import { ActionFeedback, SubmitButton } from "@/components/broker-portal/action-form";
import { ActivityList, DetailField, DrawerFormShell } from "@/components/broker-portal/detail-fields";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { initialActionFormState, type ActionFormState } from "@/lib/action-state";
import { cn, formatDate } from "@/lib/utils";
import type { ActivityLog, Recruit } from "@/types/domain";

type RecruitingBoardProps = {
  actionsEnabled: boolean;
  activities: ActivityLog[];
  canCreate: boolean;
  canEdit: boolean;
  initialRecruitFilter?: "all" | "active";
  initialStageFilter?: "all" | Recruit["stage"];
  recruits: Recruit[];
};

const stages: Recruit["stage"][] = ["Identified", "Contacted", "Engaged", "Offer Pending", "Joined", "Lost"];
const activeStages: Recruit["stage"][] = ["Identified", "Contacted", "Engaged", "Offer Pending"];
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
      description="Update stage, heat, and the activity log for this recruit."
      title="Update pipeline"
    >
      <form action={formAction} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
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
        <label className="min-w-0 flex-1 text-sm font-medium text-text-primary">
          <span className="sr-only">Recruit heat</span>
          <select
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue={recruit.heatScore}
            disabled={!actionsEnabled}
            name="heatScore"
          >
            {heatScores.map((score) => (
              <option key={score} value={score}>{score}</option>
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

function isActionFormState(value: unknown): value is ActionFormState {
  return Boolean(value && typeof value === "object" && "status" in value && "message" in value);
}

export function RecruitingBoard({
  actionsEnabled,
  activities,
  canCreate,
  canEdit,
  initialRecruitFilter = "all",
  initialStageFilter = "all",
  recruits,
}: RecruitingBoardProps) {
  const router = useRouter();
  const canMoveRecruit = actionsEnabled && canEdit;
  const [draggedRecruitId, setDraggedRecruitId] = useState<string | null>(null);
  const [dropState, setDropState] = useState<ActionFormState>(initialActionFormState);
  const [heatFilter, setHeatFilter] = useState<"all" | Recruit["heatScore"]>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMoving, startMoveTransition] = useTransition();
  const [recruitFilter, setRecruitFilter] = useState<"all" | "active">(initialRecruitFilter);
  const [selectedRecruitId, setSelectedRecruitId] = useState<string | null>(null);
  const [stageFilter, setStageFilter] = useState<"all" | Recruit["stage"]>(initialStageFilter);
  const filteredRecruits = useMemo(
    () => recruits.filter((recruit) => (
      (recruitFilter === "all" || activeStages.includes(recruit.stage)) &&
      (stageFilter === "all" || recruit.stage === stageFilter) &&
      (heatFilter === "all" || recruit.heatScore === heatFilter)
    )),
    [heatFilter, recruitFilter, recruits, stageFilter],
  );
  const visibleStages = stageFilter === "all" ? (recruitFilter === "active" ? activeStages : stages) : [stageFilter];
  const selectedRecruit = useMemo(
    () => recruits.find((recruit) => recruit.id === selectedRecruitId) ?? null,
    [recruits, selectedRecruitId],
  );
  const selectedActivities = useMemo(
    () => (selectedRecruit ? activities.filter((activity) => matchesRecruitActivity(activity, selectedRecruit)) : []),
    [activities, selectedRecruit],
  );

  function openRecruit(recruitId: string) {
    setIsCreateOpen(false);
    setSelectedRecruitId(recruitId);
  }

  function moveRecruit(recruitId: string, stage: Recruit["stage"]) {
    const recruit = recruits.find((item) => item.id === recruitId);
    if (!recruit || recruit.stage === stage || !canMoveRecruit) return;

    const formData = new FormData();
    formData.set("recruitId", recruitId);
    formData.set("stage", stage);

    startMoveTransition(async () => {
      const result = await updateRecruitStageAction(formData);
      if (isActionFormState(result)) {
        setDropState(result);
        if (result.status === "success") {
          router.refresh();
        }
      }
    });
  }

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label>
            <span className="sr-only">Filter by recruit status</span>
            <select
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-card sm:w-48"
              onChange={(event) => setRecruitFilter(event.target.value as "all" | "active")}
              value={recruitFilter}
            >
              <option value="all">All recruits</option>
              <option value="active">Active recruits</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by recruiting stage</span>
            <select
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-card sm:w-52"
              onChange={(event) => setStageFilter(event.target.value as "all" | Recruit["stage"])}
              value={stageFilter}
            >
              <option value="all">All stages</option>
              {stages.map((stage) => (
                <option key={stage} value={stage}>{stage}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by recruit heat</span>
            <select
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-card sm:w-44"
              onChange={(event) => setHeatFilter(event.target.value as "all" | Recruit["heatScore"])}
              value={heatFilter}
            >
              <option value="all">All heat</option>
              {heatScores.map((score) => (
                <option key={score} value={score}>{score}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium text-text-secondary">{filteredRecruits.length} of {recruits.length} recruits</p>
          {canCreate ? (
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
          ) : null}
        </div>
      </div>
      <ActionFeedback state={dropState} className="mb-4" />
      <div className="overflow-x-auto pb-2">
        <div className={cn("grid gap-3", stageFilter === "all" ? "min-w-[88rem] grid-cols-6" : "min-w-[24rem] grid-cols-1")}>
          {visibleStages.map((stage) => {
            const stageRecruits = filteredRecruits.filter((recruit) => recruit.stage === stage);

            return (
              <section
                key={stage}
                className={cn(
                  "rounded-lg border border-border bg-surface-muted p-3 transition",
                  draggedRecruitId && canMoveRecruit && "border-accent/60 bg-accent/5",
                  isMoving && "opacity-80",
                )}
                onDragOver={(event) => {
                  if (!canMoveRecruit) return;
                  event.preventDefault();
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (draggedRecruitId) {
                    moveRecruit(draggedRecruitId, stage);
                    setDraggedRecruitId(null);
                  }
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-text-primary">{stage}</h2>
                  <Badge>{stageRecruits.length}</Badge>
                </div>
                <div className="space-y-3">
                  {stageRecruits.map((recruit) => (
                    <Card
                      key={recruit.id}
                      className={cn(
                        "p-3 shadow-none transition hover:border-accent/40 hover:bg-surface",
                        canMoveRecruit ? "cursor-grab active:cursor-grabbing" : "cursor-pointer",
                        draggedRecruitId === recruit.id && "border-accent opacity-60",
                      )}
                      draggable={canMoveRecruit}
                      onClick={() => openRecruit(recruit.id)}
                      onDragEnd={() => setDraggedRecruitId(null)}
                      onDragStart={() => setDraggedRecruitId(recruit.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          openRecruit(recruit.id);
                        }
                      }}
                      role="button"
                      tabIndex={0}
                    >
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
