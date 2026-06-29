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
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-text-secondary">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-normal text-text-primary">{value}</p>
        </div>
        <div className="rounded-md bg-accent/10 p-2 text-accent">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
      </div>
      <p className="mt-4 text-sm text-text-secondary">{delta}</p>
    </Card>
  );
}
