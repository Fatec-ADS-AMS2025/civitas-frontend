"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "login";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
  className?: string;
}

function Button({ variant = "primary", type = "button", children, className = '', ...props }: ButtonProps) {
  const base =
    `px-4 py-2 rounded-full font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 w-full max-w-[800px] text-xl pl-10 pr-10 focus-visible:ring-3 focus-visible:ring-offset-2 focus-visible:ring-white ${className}`;

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-secundary-1 hover:bg-primary-1 focus-visible:ring-primary-1",
    secondary: "bg-primary-2 hover:bg-secondary-2 focus-visible:ring-primary-2",
    tertiary: "bg-primary-1 hover:bg-secundary-1 focus-visible:ring-secundary-1",
    login:
      "bg-secundary w-[601px] h-[73px] text-[24px] font-semibold rounded-[100px] hover:bg-secundary/80 focus-visible:ring-secundary",
  };

  return (
    <button type={type} className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}

export default Button;
