import { rolePermissions } from "@/lib/rbac/permissions";
import type {
  ActivityLog,
  Agent,
  AgentReferral,
  AgentResource,
  DemoUser,
  Recruit,
  RecruitingActivity,
  Task,
  Tenant,
  TenantMember,
  Transaction,
  UserSession,
} from "@/types/domain";

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
    status: "active",
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
  {
    id: "90000000-0000-4000-8000-000000000006",
    profileId: "91000000-0000-4000-8000-000000000006",
    firstName: "Devon",
    lastName: "Pierce",
    email: "point.owner@obliox.io",
    role: "Broker Owner",
    tenantId: "22222222-2222-4222-8222-222222222222",
  },
];

export function getDemoUserByEmail(email: string) {
  return demoUsers.find((user) => user.email === email) ?? null;
}

export function getDemoTenantById(tenantId: string): Tenant | null {
  return [demoTenant, ...placeholderTenants].find((tenant) => tenant.id === tenantId) ?? null;
}

export function isPilotDemoUser(user: DemoUser) {
  return user.tenantId !== demoTenant.id;
}

export function getDemoSessionByEmail(email = "demo.owner@obliox.io"): UserSession | null {
  const demoUser = getDemoUserByEmail(email);
  if (!demoUser) {
    return null;
  }

  const tenant = getDemoTenantById(demoUser.tenantId) ?? demoTenant;

  return {
    user: {
      id: demoUser.id,
      profileId: demoUser.profileId,
      name: `${demoUser.firstName} ${demoUser.lastName}`,
      email: demoUser.email,
    },
    tenant,
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
  { id: "a1", firstName: "Avery", lastName: "Stone", email: "avery@example.com", phone: "(415) 555-0130", brokerageStatus: "active", licenseNumber: "CA-010001", source: "Internal", productionYtd: 12800000, gciYtd: 358400, lastCloseDate: "2026-06-11", assignedOwner: "Morgan Hale" },
  { id: "a2", firstName: "Jordan", lastName: "Reed", email: "jordan@example.com", phone: "(415) 555-0178", brokerageStatus: "active", licenseNumber: "CA-010002", source: "Internal", productionYtd: 9650000, gciYtd: 270200, lastCloseDate: "2026-05-29", assignedOwner: "Morgan Hale" },
  { id: "a3", firstName: "Casey", lastName: "Lin", email: "casey@example.com", phone: "(415) 555-0199", brokerageStatus: "onboarding", licenseNumber: "CA-010003", source: "Recruiting", productionYtd: 4200000, gciYtd: 117600, lastCloseDate: "2026-04-18", assignedOwner: "Riley Moss" },
  { id: "a4", firstName: "Taylor", lastName: "Brooks", email: "taylor@example.com", phone: "(415) 555-0144", brokerageStatus: "active", licenseNumber: "CA-010004", source: "Internal", productionYtd: 15100000, gciYtd: 422800, lastCloseDate: "2026-06-20", assignedOwner: "Morgan Hale" },
  { id: "a5", firstName: "Jamie", lastName: "Quinn", email: "jamie@example.com", phone: "(415) 555-0186", brokerageStatus: "active", licenseNumber: "CA-010005", source: "Internal", productionYtd: 7350000, gciYtd: 205800, lastCloseDate: "2026-05-08", assignedOwner: "Riley Moss" },
  { id: "a6", firstName: "Mina", lastName: "Foster", email: "mina@example.com", phone: "(415) 555-0121", brokerageStatus: "active", licenseNumber: "CA-010006", source: "Recruiting", productionYtd: 6100000, gciYtd: 170800, lastCloseDate: "2026-06-02", assignedOwner: "Riley Moss" },
  { id: "a7", firstName: "Noah", lastName: "Patel", email: "noah@example.com", phone: "(415) 555-0163", brokerageStatus: "active", licenseNumber: "CA-010007", source: "Referral", productionYtd: 11200000, gciYtd: 313600, lastCloseDate: "2026-06-18", assignedOwner: "Morgan Hale" },
  { id: "a8", firstName: "Sofia", lastName: "Mercer", email: "sofia@example.com", phone: "(415) 555-0157", brokerageStatus: "inactive", licenseNumber: "CA-010008", source: "Internal", productionYtd: 2800000, gciYtd: 78400, lastCloseDate: "2026-03-21", assignedOwner: "Morgan Hale" },
  { id: "a9", firstName: "Owen", lastName: "Clarke", email: "owen@example.com", phone: "(415) 555-0172", brokerageStatus: "recruit", licenseNumber: "CA-010009", source: "Recruiting", productionYtd: 5100000, gciYtd: 142800, lastCloseDate: "2026-02-12", assignedOwner: "Riley Moss" },
  { id: "a10", firstName: "Elena", lastName: "Park", email: "elena@example.com", phone: "(415) 555-0191", brokerageStatus: "onboarding", licenseNumber: "CA-010010", source: "Independent", productionYtd: 3200000, gciYtd: 89600, lastCloseDate: "2026-05-17", assignedOwner: "Riley Moss", profileId: "91000000-0000-4000-8000-000000000005" },
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

export const recruitingActivities: RecruitingActivity[] = [
  { id: "ra1", recruitId: "r1", recruitName: "Sofia Mercer", activityType: "Note", activityDate: "2026-06-12T16:00:00Z", notes: "High-volume neighborhood specialist, early relationship only." },
  { id: "ra2", recruitId: "r2", recruitName: "Noah Patel", activityType: "Call", activityDate: "2026-06-26T15:30:00Z", notes: "Discussed marketing support and commission split questions." },
  { id: "ra3", recruitId: "r6", recruitName: "Miles Grant", activityType: "Call", activityDate: "2026-06-18T17:40:00Z", notes: "Confirmed staying put this quarter." },
  { id: "ra4", recruitId: "r5", recruitName: "Elena Park", activityType: "Stage Change", activityDate: "2026-06-24T18:45:00Z", notes: "Joined the brokerage; onboarding packet sent." },
  { id: "ra5", recruitId: "r3", recruitName: "Mina Foster", activityType: "Stage Change", activityDate: "2026-06-28T14:20:00Z", notes: "Moved to Engaged after a strong team-fit call." },
  { id: "ra6", recruitId: "r4", recruitName: "Owen Clarke", activityType: "Email", activityDate: "2026-06-30T13:10:00Z", notes: "Sent updated split model comparison." },
  { id: "ra7", recruitId: "r7", recruitName: "Harper Lane", activityType: "Text", activityDate: "2026-07-02T12:15:00Z", notes: "Confirmed interest in transaction support role." },
  { id: "ra8", recruitId: "r8", recruitName: "Theo Hayes", activityType: "Note", activityDate: "2026-07-05T19:20:00Z", notes: "Early relationship only, met at open house." },
  { id: "ra9", recruitId: "r2", recruitName: "Noah Patel", activityType: "Meeting", activityDate: "2026-07-08T20:00:00Z", notes: "In-person meeting to walk through the offer package." },
  { id: "ra10", recruitId: "r4", recruitName: "Owen Clarke", activityType: "Call", activityDate: "2026-07-11T15:45:00Z", notes: "Following up before the offer expires Friday." },
];

export const transactions: Transaction[] = [
  { id: "t1", agent: "Avery Stone", clientName: "K. Monroe", propertyAddress: "1840 Pacific Ave", transactionType: "Seller", stage: "Under Contract", listPrice: 1850000, estimatedGci: 51800, expectedCloseDate: "2026-07-12", status: "active" },
  { id: "t2", agent: "Taylor Brooks", clientName: "L. Vega", propertyAddress: "220 Harbor View", transactionType: "Buyer", stage: "Inspection", listPrice: 1325000, estimatedGci: 37100, expectedCloseDate: "2026-07-19", status: "active" },
  { id: "t3", agent: "Jordan Reed", clientName: "A. Nguyen", propertyAddress: "77 Laurel Street", transactionType: "Seller", stage: "Listing", listPrice: 975000, estimatedGci: 27300, expectedCloseDate: "2026-08-03", status: "active" },
  { id: "t4", agent: "Jamie Quinn", clientName: "R. Ellis", propertyAddress: "510 Mission Bay", transactionType: "Dual", stage: "Clear to Close", listPrice: 2140000, estimatedGci: 59900, expectedCloseDate: "2026-07-02", status: "active" },
  { id: "t5", agent: "Noah Patel", clientName: "M. Torres", propertyAddress: "912 Valley Ridge", transactionType: "Buyer", stage: "Lead", listPrice: 1185000, estimatedGci: 33180, expectedCloseDate: "2026-08-14", status: "active" },
  { id: "t6", agent: "Mina Foster", clientName: "D. Shaw", propertyAddress: "46 Lake Street", transactionType: "Referral", stage: "Closed", listPrice: 740000, estimatedGci: 10360, expectedCloseDate: "2026-06-24", status: "closed", finalizedAt: "2026-06-24T22:15:00Z", finalizedBy: "Sam Ortiz" },
  { id: "t7", agent: "Elena Park", clientName: "J. Alvarez", propertyAddress: "18 Cypress Court", transactionType: "Buyer", stage: "Under Contract", listPrice: 890000, estimatedGci: 24920, expectedCloseDate: "2026-08-07", status: "active" },
];

export const tenantMembers: TenantMember[] = demoUsers
  .filter((user) => user.role !== "Platform Admin" && user.tenantId === demoTenant.id)
  .map((user) => ({
    profileId: user.profileId,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    role: user.role,
    status: "active",
    joinedAt: "2026-06-28T00:00:00Z",
  }));

const memberIds = {
  morgan: "91000000-0000-4000-8000-000000000001",
  parker: "91000000-0000-4000-8000-000000000002",
  riley: "91000000-0000-4000-8000-000000000003",
  sam: "91000000-0000-4000-8000-000000000004",
  elena: "91000000-0000-4000-8000-000000000005",
};

export const tasks: Task[] = [
  { id: "task1", title: "Prepare owner retention packet", description: "Assemble YTD production summary and retention offer comparison before the check-in.", relatedRecord: "Avery Stone", relatedType: "agent", assignee: "Morgan Hale", assigneeId: memberIds.morgan, dueDate: "2026-06-29", priority: "high", status: "open", createdAt: "2026-06-20T16:00:00Z" },
  { id: "task2", title: "Follow up on offer package", description: "Offer expires Friday. Confirm split questions are answered before the follow-up call.", relatedRecord: "Owen Clarke", relatedType: "recruit", assignee: "Riley Moss", assigneeId: memberIds.riley, dueDate: "2026-07-01", priority: "urgent", status: "in_progress", createdAt: "2026-06-27T18:10:00Z" },
  { id: "task3", title: "Review commission forecast", description: null, relatedRecord: "Q3 GCI forecast", relatedType: "report", assignee: "Parker Vale", assigneeId: memberIds.parker, dueDate: "2026-07-03", priority: "normal", status: "open", createdAt: "2026-06-25T15:30:00Z" },
  { id: "task4", title: "Send onboarding resources", description: "Send the onboarding packet and confirm license transfer paperwork.", relatedRecord: "Elena Park", relatedType: "recruit", assignee: "Riley Moss", assigneeId: memberIds.riley, dueDate: "2026-07-05", priority: "normal", status: "complete", createdAt: "2026-06-22T17:45:00Z" },
  { id: "task5", title: "Confirm inspection contingency date", description: "Inspection window closes July 1. Confirm the extension request status with the listing side.", relatedRecord: "L. Vega", relatedType: "transaction", assignee: "Sam Ortiz", assigneeId: memberIds.sam, dueDate: "2026-06-30", priority: "high", status: "open", createdAt: "2026-06-26T14:20:00Z" },
  { id: "task6", title: "Upload clear to close package", description: null, relatedRecord: "R. Ellis", relatedType: "transaction", assignee: "Sam Ortiz", assigneeId: memberIds.sam, dueDate: "2026-07-02", priority: "urgent", status: "in_progress", createdAt: "2026-06-28T13:05:00Z" },
  { id: "task7", title: "Invite prospect to broker call", description: null, relatedRecord: "Harper Lane", relatedType: "recruit", assignee: "Riley Moss", assigneeId: memberIds.riley, dueDate: "2026-07-08", priority: "normal", status: "open", createdAt: "2026-06-27T19:40:00Z" },
  { id: "task8", title: "Review inactive agent status", description: "Decide on reactivation plan or offboarding before month end.", relatedRecord: "Sofia Mercer", relatedType: "agent", assignee: "Morgan Hale", assigneeId: memberIds.morgan, dueDate: "2026-07-10", priority: "low", status: "open", createdAt: "2026-06-23T19:00:00Z" },
  { id: "task9", title: "Prepare month-end GCI snapshot", description: null, relatedRecord: "Reports", relatedType: "report", assignee: "Parker Vale", assigneeId: memberIds.parker, dueDate: "2026-07-15", priority: "normal", status: "open", createdAt: "2026-06-28T11:00:00Z" },
  { id: "task10", title: "Verify buyer agency agreement", description: null, relatedRecord: "M. Torres", relatedType: "transaction", assignee: "Sam Ortiz", assigneeId: memberIds.sam, dueDate: "2026-07-06", priority: "normal", status: "open", createdAt: "2026-06-29T16:10:00Z" },
  { id: "task11", title: "Research early-stage prospect", description: null, relatedRecord: "Theo Hayes", relatedType: "recruit", assignee: null, assigneeId: null, dueDate: "2026-07-12", priority: "low", status: "open", createdAt: "2026-06-29T18:30:00Z" },
  { id: "task12", title: "Schedule top agent check-in", description: "Top producer retention. Book time before the July sales meeting.", relatedRecord: "Taylor Brooks", relatedType: "agent", assignee: "Morgan Hale", assigneeId: memberIds.morgan, dueDate: "2026-07-09", priority: "high", status: "open", createdAt: "2026-06-26T20:05:00Z" },
  { id: "task13", title: "Schedule buyer inspection", description: "Coordinate inspection access with the listing agent.", relatedRecord: "J. Alvarez", relatedType: "transaction", assignee: "Elena Park", assigneeId: memberIds.elena, dueDate: "2026-07-20", priority: "high", status: "open", createdAt: "2026-07-14T16:30:00Z" },
];

export const agentResources: AgentResource[] = [
  { id: "res1", title: "Listing launch checklist", description: "Standard launch steps for new listings.", resourceType: "Template", url: null, visibility: "all_agents", publishedBy: "Morgan Hale", createdAt: "2026-06-18T17:00:00Z" },
  { id: "res2", title: "Buyer consultation playbook", description: "Talk track and discovery prompts.", resourceType: "Training", url: null, visibility: "all_agents", publishedBy: "Morgan Hale", createdAt: "2026-06-20T15:30:00Z" },
  { id: "res3", title: "Commission policy overview", description: "Current internal commission policy summary.", resourceType: "Policy", url: null, visibility: "all_agents", publishedBy: "Morgan Hale", createdAt: "2026-06-22T18:45:00Z" },
  { id: "res4", title: "Open house follow-up template", description: "Email and text follow-up copy.", resourceType: "Template", url: null, visibility: "all_agents", publishedBy: "Morgan Hale", createdAt: "2026-06-25T14:10:00Z" },
  { id: "res5", title: "New agent onboarding path", description: "First 30 days onboarding resource.", resourceType: "Training", url: null, visibility: "all_agents", publishedBy: "Morgan Hale", createdAt: "2026-06-27T16:20:00Z" },
  { id: "res6", title: "Referral intake form", description: "Standard referral capture workflow.", resourceType: "Link", url: null, visibility: "all_agents", publishedBy: "Morgan Hale", createdAt: "2026-06-29T13:40:00Z" },
  { id: "res7", title: "Draft: revised commission tiers", description: "Staff-only draft pending broker approval.", resourceType: "Policy", url: null, visibility: "staff_only", publishedBy: "Morgan Hale", createdAt: "2026-07-08T19:00:00Z" },
];

export const agentReferrals: AgentReferral[] = [
  { id: "ref1", agentId: "a1", referralName: "Priya Shah", referralEmail: "priya@example.com", referralPhone: "(415) 555-0101", status: "contacted", notes: "Buyer lead from past client.", createdAt: "2026-06-20T17:30:00Z", updatedAt: "2026-06-26T18:00:00Z" },
  { id: "ref2", agentId: "a4", referralName: "Victor Chen", referralEmail: "victor@example.com", referralPhone: "(415) 555-0102", status: "active", notes: "Seller consultation scheduled.", createdAt: "2026-06-22T15:00:00Z", updatedAt: "2026-06-28T14:20:00Z" },
  { id: "ref3", agentId: "a5", referralName: "Amara Wells", referralEmail: "amara@example.com", referralPhone: "(415) 555-0103", status: "new", notes: "Needs first outreach.", createdAt: "2026-06-27T12:45:00Z", updatedAt: "2026-06-27T12:45:00Z" },
  { id: "ref4", agentId: "a10", referralName: "Leo Martin", referralEmail: "leo@example.com", referralPhone: "(415) 555-0104", status: "closed", notes: "Referral closed in June.", createdAt: "2026-06-05T16:10:00Z", updatedAt: "2026-06-24T20:00:00Z" },
  { id: "ref5", agentId: "a10", referralName: "Nadia Osei", referralEmail: "nadia@example.com", referralPhone: "(415) 555-0105", status: "new", notes: "Met at the June open house; wants to buy this fall.", createdAt: "2026-07-10T18:20:00Z", updatedAt: "2026-07-10T18:20:00Z" },
];

export const activityLogs: ActivityLog[] = [
  { id: "log1", action: "Moved Mina Foster to Engaged", entityId: "r3", entityType: "Recruit", actor: "Riley Moss", createdAt: "2026-06-28T14:20:00Z" },
  { id: "log2", action: "Updated GCI forecast for July closings", entityType: "Report", actor: "Morgan Hale", createdAt: "2026-06-28T12:05:00Z" },
  { id: "log3", action: "Created task for Owen Clarke offer follow-up", entityId: "task2", entityType: "Task", actor: "Riley Moss", createdAt: "2026-06-27T18:10:00Z" },
  { id: "log4", action: "Marked inspection contingency review open", entityType: "Transaction", actor: "Sam Ortiz", createdAt: "2026-06-27T16:25:00Z" },
  { id: "log5", action: "Reviewed month-end GCI forecast", entityType: "Report", actor: "Parker Vale", createdAt: "2026-06-27T11:40:00Z" },
  { id: "log6", action: "Added retention task for Taylor Brooks", entityId: "a4", entityType: "Agent", actor: "Morgan Hale", createdAt: "2026-06-26T20:05:00Z" },
  { id: "log7", action: "Logged recruiting call with Noah Patel", entityId: "r2", entityType: "Recruit", actor: "Riley Moss", createdAt: "2026-06-26T15:30:00Z" },
  { id: "log8", action: "Closed referral transaction for D. Shaw", entityId: "t6", entityType: "Transaction", actor: "Sam Ortiz", createdAt: "2026-06-24T22:15:00Z" },
  { id: "log9", action: "Created onboarding activity for Elena Park", entityId: "r5", entityType: "Recruit", actor: "Riley Moss", createdAt: "2026-06-24T18:45:00Z" },
  { id: "log10", action: "Reviewed inactive agent status", entityId: "a8", entityType: "Agent", actor: "Morgan Hale", createdAt: "2026-06-23T19:00:00Z" },
];
