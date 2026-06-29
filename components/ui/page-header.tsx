type PageHeaderProps = {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-normal text-text-primary">{title}</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-text-secondary">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
