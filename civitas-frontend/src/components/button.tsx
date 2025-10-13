"use client";

import { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "tertiary" | "login";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  children: ReactNode;
}

function Button({ variant = "primary", children, ...props }: ButtonProps) {
  const base =
    "px-4 py-2 rounded-full font-bold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

  const variants: Record<ButtonVariant, string> = {
    primary: "bg-[#0D5660] w-[601px] h-[73px] text-[32px] hover:bg-[#0B4B54]",
    secondary: "bg-[#FF6324] w-[601px] h-[73px] text-[32px] hover:bg-[#e65a20]",
    tertiary: "bg-[#58AFAE] w-[601px] h-[73px] text-[32px] hover:bg-[#4da3a2]",
    login:
      "bg-[#0D5660] w-[601px] h-[73px] text-[24px] font-semibold rounded-[100px] hover:bg-[#094047]",
  };

  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}

export default function ButtonPage() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-6 bg-gray-100">
      <h1 className="text-2xl font-bold mb-6">Testando todos os botões</h1>

      <div className="flex flex-col gap-4 items-center">
        <Button variant="primary">Cor Fonte</Button>
        <Button variant="secondary">Cor Fonte</Button>
        <Button variant="tertiary">Cor Fonte</Button>
        <Button variant="login">Login</Button>
      </div>
    </main>
  );
}
