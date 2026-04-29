import type { Metadata } from "next";
import AccessibilityMenu from "@/components/AccessibilityMenu";
import NavigationFeedback from "@/components/NavigationFeedback";
import Toaster from "@/components/Toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { AuthProvider } from "@/contexts/AuthContext";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Civitas",
  description: "Sistema de extensao universitaria",
};

const themeInitializer = `
(() => {
  const storageKey = "civitas-theme";
  const root = document.documentElement;
  const savedTheme = window.localStorage.getItem(storageKey);
  const themeMode =
    savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
      ? savedTheme
      : "system";
  const resolvedTheme =
    themeMode === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : themeMode;

  root.dataset.themeMode = themeMode;
  root.dataset.theme = resolvedTheme;
  root.style.colorScheme = resolvedTheme;
})();
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning id="pai">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: themeInitializer }} />
      </head>
      <body className="antialiased">
        <ThemeProvider>
          <AuthProvider>
            <NavigationFeedback />

            <a
              href="#conteudo-principal"
              className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-sm focus:bg-white focus:px-4 focus:py-2 focus:text-black"
            >
              Pular para o conteudo principal
            </a>

            <AccessibilityMenu />

            <main
              id="conteudo-principal"
              className="w-full min-h-screen"
            >
              <div id="accessibility-scale-shell" className="accessibility-scale-shell">
                {children}
              </div>
            </main>

            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
