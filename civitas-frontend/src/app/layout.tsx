import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Civitas",
  description: "Sistema de extensão universitária",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* ✅ Adicione este link para os ícones do Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined"
          rel="stylesheet"
        />
      </head>
      <body
        className={`antialiased`}
      >
        <div className="w-full h-full p-10">
          {children}
        </div>
      </body>
    </html>
  );
}
