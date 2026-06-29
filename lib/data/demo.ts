import { rolePermissions } from "@/lib/rbac/permissions";
import type { ActivityLog, Agent, DemoUser, Recruit, Task, Tenant, Transaction, UserSession } from "@/types/domain";

export const demoTenant: Tenant & { metrics: { agents: number; recruits: number; transactions: number } } = {
  id: "11111111-1111-4111-8111-111111111111",
  name: "Demo Brokerage",
  slug: "demo-brokerage",
  status: "demo",
  primaryColor: "#2563EB",
  metrics: {
    agents: 10,
    recruits: 8,
    transactions: 6,
  },
};

export const placeholderTenants: Tenant[] = [
  {
    id: "22222222-2222-4222-8222-222222222222",
    name: "Point Realty",
    slug: "point-realty",
    status: "prospect",
    primaryColor: "#0F766E",
  },
  {
    id: "33333333-3333-4333-8333-333333333333",
    name: "California Brokerage",
    slug: "california-brokerage",
    status: "prospect",
    primaryColor: "#B45309",
  },
];

export const demoUsers: DemoUser[] = [
  {
    id: "90000000-0000-4000-8000-000000000000",
    profileId: "91000000-0000-4000-8000-000000000000",
    firstName: "Alex",
    lastName: "Reyes",
    email: "platform.admin@obliox.io",
    role: "Platform Admin",
    tenantId: demoTenant.id,
  },
  {
    id: "90000000-0000-4000-8000-000000000001",
    profileId: "91000000-0000-4000-8000-000000000001",
    firstName: "Morgan",
    lastName: "Hale",
    email: "demo.owner@obliox.io",
    role: "Broker Owner",
    tenantId: demoTenant.id,
  },
  {
    id: "90000000-0000-4000-8000-000000000002",
    profileId: "91000000-0000-4000-8000-000000000002",
    firstName: "Parker",
    lastName: "Vale",
    email: "demo.cfo@obliox.io",
    role: "CFO / Finance",
    tenantId: demoTenant.id,
  },
  {
    id: "90000000-0000-4000-8000-000000000003",
    profileId: "91000000-0000-4000-8000-000000000003",
    firstName: "Riley",
    lastName: "Moss",
    email: "demo.recruiter@obliox.io",
    role: "Recruiter",
    tenantId: demoTenant.id,
  },
  {
    id: "90000000-0000-4000-8000-000000000004",
    profileId: "91000000-0000-4000-8000-000000000004",
    firstName: "Sam",
    lastName: "Ortiz",
    email: "demo.tc@obliox.io",
    role: "Transaction Coordinator",
    tenantId: demoTenant.id,
  },
  {
    id: "90000000-0000-4000-8000-000000000005",
    profileId: "91000000-0000-4000-8000-000000000005",
    firstName: "Elena",
    lastName: "Park",
    email: "demo.agent@obliox.io",
    role: "Agent Portal User",
    tenantId: demoTenant.id,
  },
];

export function getDemoUserByEmail(email: string) {
  return demoUsers.find((user) => user.email === email) ?? null;
}

export function getDemoSessionByEmail(email = "demo.owner@obliox.io"): UserSession | null {
  const demoUser = getDemoUserByEmail(email);
  if (!demoUser) {
    return null;
  }

  return {
    user: {
      id: demoUser.id,
      profileId: demoUser.profileId,
      name: `${demoUser.firstName} ${demoUser.lastName}`,
      email: demoUser.email,
    },
    tenant: demoTenant,
    role: demoUser.role,
    permissions: rolePermissions[demoUser.role],
  };
}

export function getDemoSession(): UserSession {
  const session = getDemoSessionByEmail();
  if (!session) {
    throw new Error("Default demo user is missing.");
  }

  return session;
}

export const agents: Agent[] = [
  { id: "a1", firstName: "Avery", lastName: "Stone", email: "avery@example.com", phone: "(415) 555-0130", brokerageStatus: "active", productionYtd: 12800000, gciYtd: 358400, lastCloseDate: "2026-06-11", assignedOwner: "Morgan Hale" },
  { id: "a2", firstName: "Jordan", lastName: "Reed", email: "jordan@example.com", phone: "(415) 555-0178", brokerageStatus: "active", productionYtd: 9650000, gciYtd: 270200, lastCloseDate: "2026-05-29", assignedOwner: "Morgan Hale" },
  { id: "a3", firstName: "Casey", lastName: "Lin", email: "casey@example.com", phone: "(415) 555-0199", brokerageStatus: "onboarding", productionYtd: 4200000, gciYtd: 117600, lastCloseDate: "2026-04-18", assignedOwner: "Riley Moss" },
  { id: "a4", firstName: "Taylor", lastName: "Brooks", email: "taylor@example.com", phone: "(415) 555-0144", brokerageStatus: "active", productionYtd: 15100000, gciYtd: 422800, lastCloseDate: "2026-06-20", assignedOwner: "Morgan Hale" },
  { id: "a5", firstName: "Jamie", lastName: "Quinn", email: "jamie@example.com", phone: "(415) 555-0186", brokerageStatus: "active", productionYtd: 7350000, gciYtd: 205800, lastCloseDate: "2026-05-08", assignedOwner: "Riley Moss" },
  { id: "a6", firstName: "Mina", lastName: "Foster", email: "mina@example.com", phone: "(415) 555-0121", brokerageStatus: "active", productionYtd: 6100000, gciYtd: 170800, lastCloseDate: "2026-06-02", assignedOwner: "Riley Moss" },
  { id: "a7", firstName: "Noah", lastName: "Patel", email: "noah@example.com", phone: "(415) 555-0163", brokerageStatus: "active", productionYtd: 11200000, gciYtd: 313600, lastCloseDate: "2026-06-18", assignedOwner: "Morgan Hale" },
  { id: "a8", firstName: "Sofia", lastName: "Mercer", email: "sofia@example.com", phone: "(415) 555-0157", brokerageStatus: "inactive", productionYtd: 2800000, gciYtd: 78400, lastCloseDate: "2026-03-21", assignedOwner: "Morgan Hale" },
  { id: "a9", firstName: "Owen", lastName: "Clarke", email: "owen@example.com", phone: "(415) 555-0172", brokerageStatus: "recruit", productionYtd: 5100000, gciYtd: 142800, lastCloseDate: "2026-02-12", assignedOwner: "Riley Moss" },
  { id: "a10", firstName: "Elena", lastName: "Park", email: "elena@example.com", phone: "(415) 555-0191", brokerageStatus: "onboarding", productionYtd: 3200000, gciYtd: 89600, lastCloseDate: "2026-05-17", assignedOwner: "Riley Moss" },
];

export const recruits: Recruit[] = [
  { id: "r1", name: "Sofia Mercer", stage: "Identified", heatScore: "Warm", recruitScore: 61, source: "Compass", nextFollowUpDate: "2026-07-02", notesSummary: "High-volume neighborhood specialist." },
  { id: "r2", name: "Noah Patel", stage: "Contacted", heatScore: "Hot", recruitScore: 82, source: "Coldwell Banker", nextFollowUpDate: "2026-06-30", notesSummary: "Wants stronger marketing support." },
  { id: "r3", name: "Mina Foster", stage: "Engaged", heatScore: "Hot", recruitScore: 88, source: "Sotheby's", nextFollowUpDate: "2026-07-01", notesSummary: "Team fit looks strong." },
  { id: "r4", name: "Owen Clarke", stage: "Offer Pending", heatScore: "Warm", recruitScore: 74, source: "Referral", nextFollowUpDate: "2026-07-05", notesSummary: "Reviewing split model." },
  { id: "r5", name: "Elena Park", stage: "Joined", heatScore: "Hot", recruitScore: 91, source: "Independent", nextFollowUpDate: "2026-07-10", notesSummary: "Onboarding package sent." },
  { id: "r6", name: "Miles Grant", stage: "Lost", heatScore: "Cold", recruitScore: 38, source: "Zillow Premier", nextFollowUpDate: "2026-08-01", notesSummary: "Staying put this quarter." },
  { id: "r7", name: "Harper Lane", stage: "Contacted", heatScore: "Warm", recruitScore: 67, source: "Local team lead", nextFollowUpDate: "2026-07-08", notesSummary: "Interested in transaction support." },
  { id: "r8", name: "Theo Hayes", stage: "Identified", heatScore: "Cold", recruitScore: 44, source: "Open house visit", nextFollowUpDate: "2026-07-15", notesSummary: "Early relationship only." },
];

export const transactions: Transaction[] = [
  { id: "t1", agent: "Avery Stone", clientName: "K. Monroe", propertyAddress: "1840 Pacific Ave", transactionType: "Seller", stage: "Under Contract", listPrice: 1850000, estimatedGci: 51800, expectedCloseDate: "2026-07-12", status: "active" },
  { id: "t2", agent: "Taylor Brooks", clientName: "L. Vega", propertyAddress: "220 Harbor View", transactionType: "Buyer", stage: "Inspection", listPrice: 1325000, estimatedGci: 37100, expectedCloseDate: "2026-07-19", status: "active" },
  { id: "t3", agent: "Jordan Reed", clientName: "A. Nguyen", propertyAddress: "77 Laurel Street", transactionType: "Seller", stage: "Listing", listPrice: 975000, estimatedGci: 27300, expectedCloseDate: "2026-08-03", status: "active" },
  { id: "t4", agent: "Jamie Quinn", clientName: "R. Ellis", propertyAddress: "510 Mission Bay", transactionType: "Dual", stage: "Clear to Close", listPrice: 2140000, estimatedGci: 59900, expectedCloseDate: "2026-07-02", status: "active" },
  { id: "t5", agent: "Noah Patel", clientName: "M. Torres", propertyAddress: "912 Valley Ridge", transactionType: "Buyer", stage: "Lead", listPrice: 1185000, estimatedGci: 33180, expectedCloseDate: "2026-08-14", status: "active" },
  { id: "t6", agent: "Mina Foster", clientName: "D. Shaw", propertyAddress: "46 Lake Street", transactionType: "Referral", stage: "Closed", listPrice: 740000, estimatedGci: 10360, expectedCloseDate: "2026-06-24", status: "closed" },
];

export const tasks: Task[] = [
  { id: "task1", title: "Prepare owner retention packet", relatedRecord: "Avery Stone", dueDate: "2026-06-29", priority: "high", status: "open" },
  { id: "task2", title: "Follow up on offer package", relatedRecord: "Owen Clarke", dueDate: "2026-07-01", priority: "urgent", status: "in_progress" },
  { id: "task3", title: "Review commission forecast", relatedRecord: "Q3 GCI forecast", dueDate: "2026-07-03", priority: "normal", status: "open" },
  { id: "task4", title: "Send onboarding resources", relatedRecord: "Elena Park", dueDate: "2026-07-05", priority: "normal", status: "complete" },
  { id: "task5", title: "Confirm inspection contingency date", relatedRecord: "L. Vega", dueDate: "2026-06-30", priority: "high", status: "open" },
  { id: "task6", title: "Upload clear to close package", relatedRecord: "R. Ellis", dueDate: "2026-07-02", priority: "urgent", status: "in_progress" },
  { id: "task7", title: "Invite prospect to broker call", relatedRecord: "Harper Lane", dueDate: "2026-07-08", priority: "normal", status: "open" },
  { id: "task8", title: "Review inactive agent status", relatedRecord: "Sofia Mercer", dueDate: "2026-07-10", priority: "low", status: "open" },
  { id: "task9", title: "Prepare month-end GCI snapshot", relatedRecord: "Reports", dueDate: "2026-07-15", priority: "normal", status: "open" },
  { id: "task10", title: "Verify buyer agency agreement", relatedRecord: "M. Torres", dueDate: "2026-07-06", priority: "normal", status: "open" },
  { id: "task11", title: "Research early-stage prospect", relatedRecord: "Theo Hayes", dueDate: "2026-07-12", priority: "low", status: "open" },
  { id: "task12", title: "Schedule top agent check-in", relatedRecord: "Taylor Brooks", dueDate: "2026-07-09", priority: "high", status: "open" },
];

export const activityLogs: ActivityLog[] = [
  { id: "log1", action: "Moved Mina Foster to Engaged", entityType: "Recruit", actor: "Riley Moss", createdAt: "2026-06-28T14:20:00Z" },
  { id: "log2", action: "Updated GCI forecast for July closings", entityType: "Report", actor: "Morgan Hale", createdAt: "2026-06-28T12:05:00Z" },
  { id: "log3", action: "Created task for Owen Clarke offer follow-up", entityType: "Task", actor: "Riley Moss", createdAt: "2026-06-27T18:10:00Z" },
  { id: "log4", action: "Marked inspection contingency review open", entityType: "Transaction", actor: "Sam Ortiz", createdAt: "2026-06-27T16:25:00Z" },
  { id: "log5", action: "Reviewed month-end GCI forecast", entityType: "Report", actor: "Parker Vale", createdAt: "2026-06-27T11:40:00Z" },
  { id: "log6", action: "Added retention task for Taylor Brooks", entityType: "Agent", actor: "Morgan Hale", createdAt: "2026-06-26T20:05:00Z" },
  { id: "log7", action: "Logged recruiting call with Noah Patel", entityType: "Recruit", actor: "Riley Moss", createdAt: "2026-06-26T15:30:00Z" },
  { id: "log8", action: "Closed referral transaction for D. Shaw", entityType: "Transaction", actor: "Sam Ortiz", createdAt: "2026-06-24T22:15:00Z" },
  { id: "log9", action: "Created onboarding activity for Elena Park", entityType: "Recruit", actor: "Riley Moss", createdAt: "2026-06-24T18:45:00Z" },
  { id: "log10", action: "Reviewed inactive agent status", entityType: "Agent", actor: "Morgan Hale", createdAt: "2026-06-23T19:00:00Z" },
];
