import { cn } from "@/lib/utils";

const variants = {
  default: "border-border bg-surface-muted text-text-secondary",
  success: "border-success/20 bg-success/10 text-success",
  warning: "border-warning/20 bg-warning/10 text-warning",
  danger: "border-danger/20 bg-danger/10 text-danger",
  info: "border-info/20 bg-info/10 text-info",
  accent: "border-accent/20 bg-accent/10 text-accent",
};

type BadgeProps = React.HTMLAttributes<HTMLSpanElement> & {
  variant?: keyof typeof variants;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold leading-5",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
