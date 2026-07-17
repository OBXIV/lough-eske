import type { PermissionKey, RoleName } from "@/types/domain";

export const rolePermissions: Record<RoleName, PermissionKey[]> = {
  "Platform Admin": [
    "view_dashboard",
    "view_agents",
    "create_agents",
    "edit_agents",
    "delete_agents",
    "view_recruiting",
    "create_recruits",
    "edit_recruits",
    "delete_recruits",
    "view_transactions",
    "create_transactions",
    "edit_transactions",
    "delete_transactions",
    "view_reports",
    "view_financials",
    "manage_tasks",
    "manage_notes",
    "manage_users",
    "manage_settings",
    "view_agent_portal",
    "manage_agent_resources",
  ],
  "Broker Owner": [
    "view_dashboard",
    "view_agents",
    "create_agents",
    "edit_agents",
    "view_recruiting",
    "create_recruits",
    "edit_recruits",
    "view_transactions",
    "create_transactions",
    "edit_transactions",
    "view_reports",
    "view_financials",
    "manage_tasks",
    "manage_notes",
    "manage_users",
    "manage_settings",
    "view_agent_portal",
    "manage_agent_resources",
  ],
  "CFO / Finance": ["view_dashboard", "view_agents", "view_transactions", "view_reports", "view_financials"],
  "Office Admin": [
    "view_dashboard",
    "view_agents",
    "edit_agents",
    "view_transactions",
    "manage_tasks",
    "manage_notes",
    "manage_users",
    "manage_settings",
  ],
  Recruiter: [
    "view_dashboard",
    "view_agents",
    "view_recruiting",
    "create_recruits",
    "edit_recruits",
    "manage_tasks",
    "manage_notes",
  ],
  "Transaction Coordinator": [
    "view_dashboard",
    "view_agents",
    "view_transactions",
    "edit_transactions",
    "manage_tasks",
    "manage_notes",
  ],
  "Read Only": ["view_dashboard", "view_agents", "view_recruiting", "view_transactions", "view_reports"],
  "Agent Portal User": ["view_agent_portal"],
};

export const roleDescriptions: Record<RoleName, string> = {
  "Platform Admin": "Can administer the SaaS platform across tenants.",
  "Broker Owner": "Brokerage owner with full tenant visibility.",
  "CFO / Finance": "Finance leader focused on transactions and reports.",
  "Office Admin": "Administrative operator for brokerage settings and tasks.",
  Recruiter: "Recruiting team member.",
  "Transaction Coordinator": "Transaction pipeline operator.",
  "Read Only": "Read-only tenant user.",
  "Agent Portal User": "Agent-facing portal user.",
};

export const roleScopes: Record<RoleName, "platform" | "tenant"> = {
  "Platform Admin": "platform",
  "Broker Owner": "tenant",
  "CFO / Finance": "tenant",
  "Office Admin": "tenant",
  Recruiter: "tenant",
  "Transaction Coordinator": "tenant",
  "Read Only": "tenant",
  "Agent Portal User": "tenant",
};

export function canAccess(permissions: PermissionKey[], permission: PermissionKey) {
  return permissions.includes(permission);
}

export function getDefaultRoute(permissions: PermissionKey[]) {
  const routePreference: Array<{ permission: PermissionKey; href: string }> = [
    { permission: "view_dashboard", href: "/app/dashboard" },
    { permission: "view_agent_portal", href: "/app/agent-portal" },
    { permission: "view_agents", href: "/app/agents" },
    { permission: "view_recruiting", href: "/app/recruiting" },
    { permission: "view_transactions", href: "/app/transactions" },
    { permission: "manage_tasks", href: "/app/tasks" },
    { permission: "view_reports", href: "/app/reports" },
    { permission: "manage_settings", href: "/app/settings" },
  ];

  return routePreference.find((route) => canAccess(permissions, route.permission))?.href ?? "/login";
}
