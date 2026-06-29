"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

type DetailDrawerProps = {
  children: React.ReactNode;
  eyebrow?: string;
  footer?: React.ReactNode;
  isOpen: boolean;
  onClose: () => void;
  title: string;
};

export function DetailDrawer({ children, eyebrow, footer, isOpen, onClose, title }: DetailDrawerProps) {
  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button
        aria-label="Close detail drawer"
        className="absolute inset-0 h-full w-full cursor-default bg-text-primary/30"
        onClick={onClose}
        type="button"
      />
      <aside
        aria-modal="true"
        className="absolute inset-y-0 right-0 flex w-full flex-col border-l border-border bg-surface shadow-card sm:max-w-xl"
        role="dialog"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            {eyebrow ? (
              <p className="mb-1 text-xs font-semibold uppercase tracking-normal text-text-secondary">{eyebrow}</p>
            ) : null}
            <h2 className="truncate text-lg font-semibold text-text-primary">{title}</h2>
          </div>
          <button
            aria-label="Close detail drawer"
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface text-text-secondary transition hover:bg-surface-muted hover:text-text-primary"
            onClick={onClose}
            type="button"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ? <footer className="border-t border-border px-5 py-4">{footer}</footer> : null}
      </aside>
    </div>
  );
}
