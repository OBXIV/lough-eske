import { LockKeyhole } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { FEATURE_LABELS } from "@/lib/entitlements/catalog";
import type { FeatureKey, TenantEntitlements } from "@/types/domain";

type FeatureUnavailableProps = {
  feature: FeatureKey;
  entitlements: TenantEntitlements;
};

export function FeatureUnavailable({ feature, entitlements }: FeatureUnavailableProps) {
  const featureName = FEATURE_LABELS[feature];

  return (
    <>
      <PageHeader
        title={`${featureName} is not included`}
        subtitle={`This workspace is on the ${entitlements.planName} plan.`}
        eyebrow="Plan access"
      />
      <Card className="max-w-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-md bg-surface-muted p-2 text-accent">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-text-primary">Plan entitlement required</h2>
              <Badge variant="info">{entitlements.planName}</Badge>
            </div>
            <p className="mt-2 text-sm leading-6 text-text-secondary">
              A Platform Admin must move this workspace to a plan that includes {featureName}. Tenant members cannot change plans themselves.
            </p>
          </div>
        </div>
      </Card>
    </>
  );
}
