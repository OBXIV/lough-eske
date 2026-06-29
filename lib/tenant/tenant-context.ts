import type { Tenant } from "@/types/domain";

export function getTenantAccentStyle(tenant: Tenant): React.CSSProperties {
  return {
    "--accent": tenant.primaryColor,
  } as React.CSSProperties;
}
