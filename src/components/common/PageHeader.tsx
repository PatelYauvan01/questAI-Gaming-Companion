import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

/** Consistent title block at the top of every main-app page. */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow mb-2">{eyebrow}</p> : null}
        <h1 className="text-[28px] font-semibold leading-tight tracking-tight text-ink-1">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm leading-6 text-ink-3">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </header>
  );
}
