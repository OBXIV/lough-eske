import { CheckCircle2, CircleDollarSign, Users } from "lucide-react";

import { SettingsAdministration } from "@/components/settings/settings-administration";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";
import {
  getRoleDetails,
  getTenantEntitlements,
  getTenantMembers,
  getTenantProfile,
  getVisibleTenantsForSession,
} from "@/lib/data/app-data";
import { areTenantWritesEnabled, isDatabaseConfigured } from "@/lib/data/database";
import { getDeploymentEnvironmentLabel } from "@/lib/deployment/environment";
import { FEATURE_KEYS, FEATURE_LABELS } from "@/lib/entitlements/catalog";
import { formatCurrency } from "@/lib/utils";

export default async function SettingsPage() {
  const session = await requirePermission("manage_settings");
  const [tenant, visibleTenants, entitlements, members, roles] = await Promise.all([
    getTenantProfile(session),
    getVisibleTenantsForSession(session),
    getTenantEntitlements(session),
    getTenantMembers(session),
    getRoleDetails(session),
  ]);

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Tenant administration for identity, plan access, seats, roles, and environment safety."
        eyebrow="Admin"
      />
      <section className="mb-4 grid gap-4 lg:grid-cols-3">
        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="rounded-md bg-surface-muted p-2 text-accent">
              <CircleDollarSign className="h-5 w-5" aria-hidden="true" />
            </div>
            <Badge variant="info">{entitlements.planName}</Badge>
          </div>
          <h2 className="mt-5 text-base font-semibold text-text-primary">Plan and billing</h2>
          <p className="mt-2 text-3xl font-semibold text-text-primary">
            {formatCurrency(entitlements.monthlyPriceCents / 100)}
            <span className="ml-1 text-sm font-normal text-text-secondary">/ month</span>
          </p>
          <p className="mt-3 text-sm leading-6 text-text-secondary">
            {formatCurrency(entitlements.basePriceCents / 100)} includes {entitlements.baseSeatLimit} seats. Additional subscribed seats are {formatCurrency(entitlements.perSeatPriceCents / 100)} each.
          </p>
          <p className="mt-4 text-xs text-text-secondary">Plan and seat changes require Platform Admin access.</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="rounded-md bg-surface-muted p-2 text-accent">
              <Users className="h-5 w-5" aria-hidden="true" />
            </div>
            <Badge variant={entitlements.availableSeats > 0 ? "default" : "warning"}>
              {entitlements.availableSeats} available
            </Badge>
          </div>
          <h2 className="mt-5 text-base font-semibold text-text-primary">Seat usage</h2>
          <p className="mt-2 text-3xl font-semibold text-text-primary">
            {entitlements.occupiedSeats}
            <span className="ml-1 text-sm font-normal text-text-secondary">of {entitlements.subscribedSeats} occupied</span>
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface-muted">
            <div
              aria-label="Occupied tenant seats"
              aria-valuemax={entitlements.subscribedSeats}
              aria-valuemin={0}
              aria-valuenow={entitlements.occupiedSeats}
              className="h-full rounded-full bg-accent"
              role="progressbar"
              style={{ width: `${Math.min(100, (entitlements.occupiedSeats / entitlements.subscribedSeats) * 100)}%` }}
            />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-text-secondary">Active</dt>
              <dd className="mt-1 font-semibold text-text-primary">{entitlements.activeSeats}</dd>
            </div>
            <div>
              <dt className="text-text-secondary">Invited</dt>
              <dd className="mt-1 font-semibold text-text-primary">{entitlements.invitedSeats}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="rounded-md bg-surface-muted p-2 text-accent">
              <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
            </div>
            <Badge>{entitlements.features.length} included</Badge>
          </div>
          <h2 className="mt-5 text-base font-semibold text-text-primary">Feature access</h2>
          <div className="mt-4 space-y-3">
            {FEATURE_KEYS.map((feature) => {
              const included = entitlements.features.includes(feature);
              return (
                <div key={feature} className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-muted px-3 py-2 text-sm">
                  <span className="font-medium text-text-primary">{FEATURE_LABELS[feature]}</span>
                  <Badge variant={included ? "success" : "default"}>{included ? "Included" : "Not included"}</Badge>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
      <SettingsAdministration
        actionsEnabled={areTenantWritesEnabled(session)}
        databaseMode={isDatabaseConfigured()}
        entitlements={entitlements}
        environmentLabel={getDeploymentEnvironmentLabel()}
        members={members}
        roles={roles}
        tenant={tenant}
        visibleTenants={visibleTenants}
      />
    </>
  );
}
