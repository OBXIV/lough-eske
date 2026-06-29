import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, TableCell, TableHead } from "@/components/ui/table";
import { requirePermission } from "@/lib/auth/session";
import { getTenantProfile, getVisibleTenantsForSession } from "@/lib/data/app-data";
import { rolePermissions } from "@/lib/rbac/permissions";

export default async function SettingsPage() {
  const session = await requirePermission("manage_settings");
  const [tenant, visibleTenants] = await Promise.all([
    getTenantProfile(session),
    getVisibleTenantsForSession(session),
  ]);
  const tenantPlaceholders = visibleTenants.filter((visibleTenant) => visibleTenant.id !== tenant.id);
  const roleNames = Object.keys(rolePermissions);

  return (
    <>
      <PageHeader
        title="Settings"
        subtitle="Tenant administration for identity, theme, users, role visibility, and environment safety."
        eyebrow="Admin"
      />
      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="p-5">
          <h2 className="text-base font-semibold text-text-primary">Tenant profile</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
              <dt className="text-text-secondary">Name</dt>
              <dd className="font-medium">{tenant.name}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
              <dt className="text-text-secondary">Accent</dt>
              <dd className="font-medium">{tenant.primaryColor}</dd>
            </div>
            <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
              <dt className="text-text-secondary">Current role</dt>
              <dd><Badge variant="accent">{session.role}</Badge></dd>
            </div>
          </dl>
          <h3 className="mt-6 text-sm font-semibold text-text-primary">Available tenants</h3>
          <div className="mt-3 space-y-2">
            {tenantPlaceholders.map((placeholderTenant) => (
              <div key={placeholderTenant.id} className="flex items-center justify-between rounded-md border border-border bg-surface-muted px-3 py-2 text-sm">
                <span>{placeholderTenant.name}</span>
                <Badge>{placeholderTenant.status}</Badge>
              </div>
            ))}
          </div>
        </Card>
        <DataTable>
          <thead>
            <tr>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {roleNames.map((roleName) => (
              <tr key={roleName} className="transition hover:bg-surface-muted">
                <TableCell className="font-medium">{roleName}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {rolePermissions[roleName as keyof typeof rolePermissions].map((permission) => (
                      <Badge key={permission}>{permission}</Badge>
                    ))}
                  </div>
                </TableCell>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </section>
    </>
  );
}
