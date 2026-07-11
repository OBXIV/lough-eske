import { ArrowRight, Bot, CalendarDays, FileText, Handshake, Home, Library } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { FeatureUnavailable } from "@/components/entitlements/feature-unavailable";
import { requirePermission } from "@/lib/auth/session";
import { getTenantEntitlements, tenantHasFeature } from "@/lib/data/app-data";

const portalCards = [
  { title: "Agent Dashboard", body: "Personal production, upcoming milestones, and brokerage announcements.", href: "#agent-dashboard", icon: Home, status: "Demo" },
  { title: "Transaction Status", body: "Deal status, next actions, and close-date visibility.", href: "#transaction-status", icon: FileText, status: "Demo" },
  { title: "Resource Library", body: "Training, templates, policies, and brokerage playbooks.", href: "#resource-library", icon: Library, status: "Demo" },
  { title: "Referral Tracking", body: "Referral capture, source attribution, and progress status.", href: "#referral-tracking", icon: Handshake, status: "Demo" },
  { title: "AI Assistant", body: "Agent support layer for answers, routing, and workflow help.", href: "#agent-assistant", icon: Bot, status: "Planned" },
];

const dashboardStats = [
  ["YTD production", "$3.2M"],
  ["GCI YTD", "$89.6K"],
  ["Next milestone", "Onboarding call"],
];

const portalSections = [
  {
    id: "agent-dashboard",
    title: "Agent Dashboard",
    eyebrow: "Today",
    icon: Home,
    items: [
      ["Production target", "$4.5M annual goal"],
      ["Brokerage announcement", "July sales meeting scheduled"],
      ["Milestone", "Complete onboarding checklist"],
    ],
  },
  {
    id: "transaction-status",
    title: "Transaction Status",
    eyebrow: "Active deal",
    icon: FileText,
    items: [
      ["Client", "M. Torres"],
      ["Stage", "Lead"],
      ["Next action", "Verify buyer agency agreement"],
    ],
  },
  {
    id: "resource-library",
    title: "Resource Library",
    eyebrow: "Pinned",
    icon: Library,
    items: [
      ["Template", "Listing presentation deck"],
      ["Policy", "Brokerage commission guide"],
      ["Training", "Buyer agreement walkthrough"],
    ],
  },
  {
    id: "referral-tracking",
    title: "Referral Tracking",
    eyebrow: "Pipeline",
    icon: Handshake,
    items: [
      ["New referral", "2 pending review"],
      ["Contacted", "1 active conversation"],
      ["Closed", "$10.4K referral GCI"],
    ],
  },
  {
    id: "agent-assistant",
    title: "AI Assistant",
    eyebrow: "Planned",
    icon: Bot,
    items: [
      ["Brokerage Q&A", "Policy answers"],
      ["Task routing", "Next-step suggestions"],
      ["Document help", "Template guidance"],
    ],
  },
];

export default async function AgentPortalPage() {
  const session = await requirePermission("view_agent_portal");
  const [entitlements, hasAgentPortal] = await Promise.all([
    getTenantEntitlements(session),
    tenantHasFeature(session, "agent_portal"),
  ]);

  if (!hasAgentPortal) {
    return <FeatureUnavailable feature="agent_portal" entitlements={entitlements} />;
  }

  return (
    <>
      <PageHeader
        title="Agent services"
        subtitle="Separate agent-facing experience, kept distinct from broker and staff operations."
        eyebrow="Agent portal"
      />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {portalCards.map((card) => {
          const Icon = card.icon;

          return (
            <a key={card.title} className="block rounded-lg" href={card.href}>
              <Card className="h-full p-5 transition hover:border-accent/40 hover:bg-surface-muted">
                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="w-fit rounded-md bg-surface-muted p-2 text-accent">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <Badge variant={card.status === "Demo" ? "accent" : "default"}>{card.status}</Badge>
                </div>
                <h2 className="text-base font-semibold text-text-primary">{card.title}</h2>
                <p className="mt-3 text-sm leading-6 text-text-secondary">{card.body}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                  Open
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </span>
              </Card>
            </a>
          );
        })}
      </section>
      <section id="agent-dashboard" className="mt-6 grid gap-4 md:grid-cols-3">
        {dashboardStats.map(([label, value]) => (
          <Card key={label} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-normal text-text-secondary">{label}</p>
            <p className="mt-3 text-2xl font-semibold text-text-primary">{value}</p>
          </Card>
        ))}
      </section>
      <section className="mt-6 grid gap-4 xl:grid-cols-2">
        {portalSections.slice(1).map((section) => {
          const Icon = section.icon;

          return (
            <Card key={section.id} id={section.id} className="scroll-mt-24 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-text-primary">{section.title}</h2>
                    <p className="mt-1 text-sm text-text-secondary">{section.eyebrow}</p>
                  </div>
                </div>
                <CalendarDays className="h-5 w-5 text-text-secondary" aria-hidden="true" />
              </div>
              <div className="mt-5 divide-y divide-border rounded-md border border-border bg-surface-muted">
                {section.items.map(([label, value]) => (
                  <div key={label} className="grid gap-1 px-4 py-3 sm:grid-cols-[12rem_1fr]">
                    <p className="text-xs font-semibold uppercase tracking-normal text-text-secondary">{label}</p>
                    <p className="text-sm font-medium text-text-primary">{value}</p>
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </section>
    </>
  );
}
