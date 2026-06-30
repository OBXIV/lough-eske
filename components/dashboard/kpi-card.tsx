import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string;
  delta: string;
  href?: string;
  icon: LucideIcon;
};

export function KpiCard({ label, value, delta, href, icon: Icon }: KpiCardProps) {
  const content = (
    <Card className={cn("h-full p-4 transition", href && "hover:border-accent/40 hover:bg-surface-muted")}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-normal text-text-secondary">{label}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-normal text-text-primary">{value}</p>
        </div>
        <div className="rounded-md bg-surface-muted p-2 text-accent">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 border-t border-border pt-3 text-sm leading-5 text-text-secondary">{delta}</p>
    </Card>
  );

  if (!href) {
    return content;
  }

  return (
    <Link className="block h-full rounded-lg" href={href}>
      {content}
    </Link>
  );
}
