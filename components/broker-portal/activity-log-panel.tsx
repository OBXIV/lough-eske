"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDateTime } from "@/lib/utils";
import type { ActivityLog } from "@/types/domain";

type ActivityLogPanelProps = {
  activities: ActivityLog[];
};

export function ActivityLogPanel({ activities }: ActivityLogPanelProps) {
  const [entityFilter, setEntityFilter] = useState("all");
  const [actorFilter, setActorFilter] = useState("all");

  const entityTypes = useMemo(
    () => Array.from(new Set(activities.map((activity) => activity.entityType))).sort(),
    [activities],
  );
  const actors = useMemo(
    () => Array.from(new Set(activities.map((activity) => activity.actor))).sort(),
    [activities],
  );
  const filteredActivities = activities.filter(
    (activity) =>
      (entityFilter === "all" || activity.entityType === entityFilter) &&
      (actorFilter === "all" || activity.actor === actorFilter),
  );

  const filterSelectClass = "w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-card sm:w-44";

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Activity log</h2>
          <p className="mt-1 text-sm text-text-secondary">Tenant-scoped actions filtered by record type and actor.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <label>
            <span className="sr-only">Filter activity by record type</span>
            <select
              className={filterSelectClass}
              onChange={(event) => setEntityFilter(event.target.value)}
              value={entityFilter}
            >
              <option value="all">All record types</option>
              {entityTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="sr-only">Filter activity by actor</span>
            <select
              className={filterSelectClass}
              onChange={(event) => setActorFilter(event.target.value)}
              value={actorFilter}
            >
              <option value="all">All actors</option>
              {actors.map((actor) => (
                <option key={actor} value={actor}>{actor}</option>
              ))}
            </select>
          </label>
          <p className="text-sm font-medium text-text-secondary">{filteredActivities.length} of {activities.length} entries</p>
        </div>
      </div>
      <div className="mt-4 space-y-1">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="flex gap-3 rounded-md px-2 py-3 transition hover:bg-surface-muted">
            <Badge variant="info" className="h-fit">{activity.entityType}</Badge>
            <div className="min-w-0">
              <p className="text-sm font-medium text-text-primary">{activity.action}</p>
              <p className="mt-1 text-xs text-text-secondary">
                {activity.actor} - {formatDateTime(activity.createdAt)}
              </p>
            </div>
          </div>
        ))}
        {filteredActivities.length === 0 ? (
          <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-8 text-center text-sm text-text-secondary">
            No activity matches these filters.
          </p>
        ) : null}
      </div>
    </Card>
  );
}
