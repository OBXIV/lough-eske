"use client";

import { useActionState, useMemo, useState } from "react";
import { ExternalLink, Library, Plus, Search, Upload, X } from "lucide-react";

import { publishAgentResourceAction } from "@/app/app/actions";
import { ActionFeedback, SubmitButton } from "@/components/broker-portal/action-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { initialActionFormState } from "@/lib/action-state";
import { formatDate } from "@/lib/utils";
import type { AgentResource } from "@/types/domain";

type ResourceLibraryProps = {
  actionsEnabled: boolean;
  canManage: boolean;
  resources: AgentResource[];
};

const resourceTypes: AgentResource["resourceType"][] = ["Link", "PDF", "Video", "Training", "Policy", "Template"];

function typeVariant(resourceType: AgentResource["resourceType"]) {
  if (resourceType === "Policy") return "warning";
  if (resourceType === "Training") return "info";
  if (resourceType === "Template") return "success";
  return "accent";
}

type PublishResourceFormProps = {
  actionsEnabled: boolean;
};

function PublishResourceForm({ actionsEnabled }: PublishResourceFormProps) {
  const [state, formAction] = useActionState(publishAgentResourceAction, initialActionFormState);

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold text-text-primary">Publish a resource</h3>
      <p className="mt-1 text-sm leading-5 text-text-secondary">
        Published resources appear in every agent&apos;s library. Staff-only drafts stay hidden from the portal until published.
      </p>
      <form action={formAction} className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="text-sm font-medium text-text-primary sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-normal text-text-secondary">Title</span>
          <input
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="title"
            placeholder="Buyer agreement walkthrough"
            required
            type="text"
          />
        </label>
        <label className="text-sm font-medium text-text-primary">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-normal text-text-secondary">Type</span>
          <select
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue="Training"
            disabled={!actionsEnabled}
            name="resourceType"
          >
            {resourceTypes.map((resourceType) => (
              <option key={resourceType} value={resourceType}>{resourceType}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-text-primary">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-normal text-text-secondary">Audience</span>
          <select
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            defaultValue="all_agents"
            disabled={!actionsEnabled}
            name="visibility"
          >
            <option value="all_agents">All agents</option>
            <option value="staff_only">Staff only (draft)</option>
          </select>
        </label>
        <label className="text-sm font-medium text-text-primary sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-normal text-text-secondary">URL (optional)</span>
          <input
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="url"
            placeholder="https://"
            type="url"
          />
        </label>
        <label className="text-sm font-medium text-text-primary sm:col-span-2">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-normal text-text-secondary">Description (optional)</span>
          <textarea
            className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary"
            disabled={!actionsEnabled}
            name="description"
            placeholder="What agents should use this for"
            rows={2}
          />
        </label>
        <div className="sm:col-span-2">
          <SubmitButton disabled={!actionsEnabled} icon={Upload} label="Publish resource" pendingLabel="Publishing" />
        </div>
      </form>
      <ActionFeedback
        disabledMessage={!actionsEnabled ? "Writes are disabled in this environment." : undefined}
        state={state}
      />
    </Card>
  );
}

export function ResourceLibrary({ actionsEnabled, canManage, resources }: ResourceLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | AgentResource["resourceType"]>("all");
  const [showPublishForm, setShowPublishForm] = useState(false);
  const filteredResources = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return resources.filter((resource) => (
      (typeFilter === "all" || resource.resourceType === typeFilter) &&
      (!query || [resource.title, resource.description].some((value) => value.toLowerCase().includes(query)))
    ));
  }, [resources, searchTerm, typeFilter]);

  return (
    <section>
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <label className="relative min-w-0 sm:w-72">
            <span className="sr-only">Search resources</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" aria-hidden />
            <input
              className="w-full rounded-md border border-border bg-surface px-9 py-2 text-sm text-text-primary shadow-card"
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search title or description"
              type="search"
              value={searchTerm}
            />
            {searchTerm ? (
              <button
                aria-label="Clear resource search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-text-secondary transition hover:text-text-primary"
                onClick={() => setSearchTerm("")}
                type="button"
              >
                <X className="h-4 w-4" aria-hidden />
              </button>
            ) : null}
          </label>
          <label>
            <span className="sr-only">Filter resources by type</span>
            <select
              className="w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-card sm:w-44"
              onChange={(event) => setTypeFilter(event.target.value as "all" | AgentResource["resourceType"])}
              value={typeFilter}
            >
              <option value="all">All types</option>
              {resourceTypes.map((resourceType) => (
                <option key={resourceType} value={resourceType}>{resourceType}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex items-center gap-3">
          <p className="shrink-0 text-sm font-medium text-text-secondary">{filteredResources.length} of {resources.length} resources</p>
          {canManage ? (
            <button
              className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text-primary shadow-card transition hover:bg-surface-muted"
              onClick={() => setShowPublishForm((open) => !open)}
              type="button"
            >
              <Plus className="h-4 w-4" aria-hidden />
              {showPublishForm ? "Hide publish form" : "New resource"}
            </button>
          ) : null}
        </div>
      </div>
      {canManage && showPublishForm ? (
        <div className="mb-4">
          <PublishResourceForm actionsEnabled={actionsEnabled} />
        </div>
      ) : null}
      {filteredResources.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="flex h-full flex-col p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                  <Library className="h-4 w-4" aria-hidden />
                </span>
                <div className="flex items-center gap-2">
                  {canManage && resource.visibility === "staff_only" ? <Badge variant="warning">Staff only</Badge> : null}
                  <Badge variant={typeVariant(resource.resourceType)}>{resource.resourceType}</Badge>
                </div>
              </div>
              <h3 className="text-sm font-semibold text-text-primary">{resource.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-5 text-text-secondary">{resource.description || "No description provided."}</p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
                <p className="text-xs text-text-secondary">
                  {resource.publishedBy ? `${resource.publishedBy} - ` : ""}{formatDate(resource.createdAt)}
                </p>
                {resource.url ? (
                  <a
                    className="inline-flex items-center gap-1 text-sm font-semibold text-accent"
                    href={resource.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    Open
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-10 text-center">
          <p className="text-sm font-medium text-text-primary">No resources match this filter.</p>
          <p className="mt-1 text-sm text-text-secondary">
            {resources.length === 0
              ? "Your brokerage has not published any resources yet."
              : "Try a different search term or resource type."}
          </p>
        </Card>
      )}
    </section>
  );
}
