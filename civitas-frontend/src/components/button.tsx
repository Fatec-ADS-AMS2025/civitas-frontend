"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "login";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}

function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const base =
    "inline-flex w-full items-center justify-center gap-2 rounded-[18px] border px-5 py-3 text-base font-semibold shadow-[var(--shadow-xs)] transition-all duration-[var(--motion-duration-fast)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "border-transparent bg-[linear-gradient(135deg,#0C7178_0%,#2A9B9F_42%,#58AFAE_100%)] text-white hover:-translate-y-[1px] hover:brightness-[0.98] hover:shadow-[var(--shadow-sm)]",
    secondary:
      "border-[#F2D0AF] bg-[linear-gradient(135deg,#FFF2E1_0%,#FFF8F1_100%)] text-[#9B5B00] hover:-translate-y-[1px] hover:shadow-[var(--shadow-sm)]",
    tertiary:
      "border-[var(--border-default)] bg-[rgba(255,255,255,0.88)] text-[var(--foreground)] hover:-translate-y-[1px] hover:bg-[var(--surface-subtle)] hover:shadow-[var(--shadow-sm)]",
    login:
      "max-w-[601px] rounded-full border-transparent bg-[linear-gradient(135deg,#0C7178_0%,#2A9B9F_42%,#58AFAE_100%)] py-4 text-[20px] font-semibold text-white hover:-translate-y-[1px] hover:brightness-[0.98] hover:shadow-[var(--shadow-md)] sm:text-[24px]",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
