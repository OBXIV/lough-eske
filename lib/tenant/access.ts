import { demoTenant, placeholderTenants } from "@/lib/data/demo";
import type { Tenant, UserSession } from "@/types/domain";

export function canAccessTenant(session: UserSession, tenantId: string) {
  return session.role === "Platform Admin" || session.tenant.id === tenantId;
}

export function getVisibleTenants(session: UserSession): Tenant[] {
  if (session.role === "Platform Admin") {
    return [demoTenant, ...placeholderTenants];
  }

  return [session.tenant];
}
