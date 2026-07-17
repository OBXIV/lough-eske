"use client";

import { useActionState, useState } from "react";
import { Database, Eye, Palette, Save, ShieldCheck, Users } from "lucide-react";

import { updateTenantProfileAction } from "@/app/app/actions";
import { ActionFeedback, SubmitButton } from "@/components/broker-portal/action-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DetailDrawer } from "@/components/ui/detail-drawer";
import { DataTable, TableCell, TableHead } from "@/components/ui/table";
import { initialActionFormState } from "@/lib/action-state";
import { FEATURE_KEYS, FEATURE_LABELS } from "@/lib/entitlements/catalog";
import { formatDate } from "@/lib/utils";
import type { RoleDetail, Tenant, TenantEntitlements, TenantMember } from "@/types/domain";

type SettingsAdministrationProps = {
  actionsEnabled: boolean;
  databaseMode: boolean;
  entitlements: TenantEntitlements;
  environmentLabel: string;
  members: TenantMember[];
  roles: RoleDetail[];
  tenant: Tenant;
  visibleTenants: Tenant[];
};

function memberStatusVariant(status: TenantMember["status"]) {
  if (status === "active") return "success" as const;
  if (status === "invited") return "info" as const;
  if (status === "suspended") return "warning" as const;
  return "default" as const;
}

export function SettingsAdministration({
  actionsEnabled,
  databaseMode,
  entitlements,
  environmentLabel,
  members,
  roles,
  tenant,
  visibleTenants,
}: SettingsAdministrationProps) {
  const [state, formAction] = useActionState(updateTenantProfileAction, initialActionFormState);
  const [previewName, setPreviewName] = useState(tenant.name);
  const [previewColor, setPreviewColor] = useState(tenant.primaryColor);
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null);
  const selectedRole = roles.find((role) => role.id === selectedRoleId) ?? null;

  return (
    <>
      <section className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-text-secondary">Safe profile fields</p>
              <h2 className="mt-1 text-base font-semibold text-text-primary">Tenant branding</h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Update the tenant name and primary accent. Every saved change is written to the activity log.
              </p>
            </div>
            <div className="rounded-md bg-surface-muted p-2 text-accent">
              <Palette className="h-5 w-5" aria-hidden />
            </div>
          </div>

          <form action={formAction} className="mt-5 space-y-4">
            <label className="block text-sm font-medium text-text-primary">
              Tenant name
              <input
                className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                maxLength={80}
                minLength={2}
                name="name"
                onChange={(event) => setPreviewName(event.target.value)}
                required
                type="text"
                value={previewName}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="block text-sm font-medium text-text-primary">
                Accent color
                <input
                  className="mt-1.5 w-full rounded-md border border-border bg-surface px-3 py-2 font-mono text-sm uppercase outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/15"
                  name="primaryColor"
                  onChange={(event) => setPreviewColor(event.target.value.toUpperCase())}
                  pattern="#[0-9A-Fa-f]{6}"
                  required
                  type="text"
                  value={previewColor}
                />
              </label>
              <label className="flex h-10 cursor-pointer items-center gap-2 rounded-md border border-border bg-surface px-3 text-sm font-medium text-text-secondary">
                <input
                  aria-label="Choose accent color"
                  className="h-6 w-8 cursor-pointer border-0 bg-transparent p-0"
                  onChange={(event) => setPreviewColor(event.target.value.toUpperCase())}
                  type="color"
                  value={/^#[0-9A-Fa-f]{6}$/.test(previewColor) ? previewColor : tenant.primaryColor}
                />
                Choose
              </label>
            </div>

            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <div className="flex items-center gap-3">
                <span
                  aria-label="Accent preview"
                  className="h-10 w-10 rounded-md shadow-card"
                  style={{ backgroundColor: /^#[0-9A-Fa-f]{6}$/.test(previewColor) ? previewColor : tenant.primaryColor }}
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-text-primary">{previewName || "Tenant name preview"}</p>
                  <p className="mt-0.5 text-xs text-text-secondary">Live preview only until saved</p>
                </div>
              </div>
            </div>

            <SubmitButton disabled={!actionsEnabled} icon={Save} label="Save branding" pendingLabel="Saving branding" />
            <ActionFeedback
              disabledMessage={!actionsEnabled ? "Branding writes are disabled for this workspace." : undefined}
              state={state}
            />
          </form>
        </Card>

        <Card className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-text-secondary">Deployment context</p>
              <h2 className="mt-1 text-base font-semibold text-text-primary">Environment and features</h2>
              <p className="mt-1 text-sm leading-6 text-text-secondary">
                Runtime state and plan-backed feature gates for the current tenant.
              </p>
            </div>
            <div className="rounded-md bg-surface-muted p-2 text-accent">
              <Database className="h-5 w-5" aria-hidden />
            </div>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-surface-muted p-3">
              <dt className="text-xs font-semibold uppercase tracking-normal text-text-secondary">Environment</dt>
              <dd className="mt-2"><Badge variant={environmentLabel === "Prod" ? "warning" : "info"}>{environmentLabel}</Badge></dd>
            </div>
            <div className="rounded-md border border-border bg-surface-muted p-3">
              <dt className="text-xs font-semibold uppercase tracking-normal text-text-secondary">Data source</dt>
              <dd className="mt-2"><Badge variant={databaseMode ? "success" : "default"}>{databaseMode ? "Database" : "Fallback"}</Badge></dd>
            </div>
            <div className="rounded-md border border-border bg-surface-muted p-3">
              <dt className="text-xs font-semibold uppercase tracking-normal text-text-secondary">Writes</dt>
              <dd className="mt-2"><Badge variant={actionsEnabled ? "success" : "warning"}>{actionsEnabled ? "Enabled" : "Read only"}</Badge></dd>
            </div>
          </dl>

          <div className="mt-5 space-y-2">
            {FEATURE_KEYS.map((feature) => {
              const enabled = entitlements.features.includes(feature);
              return (
                <div key={feature} className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2.5 text-sm">
                  <div>
                    <p className="font-medium text-text-primary">{FEATURE_LABELS[feature]}</p>
                    <p className="mt-0.5 text-xs text-text-secondary">Controlled by the {entitlements.planName} plan</p>
                  </div>
                  <Badge variant={enabled ? "success" : "default"}>{enabled ? "Enabled" : "Unavailable"}</Badge>
                </div>
              );
            })}
          </div>

          <div className="mt-5 border-t border-border pt-4">
            <p className="text-xs font-semibold uppercase tracking-normal text-text-secondary">Visible tenants</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {visibleTenants.map((visibleTenant) => (
                <Badge key={visibleTenant.id} variant={visibleTenant.id === tenant.id ? "accent" : "default"}>
                  {visibleTenant.name} · {visibleTenant.status}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="overflow-hidden">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-normal text-text-secondary">Tenant access</p>
              <h2 className="mt-1 text-base font-semibold text-text-primary">Members</h2>
              <p className="mt-1 text-sm text-text-secondary">Membership status and assigned role, including reserved invited seats.</p>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-text-secondary" aria-hidden />
              <Badge>{members.length}</Badge>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <caption className="sr-only">Members of {tenant.name}</caption>
              <thead>
                <tr>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {members.map((member) => {
                  const memberRole = roles.find((role) => role.name === member.role);
                  return (
                    <tr key={member.profileId}>
                      <TableCell>
                        <p className="font-medium">{member.name}</p>
                        <p className="mt-0.5 text-xs text-text-secondary">{member.email}</p>
                      </TableCell>
                      <TableCell>
                        <button
                          className="font-medium text-accent hover:underline"
                          onClick={() => setSelectedRoleId(memberRole?.id ?? null)}
                          type="button"
                        >
                          {member.role}
                        </button>
                      </TableCell>
                      <TableCell><Badge variant={memberStatusVariant(member.status)}>{member.status}</Badge></TableCell>
                      <TableCell className="text-text-secondary">{formatDate(member.joinedAt)}</TableCell>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-border bg-surface-muted px-5 py-3 text-xs text-text-secondary">
            Invitations, role reassignment, suspension, and removal remain intentionally deferred until stronger audit and approval controls ship.
          </p>
        </Card>

        <DataTable>
          <caption className="sr-only">Available roles and permission counts</caption>
          <thead>
            <tr>
              <TableHead>Role</TableHead>
              <TableHead>Scope</TableHead>
              <TableHead>Access</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {roles.map((role) => (
              <tr className="transition hover:bg-surface-muted" key={role.id}>
                <TableCell>
                  <button className="text-left font-medium text-accent hover:underline" onClick={() => setSelectedRoleId(role.id)} type="button">
                    {role.name}
                  </button>
                  <p className="mt-1 max-w-xs text-xs text-text-secondary">{role.description}</p>
                </TableCell>
                <TableCell><Badge variant={role.scope === "platform" ? "warning" : "default"}>{role.scope}</Badge></TableCell>
                <TableCell><Badge>{role.permissions.length} permissions</Badge></TableCell>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>

      <DetailDrawer
        eyebrow={selectedRole?.scope === "platform" ? "Platform role" : "Tenant role"}
        isOpen={Boolean(selectedRole)}
        onClose={() => setSelectedRoleId(null)}
        title={selectedRole?.name ?? "Role details"}
      >
        {selectedRole ? (
          <div className="space-y-5">
            <div className="rounded-lg border border-border bg-surface-muted p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-surface p-2 text-accent"><ShieldCheck className="h-5 w-5" aria-hidden /></div>
                <div>
                  <p className="font-medium text-text-primary">{selectedRole.description}</p>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    This sprint exposes role configuration for inspection only. Role editing remains deferred.
                  </p>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold text-text-primary">Granted permissions</h3>
                <Badge>{selectedRole.permissions.length}</Badge>
              </div>
              <div className="mt-3 space-y-2">
                {selectedRole.permissions.map((permission) => (
                  <div className="flex items-start gap-3 rounded-md border border-border p-3" key={permission.key}>
                    <Eye className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                    <div>
                      <p className="font-mono text-xs font-semibold text-text-primary">{permission.key}</p>
                      <p className="mt-1 text-sm text-text-secondary">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </DetailDrawer>
    </>
  );
}
