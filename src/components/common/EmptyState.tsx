import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type EmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  compact?: boolean;
};

export function EmptyState({ icon: Icon, title, description, actions, compact = false }: EmptyStateProps) {
  return (
    <div
      className={`animate-rise flex flex-col items-center rounded-xl border border-dashed border-line-strong bg-card/60 text-center ${
        compact ? "px-6 py-8" : "px-8 py-14"
      }`}
    >
      <div className="grid h-12 w-12 place-items-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <h2 className="mt-4 text-base font-semibold text-ink-1">{title}</h2>
      {description ? <p className="mt-1.5 max-w-md text-sm leading-6 text-ink-3">{description}</p> : null}
      {actions ? <div className="mt-5 flex flex-wrap justify-center gap-2">{actions}</div> : null}
    </div>
  );
}
