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
