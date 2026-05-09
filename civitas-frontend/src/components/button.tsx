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
    "inline-flex w-full items-center justify-center gap-2 rounded-sm border px-4 py-2.5 text-sm font-semibold transition-all duration-[var(--motion-duration-fast)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)] disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    primary:
      "border-[var(--secundary-1)] bg-[var(--secundary-1)] text-[var(--text-on-brand)] hover:bg-[color-mix(in_srgb,var(--secundary-1)_92%,black_8%)]",
    secondary:
      "border-[var(--tone-amber-border)] bg-[var(--tone-amber-bg)] text-[var(--tone-amber-text)] hover:bg-[color-mix(in_srgb,var(--tone-amber-bg)_84%,var(--surface-elevated)_16%)]",
    tertiary:
      "border-[var(--border-default)] bg-[var(--surface-elevated)] text-[var(--foreground)] hover:bg-[var(--surface-subtle)]",
    login:
      "max-w-[601px] rounded-sm border-[var(--secundary-1)] bg-[var(--secundary-1)] py-3.5 text-base font-semibold text-[var(--text-on-brand)] hover:bg-[color-mix(in_srgb,var(--secundary-1)_92%,black_8%)] sm:text-lg",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
