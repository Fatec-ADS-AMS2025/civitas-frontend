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
    "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3 text-base font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#58AFAE]/30 disabled:cursor-not-allowed disabled:opacity-50";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-secundary-1 text-white hover:bg-primary-1",
    secondary: "bg-primary-2 text-white hover:bg-secundary-2",
    tertiary: "bg-primary-1 text-white hover:bg-secundary-1",
    login:
      "bg-secundary-1 max-w-[601px] rounded-full py-4 text-[20px] font-semibold text-white hover:brightness-95 sm:text-[24px]",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
