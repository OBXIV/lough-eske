type PageHeaderProps = {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  eyebrow?: string;
};

export function PageHeader({ title, subtitle, action, eyebrow }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <p className="mb-2 text-xs font-semibold uppercase tracking-normal text-text-secondary">{eyebrow}</p>
        ) : null}
        <h1 className="text-2xl font-semibold tracking-normal text-text-primary">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
