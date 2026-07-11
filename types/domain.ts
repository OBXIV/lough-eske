export type RoleName =
  | "Platform Admin"
  | "Broker Owner"
  | "CFO / Finance"
  | "Office Admin"
  | "Recruiter"
  | "Transaction Coordinator"
  | "Read Only"
  | "Agent Portal User";

export type PermissionKey =
  | "view_dashboard"
  | "view_agents"
  | "create_agents"
  | "edit_agents"
  | "delete_agents"
  | "view_recruiting"
  | "create_recruits"
  | "edit_recruits"
  | "delete_recruits"
  | "view_transactions"
  | "create_transactions"
  | "edit_transactions"
  | "delete_transactions"
  | "view_reports"
  | "view_financials"
  | "manage_tasks"
  | "manage_notes"
  | "manage_users"
  | "manage_settings"
  | "view_agent_portal"
  | "manage_agent_resources";

export type PlanKey = "core" | "growth" | "scale";

export type FeatureKey = "reports" | "agent_portal" | "mls_sync";

export type TenantEntitlements = {
  planId: string;
  planKey: PlanKey;
  planName: string;
  baseSeatLimit: number;
  subscribedSeats: number;
  activeSeats: number;
  invitedSeats: number;
  occupiedSeats: number;
  availableSeats: number;
  basePriceCents: number;
  perSeatPriceCents: number;
  monthlyPriceCents: number;
  features: FeatureKey[];
};

export type Tenant = {
  id: string;
  name: string;
  slug: string;
  status: "active" | "demo" | "prospect" | "inactive";
  primaryColor: string;
};

export type UserSession = {
  user: {
    id: string;
    profileId: string;
    name: string;
    email: string;
  };
  tenant: Tenant;
  role: RoleName;
  permissions: PermissionKey[];
};

export type DemoUser = {
  id: string;
  profileId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleName;
  tenantId: string;
};

export type Agent = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  brokerageStatus: "active" | "inactive" | "recruit" | "onboarding" | "former";
  licenseNumber: string;
  source: string;
  productionYtd: number;
  gciYtd: number;
  lastCloseDate: string;
  archivedAt?: string | null;
  archivedBy?: string | null;
  assignedOwner: string;
};

export type Recruit = {
  id: string;
  name: string;
  stage: "Identified" | "Contacted" | "Engaged" | "Offer Pending" | "Joined" | "Lost";
  heatScore: "Hot" | "Warm" | "Cold";
  recruitScore: number;
  source: string;
  nextFollowUpDate: string;
  notesSummary: string;
};

export type Transaction = {
  id: string;
  agent: string;
  clientName: string;
  propertyAddress: string;
  transactionType: "Buyer" | "Seller" | "Dual" | "Referral";
  stage: "Lead" | "Listing" | "Under Contract" | "Inspection" | "Clear to Close" | "Closed" | "Cancelled";
  listPrice: number;
  estimatedGci: number;
  expectedCloseDate: string;
  status: "active" | "closed" | "cancelled";
  finalizedAt?: string | null;
  finalizedBy?: string | null;
};

export type Task = {
  id: string;
  title: string;
  description: string | null;
  relatedRecord: string;
  relatedType: string;
  assignee: string | null;
  assigneeId: string | null;
  dueDate: string;
  priority: "low" | "normal" | "high" | "urgent";
  status: "open" | "in_progress" | "complete" | "cancelled";
  createdAt: string;
};

export type TenantMember = {
  profileId: string;
  name: string;
  role: string;
};

export type ActivityLog = {
  id: string;
  action: string;
  entityId?: string;
  entityType: string;
  actor: string;
  createdAt: string;
};
