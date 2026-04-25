"use client";

import React from "react";
import { type ThemeMode, useTheme } from "@/components/theme/theme-provider";

const THEME_OPTIONS: Array<{
  value: ThemeMode;
  label: string;
  icon: string;
}> = [
  { value: "system", label: "Sistema", icon: "desktop_windows" },
  { value: "light", label: "Claro", icon: "light_mode" },
  { value: "dark", label: "Escuro", icon: "dark_mode" },
];

export default function ThemeSwitcher() {
  const { themeMode, resolvedTheme, setThemeMode } = useTheme();

  return (
    <section className="border-t border-[var(--sidebar-divider)] px-3 py-4">
      <div className="flex items-center justify-center gap-0 px-1 sm:group-hover:justify-start sm:group-hover:gap-3 sm:group-focus-within:justify-start sm:group-focus-within:gap-3">
        <span className="material-symbols-outlined text-[20px] text-[var(--sidebar-muted)]">
          palette
        </span>
        <div className="w-0 overflow-hidden opacity-0 transition-all duration-200 sm:group-hover:w-auto sm:group-hover:opacity-100 sm:group-focus-within:w-auto sm:group-focus-within:opacity-100">
          <p className="text-sm font-semibold text-[var(--sidebar-text)]">Tema</p>
          <p className="text-xs text-[var(--sidebar-muted)]">
            Atual: {themeMode === "system" ? `Sistema (${resolvedTheme})` : themeMode === "light" ? "Claro" : "Escuro"}
          </p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2">
        {THEME_OPTIONS.map((option) => {
          const isActive = option.value === themeMode;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isActive}
              onClick={() => setThemeMode(option.value)}
              className={`flex w-full items-center justify-center gap-0 rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition-all duration-150 sm:group-hover:justify-start sm:group-hover:gap-3 sm:group-focus-within:justify-start sm:group-focus-within:gap-3 ${
                isActive
                  ? "border-[var(--sidebar-option-active-border)] bg-[var(--sidebar-option-active-bg)] text-[var(--sidebar-option-active-text)]"
                  : "border-[var(--sidebar-option-border)] bg-[var(--sidebar-option-bg)] text-[var(--sidebar-text)] hover:bg-[var(--sidebar-option-hover-bg)]"
              }`}
              title={`Aplicar tema ${option.label.toLowerCase()}`}
            >
              <span className="material-symbols-outlined text-[20px]">{option.icon}</span>
              <span className="w-0 truncate whitespace-nowrap opacity-0 transition-all duration-200 sm:group-hover:w-auto sm:group-hover:opacity-100 sm:group-focus-within:w-auto sm:group-focus-within:opacity-100">
                {option.label}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
