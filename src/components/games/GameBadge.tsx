import type { ReactNode } from "react";

type GameBadgeProps = {
  children: ReactNode;
  tone?: "neutral" | "accent";
  title?: string;
};

export function GameBadge({ children, tone = "neutral", title }: GameBadgeProps) {
  return (
    <span
      title={title}
      className={`inline-flex max-w-full items-center gap-1 truncate rounded-md border px-2 py-0.5 text-2xs font-medium backdrop-blur ${
        tone === "accent"
          ? "border-accent/30 bg-accent/10 text-accent"
          : "border-white/10 bg-black/30 text-ink-2"
      }`}
    >
      {children}
    </span>
  );
}
