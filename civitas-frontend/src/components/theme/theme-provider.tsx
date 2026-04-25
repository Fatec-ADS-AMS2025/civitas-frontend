"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "system" | "light" | "dark";
export type ResolvedTheme = Exclude<ThemeMode, "system">;

type ThemeContextValue = {
  themeMode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (theme: ThemeMode) => void;
};

const STORAGE_KEY = "civitas-theme";
const ThemeContext = createContext<ThemeContextValue | null>(null);

const getSystemTheme = (): ResolvedTheme =>
  window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";

const resolveTheme = (themeMode: ThemeMode): ResolvedTheme =>
  themeMode === "system" ? getSystemTheme() : themeMode;

const applyTheme = (themeMode: ThemeMode) => {
  const resolvedTheme = resolveTheme(themeMode);
  const root = document.documentElement;

  root.dataset.themeMode = themeMode;
  root.dataset.theme = resolvedTheme;
  root.style.colorScheme = resolvedTheme;

  return resolvedTheme;
};

const readStoredTheme = (): ThemeMode => {
  const storedTheme = window.localStorage.getItem(STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark" || storedTheme === "system") {
    return storedTheme;
  }

  return "system";
};

export function ThemeProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>("system");
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");

  useEffect(() => {
    const initialTheme = readStoredTheme();
    setThemeModeState(initialTheme);
    setResolvedTheme(applyTheme(initialTheme));
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const syncWithSystemTheme = () => {
      setResolvedTheme(applyTheme(themeMode));
    };

    syncWithSystemTheme();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncWithSystemTheme);
      return () => mediaQuery.removeEventListener("change", syncWithSystemTheme);
    }

    mediaQuery.addListener(syncWithSystemTheme);
    return () => mediaQuery.removeListener(syncWithSystemTheme);
  }, [themeMode]);

  const setThemeMode = (nextTheme: ThemeMode) => {
    window.localStorage.setItem(STORAGE_KEY, nextTheme);
    setThemeModeState(nextTheme);
    setResolvedTheme(applyTheme(nextTheme));
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      themeMode,
      resolvedTheme,
      setThemeMode,
    }),
    [resolvedTheme, themeMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider.");
  }

  return context;
}
