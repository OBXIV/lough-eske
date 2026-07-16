"use client";

import { useMemo, useState } from "react";
import { ChevronRight, Handshake } from "lucide-react";

import { DetailField } from "@/components/broker-portal/detail-fields";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { formatDate } from "@/lib/utils";
import type { AgentReferral } from "@/types/domain";

type ReferralPanelProps = {
  referrals: AgentReferral[];
};

const statusLabels: Record<AgentReferral["status"], string> = {
  new: "New",
  contacted: "Contacted",
  active: "Active",
  closed: "Closed",
  lost: "Lost",
};

function statusVariant(status: AgentReferral["status"]) {
  if (status === "new") return "info";
  if (status === "contacted") return "warning";
  if (status === "active") return "success";
  if (status === "lost") return "danger";
  return "default";
}

export function ReferralPanel({ referrals }: ReferralPanelProps) {
  const [selectedReferralId, setSelectedReferralId] = useState<string | null>(null);
  const selectedReferral = useMemo(
    () => referrals.find((referral) => referral.id === selectedReferralId) ?? null,
    [referrals, selectedReferralId],
  );

  if (referrals.length === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm font-medium text-text-primary">No referrals tracked yet.</p>
        <p className="mt-1 text-sm text-text-secondary">Referrals captured for you by your brokerage will appear here with status.</p>
      </Card>
    );
  }

  return (
    <>
      <Card className="divide-y divide-border p-0">
        {referrals.map((referral) => (
          <button
            key={referral.id}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-surface-muted"
            onClick={() => setSelectedReferralId(referral.id)}
            type="button"
          >
            <span className="flex min-w-0 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                <Handshake className="h-4 w-4" aria-hidden />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-text-primary">{referral.referralName}</span>
                <span className="mt-0.5 block truncate text-xs text-text-secondary">
                  Added {formatDate(referral.createdAt)}
                </span>
              </span>
            </span>
            <span className="flex shrink-0 items-center gap-3">
              <Badge variant={statusVariant(referral.status)}>{statusLabels[referral.status]}</Badge>
              <ChevronRight className="h-4 w-4 text-text-secondary" aria-hidden />
            </span>
          </button>
        ))}
      </Card>
      <DetailDrawer
        eyebrow="Referral record"
        isOpen={Boolean(selectedReferral)}
        onClose={() => setSelectedReferralId(null)}
        title={selectedReferral?.referralName ?? "Referral"}
      >
        {selectedReferral ? (
          <div className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2">
              <DetailField
                label="Status"
                value={<Badge variant={statusVariant(selectedReferral.status)}>{statusLabels[selectedReferral.status]}</Badge>}
              />
              <DetailField label="Added" value={formatDate(selectedReferral.createdAt)} />
              <DetailField label="Email" value={selectedReferral.referralEmail || "Not recorded"} />
              <DetailField label="Phone" value={selectedReferral.referralPhone || "Not recorded"} />
              <DetailField label="Last updated" value={formatDate(selectedReferral.updatedAt)} />
            </dl>
            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <h3 className="text-sm font-semibold text-text-primary">Notes</h3>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                {selectedReferral.notes || "No notes recorded for this referral yet."}
              </p>
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
