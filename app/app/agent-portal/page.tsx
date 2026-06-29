import { Bot, FileText, Handshake, Home, Library } from "lucide-react";

import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { requirePermission } from "@/lib/auth/session";

const portalCards = [
  { title: "Agent Dashboard", body: "Personal production, upcoming milestones, and brokerage announcements.", icon: Home },
  { title: "Transaction Status", body: "Client-facing deal status and next action visibility.", icon: FileText },
  { title: "Resource Library", body: "Training, templates, policies, and brokerage playbooks.", icon: Library },
  { title: "Referral Tracking", body: "Simple referral capture and progress status.", icon: Handshake },
  { title: "Coming Soon AI Assistant", body: "Future agent support layer for answers and workflow help.", icon: Bot },
];

export default async function AgentPortalPage() {
  await requirePermission("view_agent_portal");

  return (
    <>
      <PageHeader title="Agent portal shell" subtitle="Future agent-facing service layer, separated from the broker and staff operating portal." />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {portalCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.title} className="p-5">
              <div className="mb-5 rounded-md bg-accent/10 p-2 text-accent w-fit">
                <Icon className="h-5 w-5" aria-hidden="true" />
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
