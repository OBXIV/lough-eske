import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { ActivityLog } from "@/types/domain";

type DetailFieldProps = {
  label: string;
  value: React.ReactNode;
};

export function DetailField({ label, value }: DetailFieldProps) {
  return (
    <div className="rounded-md border border-border bg-surface-muted p-3">
      <dt className="text-xs font-semibold uppercase tracking-normal text-text-secondary">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-text-primary">{value}</dd>
    </div>
  );
}

type DrawerFormShellProps = {
  children: React.ReactNode;
  description: string;
  title: string;
};

export function DrawerFormShell({ children, description, title }: DrawerFormShellProps) {
  return (
    <div className="rounded-lg border border-border bg-surface-muted p-4">
      <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-text-secondary">{description}</p>
      <div className="mt-4">{children}</div>
    </div>
  );
}

type ActivityListProps = {
  activities: ActivityLog[];
};

export function ActivityList({ activities }: ActivityListProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-text-primary">Recent activity</h3>
        <Badge>{activities.length}</Badge>
      </div>
      <div className="mt-4 space-y-3">
        {activities.length > 0 ? (
          activities.slice(0, 5).map((activity) => (
            <div key={activity.id} className="rounded-md border border-border bg-surface-muted px-3 py-2">
              <p className="text-sm font-medium text-text-primary">{activity.action}</p>
              <p className="mt-1 text-xs text-text-secondary">
                {activity.actor} - {formatDate(activity.createdAt)}
              </p>
            </div>
          ))
        ) : (
          <p className="rounded-md border border-dashed border-border bg-surface-muted px-3 py-6 text-center text-sm text-text-secondary">
            No activity recorded yet
          </p>
        )}
      </div>
    </div>
  );
}
