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
    "inline-flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-[var(--motion-duration-fast)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "border-[var(--secundary-1)] bg-[var(--secundary-1)] text-white hover:bg-[color-mix(in_srgb,var(--secundary-1)_92%,black_8%)]",
    secondary:
      "border-[#F2D0AF] bg-[var(--surface-warning-soft)] text-[#9B5B00] hover:bg-[#FFF0DB]",
    tertiary:
      "border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--surface-subtle)]",
    login:
      "max-w-[601px] rounded-xl border-[var(--secundary-1)] bg-[var(--secundary-1)] py-3.5 text-base font-semibold text-white hover:bg-[color-mix(in_srgb,var(--secundary-1)_92%,black_8%)] sm:text-lg",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
