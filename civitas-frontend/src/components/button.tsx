"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "login";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

function Button({ variant = "primary", children, ...props }: ButtonProps) {
  const base =
    "px-4 py-2 rounded-full font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-secundary-1 w-[601px] h-[73px] text-[32px] hover:bg-primary-1",
    secondary: "bg-primary-2 w-[601px] h-[73px] text-[32px] hover:bg-secondary-2",
    tertiary: "bg-primary-1 w-[601px] h-[73px] text-[32px] hover:bg-secundary-1",
    login:
      "bg-secundary w-[601px] h-[73px] text-[24px] font-semibold rounded-[100px] hover:bg-secundary/80",
  };

  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
