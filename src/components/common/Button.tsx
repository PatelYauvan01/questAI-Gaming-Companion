import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-accent text-accent-ink shadow-[0_6px_20px_-8px_rgba(45,212,191,0.6)] hover:bg-accent-strong",
  secondary:
    "border-line-strong bg-white/[0.04] text-ink-1 hover:border-[#3a4656] hover:bg-white/[0.08]",
  ghost: "border-transparent bg-transparent text-ink-2 hover:bg-white/[0.06] hover:text-ink-1",
  danger: "border-transparent bg-transparent text-ink-2 hover:bg-red-500/10 hover:text-red-300",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 gap-1.5 rounded-md px-3 text-xs",
  md: "h-10 gap-2 rounded-lg px-4 text-sm",
  lg: "h-11 gap-2 rounded-lg px-5 text-sm",
};

/** Button styling, also usable on router <Link>s so we never nest a <button> inside an <a>. */
export function buttonClasses(variant: ButtonVariant = "primary", className = "", size: ButtonSize = "md") {
  return `inline-flex shrink-0 select-none items-center justify-center border font-semibold transition duration-150 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-45 [&_svg]:shrink-0 ${sizeStyles[size]} ${variantStyles[variant]} ${className}`;
}

export function Button({
  children,
  className = "",
  variant = "primary",
  size = "md",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button type={type} className={buttonClasses(variant, className, size)} {...props}>
      {children}
    </button>
  );
}
