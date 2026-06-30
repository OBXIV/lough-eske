"use client";

import { useFormStatus } from "react-dom";
import type { LucideIcon } from "lucide-react";

import type { ActionFormState } from "@/lib/action-state";
import { cn } from "@/lib/utils";

type ActionFeedbackProps = {
  className?: string;
  disabledMessage?: string;
  state: ActionFormState;
};

export function ActionFeedback({ className, disabledMessage, state }: ActionFeedbackProps) {
  if (disabledMessage) {
    return (
      <p className={cn("mt-3 rounded-md border border-warning/20 bg-warning/10 px-3 py-2 text-sm font-medium text-warning", className)}>
        {disabledMessage}
      </p>
    );
  }

  if (state.status === "idle") return null;

  return (
    <p
      className={cn(
        "mt-3 rounded-md border px-3 py-2 text-sm font-medium",
        state.status === "success" && "border-success/20 bg-success/10 text-success",
        state.status === "error" && "border-danger/20 bg-danger/10 text-danger",
        className,
      )}
      role="status"
    >
      {state.message}
    </p>
  );
}

type SubmitButtonProps = {
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  pendingLabel?: string;
  variant?: "danger" | "primary" | "success";
};

export function SubmitButton({
  disabled = false,
  icon: Icon,
  label,
  pendingLabel = "Saving",
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold shadow-card disabled:cursor-not-allowed disabled:opacity-50",
        variant === "danger" && "border border-danger/20 bg-danger/10 text-danger hover:bg-danger/15",
        variant === "primary" && "bg-accent text-white",
        variant === "success" && "border border-success/20 bg-success/10 text-success hover:bg-success/15",
      )}
      disabled={disabled || pending}
      type="submit"
    >
      <Icon className="h-4 w-4" aria-hidden />
      {pending ? pendingLabel : label}
    </button>
  );
}
