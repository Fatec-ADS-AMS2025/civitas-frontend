import type { Metadata } from "next";
import AccessibilityMenu from "@/components/AccessibilityMenu";
import Toaster from "@/components/Toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "Civitas",
  description: "Sistema de extensão universitária",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
  return (
    <html lang="pt-BR">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
      </head>
      <body className="antialiased">
        <AuthProvider>
          <a href="#conteudo-principal" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-black">
            Pular para o conteúdo principal
          </a>
          <AccessibilityMenu />
          <main id="conteudo-principal" className="w-full min-h-screen">
            {children}
          </main>
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
