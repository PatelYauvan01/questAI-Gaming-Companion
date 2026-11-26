import type { ReactNode } from "react";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  /** Optional trailing content, e.g. a count or a link. */
  aside?: ReactNode;
};

export function SectionHeader({ title, subtitle, aside }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        <h2 className="text-base font-semibold tracking-tight text-ink-1">{title}</h2>
        {subtitle ? <p className="mt-0.5 text-sm text-ink-3">{subtitle}</p> : null}
      </div>
      {aside ? <div className="shrink-0 text-sm text-ink-3">{aside}</div> : null}
    </div>
  );
}
