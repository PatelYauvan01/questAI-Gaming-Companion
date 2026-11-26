import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border-accent/60 bg-accent text-slate-950 hover:bg-teal-300 hover:border-teal-300",
  secondary:
    "border-line bg-white/5 text-slate-100 hover:bg-white/10 hover:border-slate-500",
  ghost:
    "border-transparent bg-transparent text-slate-300 hover:bg-white/5 hover:text-white",
};

export function Button({
  children,
  className = "",
  variant = "primary",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
