type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: string;
};

export function SectionHeader({ title, subtitle, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-semibold text-white">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
        ) : null}
      </div>
      {action ? (
        <button className="rounded-md px-2 py-1 text-sm font-medium text-accent transition hover:bg-accent/10">
          {action}
        </button>
      ) : null}
    </div>
  );
}
