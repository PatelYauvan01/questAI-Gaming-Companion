type GameBadgeProps = {
  children: string;
};

export function GameBadge({ children }: GameBadgeProps) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-black/25 px-2.5 py-1 text-xs font-medium text-slate-200">
      {children}
    </span>
  );
}
