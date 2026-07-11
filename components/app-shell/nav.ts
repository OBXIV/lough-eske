import {
  BarChart3,
  BriefcaseBusiness,
  ClipboardList,
  Home,
  Landmark,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import type { ComponentType } from "react";

import type { FeatureKey, PermissionKey } from "@/types/domain";

export const navItems: Array<{
  label: string;
  href: string;
  group: string;
  permission: PermissionKey;
  feature?: FeatureKey;
  icon: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}> = [
  { label: "Dashboard", href: "/app/dashboard", group: "Overview", permission: "view_dashboard", icon: Home },
  { label: "Agents", href: "/app/agents", group: "Brokerage", permission: "view_agents", icon: Users },
  { label: "Recruiting", href: "/app/recruiting", group: "Recruiting", permission: "view_recruiting", icon: UserRound },
  { label: "Transactions", href: "/app/transactions", group: "Transactions", permission: "view_transactions", icon: BriefcaseBusiness },
  { label: "Tasks", href: "/app/tasks", group: "Operations", permission: "manage_tasks", icon: ClipboardList },
  { label: "Reports", href: "/app/reports", group: "Intelligence", permission: "view_reports", feature: "reports", icon: BarChart3 },
  { label: "Agent Portal", href: "/app/agent-portal", group: "Agent Services", permission: "view_agent_portal", feature: "agent_portal", icon: Landmark },
  { label: "Settings", href: "/app/settings", group: "Admin", permission: "manage_settings", icon: Settings },
];
