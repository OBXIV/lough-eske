import type { LucideIcon } from "lucide-react";

import { Card } from "@/components/ui/card";

type KpiCardProps = {
  label: string;
  value: string;
  delta: string;
  icon: LucideIcon;
};

export function KpiCard({ label, value, delta, icon: Icon }: KpiCardProps) {
  return (
    <Card className="p-4">
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
}
