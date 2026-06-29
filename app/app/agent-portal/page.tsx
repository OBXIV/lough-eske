import { Bot, FileText, Handshake, Home, Library } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";

const portalCards = [
  { title: "Agent Dashboard", body: "Personal production, upcoming milestones, and brokerage announcements.", icon: Home },
  { title: "Transaction Status", body: "Deal status, next actions, and close-date visibility.", icon: FileText },
  { title: "Resource Library", body: "Training, templates, policies, and brokerage playbooks.", icon: Library },
  { title: "Referral Tracking", body: "Referral capture, source attribution, and progress status.", icon: Handshake },
  { title: "AI Assistant", body: "Agent support layer for answers, routing, and workflow help.", icon: Bot },
];

export default async function AgentPortalPage() {
  await requirePermission("view_agent_portal");

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
            <Card key={card.title} className="p-5">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="w-fit rounded-md bg-surface-muted p-2 text-accent">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <Badge>Planned</Badge>
              </div>
              <h2 className="text-base font-semibold text-text-primary">{card.title}</h2>
              <p className="mt-3 text-sm leading-6 text-text-secondary">{card.body}</p>
            </Card>
          );
        })}
      </section>
    </>
  );
}
