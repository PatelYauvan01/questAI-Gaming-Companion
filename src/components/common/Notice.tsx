import { AlertTriangle, CheckCircle2, X } from "lucide-react";
import type { ReactNode } from "react";

type NoticeProps = {
  tone?: "error" | "success";
  children: ReactNode;
  onDismiss?: () => void;
};

/** Inline, dismissible status message for errors and confirmations. */
export function Notice({ tone = "error", children, onDismiss }: NoticeProps) {
  const isError = tone === "error";
  const Icon = isError ? AlertTriangle : CheckCircle2;

  return (
    <div
      role={isError ? "alert" : "status"}
      className={`animate-rise flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
        isError ? "border-red-500/30 bg-red-500/[0.08] text-red-100" : "border-accent/25 bg-accent/[0.08] text-ink-1"
      }`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${isError ? "text-red-300" : "text-accent"}`} />
      <div className="min-w-0 flex-1 break-words">{children}</div>
      {onDismiss ? (
        <button
          aria-label="Dismiss"
          className="-m-1 rounded-md p-1 text-ink-3 transition hover:bg-white/10 hover:text-ink-1"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}
